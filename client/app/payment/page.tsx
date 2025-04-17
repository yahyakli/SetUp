'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSafeSearchParams } from '@/components/SearchParamsProvider';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Loader from '@/components/Loader';
import AppLayout from '../AppLayout';
import ClientSideWrapper from '@/components/ClientSideWrapper';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutForm({ subscriptionId }: { subscriptionId: string | null }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?subscription_id=${subscriptionId}`,
        },
      });

      if (error) {
        toast.error(error.message || "An error occurred during payment");
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("There was an error processing your payment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <div className="mt-6">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={!stripe || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Complete Payment'
          )}
        </Button>
      </div>
    </form>
  );
}

// Update this component to use useSafeSearchParams
function SearchParamsWrapper() {
  const searchParams = useSafeSearchParams();
  return (
    <PaymentContent 
      clientSecret={searchParams?.get('client_secret') || null}
      subscriptionId={searchParams?.get('subscription_id') || null}
    />
  );
}

// This component no longer directly uses useSearchParams
function PaymentContent({ clientSecret, subscriptionId }: { 
  clientSecret: string | null, 
  subscriptionId: string | null 
}) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (clientSecret) {
      setIsReady(true);
    }
  }, [clientSecret]);

  if (!clientSecret) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Payment Error</CardTitle>
            <CardDescription>
              Missing payment information. Please try subscribing again.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => window.history.back()} className="w-full">
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
          <CardDescription>
            Enter your payment details to complete your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isReady ? (
            <Elements 
              stripe={stripePromise} 
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                },
              }}
            >
              <CheckoutForm subscriptionId={subscriptionId || null} />
            </Elements>
          ) : (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Wrapper component that properly ensures Suspense around the useSearchParams hook
function PaymentPageWrapper() {
  return (
    <div>
      <Suspense fallback={<Loader />}>
        <SearchParamsWrapper />
      </Suspense>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <AppLayout>
      <ClientSideWrapper>
        <PaymentPageWrapper />
      </ClientSideWrapper>
    </AppLayout>
  );
}

export const dynamic = 'force-dynamic'; 