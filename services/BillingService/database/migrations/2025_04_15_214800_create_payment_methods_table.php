<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('user_id');
            $table->enum('payment_gateway', ['stripe', 'paypal']);
            $table->string('gateway_payment_method_id');
            $table->boolean('is_default')->default(false);
            $table->string('last_four')->nullable();
            $table->string('card_type')->nullable();
            $table->string('expires_at')->nullable();
            $table->timestamps();
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
