"use client";

import React from 'react';
import AppLayout from '../../AppLayout';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import ClientSideWrapper from '@/components/ClientSideWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Users, Calendar, Globe, ArrowRight, Twitter, Github, Linkedin } from 'lucide-react';
import Link from 'next/link';

function CommunityContent() {
  return (
    <div className="p-6 space-y-12 dark:bg-gray-900 bg-gray-50">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Join Our Community</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Connect with other SetUp users, share ideas, and get help
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Button size="lg" className="gap-2">
            <Users className="h-5 w-5" />
            Join Forum
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </Button>
        </div>
      </section>

      {/* Community Channels */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Connect With Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <MessageSquare className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Forum</h3>
              <p className="text-muted-foreground mb-4">
                Ask questions, share tips, and connect with other SetUp users.
              </p>
            </CardContent>
            <CardFooter className="justify-center pb-6">
              <Button variant="outline">Visit Forum</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">User Groups</h3>
              <p className="text-muted-foreground mb-4">
                Join local and virtual user groups to network and learn from peers.
              </p>
            </CardContent>
            <CardFooter className="justify-center pb-6">
              <Button variant="outline">Find Groups</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Globe className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Social Media</h3>
              <p className="text-muted-foreground mb-4">
                Follow us on social media for updates, tips, and community highlights.
              </p>
            </CardContent>
            <CardFooter className="justify-center pb-6 gap-2">
              <Button variant="outline" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Github className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg text-center min-w-[70px]">
                  <div className="text-lg font-bold">15</div>
                  <div className="text-sm">May</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">SetUp User Conference 2024</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Virtual • 9:00 AM - 5:00 PM PST
                  </p>
                  <p className="text-sm mb-3">
                    Join us for our annual user conference featuring product updates, customer stories, and networking opportunities.
                  </p>
                  <Button variant="outline" size="sm">Register Now</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg text-center min-w-[70px]">
                  <div className="text-lg font-bold">22</div>
                  <div className="text-sm">May</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Advanced Workflow Webinar</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Virtual • 11:00 AM - 12:00 PM PST
                  </p>
                  <p className="text-sm mb-3">
                    Learn how to create custom workflows and automations to streamline your team&apos;s processes.
                  </p>
                  <Button variant="outline" size="sm">Register Now</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg text-center min-w-[70px]">
                  <div className="text-lg font-bold">5</div>
                  <div className="text-sm">Jun</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">SetUp Meetup - San Francisco</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    San Francisco, CA • 6:00 PM - 8:00 PM PST
                  </p>
                  <p className="text-sm mb-3">
                    Join local SetUp users for networking, discussions, and refreshments.
                  </p>
                  <Button variant="outline" size="sm">RSVP</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg text-center min-w-[70px]">
                  <div className="text-lg font-bold">12</div>
                  <div className="text-sm">Jun</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Getting Started with SetUp API</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Virtual • 10:00 AM - 11:30 AM PST
                  </p>
                  <p className="text-sm mb-3">
                    A technical workshop for developers looking to integrate with the SetUp API.
                  </p>
                  <Button variant="outline" size="sm">Register Now</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-6 text-center">
          <Button variant="link" className="gap-1">
            View All Events <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Community Showcase */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Community Showcase</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">SetUp for Marketing Teams</h3>
              <p className="text-sm text-muted-foreground mb-3">
                By Sarah Johnson, Marketing Director
              </p>
              <p className="text-sm mb-3">
                How our marketing team uses SetUp to manage campaigns, content calendars, and approvals.
              </p>
              <Link href="#" className="text-primary text-sm flex items-center">
                Read Case Study <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Custom Dashboard Templates</h3>
              <p className="text-sm text-muted-foreground mb-3">
                By Michael Chen, Product Manager
              </p>
              <p className="text-sm mb-3">
                A collection of dashboard templates for different team types and workflows.
              </p>
              <Link href="#" className="text-primary text-sm flex items-center">
                Download Templates <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">SetUp GitHub Integration</h3>
              <p className="text-sm text-muted-foreground mb-3">
                By Alex Rodriguez, Developer
              </p>
              <p className="text-sm mb-3">
                An open-source tool that enhances the GitHub integration with SetUp.
              </p>
              <Link href="#" className="text-primary text-sm flex items-center">
                View on GitHub <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-3xl mx-auto bg-primary/10 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Stay Updated</h2>
        <p className="text-center mb-6">
          Subscribe to our community newsletter for the latest events, tips, and updates.
        </p>
        <div className="flex gap-2 max-w-md mx-auto">
          <Input placeholder="Enter your email" className="flex-grow" />
          <Button>Subscribe</Button>
        </div>
      </section>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <AppLayout>
      <ClientSideWrapper>
        <CommunityContent />
      </ClientSideWrapper>
    </AppLayout>
  );
}

// Disable static generation for this page
export const dynamic = 'force-dynamic'; 