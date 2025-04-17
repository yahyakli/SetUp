"use client";

import React from 'react';
import AppLayout from '../../AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import ClientSideWrapper from '@/components/ClientSideWrapper';

function PrivacyPolicyContent() {
  return (
    <div className="p-6 space-y-8 dark:bg-gray-900 bg-gray-50">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-4">Last Updated: May 1, 2024</p>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="mb-3">
                Welcome to SetUp (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and handling your data in an open and transparent manner. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our project management platform.
              </p>
              <p>
                By accessing or using SetUp, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
              <h3 className="text-lg font-medium mb-2">2.1 Personal Information</h3>
              <p className="mb-3">
                We collect information that you provide directly to us when you:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>Create an account</li>
                <li>Fill out forms</li>
                <li>Subscribe to our services</li>
                <li>Correspond with us</li>
                <li>Participate in surveys or promotions</li>
              </ul>
              <p className="mb-3">
                This information may include your name, email address, phone number, billing information, and any other information you choose to provide.
              </p>
              
              <h3 className="text-lg font-medium mb-2">2.2 Usage Data</h3>
              <p className="mb-3">
                We automatically collect certain information when you visit, use, or navigate our platform. This information may include:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device type</li>
                <li>Operating system</li>
                <li>Time spent on pages</li>
                <li>Pages visited</li>
                <li>Unique device identifiers</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative information, such as updates, security alerts, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Personalize your experience</li>
                <li>Monitor usage patterns and analyze trends</li>
                <li>Detect, prevent, and address technical issues</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data Sharing and Disclosure</h2>
              <p className="mb-3">
                We may share your information with:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>Service providers who perform services on our behalf</li>
                <li>Business partners with your consent</li>
                <li>Legal authorities when required by law</li>
                <li>In connection with a business transaction such as a merger or acquisition</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
              <p className="mb-3">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
              <p className="mb-3">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate or incomplete information</li>
                <li>Deletion of your personal information</li>
                <li>Restriction of processing</li>
                <li>Data portability</li>
                <li>Objection to processing</li>
              </ul>
              <p>
                To exercise these rights, please contact us using the information provided in the &quot;Contact Us&quot; section.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Changes to This Privacy Policy</h2>
              <p className="mb-3">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
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

export default function PrivacyPolicyPage() {
  return (
    <AppLayout>
      <ClientSideWrapper>
        <PrivacyPolicyContent />
      </ClientSideWrapper>
    </AppLayout>
  );
}

// Disable static generation for this page
export const dynamic = 'force-dynamic'; 