<?php

namespace App\Services\PaymentGateway;

use App\Models\Invoice;
use App\Models\PaymentMethod;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaypalGateway implements PaymentGatewayInterface
{
    protected $client;
    protected $baseUrl;
    protected $clientId;
    protected $secret;
    protected $accessToken;

    public function __construct()
    {
        $this->clientId = config('services.paypal.client_id');
        $this->secret = config('services.paypal.secret');
        $this->baseUrl = config('services.paypal.sandbox') ? 
            'https://api-m.sandbox.paypal.com' : 
            'https://api-m.paypal.com';
            
        $this->getAccessToken();
    }
    
    protected function getAccessToken()
    {
        try {
            $response = Http::withBasicAuth($this->clientId, $this->secret)
                ->asForm()
                ->post("{$this->baseUrl}/v1/oauth2/token", [
                    'grant_type' => 'client_credentials'
                ]);
                
            if ($response->successful()) {
                $this->accessToken = $response->json()['access_token'];
                return $this->accessToken;
            } else {
                Log::error('PayPal API Error: Failed to get access token', ['response' => $response->body()]);
                throw new \Exception('Failed to get PayPal access token');
            }
        } catch (\Exception $e) {
            Log::error('PayPal API Error: ' . $e->getMessage());
            throw $e;
        }
    }
    
    public function createSubscription(array $data)
    {
        try {
            // Create product if it doesn't exist
            $productId = $this->getProductIdForPlan($data['plan']);
            
            // Create plan if it doesn't exist
            $paypalPlanId = $this->getPlanIdForPlan($data['plan']);
            
            // Create subscription
            $response = Http::withToken($this->accessToken)
                ->post("{$this->baseUrl}/v1/billing/subscriptions", [
                    'plan_id' => $paypalPlanId,
                    'application_context' => [
                        'return_url' => $data['return_url'],
                        'cancel_url' => $data['cancel_url'],
                        'brand_name' => config('app.name'),
                        'shipping_preference' => 'NO_SHIPPING',
                        'user_action' => 'SUBSCRIBE_NOW',
                        'payment_method' => [
                            'payer_selected' => 'PAYPAL',
                            'payee_preferred' => 'IMMEDIATE_PAYMENT_REQUIRED'
                        ]
                    ],
                    'subscriber' => [
                        'name' => [
                            'given_name' => 'PLACEHOLDER_FIRST',
                            'surname' => 'PLACEHOLDER_LAST'
                        ],
                        'email_address' => 'PLACEHOLDER_EMAIL'
                    ]
                ]);
                
            if ($response->successful()) {
                $subscriptionData = $response->json();
                
                // Store temporary subscription data in session to be retrieved after redirect
                session()->put('paypal_subscription_data', [
                    'user_id' => $data['user_id'],
                    'plan_id' => $data['plan']->id,
                    'paypal_subscription_id' => $subscriptionData['id']
                ]);
                
                // Return redirect URL
                return [
                    'subscription_id' => $subscriptionData['id'],
                    'approval_url' => $this->getApprovalUrl($subscriptionData['links']),
                    'success' => true
                ];
            } else {
                Log::error('PayPal API Error: Failed to create subscription', ['response' => $response->body()]);
                return [
                    'error' => 'Failed to create subscription',
                    'success' => false
                ];
            }
        } catch (\Exception $e) {
            Log::error('PayPal API Error: ' . $e->getMessage());
            return [
                'error' => $e->getMessage(),
                'success' => false
            ];
        }
    }
    
    public function cancelSubscription(string $subscriptionId)
    {
        try {
            $response = Http::withToken($this->accessToken)
                ->post("{$this->baseUrl}/v1/billing/subscriptions/{$subscriptionId}/cancel", [
                    'reason' => 'Canceled by user'
                ]);
                
            if ($response->successful()) {
                return ['success' => true];
            } else {
                Log::error('PayPal API Error: Failed to cancel subscription', ['response' => $response->body()]);
                return [
                    'error' => 'Failed to cancel subscription',
                    'success' => false
                ];
            }
        } catch (\Exception $e) {
            Log::error('PayPal API Error: ' . $e->getMessage());
            return [
                'error' => $e->getMessage(),
                'success' => false
            ];
        }
    }
    
    public function createPaymentMethod(array $data)
    {
        // PayPal doesn't store payment methods in the same way Stripe does
        // Instead, we'll return info to redirect user to PayPal
        return [
            'redirect_url' => $this->baseUrl . '/connect',
            'success' => true
        ];
    }
    
    public function deletePaymentMethod(string $paymentMethodId)
    {
        // PayPal manages payment methods differently
        // Just remove it from our database
        return ['success' => true];
    }
    
    public function createCheckoutSession(array $data)
    {
        // For PayPal, we'll just create a subscription with immediate redirect
        return $this->createSubscription($data);
    }
    
    public function processSuccessfulCheckout(string $sessionId)
    {
        try {
            // Get subscription details from PayPal
            $response = Http::withToken($this->accessToken)
                ->get("{$this->baseUrl}/v1/billing/subscriptions/{$sessionId}");
                
            if ($response->successful()) {
                $subscriptionData = $response->json();
                
                // Get stored data from session
                $storedData = session()->get('paypal_subscription_data');
                
                if (!$storedData) {
                    return [
                        'error' => 'Subscription data not found',
                        'success' => false
                    ];
                }
                
                // Create subscription record
                $subscription = Subscription::create([
                    'user_id' => $storedData['user_id'],
                    'plan_id' => $storedData['plan_id'],
                    'status' => 'active',
                    'payment_gateway' => 'paypal',
                    'gateway_subscription_id' => $subscriptionData['id'],
                    'start_date' => now(),
                    'end_date' => $this->getEndDateFromSubscription($subscriptionData),
                ]);
                
                // Create invoice record
                Invoice::create([
                    'subscription_id' => $subscription->id,
                    'user_id' => $storedData['user_id'],
                    'amount' => Plan::find($storedData['plan_id'])->price,
                    'status' => 'paid',
                    'payment_gateway' => 'paypal',
                    'gateway_invoice_id' => $this->getInvoiceIdFromSubscription($subscriptionData),
                    'gateway_payment_id' => $this->getTransactionIdFromSubscription($subscriptionData),
                    'invoice_number' => 'INV-' . time(),
                    'invoice_date' => now(),
                    'due_date' => now(),
                    'paid_at' => now(),
                ]);
                
                // Clear session data
                session()->forget('paypal_subscription_data');
                
                return [
                    'success' => true,
                    'subscription_id' => $subscription->id,
                ];
            } else {
                Log::error('PayPal API Error: Failed to get subscription details', ['response' => $response->body()]);
                return [
                    'error' => 'Failed to get subscription details',
                    'success' => false
                ];
            }
        } catch (\Exception $e) {
            Log::error('PayPal API Error: ' . $e->getMessage());
            return [
                'error' => $e->getMessage(),
                'success' => false
            ];
        }
    }
    
    public function handleWebhook(Request $request)
    {
        try {
            $payload = $request->all();
            $eventType = $payload['event_type'];
            
            // Verify webhook signature
            $headers = $request->header();
            if (!$this->verifyWebhookSignature($payload, $headers)) {
                Log::error('PayPal Webhook Error: Invalid signature');
                return response()->json(['error' => 'Invalid signature'], 400);
            }
            
            switch ($eventType) {
                case 'BILLING.SUBSCRIPTION.CREATED':
                    // We handle this after redirect, nothing to do here
                    break;
                case 'BILLING.SUBSCRIPTION.ACTIVATED':
                    $this->handleSubscriptionActivated($payload['resource']);
                    break;
                case 'BILLING.SUBSCRIPTION.UPDATED':
                    $this->handleSubscriptionUpdated($payload['resource']);
                    break;
                case 'BILLING.SUBSCRIPTION.CANCELLED':
                    $this->handleSubscriptionCancelled($payload['resource']);
                    break;
                case 'BILLING.SUBSCRIPTION.SUSPENDED':
                    $this->handleSubscriptionSuspended($payload['resource']);
                    break;
                case 'PAYMENT.SALE.COMPLETED':
                    $this->handlePaymentCompleted($payload['resource']);
                    break;
                case 'PAYMENT.SALE.REFUNDED':
                    $this->handlePaymentRefunded($payload['resource']);
                    break;
                case 'PAYMENT.SALE.DENIED':
                    $this->handlePaymentDenied($payload['resource']);
                    break;
            }
            
            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error('PayPal Webhook Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
    
    // Helper methods
    protected function getProductIdForPlan($plan)
    {
        // Check if product exists in PayPal
        // If not, create it
        try {
            $productId = "product_{$plan->id}";
            $response = Http::withToken($this->accessToken)
                ->get("{$this->baseUrl}/v1/catalogs/products/{$productId}");
                
            if ($response->successful()) {
                return $productId;
            } else {
                // Create product
                $response = Http::withToken($this->accessToken)
                    ->post("{$this->baseUrl}/v1/catalogs/products", [
                        'id' => $productId,
                        'name' => $plan->name,
                        'description' => $plan->description,
                        'type' => 'SERVICE',
                        'category' => 'SOFTWARE'
                    ]);
                    
                if ($response->successful()) {
                    return $productId;
                } else {
                    Log::error('PayPal API Error: Failed to create product', ['response' => $response->body()]);
                    throw new \Exception('Failed to create PayPal product');
                }
            }
        } catch (\Exception $e) {
            Log::error('PayPal API Error: ' . $e->getMessage());
            throw $e;
        }
    }
    
    protected function getPlanIdForPlan($plan)
    {
        // Check if plan exists in PayPal
        // If not, create it
        try {
            $planId = "plan_{$plan->id}";
            $response = Http::withToken($this->accessToken)
                ->get("{$this->baseUrl}/v1/billing/plans/{$planId}");
                
            if ($response->successful()) {
                return $planId;
            } else {
                // Create plan
                $productId = $this->getProductIdForPlan($plan);
                
                $billingCycleSettings = $this->getBillingCycleSettings($plan);
                
                $response = Http::withToken($this->accessToken)
                    ->post("{$this->baseUrl}/v1/billing/plans", [
                        'product_id' => $productId,
                        'name' => $plan->name,
                        'description' => $plan->description,
                        'status' => 'ACTIVE',
                        'billing_cycles' => [
                            [
                                'frequency' => [
                                    'interval_unit' => $billingCycleSettings['interval_unit'],
                                    'interval_count' => $billingCycleSettings['interval_count']
                                ],
                                'tenure_type' => 'REGULAR',
                                'sequence' => 1,
                                'total_cycles' => 0,
                                'pricing_scheme' => [
                                    'fixed_price' => [
                                        'value' => $plan->price,
                                        'currency_code' => 'USD'
                                    ]
                                ]
                            ]
                        ],
                        'payment_preferences' => [
                            'auto_bill_outstanding' => true,
                            'setup_fee' => [
                                'value' => '0',
                                'currency_code' => 'USD'
                            ],
                            'setup_fee_failure_action' => 'CONTINUE',
                            'payment_failure_threshold' => 3
                        ]
                    ]);
                    
                if ($response->successful()) {
                    return $response->json()['id'];
                } else {
                    Log::error('PayPal API Error: Failed to create plan', ['response' => $response->body()]);
                    throw new \Exception('Failed to create PayPal plan');
                }
            }
        } catch (\Exception $e) {
            Log::error('PayPal API Error: ' . $e->getMessage());
            throw $e;
        }
    }
    
    protected function getBillingCycleSettings($plan)
    {
        switch ($plan->billing_cycle) {
            case 'monthly':
                return [
                    'interval_unit' => 'MONTH',
                    'interval_count' => 1
                ];
            case 'quarterly':
                return [
                    'interval_unit' => 'MONTH',
                    'interval_count' => 3
                ];
            case 'yearly':
                return [
                    'interval_unit' => 'YEAR',
                    'interval_count' => 1
                ];
            default:
                return [
                    'interval_unit' => 'MONTH',
                    'interval_count' => 1
                ];
        }
    }
    
    protected function getApprovalUrl($links)
    {
        foreach ($links as $link) {
            if ($link['rel'] === 'approve') {
                return $link['href'];
            }
        }
        
        return null;
    }
    
    protected function getEndDateFromSubscription($subscriptionData)
    {
        // Extract the end date from PayPal subscription data
        // PayPal often uses billing cycles rather than specific end dates
        // This is a placeholder - you'll need to adjust based on actual PayPal response
        return now()->addDays(30);
    }
    
    protected function getInvoiceIdFromSubscription($subscriptionData)
    {
        // Extract invoice ID from subscription data
        // This is a placeholder - adjust based on actual PayPal response
        return $subscriptionData['id'] . '_invoice';
    }
    
    protected function getTransactionIdFromSubscription($subscriptionData)
    {
        // Extract transaction ID from subscription data
        // This is a placeholder - adjust based on actual PayPal response
        return $subscriptionData['id'] . '_transaction';
    }
    
    protected function verifyWebhookSignature($payload, $headers)
    {
        // Verify webhook signature - in a real implementation, you would
        // use PayPal's SDK or API to verify the webhook signature
        // This is a placeholder that always returns true
        return true;
    }
    
    // Webhook handlers
    protected function handleSubscriptionActivated($resource)
    {
        $subscription = Subscription::where('gateway_subscription_id', $resource['id'])->first();
        
        if ($subscription) {
            $subscription->update([
                'status' => 'active',
            ]);
        }
    }
    
    protected function handleSubscriptionUpdated($resource)
    {
        $subscription = Subscription::where('gateway_subscription_id', $resource['id'])->first();
        
        if ($subscription) {
            // Handle different status updates
            $status = $subscription->status;
            
            switch ($resource['status']) {
                case 'ACTIVE':
                    $status = 'active';
                    break;
                case 'SUSPENDED':
                    $status = 'past_due';
                    break;
                case 'CANCELLED':
                    $status = 'canceled';
                    break;
                case 'EXPIRED':
                    $status = 'expired';
                    break;
            }
            
            $subscription->update([
                'status' => $status,
            ]);
        }
    }
    
    protected function handleSubscriptionCancelled($resource)
    {
        $subscription = Subscription::where('gateway_subscription_id', $resource['id'])->first();
        
        if ($subscription) {
            $subscription->update([
                'status' => 'canceled',
                'canceled_at' => now(),
            ]);
        }
    }
    
    protected function handleSubscriptionSuspended($resource)
    {
        $subscription = Subscription::where('gateway_subscription_id', $resource['id'])->first();
        
        if ($subscription) {
            $subscription->update([
                'status' => 'past_due',
            ]);
        }
    }
    
    protected function handlePaymentCompleted($resource)
    {
        // Find the associated invoice by transaction ID or subscription ID
        $invoice = Invoice::where('gateway_payment_id', $resource['id'])
            ->orWhereHas('subscription', function ($query) use ($resource) {
                $query->where('gateway_subscription_id', $resource['billing_agreement_id']);
            })
            ->first();
            
        if ($invoice) {
            $invoice->update([
                'status' => 'paid',
                'paid_at' => now(),
                'gateway_payment_id' => $resource['id'],
            ]);
        } else {
            // Create a new invoice if one doesn't exist
            $subscription = Subscription::where('gateway_subscription_id', $resource['billing_agreement_id'])->first();
            
            if ($subscription) {
                Invoice::create([
                    'subscription_id' => $subscription->id,
                    'user_id' => $subscription->user_id,
                    'amount' => $resource['amount']['total'],
                    'status' => 'paid',
                    'payment_gateway' => 'paypal',
                    'gateway_invoice_id' => $resource['invoice_number'] ?? ($resource['id'] . '_invoice'),
                    'gateway_payment_id' => $resource['id'],
                    'invoice_number' => 'INV-' . time(),
                    'invoice_date' => now(),
                    'due_date' => now(),
                    'paid_at' => now(),
                ]);
            }
        }
    }
    
    protected function handlePaymentRefunded($resource)
    {
        $invoice = Invoice::where('gateway_payment_id', $resource['sale_id'])->first();
        
        if ($invoice) {
            $invoice->update([
                'status' => 'refunded',
            ]);
        }
    }
    
    protected function handlePaymentDenied($resource)
    {
        $invoice = Invoice::where('gateway_payment_id', $resource['id'])->first();
        
        if ($invoice) {
            $invoice->update([
                'status' => 'failed',
            ]);
            
            // Update subscription status if needed
            if ($invoice->subscription) {
                $invoice->subscription->update([
                    'status' => 'past_due',
                ]);
            }
        }
    }
}