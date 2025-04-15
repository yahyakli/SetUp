<?php

namespace App\Services\PaymentGateway;

use Illuminate\Http\Request;

interface PaymentGatewayInterface
{
    public function createSubscription(array $data);
    public function cancelSubscription(string $subscriptionId);
    public function createPaymentMethod(array $data);
    public function deletePaymentMethod(string $paymentMethodId);
    public function createCheckoutSession(array $data);
    public function processSuccessfulCheckout(string $sessionId);
    public function handleWebhook(Request $request);
}
