"use client";

import React, { useState } from 'react';
import AppLayout from '../../AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import ClientSideWrapper from '@/components/ClientSideWrapper';
import { Input } from '@/components/ui/input';
import { Search, Book, FileText, Video, Code, Lightbulb, ChevronRight } from 'lucide-react';
import Link from 'next/link';

function DocsContent() {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="p-6 space-y-8 dark:bg-gray-900 bg-gray-50">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Documentation</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Everything you need to get the most out of SetUp
        </p>
        
        {/* Search */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search documentation..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Quick Links */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Book className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">Getting Started</h3>
                  <p className="text-muted-foreground mb-2">
                    New to SetUp? Start here to learn the basics.
                  </p>
                  <Link href="#" className="text-primary flex items-center">
                    Read guide <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Video className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">Video Tutorials</h3>
                  <p className="text-muted-foreground mb-2">
                    Visual learner? Watch our step-by-step tutorials.
                  </p>
                  <Link href="#" className="text-primary flex items-center">
                    Watch videos <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Code className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">API Reference</h3>
                  <p className="text-muted-foreground mb-2">
                    Detailed documentation for developers.
                  </p>
                  <Link href="#" className="text-primary flex items-center">
                    View API docs <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Documentation Categories */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Documentation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Guide */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                User Guide
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary flex items-center">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Account Setup and Management
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary flex items-center">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Creating and Managing Projects
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary flex items-center">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Task Management
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary flex items-center">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Team Collaboration
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary flex items-center">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Reporting and Analytics
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          {/* Admin Guide */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Admin Guide
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary flex items-center">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    User Management
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary flex items-center">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Permissions and Access Control
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary flex items-center">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Billing and Subscription Management
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary flex items-center">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Security Settings
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary flex items-center">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Custom Workflows
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          {/* Integrations */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Integrations
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary flex items-center">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Setting Up Integrations
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary flex items-center">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    GitHub Integration
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary flex items-center">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Slack Integration
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary flex items-center">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Google Workspace Integration
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary flex items-center">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Microsoft 365 Integration
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          {/* API Documentation */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                API Documentation
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary flex items-center">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    API Overview
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary flex items-center">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Authentication
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary flex items-center">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Projects API
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary flex items-center">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Tasks API
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-primary flex items-center">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Users API
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-2">
                <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Getting Started with SetUp</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Learn how to set up your account, create your first project, and invite team members.
                  </p>
                  <Link href="#" className="text-primary text-sm">Read more</Link>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-2">
                <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Best Practices for Project Organization</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Tips and strategies for keeping your projects organized and your team productive.
                  </p>
                  <Link href="#" className="text-primary text-sm">Read more</Link>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-2">
                <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Advanced Reporting Features</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    How to use SetUp&apos;s reporting tools to gain insights into your team&apos;s performance.
                  </p>
                  <Link href="#" className="text-primary text-sm">Read more</Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default function DocsPage() {
  return (
    <AppLayout>
      <ClientSideWrapper>
        <DocsContent />
      </ClientSideWrapper>
    </AppLayout>
  );
}

// Disable static generation for this page
export const dynamic = 'force-dynamic'; 