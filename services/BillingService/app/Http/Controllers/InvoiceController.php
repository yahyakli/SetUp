<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;
use Barryvdh\DomPDF\Facade\PDF;

class InvoiceController extends Controller
{
    protected $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    public function getAllInvoices(){
        $invoices = Invoice::with('subscription')->get();
        return response()->json($invoices);
    }

    /**
     * Display a listing of the invoices for a user.
     */
    public function index(Request $request)
    {
        $request->validate([
            'user_id' => 'required|string',
        ]);
        
        $userId = $request->user_id;
        
        $invoices = Invoice::with('subscription.plan')
            ->whereHas('subscription', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($invoices);
    }

    /**
     * Display the specified invoice.
     */
    public function show(string $id, $userId)
    {
        $invoice = Invoice::with('subscription.plan')
            ->whereHas('subscription', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->where('id', $id)
            ->firstOrFail();
            
        return response()->json($invoice);
    }

    /**
     * Pay a pending invoice using Stripe.
     */
    public function pay(string $id, Request $request)
    {
        $request->validate([
            'user_id' => 'required|string',
            'payment_method_id' => 'required|string',
        ]);

        $userId = $request->user_id;
        
        $invoice = Invoice::with('subscription.plan')
            ->whereHas('subscription', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->where('id', $id)
            ->where('status', 'pending')
            ->firstOrFail();
            
        DB::beginTransaction();
        try {
            // Create or retrieve Stripe customer
            $stripeCustomerId = $this->getOrCreateStripeCustomer($userId, $request->payment_method_id);
            
            // Update subscription with stripe customer id
            $invoice->subscription->update([
                'stripe_customer_id' => $stripeCustomerId,
            ]);
            
            // Create Stripe payment intent
            $paymentIntent = $this->stripe->paymentIntents->create([
                'amount' => $invoice->amount * 100, // Stripe uses cents
                'currency' => 'usd',
                'customer' => $stripeCustomerId,
                'payment_method' => $request->payment_method_id,
                'off_session' => true,
                'confirm' => true,
                'metadata' => [
                    'subscription_id' => $invoice->subscription->id,
                    'invoice_id' => $invoice->id,
                ],
            ]);
            
            // Update invoice with payment intent ID
            $invoice->update([
                'stripe_payment_intent_id' => $paymentIntent->id,
            ]);
            
            // If payment intent succeeded, update subscription and invoice status
            if ($paymentIntent->status === 'succeeded') {
                $invoice->subscription->update([
                    'status' => 'active',
                ]);
                
                $invoice->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                ]);
                
                $message = 'Payment successful. Your subscription is now active.';
            } else {
                $message = 'Payment requires additional action.';
            }
            
            DB::commit();
            
            return response()->json([
                'invoice' => $invoice->fresh()->load('subscription.plan'),
                'client_secret' => $paymentIntent->client_secret,
                'payment_status' => $paymentIntent->status,
                'message' => $message,
                'subscription' => $invoice->subscription->fresh()->load('plan'),
            ]);
            
        } catch (ApiErrorException $e) {
            DB::rollBack();
            Log::error('Stripe error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Invoice payment error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to process payment'], 500);
        }
    }

    /**
     * Get or create a Stripe customer for the user.
     */
    protected function getOrCreateStripeCustomer(string $userId, string $paymentMethodId)
    {
        // In a real application, you might want to store this in a customers table
        // For now, we'll search for existing customers or create a new one
        $customers = $this->stripe->customers->all([
            'limit' => 1,
            'email' => $userId . '@example.com', // Using user ID as email for simplicity
        ]);
        
        if (!empty($customers->data)) {
            $customer = $customers->data[0];
            
            // Attach the payment method to the customer
            $this->stripe->paymentMethods->attach($paymentMethodId, [
                'customer' => $customer->id,
            ]);
            
            return $customer->id;
        }
        
        // Create a new customer with the payment method
        $customer = $this->stripe->customers->create([
            'email' => $userId . '@example.com',
            'payment_method' => $paymentMethodId,
            'metadata' => [
                'user_id' => $userId,
            ],
        ]);
        
        return $customer->id;
    }

    /**
     * Cancel a pending invoice.
     */
    public function cancel(string $id, Request $request)
    {
        $request->validate([
            'user_id' => 'required|string',
        ]);
        
        $userId = $request->user_id;
        
        $invoice = Invoice::with('subscription')
            ->whereHas('subscription', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->where('id', $id)
            ->where('status', 'pending')
            ->firstOrFail();
            
        DB::beginTransaction();
        try {
            // Cancel payment intent if it exists
            if ($invoice->stripe_payment_intent_id) {
                $this->stripe->paymentIntents->cancel($invoice->stripe_payment_intent_id);
            }
            
            // Update invoice status
            $invoice->update([
                'status' => 'canceled',
            ]);
            
            // If this is the first invoice for a subscription, cancel the subscription too
            if ($invoice->subscription->invoices()->count() === 1) {
                $invoice->subscription->update([
                    'status' => 'canceled',
                ]);
            }
            
            DB::commit();
            
            return response()->json([
                'message' => 'Invoice canceled successfully',
                'invoice' => $invoice->fresh()->load('subscription'),
            ]);
            
        } catch (ApiErrorException $e) {
            DB::rollBack();
            Log::error('Stripe error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Invoice cancellation error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to cancel invoice'], 500);
        }
    }

    public function getUserPaidInvoices($userId)
    {
        $invoices = Invoice::with('subscription.plan')
            ->whereHas('subscription', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->where('status', 'paid')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($invoices, 200);
    }

    /**
     * Generate and download a PDF invoice.
     */
    public function downloadPdf(string $id, Request $request)
    {
        $request->validate([
            'user_id' => 'required|string',
        ]);
        
        $userId = $request->user_id;
        
        $invoice = Invoice::with(['subscription.plan'])
            ->whereHas('subscription', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->where('id', $id)
            ->firstOrFail();
        
        // Make sure the invoice is paid
        if ($invoice->status !== 'paid') {
            return response()->json(['error' => 'Only paid invoices can be downloaded'], 400);
        }
        
        $data = [
            'invoice' => $invoice,
            'company' => [
                'name' => config('SetUp-org.web.app', 'SetUp'),
                'address' => 'Res La Mecque, Kadi tazi',
                'city' => 'MOHAMMEDIA',
                'state' => 'CASABLANCA-SETTAT',
                'zip' => '28810',
                'phone' => '0657838772',
                'email' => 'contact@setup.com',
            ]
        ];
        
        $pdf = PDF::loadView('invoices.pdf', $data);
        
        return $pdf->download('invoice-' . $invoice->invoice_number . '.pdf');
    }

    /**
     * Generate and download a PDF invoice for admin users.
     */
    public function adminDownloadPdf(string $id)
    {
        $invoice = Invoice::with(['subscription.plan'])
            ->where('id', $id)
            ->firstOrFail();
        
        // Make sure the invoice is paid
        if ($invoice->status !== 'paid') {
            return response()->json(['error' => 'Only paid invoices can be downloaded'], 400);
        }
        
        $data = [
            'invoice' => $invoice,
            'company' => [
                'name' => config('SetUp-org.web.app', 'SetUp'),
                'address' => 'Res La Mecque, Kadi tazi',
                'city' => 'MOHAMMEDIA',
                'state' => 'CASABLANCA-SETTAT',
                'zip' => '28810',
                'phone' => '0657838772',
                'email' => 'contact@setup.com',
            ]
        ];
        
        $pdf = PDF::loadView('invoices.pdf', $data);
        
        return $pdf->download('invoice-' . $invoice->invoice_number . '.pdf');
    }

} 