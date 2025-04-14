"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, CreditCard } from 'lucide-react';
import Loader from '@/components/Loader';
import Image from 'next/image';
import { AxiosError } from 'axios';

interface Invoice {
  id: string;
  amount: number;
  planId: string;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  status: 'pending' | 'paid' | 'failed';
}

const PaymentPage = () => {
  const { invoiceId } = useParams();
  const router = useRouter();
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        // Here you would fetch the invoice details from your API
        // const response = await axios.get(`/api/invoices/${invoiceId}`);
        // setInvoice(response.data);
        
        // Mock invoice data for now
        setInvoice({
          id: invoiceId as string,
          amount: 49.99,
          planId: 'plan_premium',
          planName: 'Premium Plan',
          billingCycle: 'monthly',
          status: 'pending'
        });
      } catch (err) {
        if (err instanceof AxiosError) {
          setError(err.response?.data?.message || "Failed to fetch invoice details.");
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Here you would make an API call to process the payment
      // const response = await axios.post('/api/payments', {
      //   invoiceId,
      //   paymentMethod,
      //   userId: user.id
      // });
      
      // After successful payment, create subscription
      // await axios.post('/api/subscriptions', {
      //   userId: user.id,
      //   planId: invoice?.planId,
      //   billingCycle: invoice?.billingCycle
      // });
      
      // Mock successful payment for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      
      // Remove the direct navigation from here
      // setTimeout(() => {
      //   router.push('/dashboard');
      // }, 3000);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Payment failed. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-10 flex justify-center items-center min-h-[70vh]">
          <Card className="w-full max-w-md shadow-sm">
            <CardHeader className="text-center border-b bg-muted/40 pb-6">
              <CardTitle className="text-xl mb-2">Loading Payment Details</CardTitle>
              <CardDescription>
                Please wait while we retrieve your payment information...
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <Loader />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (success) {
    return (
      <AppLayout>
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-10 flex justify-center items-center min-h-[70vh]">
          <Card className="w-full max-w-md shadow-sm">
            <CardHeader className="text-center border-b bg-muted/40 pb-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Payment Successful!</CardTitle>
              <CardDescription className="mt-2 text-base">
                Thank you for your subscription. You will be redirected to your dashboard shortly.
              </CardDescription>
            </CardHeader>
            <CardFooter className="p-6 flex justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (error && !invoice) {
    return (
      <AppLayout>
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-muted/40 pb-4">
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-red-500">{error}</p>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 pt-4 mt-2">
              <Button onClick={() => router.push('/')} size="lg">Return to Plans</Button>
            </CardFooter>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold mb-8">Complete Your Payment</h1>
        
        {invoice && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card className="shadow-sm">
                <CardHeader className="border-b bg-muted/40 pb-4">
                  <CardTitle className="text-xl">Payment Method</CardTitle>
                  <CardDescription className="mt-1.5">Choose your preferred payment method</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 px-6">
                  <RadioGroup 
                    value={paymentMethod} 
                    onValueChange={(value) => setPaymentMethod(value as 'stripe' | 'paypal')}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-3 border p-4 rounded-md hover:border-primary/50 transition-colors">
                      <RadioGroupItem value="stripe" id="stripe" />
                      <Label htmlFor="stripe" className="flex-1 cursor-pointer flex items-center">
                        <div className="font-medium">Credit Card</div>
                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Stripe</span>
                          <Image 
                            src="/stripe-logo.png" 
                            alt="Stripe" 
                            width={60} 
                            height={25}
                            className="h-6 w-auto object-contain"
                          />
                        </div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3 border p-4 rounded-md hover:border-primary/50 transition-colors">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="flex-1 cursor-pointer flex items-center">
                        <div className="font-medium">PayPal</div>
                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">PayPal</span>
                          <Image 
                            src="/paypal-logo.png" 
                            alt="PayPal" 
                            width={80} 
                            height={20}
                            className="h-6 w-auto object-contain"
                          />
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {/* Payment form would go here - simplified for this example */}
                  {paymentMethod === 'stripe' && (
                    <div className="mt-6 space-y-4 border p-6 rounded-md bg-card">
                      <div className="grid grid-cols-2 gap-5">
                        <div className="col-span-2">
                          <Label htmlFor="cardNumber" className="text-sm font-medium mb-1.5 block">Card Number</Label>
                          <div className="flex">
                            <input
                              type="text"
                              id="cardNumber"
                              placeholder="4242 4242 4242 4242"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <CreditCard className="ml-2 h-10 w-5 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="expiry" className="text-sm font-medium mb-1.5 block">Expiry Date</Label>
                          <input
                            type="text"
                            id="expiry"
                            placeholder="MM/YY"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvc" className="text-sm font-medium mb-1.5 block">CVC</Label>
                          <input
                            type="text"
                            id="cvc"
                            placeholder="123"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {paymentMethod === 'paypal' && (
                    <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-md text-center">
                      <p>You will be redirected to PayPal to complete your payment.</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t bg-muted/20 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-between p-6">
                  <Button 
                    onClick={handlePayment} 
                    disabled={isProcessing}
                    className="w-full sm:w-auto"
                    size="lg"
                  >
                    {isProcessing ? "Processing Payment..." : `Pay $${invoice.amount}`}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => router.back()}
                    className="w-full sm:w-auto"
                  >
                    Back
                  </Button>
                </CardFooter>
              </Card>
              
              {error && (
                <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            
            <div>
              <Card className="shadow-sm sticky top-24">
                <CardHeader className="border-b bg-muted/40 pb-4">
                  <CardTitle className="text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6 px-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Plan</span>
                    <span className="font-medium">{invoice.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Billing Cycle</span>
                    <span className="font-medium capitalize">{invoice.billingCycle}</span>
                  </div>
                  <div className="border-t pt-5 mt-5">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${invoice.amount}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-600 dark:text-gray-400 border-t p-6">
                  <p>
                    By proceeding with the payment, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PaymentPage; 