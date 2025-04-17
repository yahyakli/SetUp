"use client";

import React from 'react';
import AppLayout from '../../AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import ClientSideWrapper from '@/components/ClientSideWrapper';

function CookiePolicyContent() {
  return (
    <div className="p-6 space-y-8 dark:bg-gray-900 bg-gray-50">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
          <p className="text-muted-foreground mb-4">Last Updated: May 1, 2024</p>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="mb-3">
                This Cookie Policy explains how SetUp (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) uses cookies and similar technologies to recognize you when you visit our website and use our services. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">2. What Are Cookies?</h2>
              <p className="mb-3">
                Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
              </p>
              <p className="mb-3">
                Cookies set by the website owner (in this case, SetUp) are called &quot;first-party cookies&quot;. Cookies set by parties other than the website owner are called &quot;third-party cookies&quot;. Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics).
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">3. Types of Cookies We Use</h2>
              <p className="mb-3">
                We use the following types of cookies:
              </p>
              
              <h3 className="text-lg font-medium mb-2">3.1 Essential Cookies</h3>
              <p className="mb-3">
                These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms. You can set your browser to block or alert you about these cookies, but some parts of the site will not then work.
              </p>
              
              <h3 className="text-lg font-medium mb-2">3.2 Performance Cookies</h3>
              <p className="mb-3">
                These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site. All information these cookies collect is aggregated and therefore anonymous.
              </p>
              
              <h3 className="text-lg font-medium mb-2">3.3 Functionality Cookies</h3>
              <p className="mb-3">
                These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages. If you do not allow these cookies, then some or all of these services may not function properly.
              </p>
              
              <h3 className="text-lg font-medium mb-2">3.4 Targeting Cookies</h3>
              <p className="mb-3">
                These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites. They do not store directly personal information but are based on uniquely identifying your browser and internet device.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">4. How We Use Cookies</h2>
              <p className="mb-3">
                We use cookies for the following purposes:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>To authenticate users and prevent fraudulent use of user accounts</li>
                <li>To remember information about your preferences and choices</li>
                <li>To understand and save user preferences for future visits</li>
                <li>To keep track of advertisements</li>
                <li>To compile aggregate data about site traffic and site interactions</li>
                <li>To improve our website and provide a better user experience</li>
                <li>To track user engagement with our services</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Third-Party Cookies</h2>
              <p className="mb-3">
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the Service, deliver advertisements, and so on. These cookies may include:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>Google Analytics</li>
                <li>Stripe</li>
                <li>Intercom</li>
                <li>Social media cookies (LinkedIn, Twitter, Facebook)</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">6. How to Control Cookies</h2>
              <p className="mb-3">
                You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. If you do this, however, you may have to manually adjust some preferences every time you visit a site, and some services and functionalities may not work.
              </p>
              <p className="mb-3">
                Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, visit <a href="https://www.aboutcookies.org" className="text-primary hover:underline">www.aboutcookies.org</a> or <a href="https://www.allaboutcookies.org" className="text-primary hover:underline">www.allaboutcookies.org</a>.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Changes to This Cookie Policy</h2>
              <p className="mb-3">
                We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
              </p>
              <p className="mb-3">
                The date at the top of this Cookie Policy indicates when it was last updated.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
              <p>
                If you have any questions about our use of cookies or this Cookie Policy, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> privacy@setup.com<br />
                <strong>Address:</strong> 123 Project Street, Suite 456, San Francisco, CA 94103
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CookiePolicyPage() {
  return (
    <AppLayout>
      <ClientSideWrapper>
        <CookiePolicyContent />
      </ClientSideWrapper>
    </AppLayout>
  );
}

// Disable static generation for this page
export const dynamic = 'force-dynamic'; 