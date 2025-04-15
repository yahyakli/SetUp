<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Services\PaymentGateway\PaymentGatewayManager;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    protected $paymentGatewayManager;

    public function __construct(PaymentGatewayManager $paymentGatewayManager)
    {
        $this->paymentGatewayManager = $paymentGatewayManager;
    }

    public function initiateCheckout(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'plan_id' => 'required|exists:plans,id',
            'payment_gateway' => 'required|in:stripe,paypal',
            'return_url' => 'required|url',
            'cancel_url' => 'required|url',
        ]);

        $plan = Plan::findOrFail($validated['plan_id']);
        $gateway = $this->paymentGatewayManager->gateway($validated['payment_gateway']);
        
        $checkoutSession = $gateway->createCheckoutSession([
            'user_id' => $validated['user_id'],
            'plan' => $plan,
            'return_url' => $validated['return_url'],
            'cancel_url' => $validated['cancel_url'],
        ]);
        
        return response()->json($checkoutSession);
    }
    
    public function checkoutSuccess(Request $request)
    {
        $validatedData = $request->validate([
            'session_id' => 'required|string',
            'payment_gateway' => 'required|in:stripe,paypal',
        ]);
        
        $gateway = $this->paymentGatewayManager->gateway($validatedData['payment_gateway']);
        $result = $gateway->processSuccessfulCheckout($validatedData['session_id']);
        
        return response()->json($result);
    }
    
    public function checkoutCancel(Request $request)
    {
        return response()->json(['status' => 'canceled']);
    }
}