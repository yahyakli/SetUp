"use client";

import React from 'react';
import AppLayout from '../../AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import ClientSideWrapper from '@/components/ClientSideWrapper';
import { CheckCircle2, Users, Clock, Shield, MessageSquare, Zap } from 'lucide-react';

function AboutUsContent() {
  return (
    <div className="p-6 space-y-12 dark:bg-gray-900 bg-gray-50">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">About SetUp</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Empowering teams to achieve more together through intuitive project management.
        </p>
      </section>

      {/* Our Story */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="mb-4">
                SetUp was founded in 2020 by a team of project managers and developers who were frustrated with the complexity of existing project management tools. We set out to create a solution that was powerful enough for enterprise teams but simple enough for anyone to use.
              </p>
              <p>
                What started as a simple task tracker has evolved into a comprehensive project management platform used by thousands of teams worldwide. Our mission is to help teams of all sizes work more efficiently and collaboratively, no matter where they are located.
              </p>
            </div>
            <div className="relative h-64 w-full rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-2xl font-bold">Founded in 2020</h3>
                  <p className="text-lg">San Francisco, California</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Our Values */}
      <section className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Team First</h3>
              <p className="text-muted-foreground">
                We believe in the power of collaboration and building tools that bring teams together.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Zap className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Simplicity</h3>
              <p className="text-muted-foreground">
                We strive to make complex project management simple and accessible for everyone.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Security</h3>
              <p className="text-muted-foreground">
                We prioritize the security and privacy of our users&apos; data above all else.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Key Features */}
      <section className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Why Choose SetUp</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-4">
            <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-1">Intuitive Task Management</h3>
              <p className="text-muted-foreground">
                Create, assign, and track tasks with ease. Our drag-and-drop interface makes project management a breeze.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <Users className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-1">Team Collaboration</h3>
              <p className="text-muted-foreground">
                Work together seamlessly with real-time updates, comments, and file sharing.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-1">Time Tracking</h3>
              <p className="text-muted-foreground">
                Monitor project progress and team productivity with built-in time tracking tools.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <MessageSquare className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-1">Integrated Chat</h3>
              <p className="text-muted-foreground">
                Communicate directly within projects or have private conversations with team members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Our Leadership Team</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-bold text-xl">JD</div>
              </div>
              <h3 className="text-xl font-semibold">Jane Doe</h3>
              <p className="text-primary mb-2">CEO & Co-Founder</p>
              <p className="text-muted-foreground text-sm">
                Former project manager with 15+ years of experience leading teams at Fortune 500 companies.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-bold text-xl">JS</div>
              </div>
              <h3 className="text-xl font-semibold">John Smith</h3>
              <p className="text-primary mb-2">CTO & Co-Founder</p>
              <p className="text-muted-foreground text-sm">
                Software architect with a passion for creating elegant solutions to complex problems.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-bold text-xl">EJ</div>
              </div>
              <h3 className="text-xl font-semibold">Emily Johnson</h3>
              <p className="text-primary mb-2">Head of Product</p>
              <p className="text-muted-foreground text-sm">
                UX specialist focused on creating intuitive and delightful user experiences.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default function AboutPage() {
  return (
    <AppLayout>
      <ClientSideWrapper>
        <AboutUsContent />
      </ClientSideWrapper>
    </AppLayout>
  );
}

// Disable static generation for this page
export const dynamic = 'force-dynamic'; 