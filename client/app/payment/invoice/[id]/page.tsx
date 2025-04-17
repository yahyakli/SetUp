'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield, CreditCard, Lock } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import AppLayout from '@/app/AppLayout';
import { Invoice, Plan, Subscription } from '@/types';
import { BILLING_SERVICE_URL } from '@/constants/API_URLS';
import { useAppContext } from '@/context/AppContext';
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function PaymentForm({ invoice, subscription }: { invoice: Invoice, subscription: Subscription }) {
  const { setUserPermissions, setUserSubscription } = useAppContext();
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !user) {
      return;
    }

    setIsLoading(true);

    try {
      // Get payment method from Elements
      const { setupIntent, error } = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?payment_success=true&plan=${subscription.plan?.name}`,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Pay the invoice with the payment method
      const response = await axios.post(`${BILLING_SERVICE_URL}/api/invoices/${invoice.id}/pay`, {
        user_id: user.id,
        payment_method_id: setupIntent.payment_method,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.payment_status === 'succeeded') {
        // Redirect directly to dashboard with success parameter
        const newSub = response.data.subscription;
        setUserPermissions({
          projects: newSub.plan.projects,
          teams: newSub.plan.teams,
          chat: newSub.plan.chat,
          priority: newSub.plan.priority,
          analytics: newSub.plan.analytics,
          security: newSub.plan.security
        });
        setUserSubscription(newSub);
        router.push(`/dashboard?payment_success=true&plan=${subscription.plan?.name}`);
      } else {
        // Handle additional actions if needed
        const { client_secret } = response.data;
        const { error: confirmError } = await stripe.confirmCardPayment(client_secret);
        
        if (confirmError) {
          throw new Error(confirmError.message);
        } else {
          // Redirect directly to dashboard with success parameter
          router.push(`/dashboard?payment_success=true&plan=${subscription.plan?.name}`);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Payment Information</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your payment information is securely processed by Stripe.
        </p>
        <div className="p-5 border rounded-lg bg-card dark:bg-card/80 shadow-sm">
          <PaymentElement />
        </div>
      </div>
      
      <div className="pt-4">
        <Button 
          type="submit" 
          className="w-full py-6 text-base font-medium bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-200"
          disabled={!stripe || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-5 w-5" />
              Pay ${invoice?.amount || '0'}
            </>
          )}
        </Button>
      </div>
      
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-3">
        <Lock className="h-4 w-4" />
        <p>Secure payment - your information is protected</p>
      </div>
    </form>
  );
}

function PlanCard({ plan }: { plan: Plan | null }) {
  if (!plan) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-muted rounded-md w-3/4"></div>
      <div className="h-4 bg-muted rounded-md w-1/2"></div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded-md w-full"></div>
        <div className="h-4 bg-muted rounded-md w-full"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className={`text-xl font-semibold ${
          plan.special_title 
            ? 'bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent'
            : ''
        }`}>
          {plan.name}
        </h3>
        <p className="text-muted-foreground text-sm">{plan.description}</p>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Price:</span>
        <span className="font-medium text-lg">
          ${plan.price}
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            {plan.billing_cycle === 'monthly' ? '/month' :
              plan.billing_cycle === 'quarterly' ? '/quarter' :
                plan.billing_cycle === 'yearly' ? '/year' : ''}
          </span>
        </span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Billing Cycle:</span>
        <span className="font-medium">
          {plan.billing_cycle === 'unlimited' ? 'One-time payment' : 
            plan.billing_cycle.charAt(0).toUpperCase() + plan.billing_cycle.slice(1)}
        </span>
      </div>
      
      <div className="space-y-3 pt-2">
        <h3 className="font-medium">Plan includes:</h3>
        <ul className="space-y-3">
          <li className="flex items-center gap-2">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            </div>
            <span>{plan.projects === -1 ? 'Unlimited' : plan.projects} projects</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            </div>
            <span>{plan.teams === -1 ? 'Unlimited' : plan.teams} teams owned</span>
          </li>
          {plan.chat && (
            <li className="flex items-center gap-2">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              </div>
              <span>Chat Support</span>
            </li>
          )}
          {plan.priority && (
            <li className="flex items-center gap-2">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              </div>
              <span>Priority support</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default function InvoicePaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const invoiceId = params?.id;
  const subscriptionId = searchParams?.get('subscription_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { token, user } = useSelector((state: RootState) => state.user);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!invoiceId || !subscriptionId || !token) {
        setError("Missing required information");
        setLoading(false);
        return;
      }
      
      try {
        // Fetch invoice details
        const invoiceResponse = await axios.get(`${BILLING_SERVICE_URL}/api/invoices/${invoiceId}/${user?.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Fetch subscription details
        const subscriptionResponse = await axios.get(`${BILLING_SERVICE_URL}/api/subscriptions/${subscriptionId}/user/${user?.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Create setup intent
        const setupResponse = await axios.post(`${BILLING_SERVICE_URL}/api/payment-methods/setup-intent`, {
          user_id: user?.id
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setInvoice(invoiceResponse.data);
        setSubscription(subscriptionResponse.data);
        setClientSecret(setupResponse.data.client_secret);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError("Failed to load payment information");
      } finally {
        setLoading(false);
      }
    };
    if ( user?.id) {
      fetchData();
    }
  }, [invoiceId, subscriptionId, token, user]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }
  
  if (error || !invoice || !subscription || !clientSecret) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>{error || "Failed to load payment information"}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.history.back()} className="w-full">
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container max-w-5xl py-12 px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              You&#39;re just one step away from accessing all the features of your plan
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="md:order-2 border-blue-200 dark:border-blue-900 shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-800/30 border-b relative p-6">
                <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/30 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(0,0,0,0.4),rgba(0,0,0,0.1))]"></div>
                <div className="relative">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <CardTitle>Subscription Details</CardTitle>
                  </div>
                  <CardDescription className="text-blue-700/70 dark:text-blue-300/70">
                    Review your subscription and invoice
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <PlanCard plan={subscription.plan || null} />
                
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-medium mb-2">Invoice Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Invoice Number:</span>
                      <span className="font-medium">{invoice.invoice_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">${invoice.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:order-1 shadow-lg border-gray-200 dark:border-gray-800 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800/80 dark:to-gray-900/60 border-b relative p-6">
                <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/20 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(0,0,0,0.4),rgba(0,0,0,0.1))]"></div>
                <div className="relative">
                  <div className="flex items-center mb-2">
                    <CreditCard className="h-5 w-5 text-gray-700 dark:text-gray-300 mr-2" />
                    <CardTitle>Payment Details</CardTitle>
                  </div>
                  <CardDescription>
                    Provide your payment information to complete your subscription
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Elements 
                  stripe={stripePromise} 
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                    },
                  }}
                >
                  <PaymentForm invoice={invoice} subscription={subscription} />
                </Elements>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 