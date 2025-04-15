<?php

namespace App\Services\PaymentGateway;

use App\Models\Invoice;
use App\Models\PaymentMethod;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class StripeGateway implements PaymentGatewayInterface
{
    protected $stripe;
    
    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }
    
    public function createSubscription(array $data)
    {
        try {
            // Create or retrieve customer
            $stripeCustomerId = $this->getStripeCustomerId($data['user_id']);
            
            // Create subscription
            $subscription = $this->stripe->subscriptions->create([
                'customer' => $stripeCustomerId,
                'items' => [
                    ['price' => $this->getPriceIdForPlan($data['plan'])],
                ],
                'payment_behavior' => 'default_incomplete',
                'payment_settings' => [
                    'save_default_payment_method' => 'on_subscription',
                ],
                'expand' => ['latest_invoice.payment_intent'],
            ]);
            
            // Create local subscription record
            $localSubscription = Subscription::create([
                'user_id' => $data['user_id'],
                'plan_id' => $data['plan']->id,
                'status' => 'active',
                'payment_gateway' => 'stripe',
                'gateway_subscription_id' => $subscription->id,
                'start_date' => now(),
                'end_date' => now()->addDays($this->calculateDaysFromBillingCycle($data['plan']->billing_cycle)),
            ]);
            
            // Create invoice record
            $stripeInvoice = $subscription->latest_invoice;
            Invoice::create([
                'subscription_id' => $localSubscription->id,
                'user_id' => $data['user_id'],
                'amount' => $data['plan']->price,
                'status' => 'unpaid',
                'payment_gateway' => 'stripe',
                'gateway_invoice_id' => $stripeInvoice->id,
                'gateway_payment_id' => $stripeInvoice->payment_intent->id ?? null,
                'invoice_number' => 'INV-' . time(),
                'invoice_date' => now(),
                'due_date' => now()->addDays(7),
            ]);
            
            return [
                'subscription_id' => $localSubscription->id,
                'client_secret' => $stripeInvoice->payment_intent->client_secret ?? null,
                'requires_action' => true,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe API Error: ' . $e->getMessage());
            return [
                'error' => $e->getMessage(),
                'success' => false
            ];
        }
    }
    
    public function cancelSubscription(string $subscriptionId)
    {
        try {
            $this->stripe->subscriptions->cancel($subscriptionId);
            return ['success' => true];
        } catch (ApiErrorException $e) {
            Log::error('Stripe API Error: ' . $e->getMessage());
            return [
                'error' => $e->getMessage(),
                'success' => false
            ];
        }
    }
    
    public function createPaymentMethod(array $data)
    {
        try {
            // Create setup intent
            $setupIntent = $this->stripe->setupIntents->create([
                'payment_method_types' => ['card'],
                'customer' => $this->getStripeCustomerId($data['user_id']),
                'usage' => 'off_session',
            ]);
            
            return [
                'client_secret' => $setupIntent->client_secret,
                'success' => true
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe API Error: ' . $e->getMessage());
            return [
                'error' => $e->getMessage(),
                'success' => false
            ];
        }
    }
    
    public function deletePaymentMethod(string $paymentMethodId)
    {
        try {
            $this->stripe->paymentMethods->detach($paymentMethodId);
            return ['success' => true];
        } catch (ApiErrorException $e) {
            Log::error('Stripe API Error: ' . $e->getMessage());
            return [
                'error' => $e->getMessage(),
                'success' => false
            ];
        }
    }
    
    public function createCheckoutSession(array $data)
    {
        try {
            $session = $this->stripe->checkout->sessions->create([
                'payment_method_types' => ['card'],
                'line_items' => [
                    [
                        'price' => $this->getPriceIdForPlan($data['plan']),
                        'quantity' => 1,
                    ],
                ],
                'mode' => 'subscription',
                'success_url' => $data['return_url'] . '?session_id={CHECKOUT_SESSION_ID}&payment_gateway=stripe',
                'cancel_url' => $data['cancel_url'],
                'customer' => $this->getStripeCustomerId($data['user_id']),
            ]);
            
            return [
                'id' => $session->id,
                'url' => $session->url,
                'success' => true
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe API Error: ' . $e->getMessage());
            return [
                'error' => $e->getMessage(),
                'success' => false
            ];
        }
    }
    
    public function processSuccessfulCheckout(string $sessionId)
    {
        try {
            $session = $this->stripe->checkout->sessions->retrieve($sessionId, [
                'expand' => ['subscription', 'customer'],
            ]);
            
            if ($session->payment_status !== 'paid') {
                return [
                    'success' => false,
                    'error' => 'Payment not completed'
                ];
            }
            
            // Get the plan from the checkout session
            $stripeSubscription = $session->subscription;
            $priceId = $stripeSubscription->items->data[0]->price->id;
            $planId = $this->getPlanIdFromPriceId($priceId);
            
            // Create subscription record
            $subscription = Subscription::create([
                'user_id' => $this->getUserIdFromStripeCustomerId($session->customer),
                'plan_id' => $planId,
                'status' => 'active',
                'payment_gateway' => 'stripe',
                'gateway_subscription_id' => $stripeSubscription->id,
                'start_date' => now(),
                'end_date' => now()->addDays($this->calculateDaysFromBillingCycle(Plan::find($planId)->billing_cycle)),
            ]);
            
            // Create invoice record
            Invoice::create([
                'subscription_id' => $subscription->id,
                'user_id' => $subscription->user_id,
                'amount' => Plan::find($planId)->price,
                'status' => 'paid',
                'payment_gateway' => 'stripe',
                'gateway_invoice_id' => $stripeSubscription->latest_invoice,
                'gateway_payment_id' => $session->payment_intent,
                'invoice_number' => 'INV-' . time(),
                'invoice_date' => now(),
                'due_date' => now(),
                'paid_at' => now(),
            ]);
            
            return [
                'success' => true,
                'subscription_id' => $subscription->id,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe API Error: ' . $e->getMessage());
            return [
                'error' => $e->getMessage(),
                'success' => false
            ];
        }
    }
    
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');
        
        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
            
            switch ($event->type) {
                case 'invoice.paid':
                    $this->handleInvoicePaid($event->data->object);
                    break;
                case 'invoice.payment_failed':
                    $this->handleInvoicePaymentFailed($event->data->object);
                    break;
                case 'customer.subscription.updated':
                    $this->handleSubscriptionUpdated($event->data->object);
                    break;
                case 'customer.subscription.deleted':
                    $this->handleSubscriptionDeleted($event->data->object);
                    break;
                case 'payment_method.attached':
                    $this->handlePaymentMethodAttached($event->data->object);
                    break;
                case 'payment_method.detached':
                    $this->handlePaymentMethodDetached($event->data->object);
                    break;
            }
            
            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error('Stripe Webhook Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
    
    // Helper methods
    protected function getStripeCustomerId($userId)
    {
        // Logic to retrieve or create Stripe customer ID for user
        // This would typically involve looking up in your database or creating a new customer
        
        return 'cus_example123'; // Placeholder
    }
    
    protected function getUserIdFromStripeCustomerId($stripeCustomerId)
    {
        // Logic to get your user ID from Stripe customer ID
        // This would typically involve looking up in your database
        
        return 1; // Placeholder
    }
    
    protected function getPriceIdForPlan($plan)
    {
        // Logic to get Stripe price ID for your plan
        // This would typically involve looking up in your database or service
        
        return 'price_example123'; // Placeholder
    }
    
    protected function getPlanIdFromPriceId($priceId)
    {
        // Logic to get your plan ID from Stripe price ID
        // This would typically involve looking up in your database
        
        return 1; // Placeholder
    }
    
    protected function calculateDaysFromBillingCycle($billingCycle)
    {
        switch ($billingCycle) {
            case 'monthly':
                return 30;
            case 'quarterly':
                return 90;
            case 'yearly':
                return 365;
            default:
                return 30;
        }
    }
    
    // Webhook handlers
    protected function handleInvoicePaid($invoice)
    {
        // Update invoice status in database
        $localInvoice = Invoice::where('gateway_invoice_id', $invoice->id)->first();
        
        if ($localInvoice) {
            $localInvoice->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);
        }
    }
    
    protected function handleInvoicePaymentFailed($invoice)
    {
        // Update invoice status in database
        $localInvoice = Invoice::where('gateway_invoice_id', $invoice->id)->first();
        
        if ($localInvoice) {
            $localInvoice->update([
                'status' => 'failed',
            ]);
            
            // Update subscription status if needed
            if ($localInvoice->subscription) {
                $localInvoice->subscription->update([
                    'status' => 'past_due',
                ]);
            }
        }
    }
    
    protected function handleSubscriptionUpdated($subscription)
    {
        $localSubscription = Subscription::where('gateway_subscription_id', $subscription->id)->first();
        
        if ($localSubscription) {
            $status = 'active';
            
            if ($subscription->status === 'canceled' || $subscription->status === 'unpaid') {
                $status = $subscription->status;
            } else if ($subscription->cancel_at_period_end) {
                $status = 'canceled';
            }
            
            $localSubscription->update([
                'status' => $status,
                'end_date' => date('Y-m-d H:i:s', $subscription->current_period_end),
            ]);
        }
    }
    
    protected function handleSubscriptionDeleted($subscription)
    {
        $localSubscription = Subscription::where('gateway_subscription_id', $subscription->id)->first();
        
        if ($localSubscription) {
            $localSubscription->update([
                'status' => 'expired',
                'end_date' => now(),
            ]);
        }
    }
    
    protected function handlePaymentMethodAttached($paymentMethod)
    {
        $userId = $this->getUserIdFromStripeCustomerId($paymentMethod->customer);
        
        PaymentMethod::create([
            'user_id' => $userId,
            'payment_gateway' => 'stripe',
            'gateway_payment_method_id' => $paymentMethod->id,
            'is_default' => false,
            'last_four' => $paymentMethod->card->last4 ?? null,
            'card_type' => $paymentMethod->card->brand ?? null,
            'expires_at' => $paymentMethod->card ? $paymentMethod->card->exp_month . '/' . $paymentMethod->card->exp_year : null,
        ]);
    }
    
    protected function handlePaymentMethodDetached($paymentMethod)
    {
        PaymentMethod::where('gateway_payment_method_id', $paymentMethod->id)->delete();
    }
}