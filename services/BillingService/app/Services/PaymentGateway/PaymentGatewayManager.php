<?php

namespace App\Services\PaymentGateway;

use InvalidArgumentException;

class PaymentGatewayManager
{
    public function gateway($name)
    {
        switch ($name) {
            case 'stripe':
                return new StripeGateway();
            case 'paypal':
                return new PaypalGateway();
            default:
                throw new InvalidArgumentException("Unsupported payment gateway: {$name}");
        }
    }
}
