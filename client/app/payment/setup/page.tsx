'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, Shield, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useAppContext } from '@/context/AppContext';
import AppLayout from '@/app/AppLayout';
import { Plan } from '@/types';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function SetupForm({ planDetails }: { planDetails: Plan | null }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan_id');
  const { user } = useSelector((state: RootState) => state.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !planId || !user) {
      return;
    }

    setIsLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      // Create payment method with the card element
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Create subscription with the payment method ID
      const response = await axios.post('/api/subscriptions', {
        user_id: user.id,
        plan_id: Number(planId),
        payment_method_id: paymentMethod.id,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 201) {
        // Redirect to payment page with client secret
        router.push(`/payment?client_secret=${response.data.client_secret}&subscription_id=${response.data.subscription.id}`);
      }
    } catch (error) {
      console.error('Payment setup error:', error);
      toast.error(error instanceof Error ? error.message : "Payment setup failed");
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
        <div className="p-4 border rounded-lg bg-card dark:bg-card/80 shadow-sm">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                fontFamily: 'system-ui, sans-serif',
                '::placeholder': {
                  color: '#aab7c4',
                },
                iconColor: '#6366f1',
              },
              invalid: {
                color: '#ef4444',
                iconColor: '#ef4444',
              },
            },
            hidePostalCode: true,
          }} />
        </div>
      </div>
      
      <div className="pt-4">
        <Button 
          type="submit" 
          className="w-full py-6 text-base font-medium"
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
              Pay ${planDetails?.price || '0'} {planDetails?.billing_cycle === 'monthly' ? '/month' : 
                planDetails?.billing_cycle === 'quarterly' ? '/quarter' : 
                planDetails?.billing_cycle === 'yearly' ? '/year' : ''}
            </>
          )}
        </Button>
      </div>
      
      <div className="text-center text-sm text-muted-foreground pt-2">
        <p>By subscribing, you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </form>
  );
}

function PlanCard({ plan }: { plan: Plan | null }) {
  if (!plan) return <div className="animate-pulse space-y-4">
    <div className="h-8 bg-muted rounded-md w-3/4"></div>
    <div className="h-6 bg-muted rounded-md w-1/2"></div>
    <div className="h-10 bg-muted rounded-md w-1/3"></div>
    <div className="space-y-2">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-4 bg-muted rounded-md w-full"></div>
      ))}
    </div>
  </div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{plan.name}</h2>
        <p className="text-muted-foreground">{plan.description}</p>
      </div>
      
      <div className="text-3xl font-bold">
        ${plan.price}
        <span className="text-sm font-normal text-muted-foreground ml-1">
          {plan.billing_cycle === 'monthly' ? '/month' :
            plan.billing_cycle === 'quarterly' ? '/quarter' :
              plan.billing_cycle === 'yearly' ? '/year' : ''}
        </span>
      </div>
      
      <div className="space-y-3 pt-2">
        <h3 className="font-medium">Plan includes:</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span>{plan.projects === -1 ? 'Unlimited' : plan.projects} projects</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span>{plan.teams === -1 ? 'Unlimited' : plan.teams} teams owned</span>
          </li>
          {plan.chat && (
            <li className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span>Chat Support</span>
            </li>
          )}
          {plan.priority && (
            <li className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span>Priority support</span>
            </li>
          )}
        </ul>
      </div>
      
      <div className="pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Secure payment processing by Stripe</span>
        </div>
      </div>
    </div>
  );
}

export default function SetupPage() {
  const { plans } = useAppContext();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan_id');
  const [planDetails, setPlanDetails] = useState<Plan | null>(null);
  
  useEffect(() => {
    if (plans && planId) {
      const selectedPlan = plans.find(p => p.id === Number(planId));
      if (selectedPlan) {
        setPlanDetails(selectedPlan);
      }
    }
  }, [plans, planId]);

  return (
    <AppLayout>
      <div className="container max-w-6xl py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Complete Your Subscription</h1>
          <p className="text-muted-foreground">Enter your payment details to subscribe to the plan</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="md:order-2">
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
              <CardDescription>
                Review your selected subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlanCard plan={planDetails} />
            </CardContent>
          </Card>
          
          <Card className="md:order-1">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Provide your card information to complete your subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise}>
                <SetupForm planDetails={planDetails} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
} 