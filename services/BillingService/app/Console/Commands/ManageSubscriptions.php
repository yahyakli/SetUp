<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ManageSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:manage';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage subscriptions: cancel pending ones after 30 minutes and handle expired subscriptions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->cancelPendingSubscriptions();
        $this->handleExpiredSubscriptions();
        
        $this->info('Subscription management completed successfully.');
        return Command::SUCCESS;
    }

    /**
     * Cancel pending subscriptions that are older than 30 minutes
     */
    private function cancelPendingSubscriptions()
    {
        $this->info('Checking for pending subscriptions older than 30 minutes...');
        
        $cutoffTime = now()->subMinutes(30);
        $pendingSubscriptions = Subscription::where('status', 'pending')
            ->where('created_at', '<', $cutoffTime)
            ->get();
            
        $count = 0;
        foreach ($pendingSubscriptions as $subscription) {
            DB::beginTransaction();
            try {
                // Update subscription status
                $subscription->update([
                    'status' => 'canceled',
                ]);
                
                // Cancel any pending invoices
                $subscription->invoices()
                    ->where('status', 'pending')
                    ->update(['status' => 'canceled']);
                    
                DB::commit();
                $count++;
                
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Failed to cancel pending subscription #' . $subscription->id . ': ' . $e->getMessage());
                $this->error('Failed to cancel subscription #' . $subscription->id . ': ' . $e->getMessage());
            }
        }
        
        $this->info("Canceled {$count} pending subscriptions.");
    }

    /**
     * Handle expired subscriptions - renew or expire based on auto_renew setting
     */

    //  * * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
    // php artisan subscriptions:manage
    private function handleExpiredSubscriptions()
    {
        $this->info('Checking for expired subscriptions...');
        
        $expiredSubscriptions = Subscription::where('status', 'active')
            ->where('end_date', '<', now())
            ->get();
            
        $renewed = 0;
        $expired = 0;
        $failed = 0;
        
        foreach ($expiredSubscriptions as $subscription) {
            DB::beginTransaction();
            try {
                if ($subscription->auto_renew) {
                    // Only attempt to renew if we have Stripe information
                    if ($subscription->stripe_customer_id && $subscription->stripe_subscription_id) {
                        // Process payment through Stripe
                        $paymentSuccess = $this->processStripePayment($subscription);
                        
                        if ($paymentSuccess) {
                            // Renew the subscription
                            $startDate = now();
                            $endDate = $this->calculateEndDate($startDate, $subscription->plan);
                            
                            $subscription->update([
                                'start_date' => $startDate,
                                'end_date' => $endDate,
                            ]);
                            
                            // Create a new paid invoice
                            $invoice = Invoice::create([
                                'subscription_id' => $subscription->id,
                                'amount' => $subscription->plan->price,
                                'status' => 'paid',
                                'due_date' => now(),
                                'paid_date' => now(),
                                'invoice_number' => Invoice::generateInvoiceNumber(),
                            ]);
                            
                            $renewed++;
                        } else {
                            // Payment failed, create pending invoice
                            $invoice = Invoice::create([
                                'subscription_id' => $subscription->id,
                                'amount' => $subscription->plan->price,
                                'status' => 'pending',
                                'due_date' => now()->addDays(7),
                                'invoice_number' => Invoice::generateInvoiceNumber(),
                            ]);
                            
                            // Notify user about failed payment
                            $this->notifyPaymentFailed($subscription);
                            $failed++;
                        }
                    } else {
                        // No Stripe info, create pending invoice
                        $invoice = Invoice::create([
                            'subscription_id' => $subscription->id,
                            'amount' => $subscription->plan->price,
                            'status' => 'pending',
                            'due_date' => now()->addDays(7),
                            'invoice_number' => Invoice::generateInvoiceNumber(),
                        ]);
                        
                        $renewed++;
                    }
                } else {
                    // Mark as expired
                    $subscription->update([
                        'status' => 'expired',
                    ]);
                    
                    $expired++;
                }
                
                DB::commit();
                
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Failed to process expired subscription #' . $subscription->id . ': ' . $e->getMessage());
                $this->error('Failed to process subscription #' . $subscription->id . ': ' . $e->getMessage());
            }
        }
        
        $this->info("Renewed {$renewed} subscriptions, expired {$expired} subscriptions, and had {$failed} payment failures.");
    }

    /**
     * Process payment through Stripe
     * 
     * @param Subscription $subscription
     * @return bool Whether payment was successful
     */
    private function processStripePayment(Subscription $subscription)
    {
        try {
            $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
            
            // Create an invoice item
            $invoiceItem = $stripe->invoiceItems->create([
                'customer' => $subscription->stripe_customer_id,
                'amount' => (int)($subscription->plan->price * 100), // Convert to cents
                'currency' => 'usd', // Adjust based on your currency
                'description' => 'Renewal for ' . $subscription->plan->name,
            ]);
            
            // Create and pay the invoice immediately
            $invoice = $stripe->invoices->create([
                'customer' => $subscription->stripe_customer_id,
                'auto_advance' => true, // Auto-finalize the invoice
                'collection_method' => 'charge_automatically',
            ]);
            
            // Pay the invoice immediately
            $paidInvoice = $stripe->invoices->pay($invoice->id);
            
            // Check if payment was successful
            return $paidInvoice->status === 'paid';
            
        } catch (\Exception $e) {
            Log::error('Stripe payment processing error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify user about failed payment
     * 
     * @param Subscription $subscription
     */
    private function notifyPaymentFailed(Subscription $subscription)
    {
        // In a real application, you would send an email or notification to the user
        // For now, we'll just log it
        Log::info('Payment failed for subscription #' . $subscription->id . ' for user ' . $subscription->user_id);
        
        // You could implement email notification here:
        // Mail::to($userEmail)->send(new PaymentFailedNotification($subscription));
    }

    /**
     * Calculate the end date based on the plan.
     */
    protected function calculateEndDate(Carbon $startDate, $plan)
    {
        switch ($plan->billing_cycle) {
            case 'monthly':
                return $startDate->copy()->addMonth();
            case 'quarterly':
                return $startDate->copy()->addMonths(3);
            case 'yearly':
                return $startDate->copy()->addYear();
            default:
                return $startDate->copy()->addMonth();
        }
    }
} 