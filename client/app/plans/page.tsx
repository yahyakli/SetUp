"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, X, Shield, ArrowRight } from 'lucide-react';

const PlansPage = () => {
  const { plans, plansLoading } = useAppContext();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  // Calculate yearly price (20% discount)
  const getYearlyPrice = (monthlyPrice: number) => {
    return (monthlyPrice * 12 * 0.8).toFixed(2);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    },
    hover: {
      scale: 1.03,
      boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <div className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your <span className="text-blue-600 dark:text-blue-400">Perfect Plan</span></h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Select the plan that best fits your needs. All plans include our core features with different limits.
        </p>
        
        {/* Billing cycle toggle */}
        <div className="mt-8">
          <Tabs 
            defaultValue="monthly" 
            className="w-[300px] mx-auto"
            onValueChange={(value) => setBillingCycle(value as 'monthly' | 'yearly')}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">
                Yearly <span className="ml-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-2 py-0.5 rounded-full">Save 20%</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {plansLoading ? (
        // Loading skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="flex flex-col animate-pulse">
              <CardHeader>
                <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded-md w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-md w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-md w-1/3 mt-4"></div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-md w-3/4"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-md w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Dynamic Plans */}
          {plans && [...plans]
            .sort((a, b) => a.price - b.price)
            .map((plan) => (
              <motion.div key={plan.id} variants={itemVariants} whileHover="hover">
                <Card 
                  className={`flex flex-col h-full ${
                    plan.specialTitle 
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-gray-800 shadow-lg relative z-10' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {plan.specialTitle && (
                    <div className="bg-blue-600 text-white text-center py-2 text-sm font-bold">
                      {plan.specialTitle}
                    </div>
                  )}
                  <CardHeader className={plan.specialTitle ? 'pb-6' : ''}>
                    <CardTitle className={`text-2xl ${plan.specialTitle ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="min-h-[50px]">{plan.description}</CardDescription>
                    <div className={`text-4xl font-bold mt-4 ${plan.specialTitle ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                      ${billingCycle === 'monthly' ? plan.price : getYearlyPrice(plan.price)}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && plan.price > 0 && (
                      <div className="text-green-600 dark:text-green-400 text-sm mt-1">
                        Save ${(plan.price * 12 * 0.2).toFixed(2)} per year
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2">
                        <div className="w-5 h-5 flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <span>{plan.projects === -1 ? 'Unlimited' : plan.projects} projects</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-5 h-5 flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <span>{plan.teamOwned === -1 ? 'Unlimited' : plan.teamOwned} teams owned</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-5 h-5 flex-shrink-0">
                          {plan.chat ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <span className={!plan.chat ? "text-gray-500 dark:text-gray-400" : ""}>
                          Advanced task management
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-5 h-5 flex-shrink-0">
                          {plan.priority ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <span className={!plan.priority ? "text-gray-500 dark:text-gray-400" : ""}>
                          Priority support
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-5 h-5 flex-shrink-0">
                          {plan.analytics ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <span className={!plan.analytics ? "text-gray-500 dark:text-gray-400" : ""}>
                          Advanced analytics
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-5 h-5 flex-shrink-0">
                          {plan.security ? (
                            <Shield className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <span className={!plan.security ? "text-gray-500 dark:text-gray-400" : ""}>
                          Premium security features
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {plan.price === 0 ? (
                      <Link href="/dashboard" className='w-full'>
                        <Button className="w-full group">
                          Get Started
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    ) : (
                      <Button 
                        className={`w-full group ${
                          plan.specialTitle 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md' 
                            : ''
                        }`}
                        onClick={() => router.push(`/subscribe/${plan.id}?cycle=${billingCycle}`)}
                      >
                        Subscribe Now
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}

          {/* Enterprise Plan (static) */}
          <motion.div variants={itemVariants} whileHover="hover">
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-2xl">Enterprise Plan</CardTitle>
                <CardDescription className="min-h-[50px]">For large organizations with custom needs</CardDescription>
                <div className="text-4xl font-bold mt-4">
                  Custom<span className="text-sm font-normal text-gray-500 dark:text-gray-400"> pricing</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <span>Everything in Pro Plan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <span>Customizable workflows</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <span>Dedicated account manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <span>1 TB storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 flex-shrink-0">
                      <Shield className="h-5 w-5 text-green-500" />
                    </div>
                    <span>Premium security features</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full group" variant="outline">
                  Contact Sales
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* FAQ Section */}
      <div className="mt-24">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Can I change plans later?</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Yes, you can upgrade or downgrade your plan at any time. When upgrading, you&apos;ll be charged the prorated difference. When downgrading, your new rate will apply at the start of your next billing cycle.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Is there a free trial?</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Yes! You can start with our Free plan to explore the core features. No credit card required. Upgrade anytime when you need more capabilities.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">How does billing work?</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We offer both monthly and annual billing options. Annual plans come with a 20% discount. All plans are automatically renewed unless canceled.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">What payment methods do you accept?</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We accept all major credit cards, including Visa, Mastercard, and American Express. For Enterprise plans, we also offer invoicing options.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-24 bg-blue-600 dark:bg-blue-800 text-white p-12 rounded-xl text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Project Management?</h2>
        <p className="mb-8 max-w-2xl mx-auto">
          Join thousands of teams who have improved their workflow with SetUp.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/dashboard">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 group">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlansPage; 