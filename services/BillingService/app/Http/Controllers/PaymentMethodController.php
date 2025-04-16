<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class PaymentMethodController extends Controller
{
    protected $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    /**
     * Create a setup intent for adding a payment method.
     */
    public function createSetupIntent(Request $request)
    {
        $request->validate([
            'user_id' => 'required|string',
        ]);
        
        $userId = $request->user_id;
        
        try {
            // Create a customer if one doesn't exist
            $customer = $this->getOrCreateCustomer($userId);
            
            // Create a setup intent
            $setupIntent = $this->stripe->setupIntents->create([
                'customer' => $customer->id,
                'usage' => 'off_session',
            ]);
            
            return response()->json([
                'client_secret' => $setupIntent->client_secret,
                'customer_id' => $customer->id,
            ]);
            
        } catch (ApiErrorException $e) {
            Log::error('Stripe error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        } catch (\Exception $e) {
            Log::error('Setup intent creation error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create setup intent'], 500);
        }
    }

    /**
     * List payment methods for a user.
     */
    public function index(Request $request)
    {
        $request->validate([
            'user_id' => 'required|string',
        ]);
        
        $userId = $request->user_id;
        
        try {
            // Get customer
            $customer = $this->getOrCreateCustomer($userId);
            
            // List payment methods
            $paymentMethods = $this->stripe->paymentMethods->all([
                'customer' => $customer->id,
                'type' => 'card',
            ]);
            
            return response()->json($paymentMethods->data);
            
        } catch (ApiErrorException $e) {
            Log::error('Stripe error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        } catch (\Exception $e) {
            Log::error('Payment methods listing error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to list payment methods'], 500);
        }
    }

    /**
     * Delete a payment method.
     */
    public function destroy(string $id, Request $request)
    {
        $request->validate([
            'user_id' => 'required|string',
        ]);
        
        $userId = $request->user_id;
        
        try {
            // Detach payment method from customer
            $this->stripe->paymentMethods->detach($id);
            
            return response()->json(['message' => 'Payment method deleted successfully']);
            
        } catch (ApiErrorException $e) {
            Log::error('Stripe error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        } catch (\Exception $e) {
            Log::error('Payment method deletion error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete payment method'], 500);
        }
    }

    /**
     * Get or create a Stripe customer for the user.
     */
    protected function getOrCreateCustomer(string $userId)
    {
        // In a real application, you might want to store this in a customers table
        // For now, we'll search for existing customers or create a new one
        $customers = $this->stripe->customers->all([
            'limit' => 1,
            'email' => $userId . '@example.com', // Using user ID as email for simplicity
        ]);
        
        if (!empty($customers->data)) {
            return $customers->data[0];
        }
        
        // Create a new customer
        return $this->stripe->customers->create([
            'email' => $userId . '@example.com',
            'metadata' => [
                'user_id' => $userId,
            ],
        ]);
    }
} 