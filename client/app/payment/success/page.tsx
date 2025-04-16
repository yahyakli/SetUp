'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionId = searchParams.get('subscription_id');
  
  useEffect(() => {
    const verifyPayment = async () => {
      if (!subscriptionId) {
        setError('Missing subscription information');
        setIsLoading(false);
        return;
      }
      
      try {
        // Verify the payment status with your backend
        const response = await axios.get(`/api/subscriptions/${subscriptionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.subscription.status !== 'active') {
          setError('Your subscription is not active yet. Please contact support.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setError('Failed to verify payment status');
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyPayment();
  }, [subscriptionId]);

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          {isLoading ? (
            <>
              <CardTitle>Verifying Payment</CardTitle>
              <CardDescription>Please wait while we verify your payment...</CardDescription>
            </>
          ) : error ? (
            <>
              <CardTitle>Payment Issue</CardTitle>
              <CardDescription>{error}</CardDescription>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-center">Payment Successful!</CardTitle>
              <CardDescription className="text-center">
                Thank you for your subscription. Your account has been upgraded.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => router.push('/dashboard')} 
            className="w-full"
            disabled={isLoading}
          >
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 