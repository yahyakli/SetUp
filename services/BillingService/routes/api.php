<?php

use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\SubscriptionController;
use Illuminate\Support\Facades\Route;

// Plans
Route::get('/plans', [PlanController::class, 'index']);
Route::get('/plans/{id}', [PlanController::class, 'show']);

// Admin routes for plans management (should be protected)
Route::middleware(['auth:api', 'api.token', 'is.admin'])->group(function () {
    Route::post('/plans', [PlanController::class, 'store']);
    Route::put('/plans/{id}', [PlanController::class, 'update']);
    Route::delete('/plans/{id}', [PlanController::class, 'destroy']);
});

// Subscriptions
Route::middleware(['auth:api', 'api.token'])->group(function () {
    Route::get('/subscriptions', [SubscriptionController::class, 'index']);
    Route::get('/subscriptions/{id}', [SubscriptionController::class, 'show']);
    Route::post('/subscriptions', [SubscriptionController::class, 'create']);
    Route::post('/subscriptions/{id}/cancel', [SubscriptionController::class, 'cancel']);
});

// Invoices
Route::middleware(['auth:api', 'api.token'])->group(function () {
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::get('/invoices/{id}', [InvoiceController::class, 'show']);
    Route::get('/invoices/{id}/download', [InvoiceController::class, 'downloadPdf']);
});

// Payment Methods
Route::middleware(['auth:api', 'api.token'])->group(function () {
    Route::get('/payment-methods', [PaymentMethodController::class, 'index']);
    Route::post('/payment-methods', [PaymentMethodController::class, 'create']);
    Route::delete('/payment-methods/{id}', [PaymentMethodController::class, 'delete']);
    Route::post('/payment-methods/{id}/default', [PaymentMethodController::class, 'setDefault']);
});

// Checkout
Route::middleware(['auth:api', 'api.token'])->group(function () {
    Route::post('/checkout', [CheckoutController::class, 'initiateCheckout']);
    Route::get('/checkout/success', [CheckoutController::class, 'checkoutSuccess']);
    Route::get('/checkout/cancel', [CheckoutController::class, 'checkoutCancel']);
});

// Webhooks (no authentication required)
Route::post('/webhooks/stripe', [SubscriptionController::class, 'handleWebhook', 'stripe']);
Route::post('/webhooks/paypal', [SubscriptionController::class, 'handleWebhook', 'paypal']);
