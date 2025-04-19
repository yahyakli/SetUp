<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Plan;
use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class SubscriptionController extends Controller
{
    protected $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    /**
     * Display a listing of the subscriptions.
     */
    public function index(Request $request)
    {
        $request->validate([
            'user_id' => 'required|string',
        ]);
        
        $userId = $request->user_id;
        
        $subscriptions = Subscription::with('plan')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($subscriptions);
    }

    public function getAllSubscriptions(){
        $subscriptions = Subscription::with('plan')->get();
        return response()->json($subscriptions);
    }

    /**
     * Store a newly created subscription in storage (without payment).
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|string',
            'plan_id' => 'required|exists:plans,id',
        ]);

        $userId = $request->user_id;
        $plan = Plan::findOrFail($request->plan_id);

        DB::beginTransaction();
        try {
            // Calculate subscription dates
            $startDate = now();
            $endDate = $this->calculateEndDate($startDate, $plan);
            
            // Create subscription record with pending status
            $subscription = Subscription::create([
                'user_id' => $userId,
                'plan_id' => $plan->id,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => 'pending', // Subscription is pending until payment
            ]);
            
            // Create invoice with pending status
            $invoice = Invoice::create([
                'subscription_id' => $subscription->id,
                'amount' => $plan->price,
                'status' => 'pending',
                'due_date' => now()->addDays(7),
                'invoice_number' => Invoice::generateInvoiceNumber(),
            ]);
            
            DB::commit();
            
            return response()->json([
                'subscription' => $subscription->load('plan'),
                'invoice' => $invoice,
                'message' => 'Subscription created successfully. Please proceed to payment.'
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Subscription creation error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create subscription'], 500);
        }
    }

    /**
     * Display the specified subscription.
     */
    public function show(string $id, string $userId)
    {        
        $subscription = Subscription::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();
            
        return response()->json($subscription->load('plan'), 200);  
    }

    /**
     * Cancel the specified subscription.
     */
    public function cancel(string $id, Request $request)
    {
        $request->validate([
            'user_id' => 'required|string',
        ]);
        
        $userId = $request->user_id;
        
        $subscription = Subscription::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();
            
        if ($subscription->status === 'canceled') {
            return response()->json(['message' => 'Subscription is already canceled']);
        }
        
        DB::beginTransaction();
        try {
            // Cancel subscription in Stripe if it exists
            if ($subscription->stripe_subscription_id) {
                $this->stripe->subscriptions->cancel($subscription->stripe_subscription_id);
            }
            
            // Update subscription status
            $subscription->update([
                'status' => 'canceled',
            ]);
            
            // Cancel any pending invoices
            $subscription->invoices()
                ->where('status', 'pending')
                ->update(['status' => 'canceled']);
                
            DB::commit();
            
            return response()->json([
                'message' => 'Subscription canceled successfully',
                'subscription' => $subscription->load('plan'),
            ]);
            
        } catch (ApiErrorException $e) {
            DB::rollBack();
            Log::error('Stripe error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Subscription cancellation error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to cancel subscription'], 500);
        }
    }

    /**
     * Get or create a Stripe customer for the user.
     */
    protected function getOrCreateStripeCustomer(string $userId, string $paymentMethodId)
    {
        // In a real application, you might want to store this in a customers table
        // For now, we'll create a new customer each time
        $customer = $this->stripe->customers->create([
            'metadata' => [
                'user_id' => $userId,
            ],
            'payment_method' => $paymentMethodId,
        ]);
        
        return $customer->id;
    }

    /**
     * Calculate the end date based on the plan.
     */
    protected function calculateEndDate(Carbon $startDate, Plan $plan)
    {
        switch ($plan->billing_cycle) {
            case 'monthly':
                return $startDate->copy()->addMonth();
            case 'quarterly':
                return $startDate->copy()->addMonths(3);
            case 'yearly':
                return $startDate->copy()->addYear();
            default:
                return $startDate->copy()->addMonth();
        }
    }

    public function getUserSubscriptions($userId){
        $subscriptions = Subscription::where('user_id', $userId)->get();
        return response()->json(['subscriptions' => $subscriptions->load('plan', 'invoices')], 200);
    }

    public function getUserActiveSubscription($userId){
        $subscription = Subscription::where('user_id', $userId)->where('status', 'active')->first();
        return response()->json(['subscription' => $subscription->load('plan')], 200);
    }

    public function toggleSubscriptionAutoRenewal(string $id, Request $request){
        $request->validate([
            'user_id' => 'required|string',
        ]);

        $userId = $request->user_id;

        $subscription = Subscription::where('id', $id)->where('user_id', $userId)->first();

        if (!$subscription) {
            return response()->json(['error' => 'Subscription not found'], 404);
        }

        $subscription->update([
            'auto_renew' => !$subscription->auto_renew,
        ]);

        $subscription->save();

        return response()->json(['message' => 'Subscription auto renewal toggled successfully', 'subscription' => $subscription->load('plan', 'invoices')], 200);
    }
} 