"use client";

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import PlansSection from '@/components/PlansSection';

const PlansPage = () => {

  return (
    <div className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your <span className="text-blue-600 dark:text-blue-400">Perfect Plan</span></h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Select the plan that best fits your needs. All plans include our core features with different limits.
        </p>
      </div>

      <PlansSection />

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