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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('subscription_id');
            $table->string('user_id');
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['paid', 'unpaid', 'failed', 'refunded']);
            $table->enum('payment_gateway', ['stripe', 'paypal']);
            $table->string('gateway_invoice_id');
            $table->string('gateway_payment_id')->nullable();
            $table->string('invoice_number');
            $table->timestamp('invoice_date');
            $table->timestamp('due_date');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            
            $table->foreign('subscription_id')->references('id')->on('subscriptions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
