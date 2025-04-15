<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'payment_gateway',
        'gateway_payment_method_id',
        'is_default',
        'last_four',
        'card_type',
        'expires_at',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];
}
