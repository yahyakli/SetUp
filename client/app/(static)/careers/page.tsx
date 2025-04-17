"use client";

import React from 'react';
import AppLayout from '../../AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import ClientSideWrapper from '@/components/ClientSideWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Briefcase, Heart, Users, Zap, Shield, Globe, ArrowRight } from 'lucide-react';

function CareersContent() {
  return (
    <div className="p-6 space-y-12 dark:bg-gray-900 bg-gray-50">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Help us build the future of project management
        </p>
        <Button size="lg">View Open Positions</Button>
      </section>

      {/* Why Join Us */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">Why Join SetUp?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Heart className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Meaningful Work</h3>
              <p className="text-muted-foreground">
                Build products that help thousands of teams work more efficiently and achieve their goals.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Inclusive Culture</h3>
              <p className="text-muted-foreground">
                Join a diverse team that values different perspectives and fosters belonging.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Zap className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Growth Opportunities</h3>
              <p className="text-muted-foreground">
                Develop your skills and advance your career with mentorship and learning resources.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">Benefits & Perks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Health & Wellness</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Comprehensive health, dental, and vision insurance</span>
                </li>
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Mental health resources and support</span>
                </li>
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Wellness stipend for gym memberships or fitness classes</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Work-Life Balance</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Flexible work hours and remote work options</span>
                </li>
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Generous paid time off and holidays</span>
                </li>
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Parental leave for all parents</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Professional Development</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Learning and development budget</span>
                </li>
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Conference attendance and speaking opportunities</span>
                </li>
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Mentorship and career growth programs</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Team & Culture</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Regular team events and retreats</span>
                </li>
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Employee resource groups</span>
                </li>
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Volunteer time off and donation matching</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Open Positions */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search positions..." className="pl-10" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">All Departments</Button>
            <Button variant="outline">All Locations</Button>
          </div>
        </div>
        
        {/* Job Listings */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">Senior Frontend Engineer</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span>Engineering</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>Remote (US)</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Globe className="h-4 w-4 mr-1" />
                      <span>Full-time</span>
                    </div>
                  </div>
                </div>
                <Button>Apply Now</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">Product Manager</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span>Product</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>San Francisco, CA</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Globe className="h-4 w-4 mr-1" />
                      <span>Full-time</span>
                    </div>
                  </div>
                </div>
                <Button>Apply Now</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">Customer Success Manager</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span>Customer Success</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>Remote (US)</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Globe className="h-4 w-4 mr-1" />
                      <span>Full-time</span>
                    </div>
                  </div>
                </div>
                <Button>Apply Now</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">Backend Engineer</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span>Engineering</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>Remote (US)</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Globe className="h-4 w-4 mr-1" />
                      <span>Full-time</span>
                    </div>
                  </div>
                </div>
                <Button>Apply Now</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6 text-center">
          <Button variant="link" className="gap-1">
            View All Positions <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto bg-primary/10 p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Don&apos;t See a Perfect Fit?</h2>
        <p className="mb-6">
          We&apos;re always looking for talented individuals to join our team. Send us your resume and we&apos;ll keep you in mind for future opportunities.
        </p>
        <Button>Submit Your Resume</Button>
      </section>
    </div>
  );
}

export default function CareersPage() {
  return (
    <AppLayout>
      <ClientSideWrapper>
        <CareersContent />
      </ClientSideWrapper>
    </AppLayout>
  );
}

// Disable static generation for this page
export const dynamic = 'force-dynamic'; 