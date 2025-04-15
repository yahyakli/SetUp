"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import AppLayout from '@/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, Shield, X, AlertCircle } from 'lucide-react';
import { Invoice, Plan, Subscription } from '@/types';
import axios, { AxiosError } from 'axios';
import { BILLING_SERVICE_URL } from '@/constants/API_URLS';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Checkbox } from '@/components/ui/checkbox';

const SubscribePage = () => {
  const { user, token } = useSelector((state: RootState) => state.user);
  const { planId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cycleParam = searchParams.get('cycle');
  const { plans, plansLoading } = useAppContext();

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUALLY'>(
    cycleParam === 'yearly' ? 'ANNUALLY' : 'MONTHLY'
  );
  const [autoRenew, setAutoRenew] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);
  const [subscriptionChecking, setSubscriptionChecking] = useState(true);
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>();

  // Use effect to set billing cycle from URL parameter
  useEffect(() => {
    if (cycleParam === 'yearly') {
      setBillingCycle('ANNUALLY');
    } else if (cycleParam === 'monthly') {
      setBillingCycle('MONTHLY');
    }
  }, [cycleParam]);

  // Fetch user subscriptions
  useEffect(() => {
    const fetchSubscriptions = async () => {
      setSubscriptionChecking(true);
      try {
        const response = await axios.get(`${BILLING_SERVICE_URL}/api/subscriptions/user/current/${user?.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.status === 200) {
          setSubscriptions(response.data.filter((sub: Subscription) => sub.status !== 'CANCELED'));
          console.log(response.data);
          
          // Check for active subscription for this plan
          const activeSubscription = response.data.find(
            (sub: Subscription) => (sub.status === 'ACTIVE' && sub.planId === planId) || sub.invoices.find(
              (invoice: Invoice) => invoice.status === 'UNPAID'
            )
          );
  
          setActiveSubscription(activeSubscription);
        }
      } catch (err) {
        console.error("Failed to fetch subscriptions:", err);
        setError("Failed to fetch subscription information. Please try again.");
      } finally {
        setSubscriptionsLoading(false);
        setSubscriptionChecking(false);
      }
    };

    fetchSubscriptions();
  }, [user?.id, token, planId, router]);

  useEffect(() => {
    if (plans && planId) {
      const plan = plans.find(p => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
      } else {
        setError("Plan not found. Please select a valid plan.");
      }
    }
  }, [plans, planId]);

  const yearlyDiscount = 0.2; // 20% discount for yearly billing

  const calculatePrice = () => {
    if (!selectedPlan) return 0;

    const basePrice = selectedPlan.price;
    if (billingCycle === 'ANNUALLY') {
      return (basePrice * 12 * (1 - yearlyDiscount)).toFixed(2);
    }
    return basePrice;
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await axios.delete(
        `${BILLING_SERVICE_URL}/api/subscriptions/${activeSubscription?.id}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        setError(null);
        router.push('/plans');
      } else {
        setError("Failed to cancel subscription. Please try again.");
      }
    } catch (err) {
      console.error("Failed to cancel subscription:", err);
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Failed to cancel subscription. Please try again.");
      } else {
        setError("Failed to cancel subscription. Please try again.");
      }
    }
  };

  const handleCreateInvoice = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(BILLING_SERVICE_URL + '/api/subscriptions', {
        planId: selectedPlan?.id,
        userId: user?.id,
        billingCycle,
        amount: calculatePrice(),
        autoRenew
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Navigate to payment page with the invoice ID from the response
      router.push(`/payment/${response.data.id}`);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Failed to create invoice. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (plansLoading || subscriptionsLoading || subscriptionChecking) {
    return (
      <AppLayout>
        <div className="container mx-auto py-10 flex justify-center items-center min-h-[70vh]">
          <Card className="w-full max-w-md shadow-sm border-border dark:border-gray-700">
            <CardHeader className="text-center border-b bg-muted/40 dark:bg-gray-800/50 pb-6">
              <CardTitle className="text-xl mb-2 dark:text-white">Loading Subscription Details</CardTitle>
              <CardDescription className="dark:text-gray-300">
                Please wait while we retrieve your subscription information...
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-8 space-y-4 dark:bg-gray-900">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-primary dark:bg-blue-400 animate-pulse" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 rounded-full bg-primary dark:bg-blue-400 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                <div className="w-3 h-3 rounded-full bg-primary dark:bg-blue-400 animate-pulse" style={{ animationDelay: '600ms' }}></div>
              </div>
              <p className="text-sm text-muted-foreground dark:text-gray-400">Checking subscription status...</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (error && !selectedPlan) {
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

  // Check if user has an active subscription for this plan
  const hasActiveSubscription = subscriptions.some(
    sub => sub.status === 'ACTIVE' && sub.planId === planId
  );

  // Check for pending subscription for this plan
  const pendingSubscription = subscriptions.find(
    (sub: Subscription) => sub.status === 'PENDING' && sub.planId === planId
  );
  
  // Find the unpaid invoice if there's a pending subscription
  const unpaidInvoice = pendingSubscription?.invoices.find(
    (invoice: Invoice) => invoice.status === 'UNPAID'
  );

  if (pendingSubscription && unpaidInvoice) {
    return (
      <AppLayout>
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <Card className="shadow-sm border-border dark:border-gray-700">
            <CardHeader className="border-b bg-muted/40 dark:bg-gray-800/50 pb-4">
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Pending Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 dark:bg-gray-900 dark:text-gray-200">
              <p>You already have a pending subscription to this plan. Would you like to continue to payment or cancel this subscription?</p>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 dark:bg-gray-800/30 pt-4 mt-2 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 dark:border-gray-700">
              <Button 
                onClick={() => router.push(`/payment/${unpaidInvoice.id}`)}
                className="w-full sm:w-auto dark:hover:bg-blue-600"
              >
                Continue to Payment
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancelSubscription}
                className="w-full sm:w-auto dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:border-gray-600"
              >
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (hasActiveSubscription) {
    return (
      <AppLayout>
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-muted/40 pb-4">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Active Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p>You already have an active subscription to this plan. You can manage your subscriptions from your account settings.</p>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 pt-4 mt-2">
              <Button onClick={() => router.push('/account/subscriptions')} className="mr-2">
                Manage Subscriptions
              </Button>
              <Button onClick={() => router.push('/')} variant="outline">
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
        <h1 className="text-3xl font-bold mb-8">Confirm Your Subscription</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md">
            {error}
          </div>
        )}

        {selectedPlan && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card className="shadow-sm">
                <CardHeader className="border-b bg-muted/40 pb-4">
                  <CardTitle className="text-xl">Billing Options</CardTitle>
                  <CardDescription className="mt-1.5">Choose your preferred billing cycle</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 px-6">
                  <RadioGroup
                    value={billingCycle}
                    onValueChange={(value) => setBillingCycle(value as 'MONTHLY' | 'ANNUALLY')}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-3 border p-5 rounded-md hover:border-primary/50 transition-colors">
                      <RadioGroupItem value="MONTHLY" id="MONTHLY" />
                      <Label htmlFor="MONTHLY" className="flex-1 cursor-pointer">
                        <div className="font-medium">Monthly Billing</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          ${selectedPlan.price}/month
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border p-5 rounded-md border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                      <RadioGroupItem value="ANNUALLY" id="ANNUALLY" />
                      <Label htmlFor="ANNUALLY" className="flex-1 cursor-pointer">
                        <div className="font-medium">Annual Billing</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          ${(selectedPlan.price * 12 * (1 - yearlyDiscount)).toFixed(2)}/year (Save {yearlyDiscount * 100}%)
                        </div>
                      </Label>
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded">
                        Best Value
                      </span>
                    </div>
                  </RadioGroup>

                  <div className="mt-6 border-t pt-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="autoRenew"
                        checked={autoRenew}
                        onCheckedChange={(checked) => setAutoRenew(checked as boolean)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="autoRenew" className="text-sm font-medium leading-none cursor-pointer">
                          Auto-renew subscription
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Your subscription will automatically renew at the end of your billing cycle.
                          You can cancel anytime from your account settings.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/20 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-between p-6">
                  <Button
                    onClick={handleCreateInvoice}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                    size="lg"
                  >
                    {isLoading ? "Processing..." : `Proceed to Payment • $${calculatePrice()}`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="w-full sm:w-auto"
                  >
                    Back to Plans
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card className="shadow-sm sticky top-24">
                <CardHeader className="border-b bg-muted/40 pb-4">
                  <CardTitle className="text-xl">{selectedPlan.name}</CardTitle>
                  <CardDescription className="mt-1.5">{selectedPlan.description}</CardDescription>
                  <div className="text-3xl font-bold mt-5">
                    ${selectedPlan.price}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 px-6">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <span>{selectedPlan.projects === -1 ? 'Unlimited' : selectedPlan.projects} projects</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <span>{selectedPlan.teamOwned === -1 ? 'Unlimited' : selectedPlan.teamOwned} teams owned</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                        {selectedPlan.chat ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <span className={!selectedPlan.chat ? "text-gray-500 dark:text-gray-400" : ""}>
                        Advanced task management
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                        {selectedPlan.priority ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <span className={!selectedPlan.priority ? "text-gray-500 dark:text-gray-400" : ""}>
                        Priority support
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                        {selectedPlan.analytics ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <span className={!selectedPlan.analytics ? "text-gray-500 dark:text-gray-400" : ""}>
                        Advanced analytics
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                        {selectedPlan.security ? (
                          <Shield className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <span className={!selectedPlan.security ? "text-gray-500 dark:text-gray-400" : ""}>
                        Premium security features
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SubscribePage; 