import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, X, ArrowRight, Shield, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAppContext } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { toast } from 'sonner'

// Initialize Stripe with your publishable key

export default function PlansSection() {
  const { user } = useSelector((state: RootState) => state.user);
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
  const { plans, plansLoading } = useAppContext();
  const router = useRouter();
  const [loadingPlanId, setLoadingPlanId] = useState<number | null>(null);

  const handleSubscribe = async (planId: number) => {
    if (!user) {
      toast.error('Please sign in to subscribe to a plan');
      router.push('/login?redirectTo=/plans');
      return;
    }

    setLoadingPlanId(planId);
    
    try {
      // Instead of creating a payment method here, redirect to setup page
      router.push(`/payment/setup?plan_id=${planId}`);
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error("There was an error processing your subscription. Please try again.");
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div>
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
        <div className="mt-8">
          <Tabs
            defaultValue="monthly"
            className="w-full mb-8"
          >
            <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-10">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>

            {['monthly', 'quarterly', 'yearly'].map((cycle) => (
              <TabsContent key={cycle} value={cycle}>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {plans && [...plans]
                    .filter(plan =>
                      // Show plans with the selected billing cycle OR unlimited plans
                      plan.billing_cycle === cycle || plan.billing_cycle === 'unlimited'
                    )
                    // Sort by billing cycle first (unlimited first) then by price
                    .sort((a, b) => {
                      // First sort by billing cycle (unlimited first)
                      if (a.billing_cycle === 'unlimited' && b.billing_cycle !== 'unlimited') return -1;
                      if (a.billing_cycle !== 'unlimited' && b.billing_cycle === 'unlimited') return 1;
                      // Then sort by price
                      return a.price - b.price;
                    })
                    .map((plan) => (
                      <motion.div key={plan.id} variants={itemVariants} whileHover="hover">
                        <Card
                          className={`flex flex-col h-full ${
                            plan.special_title
                              ? 'border-2 border-blue-500 dark:border-blue-400 bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-xl relative z-10 transform scale-105'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          {plan.special_title && (
                            <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-4 py-1 bg-blue-600 text-white text-sm font-bold rounded-full shadow-lg">
                              {plan.special_title}
                            </div>
                          )}
                          <CardHeader className={plan.special_title ? 'pt-8' : ''}>
                            <div className="flex justify-between items-start">
                              <CardTitle 
                                className={`text-2xl font-bold ${
                                  plan.special_title 
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent'
                                    : ''
                                }`}
                              >
                                {plan.name}
                              </CardTitle>
                              {plan.billing_cycle !== 'unlimited' && (
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  plan.special_title
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                }`}>
                                  {plan.billing_cycle.charAt(0).toUpperCase() + plan.billing_cycle.slice(1)}
                                </span>
                              )}
                            </div>
                            <CardDescription className="min-h-[50px]">{plan.description}</CardDescription>
                            <div className={`text-4xl font-bold mt-4 ${
                              plan.special_title 
                                ? 'bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent'
                                : ''
                            }`}>
                              ${plan.price}
                              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                {plan.billing_cycle === 'monthly' ? '/month' :
                                  plan.billing_cycle === 'quarterly' ? '/quarter' :
                                    plan.billing_cycle === 'yearly' ? '/year' : ''}
                              </span>
                            </div>
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
                                <span>{plan.teams === -1 ? 'Unlimited' : plan.teams} teams owned</span>
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
                                  Chat Support
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
                            </ul>
                          </CardContent>
                          <CardFooter>
                            {plan.price == 0 ? (
                              <Link href="/dashboard" className='w-full'>
                                <Button className="w-full group">
                                  Get Started
                                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                              </Link>
                            ) : (
                              <Button
                                className={`w-full group ${
                                  plan.special_title
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold shadow-md'
                                    : ''
                                }`}
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={loadingPlanId === plan.id}
                              >
                                {loadingPlanId === plan.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    Subscribe Now
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                  </>
                                )}
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
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  )
}
