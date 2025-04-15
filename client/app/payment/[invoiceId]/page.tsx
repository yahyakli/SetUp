"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, CreditCard } from 'lucide-react';
import Image from 'next/image';
import axios, { AxiosError } from 'axios';
import { BILLING_SERVICE_URL } from '@/constants/API_URLS';
import { RootState } from '@/lib/store';
import { useSelector } from 'react-redux';

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
  const { token, user } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [isLoadingPaymentInfo, setIsLoadingPaymentInfo] = useState(false);

  useEffect(() => {
    if (token && user?.id) {
      const fetchInvoice = async () => {
        try {
          // Here you would fetch the invoice details from your API
          const response = await axios.get(`${BILLING_SERVICE_URL}/api/invoices/${invoiceId}/${user.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setInvoice(response.data);
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
    }
  }, [invoiceId, token, user]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, router]);

  useEffect(() => {
    if (paymentMethod && invoice && !isProcessing) {
      const getPaymentInfo = async () => {
        setIsLoadingPaymentInfo(true);
        setError(null);
        
        try {
          const response = await axios.post(`${BILLING_SERVICE_URL}/api/payments/create`, {
            paymentMethod,
            planId: invoice.planId,
            userId: user?.id,
            amount: invoice.amount,
            currency: 'USD',
            invoiceId: invoice.id
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          setPaymentInfo(response.data);
        } catch (err) {
          if (err instanceof AxiosError) {
            setError(err.response?.data?.message || "Failed to initialize payment. Please try again.");
          } else {
            setError("An unexpected error occurred. Please try again.");
          }
          // Reset payment method if there's an error
          setPaymentMethod(null);
        } finally {
          setIsLoadingPaymentInfo(false);
        }
      };
      
      getPaymentInfo();
    }
  }, [paymentMethod, invoice, user, token, isProcessing]);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      if (paymentMethod === 'stripe') {
        // Process Stripe payment using the client secret
        // This would typically involve Stripe.js and Elements
        // For now, we'll just simulate a successful payment
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Complete the payment
        const response = await axios.get(`${BILLING_SERVICE_URL}/api/payments/complete`, {
          params: {
            paymentMethod: 'stripe',
            paymentId: paymentInfo.paymentId,
            userId: user?.id,
            planId: invoice?.planId
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data) {
          setSuccess(true);
        } else {
          setError("Payment verification failed. Please try again.");
        }
      } else if (paymentMethod === 'paypal') {
        // For PayPal, redirect to the PayPal URL
        if (paymentInfo && paymentInfo.redirectUrl) {
          window.location.href = paymentInfo.redirectUrl;
          return; // Don't set success here as we're redirecting
        } else {
          setError("PayPal redirect URL not found. Please try again.");
        }
      }
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
          <Card className="w-full max-w-md shadow-sm border-border dark:border-gray-700">
            <CardHeader className="text-center border-b bg-muted/40 dark:bg-gray-800/50 pb-6">
              <CardTitle className="text-xl mb-2 dark:text-white">Loading Payment Details</CardTitle>
              <CardDescription className="dark:text-gray-300">
                Please wait while we retrieve your payment information...
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-8 space-y-4 dark:bg-gray-900">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-primary dark:bg-blue-400 animate-pulse" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 rounded-full bg-primary dark:bg-blue-400 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                <div className="w-3 h-3 rounded-full bg-primary dark:bg-blue-400 animate-pulse" style={{ animationDelay: '600ms' }}></div>
              </div>
              <p className="text-sm text-muted-foreground dark:text-gray-400">Fetching invoice #{invoiceId}</p>
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
          <Card className="w-full max-w-md shadow-sm border-border dark:border-gray-700">
            <CardHeader className="text-center border-b bg-muted/40 dark:bg-gray-800/50 pb-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/60">
                <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl dark:text-white">Payment Successful!</CardTitle>
              <CardDescription className="mt-2 text-base dark:text-gray-300">
                Thank you for your subscription. You will be redirected to your dashboard shortly.
              </CardDescription>
            </CardHeader>
            <CardFooter className="p-6 flex justify-center dark:bg-gray-900">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:border-gray-600"
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
          <Card className="shadow-sm border-border dark:border-gray-700">
            <CardHeader className="border-b bg-muted/40 dark:bg-gray-800/50 pb-4">
              <CardTitle className="dark:text-white">Error</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 dark:bg-gray-900">
              <p className="text-red-500 dark:text-red-400">{error}</p>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 dark:bg-gray-800/30 pt-4 mt-2 dark:border-gray-700">
              <Button
                onClick={() => router.push('/')}
                size="lg"
                className="dark:hover:bg-blue-600"
              >
                Return to Plans
              </Button>
            </CardFooter>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">Complete Your Payment</h1>

        {invoice && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card className="shadow-sm border-border dark:border-gray-700">
                <CardHeader className="border-b bg-muted/40 dark:bg-gray-800/50 pb-4">
                  <CardTitle className="text-xl dark:text-white">Payment Method</CardTitle>
                  <CardDescription className="mt-1.5 dark:text-gray-300">Choose your preferred payment method</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 px-6 dark:bg-gray-900">
                  <RadioGroup
                    value={paymentMethod || ''}
                    onValueChange={(value) => setPaymentMethod(value as 'stripe' | 'paypal')}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-3 border dark:border-gray-700 p-4 rounded-md hover:border-primary/50 dark:hover:border-blue-500/70 transition-colors">
                      <RadioGroupItem value="stripe" id="stripe" className="dark:border-gray-600" />
                      <Label htmlFor="stripe" className="flex-1 cursor-pointer flex items-center dark:text-white">
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

                    <div className="flex items-center space-x-3 border dark:border-gray-700 p-4 rounded-md hover:border-primary/50 dark:hover:border-blue-500/70 transition-colors">
                      <RadioGroupItem value="paypal" id="paypal" className="dark:border-gray-600" />
                      <Label htmlFor="paypal" className="flex-1 cursor-pointer flex items-center dark:text-white">
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

                  {/* Show loading indicator when fetching payment info */}
                  {isLoadingPaymentInfo && (
                    <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-md text-center">
                      <div className="flex justify-center space-x-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-primary dark:bg-blue-400 animate-pulse" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-3 h-3 rounded-full bg-primary dark:bg-blue-400 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                        <div className="w-3 h-3 rounded-full bg-primary dark:bg-blue-400 animate-pulse" style={{ animationDelay: '600ms' }}></div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Preparing payment details...</p>
                    </div>
                  )}

                  {/* Payment form for Stripe - only show when payment info is loaded */}
                  {paymentMethod === 'stripe' && paymentInfo && !isLoadingPaymentInfo && (
                    <div className="mt-6 space-y-4 border dark:border-gray-700 p-6 rounded-md bg-card dark:bg-gray-800">
                      <div className="grid grid-cols-2 gap-5">
                        <div className="col-span-2">
                          <Label htmlFor="cardNumber" className="text-sm font-medium mb-1.5 block dark:text-gray-200">Card Number</Label>
                          <div className="flex">
                            <input
                              type="text"
                              id="cardNumber"
                              placeholder="4242 4242 4242 4242"
                              className="flex h-10 w-full rounded-md border border-input dark:border-gray-600 bg-background dark:bg-gray-700 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white"
                            />
                            <CreditCard className="ml-2 h-10 w-5 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="expiry" className="text-sm font-medium mb-1.5 block dark:text-gray-200">Expiry Date</Label>
                          <input
                            type="text"
                            id="expiry"
                            placeholder="MM/YY"
                            className="flex h-10 w-full rounded-md border border-input dark:border-gray-600 bg-background dark:bg-gray-700 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvc" className="text-sm font-medium mb-1.5 block dark:text-gray-200">CVC</Label>
                          <input
                            type="text"
                            id="cvc"
                            placeholder="123"
                            className="flex h-10 w-full rounded-md border border-input dark:border-gray-600 bg-background dark:bg-gray-700 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white"
                          />
                        </div>
                      </div>
                      
                      {/* Display client secret or other payment info if needed */}
                      {paymentInfo.clientSecret && (
                        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                          <p>Payment initialized with Stripe</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PayPal info - only show when payment info is loaded */}
                  {paymentMethod === 'paypal' && paymentInfo && !isLoadingPaymentInfo && (
                    <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/30 rounded-md text-center dark:text-gray-200">
                      <p>You will be redirected to PayPal to complete your payment.</p>
                      {paymentInfo.redirectUrl && (
                        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                          Redirect URL is ready. Click &quot;Pay&quot; to continue to PayPal.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t bg-muted/20 dark:bg-gray-800/30 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-between p-6 dark:border-gray-700">
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing || isLoadingPaymentInfo || !paymentMethod || !paymentInfo}
                    className="w-full sm:w-auto dark:hover:bg-blue-600"
                    size="lg"
                  >
                    {isProcessing ? "Processing Payment..." : `Pay $${invoice.amount}`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="w-full sm:w-auto dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:border-gray-600"
                  >
                    Cancel
                  </Button>
                </CardFooter>
              </Card>

              {error && (
                <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div>
              <Card className="shadow-sm sticky top-24 border-border dark:border-gray-700">
                <CardHeader className="border-b bg-muted/40 dark:bg-gray-800/50 pb-4">
                  <CardTitle className="text-xl dark:text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6 px-6 dark:bg-gray-900">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Plan</span>
                    <span className="font-medium dark:text-white">{invoice.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Billing Cycle</span>
                    <span className="font-medium capitalize dark:text-white">{invoice.billingCycle}</span>
                  </div>
                  <div className="border-t dark:border-gray-700 pt-5 mt-5">
                    <div className="flex justify-between font-bold">
                      <span className="dark:text-white">Total</span>
                      <span className="dark:text-white">${invoice.amount}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 border-t dark:border-gray-700 p-6">
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