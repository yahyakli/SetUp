"use client";

import React from 'react';
import AppLayout from '../../AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import ClientSideWrapper from '@/components/ClientSideWrapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

function IntegrationsContent() {
  return (
    <div className="p-6 space-y-8 dark:bg-gray-900 bg-gray-50">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Integrations</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Connect SetUp with your favorite tools and services
        </p>
        
        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search integrations..." 
            className="pl-10"
          />
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-5xl mx-auto">
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <Badge variant="secondary" className="px-4 py-2 cursor-pointer">All</Badge>
          <Badge variant="outline" className="px-4 py-2 cursor-pointer">Communication</Badge>
          <Badge variant="outline" className="px-4 py-2 cursor-pointer">Development</Badge>
          <Badge variant="outline" className="px-4 py-2 cursor-pointer">Productivity</Badge>
          <Badge variant="outline" className="px-4 py-2 cursor-pointer">Analytics</Badge>
          <Badge variant="outline" className="px-4 py-2 cursor-pointer">File Storage</Badge>
          <Badge variant="outline" className="px-4 py-2 cursor-pointer">CRM</Badge>
        </div>
      </section>

      {/* Featured Integrations */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Featured Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slack */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#4A154B] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <Badge>Popular</Badge>
              </div>
              <h3 className="text-xl font-semibold mb-2">Slack</h3>
              <p className="text-muted-foreground mb-4">
                Get notifications and updates from SetUp directly in your Slack channels.
              </p>
              <Button className="w-full">Connect</Button>
            </CardContent>
          </Card>
          
          {/* GitHub */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#24292e] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">G</span>
                </div>
                <Badge>Popular</Badge>
              </div>
              <h3 className="text-xl font-semibold mb-2">GitHub</h3>
              <p className="text-muted-foreground mb-4">
                Link commits and pull requests to tasks and automate workflow.
              </p>
              <Button className="w-full">Connect</Button>
            </CardContent>
          </Card>
          
          {/* Google Drive */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#0F9D58] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">GD</span>
                </div>
                <Badge>Popular</Badge>
              </div>
              <h3 className="text-xl font-semibold mb-2">Google Drive</h3>
              <p className="text-muted-foreground mb-4">
                Attach Google Drive files to tasks and projects for easy access.
              </p>
              <Button className="w-full">Connect</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* All Integrations */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">All Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Jira */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#0052CC] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">J</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Jira</h3>
              <p className="text-muted-foreground mb-4">
                Sync issues between Jira and SetUp for seamless workflow.
              </p>
              <Button className="w-full">Connect</Button>
            </CardContent>
          </Card>
          
          {/* Dropbox */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#0061FF] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">D</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Dropbox</h3>
              <p className="text-muted-foreground mb-4">
                Attach Dropbox files to your tasks and projects.
              </p>
              <Button className="w-full">Connect</Button>
            </CardContent>
          </Card>
          
          {/* Microsoft Teams */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#6264A7] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">MT</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Microsoft Teams</h3>
              <p className="text-muted-foreground mb-4">
                Get SetUp notifications and updates in Microsoft Teams.
              </p>
              <Button className="w-full">Connect</Button>
            </CardContent>
          </Card>
          
          {/* Zoom */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#2D8CFF] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">Z</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Zoom</h3>
              <p className="text-muted-foreground mb-4">
                Schedule and join Zoom meetings directly from SetUp.
              </p>
              <Button className="w-full">Connect</Button>
            </CardContent>
          </Card>
          
          {/* Figma */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#F24E1E] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">F</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Figma</h3>
              <p className="text-muted-foreground mb-4">
                Link Figma designs to your tasks for easy reference.
              </p>
              <Button className="w-full">Connect</Button>
            </CardContent>
          </Card>
          
          {/* Google Calendar */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#4285F4] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">GC</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Google Calendar</h3>
              <p className="text-muted-foreground mb-4">
                Sync SetUp deadlines with your Google Calendar.
              </p>
              <Button className="w-full">Connect</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Salesforce */}
          <Card className="opacity-70">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#00A1E0] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">SF</span>
                </div>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              <h3 className="text-xl font-semibold mb-2">Salesforce</h3>
              <p className="text-muted-foreground mb-4">
                Connect SetUp with Salesforce CRM.
              </p>
              <Button className="w-full" disabled>Join Waitlist</Button>
            </CardContent>
          </Card>
          
          {/* Adobe Creative Cloud */}
          <Card className="opacity-70">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#FF0000] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">AC</span>
                </div>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              <h3 className="text-xl font-semibold mb-2">Adobe Creative Cloud</h3>
              <p className="text-muted-foreground mb-4">
                Link Adobe files to your SetUp projects.
              </p>
              <Button className="w-full" disabled>Join Waitlist</Button>
            </CardContent>
          </Card>
          
          {/* Zapier */}
          <Card className="opacity-70">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#FF4A00] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">Z</span>
                </div>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              <h3 className="text-xl font-semibold mb-2">Zapier</h3>
              <p className="text-muted-foreground mb-4">
                Connect SetUp with thousands of apps through Zapier.
              </p>
              <Button className="w-full" disabled>Join Waitlist</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <AppLayout>
      <ClientSideWrapper>
        <IntegrationsContent />
      </ClientSideWrapper>
    </AppLayout>
  );
}

// Disable static generation for this page
export const dynamic = 'force-dynamic'; 