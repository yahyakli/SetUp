<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class InvoiceController extends Controller
{
    protected $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
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
    public function show(string $id, Request $request)
    {
        $request->validate([
            'user_id' => 'required|string',
        ]);
        
        $userId = $request->user_id;
        
        $invoice = Invoice::with('subscription.plan')
            ->whereHas('subscription', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->where('id', $id)
            ->firstOrFail();
            
        return response()->json($invoice);
    }

    /**
     * Pay a pending invoice.
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
            // Create payment intent
            $paymentIntent = $this->stripe->paymentIntents->create([
                'amount' => $invoice->amount * 100, // Stripe uses cents
                'currency' => 'usd',
                'customer' => $invoice->subscription->stripe_customer_id,
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
            }
            
            DB::commit();
            
            return response()->json([
                'invoice' => $invoice->fresh()->load('subscription.plan'),
                'client_secret' => $paymentIntent->client_secret,
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
} 