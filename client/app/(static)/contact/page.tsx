"use client";

import React, { useState } from 'react';
import AppLayout from '../../AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import ClientSideWrapper from '@/components/ClientSideWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

function ContactContent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, inquiryType: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Your message has been sent! We\'ll get back to you soon.', {
        duration: 3000,
        position: 'top-center',
      });
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        inquiryType: ''
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="p-6 space-y-8 dark:bg-gray-900 bg-gray-50">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Have questions or need help? We&apos;re here for you.
        </p>
      </section>

      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
        {/* Contact Information */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-muted-foreground">support@setup.com</p>
                    <p className="text-muted-foreground">sales@setup.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-muted-foreground">Mon-Fri, 9am-5pm PT</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Office</h3>
                    <p className="text-muted-foreground">
                      123 Project Street<br />
                      Suite 456<br />
                      San Francisco, CA 94103
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Live Chat</h3>
                    <p className="text-muted-foreground">
                      Available for customers<br />
                      24/7 for Pro and Enterprise plans
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Business Hours</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 5:00 PM PT</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>Closed</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Contact Form */}
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      placeholder="John Doe" 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="john@example.com" 
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="inquiryType">Inquiry Type</Label>
                  <Select 
                    value={formData.inquiryType} 
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an inquiry type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="support">Technical Support</SelectItem>
                      <SelectItem value="billing">Billing Question</SelectItem>
                      <SelectItem value="sales">Sales Inquiry</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    name="subject" 
                    value={formData.subject} 
                    onChange={handleChange} 
                    placeholder="How can we help you?" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    value={formData.message} 
                    onChange={handleChange} 
                    placeholder="Please describe your question or issue in detail..." 
                    rows={5} 
                    required 
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">How do I upgrade my plan?</h3>
              <p className="text-muted-foreground">
                You can upgrade your plan at any time by going to Billing in your account settings. Changes take effect immediately.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">What happens when my subscription ends?</h3>
              <p className="text-muted-foreground">
                When your subscription ends, your account will revert to the free plan. You&apos;ll retain access to your 3 most recent projects and 1 team.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Can I cancel my subscription?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time. Please note that we don&apos;t provide refunds for unused portions of your subscription period.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">How do I get support?</h3>
              <p className="text-muted-foreground">
                All plans include chat support. Pro and Enterprise plans also include priority support with faster response times.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default function ContactPage() {
  return (
    <AppLayout>
      <ClientSideWrapper>
        <ContactContent />
      </ClientSideWrapper>
    </AppLayout>
  );
}

// Disable static generation for this page
export const dynamic = 'force-dynamic'; 