"use client";

import React from 'react';
import AppLayout from '../../AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import ClientSideWrapper from '@/components/ClientSideWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Shield, Users, Lock, BarChart4, Zap, Clock } from 'lucide-react';

function EnterpriseContent() {
  return (
    <div className="p-6 space-y-12 dark:bg-gray-900 bg-gray-50">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">SetUp Enterprise</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Advanced project management solutions for large organizations
        </p>
        <Button size="lg" className="mt-4">
          Contact Sales
        </Button>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">Enterprise Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Security</h3>
              <p className="text-muted-foreground">
                Enterprise-grade security with SSO, SAML, and custom data retention policies.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">User Management</h3>
              <p className="text-muted-foreground">
                Advanced user permissions, SCIM provisioning, and custom roles.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Lock className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Compliance</h3>
              <p className="text-muted-foreground">
                GDPR, HIPAA, SOC2, and ISO 27001 compliance for regulated industries.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <BarChart4 className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground">
                Comprehensive reporting, custom dashboards, and data export capabilities.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Zap className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Custom Workflows</h3>
              <p className="text-muted-foreground">
                Build custom workflows and automations tailored to your organization.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Clock className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-muted-foreground">
                Dedicated account manager and round-the-clock priority support.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto bg-secondary/30 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-8 text-center">Trusted by Industry Leaders</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <p className="italic mb-4">
                &quot;TaskFlow Enterprise has transformed how our teams collaborate across multiple departments and locations. The custom workflows and advanced security features were exactly what we needed.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                <div>
                  <p className="font-semibold">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">CTO, Global Tech Solutions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <p className="italic mb-4">
                &quot;The dedicated support and customization options have made TaskFlow an invaluable tool for our organization. We&apos;ve seen a 40% increase in project completion rates since implementation.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                <div>
                  <p className="font-semibold">Michael Chen</p>
                  <p className="text-sm text-muted-foreground">Director of Operations, Innovate Inc.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Form */}
      <section className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Request Enterprise Information</h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input id="email" type="email" placeholder="john@company.com" />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" placeholder="Acme Inc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+1 (555) 123-4567" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="team-size">Team Size</Label>
                <Input id="team-size" placeholder="e.g., 100-500 employees" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">How can we help?</Label>
                <Textarea 
                  id="message" 
                  placeholder="Tell us about your organization's needs..." 
                  rows={4} 
                />
              </div>
              
              <Button type="submit" className="w-full">
                Submit Request
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                By submitting this form, you agree to our <a href="/privacy-policy" className="underline">Privacy Policy</a> and <a href="/terms-of-service" className="underline">Terms of Service</a>.
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default function EnterprisePage() {
  return (
    <AppLayout>
      <ClientSideWrapper>
        <EnterpriseContent />
      </ClientSideWrapper>
    </AppLayout>
  );
}

// Disable static generation for this page
export const dynamic = 'force-dynamic'; 