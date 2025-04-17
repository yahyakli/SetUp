"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import axios from 'axios';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CreditCard,
  DollarSign,
  ExternalLink,
  Info,
  Package,
  RefreshCw,
  Shield,
  Users,
  MessageSquare,
  BarChart,
  X,
} from 'lucide-react';

import AppLayout from '@/app/AppLayout';
import ClientSideWrapper from '@/components/ClientSideWrapper';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { toast } from 'sonner';

import { RootState } from '@/lib/store';
import { Subscription } from '@/types';
import { BILLING_SERVICE_URL } from '@/constants/API_URLS';
import { useAppContext } from '@/context/AppContext';

function SubscriptionContent() {
  const router = useRouter();
  const params = useParams();
  const planId = params?.id;
  const { user, token } = useSelector((state: RootState) => state.user);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const { userPermissions, setUserSubscription, setUserPermissions } = useAppContext();

  useEffect(() => {
    if (user?.id && planId) {
      fetchSubscription();
    }
  }, [user?.id, planId]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BILLING_SERVICE_URL}/api/subscriptions/${planId}/user/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setSubscription(response.data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription details');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500); // Ensure loading state is visible for at least 500ms
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    try {
      setCancelLoading(true);
      const response = await axios.post(
        `${BILLING_SERVICE_URL}/api/subscriptions/${subscription.id}/cancel`,
        { user_id: user?.id },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        toast.success('Your subscription has been canceled');
        setCancelDialogOpen(false);
        // Update the subscription status
        setSubscription({
          ...subscription,
          status: 'canceled'
        });
        setUserSubscription(null);
        setUserPermissions({
          projects: 3,
          teams: 1,
          chat: false,
          priority: false,
          analytics: false,
          security: false,
        });
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleToggleAutoRenewal = async () => {
    if (!subscription) return;
    
    try {
      const response = await axios.post(
        `${BILLING_SERVICE_URL}/api/subscriptions/${subscription.id}/toggle-auto-renewal`,
        { user_id: user?.id },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        // Update the subscription with the toggled auto_renew value
        setSubscription(response.data.subscription);
        
        toast.success(
          subscription.auto_renew 
            ? 'Auto-renewal has been disabled' 
            : 'Auto-renewal has been enabled'
        );
      }
    } catch (error) {
      console.error('Error toggling auto-renewal:', error);
      toast.error('Failed to update auto-renewal settings');
    }
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'canceled':
        return <Badge variant="secondary">Canceled</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getNextBillingDate = (subscription: Subscription) => {
    if (!subscription || !subscription.end_date) return 'N/A';
    
    if (subscription.status.toLowerCase() !== 'active') {
      return 'No upcoming billing';
    }
    
    return formatDate(subscription.end_date);
  };

  const getRemainingDays = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="p-6 space-y-8 dark:bg-gray-900 bg-gray-50">
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.back()}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold dark:text-white">Subscription Management</h1>
            </div>
            <p className="text-muted-foreground mt-1 ml-10">
              View and manage your current subscription
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => router.push('/billing/history')}
            >
              <CreditCard className="h-4 w-4" />
              Billing History
            </Button>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ) : !subscription ? (
          <Card>
            <CardHeader>
              <CardTitle>No Active Subscription</CardTitle>
              <CardDescription>
                You don&apos;t have an active subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Subscription Found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  You don&apos;t currently have any subscription. Subscribe to a plan to access premium features.
                </p>
                <Button onClick={() => router.push('/billing/plans')}>
                  View Available Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <CardTitle className="text-xl">Current Subscription</CardTitle>
                    <CardDescription>
                      Details about your current subscription plan
                    </CardDescription>
                  </div>
                  <div className="mt-2 md:mt-0 flex items-center gap-2">
                    {getStatusBadge(subscription.status)}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={fetchSubscription}
                      title="Refresh"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Plan Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plan:</span>
                        <span className="font-medium">{subscription.plan?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Billing Cycle:</span>
                        <span>{subscription.plan?.billing_cycle || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium">
                          {subscription.plan ? formatCurrency(subscription.plan.price) : 'N/A'}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span>{subscription.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Billing Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Start Date:</span>
                        <span>{formatDate(subscription.start_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">End Date:</span>
                        <span>{formatDate(subscription.end_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Next Billing:</span>
                        <span>{getNextBillingDate(subscription)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Days Remaining:</span>
                        <span className="font-medium">
                          {subscription.status.toLowerCase() === 'active' 
                            ? `${getRemainingDays(subscription.end_date)} days` 
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Auto-Renewal:</span>
                        <span className={subscription.auto_renew ? 'text-green-600' : 'text-gray-500'}>
                          {subscription.auto_renew ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {subscription.status.toLowerCase() === 'active' && subscription.auto_renew && (
                  <Alert variant="default" className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle>Subscription Information</AlertTitle>
                    <AlertDescription>
                      Your subscription will automatically renew on {formatDate(subscription.end_date)}.
                      You can cancel anytime before the renewal date.
                    </AlertDescription>
                  </Alert>
                )}
                
                {subscription.status.toLowerCase() === 'canceled' && (
                  <Alert variant="default" className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertTitle>Subscription Canceled</AlertTitle>
                    <AlertDescription>
                      Your subscription has been canceled but you can still use the service until {formatDate(subscription.end_date)}.
                      After this date, you will be downgraded to the free plan.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              
              <CardFooter className="flex flex-col sm:flex-row gap-3 justify-end">
                {subscription.status.toLowerCase() === 'active' && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={handleToggleAutoRenewal}
                      className="w-full sm:w-auto"
                    >
                      {subscription.auto_renew ? 'Disable Auto-Renewal' : 'Enable Auto-Renewal'}
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      onClick={() => setCancelDialogOpen(true)}
                      className="w-full sm:w-auto"
                    >
                      Cancel Subscription
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Plan Features</CardTitle>
                <CardDescription>
                  Features included in your current plan
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Projects</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Create and manage projects
                    </p>
                    <div className="mt-auto pt-2 border-t">
                      <span className="font-medium">
                        {userPermissions?.projects === -1 ? 'Unlimited' : userPermissions?.projects} projects
                      </span>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Teams</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Create and manage teams
                    </p>
                    <div className="mt-auto pt-2 border-t">
                      <span className="font-medium">
                        {userPermissions?.teams === -1 ? 'Unlimited' : userPermissions?.teams} teams
                      </span>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Chat</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Team communication
                    </p>
                    <div className="mt-auto pt-2 border-t">
                      {userPermissions?.chat ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                          <Check className="h-4 w-4" /> Included
                        </span>
                      ) : (
                        <span className="text-gray-500 flex items-center gap-1">
                          <X className="h-4 w-4" /> Not included
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Security</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Advanced security features
                    </p>
                    <div className="mt-auto pt-2 border-t">
                      {userPermissions?.security ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                          <Check className="h-4 w-4" /> Included
                        </span>
                      ) : (
                        <span className="text-gray-500 flex items-center gap-1">
                          <X className="h-4 w-4" /> Not included
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Analytics</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Project and team analytics
                    </p>
                    <div className="mt-auto pt-2 border-t">
                      {userPermissions?.analytics ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                          <Check className="h-4 w-4" /> Included
                        </span>
                      ) : (
                        <span className="text-gray-500 flex items-center gap-1">
                          <X className="h-4 w-4" /> Not included
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Priority Support</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Priority customer support
                    </p>
                    <div className="mt-auto pt-2 border-t">
                      {userPermissions?.priority ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                          <Check className="h-4 w-4" /> Included
                        </span>
                      ) : (
                        <span className="text-gray-500 flex items-center gap-1">
                          <X className="h-4 w-4" /> Not included
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-center">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => window.open('/plans', '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  Compare All Plans
                </Button>
              </CardFooter>
            </Card>
          </>
        )}
      </section>

      {/* Cancel Subscription Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <Alert variant="destructive" className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className='text-black dark:text-white'>Important Information</AlertTitle>
              <AlertDescription className='text-black dark:text-white'>
                Your subscription will remain active until the end of your current billing period ({formatDate(subscription?.end_date || '')}). 
                After this date, you will lose access to premium features.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <h4 className="font-medium">You will lose access to:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {userPermissions?.projects === -1 && (
                  <li>Unlimited projects</li>
                )}
                {userPermissions?.teams === -1 && (
                  <li>Unlimited teams</li>
                )}
                {userPermissions?.chat && (
                  <li>Team chat functionality</li>
                )}
                {userPermissions?.analytics && (
                  <li>Advanced analytics</li>
                )}
                {userPermissions?.security && (
                  <li>Enhanced security features</li>
                )}
                {userPermissions?.priority && (
                  <li>Priority support</li>
                )}
              </ul>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelLoading}
            >
              Keep Subscription
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelSubscription}
              disabled={cancelLoading}
            >
              {cancelLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Canceling...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <AppLayout>
      <ClientSideWrapper>
        <SubscriptionContent />
      </ClientSideWrapper>
    </AppLayout>
  );
}

// Disable static generation for this page
export const dynamic = 'force-dynamic'; 