"use client";

import React from 'react';
import AppLayout from '../../AppLayout';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import ClientSideWrapper from '@/components/ClientSideWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, LifeBuoy, FileText, Video, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function SupportContent() {
  return (
    <div className="p-6 space-y-12 dark:bg-gray-900 bg-gray-50">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">How Can We Help?</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Find answers, get support, and resolve issues
        </p>
        
        {/* Search */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search for help articles..." 
            className="pl-10"
          />
        </div>
      </section>

      {/* Support Options */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Support Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <MessageSquare className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Live Chat</h3>
              <p className="text-muted-foreground mb-4">
                Chat with our support team for immediate assistance.
              </p>
            </CardContent>
            <CardFooter className="justify-center pb-6">
              <Button>Start Chat</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <FileText className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Knowledge Base</h3>
              <p className="text-muted-foreground mb-4">
                Browse our comprehensive documentation and tutorials.
              </p>
            </CardContent>
            <CardFooter className="justify-center pb-6">
              <Button variant="outline">View Articles</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <LifeBuoy className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Submit a Ticket</h3>
              <p className="text-muted-foreground mb-4">
                Create a support ticket for complex issues requiring investigation.
              </p>
            </CardContent>
            <CardFooter className="justify-center pb-6">
              <Button variant="outline">Create Ticket</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Popular Topics */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Popular Topics</h2>
        <Tabs defaultValue="account">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">How to reset your password</h3>
                  <p className="text-muted-foreground mb-3">
                    Learn how to reset your password if you&apos;ve forgotten it.
                  </p>
                  <Link href="#" className="text-primary flex items-center text-sm">
                    Read article <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Managing team members</h3>
                  <p className="text-muted-foreground mb-3">
                    How to invite, remove, and manage permissions for team members.
                  </p>
                  <Link href="#" className="text-primary flex items-center text-sm">
                    Read article <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Two-factor authentication</h3>
                  <p className="text-muted-foreground mb-3">
                    Set up 2FA to add an extra layer of security to your account.
                  </p>
                  <Link href="#" className="text-primary flex items-center text-sm">
                    Read article <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Account settings</h3>
                  <p className="text-muted-foreground mb-3">
                    How to update your profile, notification preferences, and more.
                  </p>
                  <Link href="#" className="text-primary flex items-center text-sm">
                    Read article <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="billing" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Subscription management</h3>
                  <p className="text-muted-foreground mb-3">
                    How to upgrade, downgrade, or cancel your subscription.
                  </p>
                  <Link href="#" className="text-primary flex items-center text-sm">
                    Read article <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Payment methods</h3>
                  <p className="text-muted-foreground mb-3">
                    How to add, update, or remove payment methods.
                  </p>
                  <Link href="#" className="text-primary flex items-center text-sm">
                    Read article <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Billing history and invoices</h3>
                  <p className="text-muted-foreground mb-3">
                    How to view and download your billing history and invoices.
                  </p>
                  <Link href="#" className="text-primary flex items-center text-sm">
                    Read article <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Enterprise billing</h3>
                  <p className="text-muted-foreground mb-3">
                    Information about custom billing options for enterprise customers.
                  </p>
                  <Link href="#" className="text-primary flex items-center text-sm">
                    Read article <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="projects" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Creating your first project</h3>
                  <p className="text-muted-foreground mb-3">
                    A step-by-step guide to creating and setting up your first SetUp project.
                  </p>
                  <Link href="#" className="text-primary flex items-center text-sm">
                    Read article <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Task management</h3>
                  <p className="text-muted-foreground mb-3">
                    How to create, assign, and track tasks within your projects.
                  </p>
                  <Link href="#" className="text-primary flex items-center text-sm">
                    Read article <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Project templates</h3>
                  <p className="text-muted-foreground mb-3">
                    How to use and create project templates to save time.
                  </p>
                  <Link href="#" className="text-primary flex items-center text-sm">
                    Read article <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Project reporting</h3>
                  <p className="text-muted-foreground mb-3">
                    How to generate and customize reports for your projects.
                  </p>
                  <Link href="#" className="text-primary flex items-center text-sm">
                    Read article <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="integrations" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Slack integration</h3>
                  <p className="text-muted-foreground mb-3">
                    How to connect and use SetUp with Slack.
                  </p>
                  <Link href="#" className="text-primary flex items-center text-sm">
                    Read article <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">GitHub integration</h3>
                  <p className="text-muted-foreground mb-3">
                    How to connect and use SetUp with GitHub.
                  </p>
                  <Link href="#" className="text-primary flex items-center text-sm">
                    Read article <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Google Drive integration</h3>
                  <p className="text-muted-foreground mb-3">
                    How to connect and use SetUp with Google Drive.
                  </p>
                  <Link href="#" className="text-primary flex items-center text-sm">
                    Read article <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">API documentation</h3>
                  <p className="text-muted-foreground mb-3">
                    How to use our API to build custom integrations.
                  </p>
                  <Link href="#" className="text-primary flex items-center text-sm">
                    Read article <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Video Tutorials */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Video Tutorials</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-md mb-4 flex items-center justify-center">
                <Video className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Getting Started with SetUp</h3>
              <p className="text-sm text-muted-foreground mb-2">
                A complete walkthrough of SetUp basics.
              </p>
              <p className="text-xs text-muted-foreground">5:32</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-md mb-4 flex items-center justify-center">
                <Video className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Advanced Project Management</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Learn advanced techniques for managing complex projects.
              </p>
              <p className="text-xs text-muted-foreground">8:47</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-md mb-4 flex items-center justify-center">
                <Video className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Team Collaboration Features</h3>
              <p className="text-sm text-muted-foreground mb-2">
                How to use SetUp&apos;s collaboration tools effectively.
              </p>
              <p className="text-xs text-muted-foreground">6:15</p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-6 text-center">
          <Button variant="link" className="gap-1">
            View All Videos <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Contact Support */}
      <section className="max-w-3xl mx-auto bg-primary/10 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Still Need Help?</h2>
        <p className="text-center mb-6">
          Our support team is available Monday through Friday, 9am-5pm PST.
        </p>
        <div className="flex justify-center gap-4">
          <Button className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Contact Support
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function SupportPage() {
  return (
    <AppLayout>
      <ClientSideWrapper>
        <SupportContent />
      </ClientSideWrapper>
    </AppLayout>
  );
}

// Disable static generation for this page
export const dynamic = 'force-dynamic'; 