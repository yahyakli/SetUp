"use client";

import React from 'react';
import AppLayout from '../../AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import ClientSideWrapper from '@/components/ClientSideWrapper';
import { FileText, Shield, Lock } from 'lucide-react';
import Link from 'next/link';

function LegalContent() {
  return (
    <div className="p-6 space-y-12 dark:bg-gray-900 bg-gray-50">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Legal Information</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Important legal documents and policies for SetUp users
        </p>
      </section>

      {/* Legal Documents */}
      <section className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">Terms of Service</h3>
                  <p className="text-muted-foreground mb-2">
                    The agreement between SetUp and users of our services.
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Last updated: May 1, 2024
                  </p>
                  <Link href="/terms-of-service" className="text-primary">
                    Read Terms of Service
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">Privacy Policy</h3>
                  <p className="text-muted-foreground mb-2">
                    How we collect, use, and protect your personal information.
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Last updated: May 1, 2024
                  </p>
                  <Link href="/privacy-policy" className="text-primary">
                    Read Privacy Policy
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Lock className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">Cookie Policy</h3>
                  <p className="text-muted-foreground mb-2">
                    Information about cookies and similar technologies we use.
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Last updated: May 1, 2024
                  </p>
                  <Link href="/cookie-policy" className="text-primary">
                    Read Cookie Policy
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Additional Legal Information */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Additional Legal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-3">Data Processing Agreement</h3>
              <p className="text-muted-foreground mb-4">
                For customers who need a Data Processing Agreement (DPA) to comply with data protection regulations such as GDPR.
              </p>
              <Link href="#" className="text-primary">
                Request DPA
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-3">Service Level Agreement</h3>
              <p className="text-muted-foreground mb-4">
                Details about our service availability commitments and support response times for paid plans.
              </p>
              <Link href="#" className="text-primary">
                View SLA
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-3">Security Practices</h3>
              <p className="text-muted-foreground mb-4">
                Information about our security measures, certifications, and compliance with industry standards.
              </p>
              <Link href="#" className="text-primary">
                Learn About Security
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-3">Acceptable Use Policy</h3>
              <p className="text-muted-foreground mb-4">
                Guidelines for appropriate use of SetUp services and prohibited activities.
              </p>
              <Link href="#" className="text-primary">
                Read Acceptable Use Policy
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Compliance */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Compliance</h2>
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">GDPR Compliance</h3>
                <p className="text-muted-foreground mb-4">
                  SetUp is committed to GDPR compliance and provides tools and features to help our customers comply with GDPR requirements.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>Data export functionality</li>
                  <li>Data deletion options</li>
                  <li>Data Processing Agreements</li>
                  <li>Security measures and safeguards</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Other Compliance Standards</h3>
                <p className="text-muted-foreground mb-4">
                  SetUp maintains compliance with various industry standards and regulations:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>SOC 2 Type II certified</li>
                  <li>CCPA compliant</li>
                  <li>HIPAA compliance available for Enterprise plans</li>
                  <li>ISO 27001 certified</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Contact */}
      <section className="max-w-3xl mx-auto bg-primary/10 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Legal Questions?</h2>
        <p className="text-center mb-6">
          If you have any questions about our legal policies or need additional information, please contact our legal team.
        </p>
        <div className="flex justify-center">
          <Link href="/contact" className="text-primary font-medium">
            Contact Legal Team
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function LegalPage() {
  return (
    <AppLayout>
      <ClientSideWrapper>
        <LegalContent />
      </ClientSideWrapper>
    </AppLayout>
  );
}

// Disable static generation for this page
export const dynamic = 'force-dynamic'; 