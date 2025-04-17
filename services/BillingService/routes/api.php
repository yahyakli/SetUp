<?php

use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\SubscriptionController;
use Illuminate\Support\Facades\Route;

// Plans
Route::get('/plans/active', [PlanController::class, 'index']);
Route::get('/plans/{id}', [PlanController::class, 'show']);

// Admin routes for plans management (should be protected)
Route::middleware(['jwt.token'])->group(function () {
    Route::get('/plans', [PlanController::class, 'getAllPlans']);
    Route::post('/plans', [PlanController::class, 'store']);
    Route::put('/plans/{id}', [PlanController::class, 'update']);
    Route::delete('/plans/{id}', [PlanController::class, 'destroy']);
});

// Subscriptions
Route::middleware(['jwt.token'])->group(function () {
    Route::get('/subscriptions', [SubscriptionController::class, 'index']);
    Route::post('/subscriptions', [SubscriptionController::class, 'store']);
    Route::get('/subscriptions/{id}/{userId}', [SubscriptionController::class, 'show']);
    Route::post('/subscriptions/{id}/cancel', [SubscriptionController::class, 'cancel']);
    Route::get('/subscriptions/user/{userId}', [SubscriptionController::class, 'getUserSubscriptions']);
    Route::get('/subscriptions/user/{userId}/active', [SubscriptionController::class, 'getUserActiveSubscription']);
});

// Invoices
Route::middleware(['jwt.token'])->group(function () {
    // Specific routes first
    Route::get('/invoices/paid/{userId}', [InvoiceController::class, 'getUserPaidInvoices']);
    Route::get('/invoices/{id}/download', [InvoiceController::class, 'downloadPdf']);
    
    // General routes after
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::get('/invoices/{id}/{userId}', [InvoiceController::class, 'show']);
    Route::post('/invoices/{id}/pay', [InvoiceController::class, 'pay']);
    Route::post('/invoices/{id}/cancel', [InvoiceController::class, 'cancel']);
});

// Payment Methods
Route::middleware(['jwt.token'])->group(function () {
    Route::get('/payment-methods', [PaymentMethodController::class, 'index']);
    Route::post('/payment-methods/setup-intent', [PaymentMethodController::class, 'createSetupIntent']);
    Route::delete('/payment-methods/{id}', [PaymentMethodController::class, 'destroy']);
});

// Checkout
Route::middleware(['jwt.token'])->group(function () {
    Route::post('/checkout/create-session', [CheckoutController::class, 'createCheckoutSession']);
});

// Stripe Webhooks
Route::post('/webhooks/stripe', [CheckoutController::class, 'handleCheckoutSessionCompleted']);

// Test route without middleware for debugging
Route::get('/test', function () {
    return response()->json([
        'message' => 'Hello, World!',
        'routes' => Route::getRoutes()->getRoutesByMethod()['GET'],
        'url' => request()->url(),
        'path' => request()->path(),
    ]);
});

// Add this outside any middleware group for testing
Route::get('/test-invoices/{userId}', [InvoiceController::class, 'getUserPaidInvoices']);
