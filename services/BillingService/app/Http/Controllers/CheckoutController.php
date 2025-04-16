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

class CheckoutController extends Controller
{
    protected $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    /**
     * Create a checkout session for a plan.
     */
    public function createCheckoutSession(Request $request)
    {
        $request->validate([
            'user_id' => 'required|string',
            'plan_id' => 'required|exists:plans,id',
            'success_url' => 'required|url',
            'cancel_url' => 'required|url',
        ]);

        $userId = $request->user_id;
        
        if (!$userId) {
            return response()->json(['error' => 'User ID is required'], 400);
        }

        $plan = Plan::findOrFail($request->plan_id);

        try {
            // Create a checkout session
            $session = $this->stripe->checkout->sessions->create([
                'payment_method_types' => ['card'],
                'line_items' => [
                    [
                        'price_data' => [
                            'currency' => 'usd',
                            'product_data' => [
                                'name' => $plan->name,
                                'description' => $plan->description,
                            ],
                            'unit_amount' => $plan->price * 100, // Stripe uses cents
                        ],
                        'quantity' => 1,
                    ],
                ],
                'mode' => 'payment',
                'success_url' => $request->success_url . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => $request->cancel_url,
                'metadata' => [
                    'user_id' => $userId,
                    'plan_id' => $plan->id,
                ],
            ]);
            
            return response()->json([
                'session_id' => $session->id,
                'checkout_url' => $session->url,
            ]);
            
        } catch (ApiErrorException $e) {
            Log::error('Stripe error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        } catch (\Exception $e) {
            Log::error('Checkout session creation error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create checkout session'], 500);
        }
    }

    /**
     * Handle the checkout session completion webhook.
     */
    public function handleCheckoutSessionCompleted(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');
        
        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload, $sigHeader, $endpointSecret
            );
            
            if ($event->type === 'checkout.session.completed') {
                $session = $event->data->object;
                
                // Process the checkout session
                $this->processCheckoutSession($session);
            }
            
            return response()->json(['status' => 'success']);
            
        } catch (\UnexpectedValueException $e) {
            Log::error('Invalid payload: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            Log::error('Invalid signature: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        } catch (\Exception $e) {
            Log::error('Webhook processing error: ' . $e->getMessage());
            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    /**
     * Process a completed checkout session.
     */
    protected function processCheckoutSession($session)
    {
        $userId = $session->metadata->user_id;
        $planId = $session->metadata->plan_id;
        
        DB::beginTransaction();
        try {
            $plan = Plan::findOrFail($planId);
            
            // Calculate subscription dates
            $startDate = now();
            $endDate = $this->calculateEndDate($startDate, $plan);
            
            // Create subscription
            $subscription = Subscription::create([
                'user_id' => $userId,
                'plan_id' => $planId,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => 'active',
                'stripe_customer_id' => $session->customer,
            ]);
            
            // Create invoice
            $invoice = Invoice::create([
                'subscription_id' => $subscription->id,
                'amount' => $plan->price,
                'status' => 'paid',
                'due_date' => now(),
                'paid_at' => now(),
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'stripe_payment_intent_id' => $session->payment_intent,
            ]);
            
            DB::commit();
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Checkout session processing error: ' . $e->getMessage());
            throw $e;
        }
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
} 