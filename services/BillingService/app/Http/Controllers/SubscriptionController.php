<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Subscription;
use App\Services\PaymentGateway\PaymentGatewayManager;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    protected $paymentGatewayManager;

    public function __construct(PaymentGatewayManager $paymentGatewayManager)
    {
        $this->paymentGatewayManager = $paymentGatewayManager;
    }

    public function index(Request $request)
    {
        $subscriptions = Subscription::where('user_id', $request->user_id)->get();
        return response()->json(['subscriptions' => $subscriptions]);
    }

    public function show($id, Request $request)
    {
        $subscription = Subscription::where('id', $id)
            ->where('user_id', $request->user_id)
            ->firstOrFail();
        return response()->json(['subscription' => $subscription]);
    }

    public function create(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'plan_id' => 'required|exists:plans,id',
            'payment_gateway' => 'required|in:stripe,paypal',
            'payment_method_id' => 'sometimes|string',
            'return_url' => 'required|url',
            'cancel_url' => 'required|url',
        ]);

        $plan = Plan::findOrFail($validated['plan_id']);
        
        // Initialize the correct payment gateway
        $gateway = $this->paymentGatewayManager->gateway($validated['payment_gateway']);
        
        // Create subscription through the payment gateway
        $paymentResponse = $gateway->createSubscription([
            'user_id' => $validated['user_id'],
            'plan' => $plan,
            'payment_method_id' => $validated['payment_method_id'] ?? null,
            'return_url' => $validated['return_url'],
            'cancel_url' => $validated['cancel_url'],
        ]);
        
        // Return appropriate response based on the gateway
        return response()->json($paymentResponse);
    }
    
    public function cancel($id, Request $request)
    {
        $subscription = Subscription::where('id', $id)
            ->where('user_id', $request->user_id)
            ->firstOrFail();
            
        $gateway = $this->paymentGatewayManager->gateway($subscription->payment_gateway);
        $cancellationResult = $gateway->cancelSubscription($subscription->gateway_subscription_id);
        
        if ($cancellationResult['success']) {
            $subscription->update([
                'status' => 'canceled',
                'canceled_at' => now(),
            ]);
            
            return response()->json(['message' => 'Subscription canceled successfully']);
        }
        
        return response()->json(['error' => 'Failed to cancel subscription'], 500);
    }
    
    public function handleWebhook(Request $request, $gateway)
    {
        $gatewayService = $this->paymentGatewayManager->gateway($gateway);
        return $gatewayService->handleWebhook($request);
    }
}