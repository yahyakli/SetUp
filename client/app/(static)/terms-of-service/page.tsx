"use client";

import React from 'react';
import AppLayout from '../../AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import ClientSideWrapper from '@/components/ClientSideWrapper';

function TermsOfServiceContent() {
  return (
    <div className="p-6 space-y-8 dark:bg-gray-900 bg-gray-50">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          <p className="text-muted-foreground mb-4">Last Updated: May 1, 2024</p>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="mb-3">
                By accessing or using SetUp (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you disagree with any part of the terms, you may not access the Service.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p className="mb-3">
                SetUp is a project management platform that allows users to create, manage, and collaborate on projects and tasks. The Service includes features such as task tracking, team collaboration, file sharing, and reporting.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">3. Subscription Plans and Payments</h2>
              <p className="mb-3">
                SetUp offers various subscription plans, including a free plan and paid plans with additional features. By selecting a paid plan, you agree to pay the subscription fees as described at the time of purchase.
              </p>
              <p className="mb-3">
                Subscription fees are billed in advance on a monthly, quarterly, or annual basis depending on the plan selected. You authorize us to charge your payment method for all fees associated with your account.
              </p>
              <p className="mb-3">
                <strong>Cancellation Policy:</strong> You may cancel your subscription at any time. However, we do not provide refunds for any unused portion of your subscription period. Upon cancellation or expiration of your paid subscription, your account will revert to the free plan, which limits you to 3 projects and 1 team, with all other projects and teams becoming inaccessible.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">4. User Accounts</h2>
              <p className="mb-3">
                To use certain features of the Service, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
              <p className="mb-3">
                You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">5. User Content</h2>
              <p className="mb-3">
                You retain all rights to any content you submit, post, or display on or through the Service (&quot;User Content&quot;). By submitting User Content, you grant SetUp a worldwide, non-exclusive, royalty-free license to use, copy, modify, and display the User Content in connection with providing the Service.
              </p>
              <p className="mb-3">
                You are solely responsible for your User Content and the consequences of posting or publishing it. We do not endorse any User Content or any opinion, recommendation, or advice expressed therein.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Prohibited Conduct</h2>
              <p className="mb-3">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Violate or infringe other people&apos;s intellectual property, privacy, or other rights</li>
                <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Use the Service to transmit viruses, malware, or other malicious code</li>
                <li>Harass, abuse, or harm another person</li>
                <li>Use automated means to access or use the Service without our permission</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Intellectual Property</h2>
              <p className="mb-3">
                The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of SetUp and its licensors. The Service is protected by copyright, trademark, and other laws.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
              <p className="mb-3">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach the Terms.
              </p>
              <p className="mb-3">
                Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
              <p className="mb-3">
                In no event shall SetUp, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
              <p className="mb-3">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
              <p className="mb-3">
                By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">11. Governing Law</h2>
              <p className="mb-3">
                These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> legal@setup.com<br />
                <strong>Address:</strong> 123 Project Street, Suite 456, San Francisco, CA 94103
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TermsOfServicePage() {
  return (
    <AppLayout>
      <ClientSideWrapper>
        <TermsOfServiceContent />
      </ClientSideWrapper>
    </AppLayout>
  );
}

// Disable static generation for this page
export const dynamic = 'force-dynamic'; 