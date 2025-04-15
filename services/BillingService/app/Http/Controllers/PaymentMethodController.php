<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use App\Services\PaymentGateway\PaymentGatewayManager;
use Illuminate\Http\Request;

class PaymentMethodController extends Controller
{
    protected $paymentGatewayManager;

    public function __construct(PaymentGatewayManager $paymentGatewayManager)
    {
        $this->paymentGatewayManager = $paymentGatewayManager;
    }

    public function index(Request $request)
    {
        $paymentMethods = PaymentMethod::where('user_id', $request->user_id)->get();
        return response()->json(['payment_methods' => $paymentMethods]);
    }

    public function create(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'payment_gateway' => 'required|in:stripe,paypal',
            'payment_method_data' => 'sometimes|array',
            'return_url' => 'required|url',
        ]);

        $gateway = $this->paymentGatewayManager->gateway($validated['payment_gateway']);
        $result = $gateway->createPaymentMethod($validated);
        
        return response()->json($result);
    }

    public function delete($id, Request $request)
    {
        $paymentMethod = PaymentMethod::where('id', $id)
            ->where('user_id', $request->user_id)
            ->firstOrFail();
            
        $gateway = $this->paymentGatewayManager->gateway($paymentMethod->payment_gateway);
        $result = $gateway->deletePaymentMethod($paymentMethod->gateway_payment_method_id);
        
        if ($result['success']) {
            $paymentMethod->delete();
            return response()->json(['message' => 'Payment method deleted successfully']);
        }
        
        return response()->json(['error' => 'Failed to delete payment method'], 500);
    }
    
    public function setDefault($id, Request $request)
    {
        $paymentMethod = PaymentMethod::where('id', $id)
            ->where('user_id', $request->user_id)
            ->firstOrFail();
            
        // Reset all payment methods for this user
        PaymentMethod::where('user_id', $request->user_id)
            ->update(['is_default' => false]);
            
        // Set this one as default
        $paymentMethod->update(['is_default' => true]);
        
        return response()->json(['message' => 'Default payment method updated']);
    }
}