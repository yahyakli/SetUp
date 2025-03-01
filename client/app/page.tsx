"use client";

import React, { useRef } from 'react';
import Banner from '@/public/banner.jpg';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { BarChart, Clock, Users, CheckCircle, Shield, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavigationMenu } from '@radix-ui/react-navigation-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChart, Line } from 'recharts';
import { Footer } from '@/components/Footer';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface ChartData {
  name: string;
  value: number;
}

interface Testimonial {
  name: string;
  role: string;
  text: string;
}

const Page: React.FC = () => {
  const getLastSixMonths = (): ChartData[] => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const today = new Date();
    const chartData: ChartData[] = [];

    const growingValues = [1520, 1270, 1460, 1530, 1800, 1900];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      const monthName = months[date.getMonth()];
      const value = growingValues[5 - i];
      chartData.push({ name: monthName, value });
    }
    return chartData;
  };

  const chartData: ChartData[] = getLastSixMonths();

  const princingRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Testimonials data
  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      role: "Product Manager at TechCorp",
      text: "SetUp transformed how our team collaborates. We've seen a 40% increase in productivity since implementing it.",
    },
    {
      name: "David Chen",
      role: "CTO at Startup Innovations",
      text: "The interface is intuitive and the features are exactly what we needed. SetUp has become essential to our workflow.",
    },
    {
      name: "Maria Rodriguez",
      role: "Team Lead at Global Solutions",
      text: "I've used many project management tools, but SetUp stands out with its perfect balance of simplicity and power.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full bg-white dark:bg-gray-800 shadow-sm px-18">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between cursor-pointer">
          {/* Logo on the left */}
          <div onClick={scrollToTop} className="text-2xl font-bold flex items-center">
            <span className="text-blue-600 dark:text-blue-400">Set</span>
            <span className="text-gray-900 dark:text-white">Up</span>
          </div>

          {/* Desktop Navigation Links (hidden on small devices) */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="flex space-x-4">
              <NavigationMenuItem>
                <button className="px-4 py-2 cursor-pointer text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400" onClick={() => { featuresRef.current?.scrollIntoView({ behavior: "smooth" }) }}>
                  Features
                </button>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <button className="px-4 py-2 cursor-pointer text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400" onClick={() => { statusRef.current?.scrollIntoView({ behavior: "smooth" }) }}>
                  Status
                </button>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <button className="px-4 py-2 cursor-pointer text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400" onClick={() => { princingRef.current?.scrollIntoView({ behavior: "smooth" }) }}>
                  Pricing
                </button>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <button className="px-4 py-2 cursor-pointer text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400" onClick={() => { testimonialsRef.current?.scrollIntoView({ behavior: "smooth" }) }}>
                  Testimonials
                </button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right-side buttons (theme toggle and get started) */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex">
              <ThemeToggle />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white hidden md:inline-block" onClick={() => (redirect("/dashboard"))}>
              get started
            </Button>
          </div>

          {/* Mobile Menu Trigger (visible on small devices) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
            <SheetContent side="right" className="w-[300px] pt-10">
              <div className="flex flex-col space-y-4 mt-6">
                <SheetClose asChild>
                  <button className="px-4 py-2 cursor-pointer text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400" onClick={() => { princingRef.current?.scrollIntoView({ behavior: "smooth" }) }}>
                    Pricing
                  </button>
                </SheetClose>
                <SheetClose asChild>
                  <button className="px-4 py-2 cursor-pointer text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400" onClick={() => { featuresRef.current?.scrollIntoView({ behavior: "smooth" }) }}>
                    Features
                  </button>
                </SheetClose>
                <SheetClose asChild>
                  <button className="px-4 py-2 cursor-pointer text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400" onClick={() => { testimonialsRef.current?.scrollIntoView({ behavior: "smooth" }) }}>
                    Testimonials
                  </button>
                </SheetClose>
                {/* Add ThemeToggle inside the mobile sheet */}
                <div className='absolute top-4 left-4'>
                  <ThemeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-18 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-4">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Manage Projects <span className="text-blue-600 dark:text-blue-400">Effortlessly</span>
            </h1>
            <p className="text-lg mb-8 text-gray-700 dark:text-gray-300">
              SetUp is an all-in-one project management solution designed to simplify your workflow and boost team productivity.
            </p>
            <div className="flex gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Started Free</Button>
              <Button variant="outline">Book a Demo</Button>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
              <Image src={Banner} alt="Dashboard Preview" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-18 bg-white dark:bg-gray-900" ref={featuresRef}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features to Transform Your Workflow</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <BarChart className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Gain insights into project performance with detailed charts and reports.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <Clock className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Time Tracking</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Monitor hours spent on tasks and generate accurate timesheets.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <Users className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Seamlessly communicate and share resources with your team members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-18 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">98%</div>
              <div className="text-gray-700 dark:text-gray-300">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">10k+</div>
              <div className="text-gray-700 dark:text-gray-300">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">50k+</div>
              <div className="text-gray-700 dark:text-gray-300">Projects Managed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">30%</div>
              <div className="text-gray-700 dark:text-gray-300">Productivity Increase</div>
            </div>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="py-20 px-18 bg-white dark:bg-gray-900" ref={statusRef}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Data-Driven Project Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-6">Task Completion Rate</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#2563eb" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-6">Team Productivity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section className="py-20 px-18 bg-gray-100 dark:bg-gray-800" ref={princingRef}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Pricing Plans</h2>
          <p className="text-center mb-12 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Choose the perfect plan for your team&#39;s needs. All plans include our core features with different limits.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Free Plan */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Free Plan</CardTitle>
                <CardDescription>For individuals and small teams</CardDescription>
                <div className="text-3xl font-bold mt-4">
                  $0<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>3 projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>5 team members per project</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Basic task management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>1 GB storage</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard" className='w-full'>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Basic Plan */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Basic Plan</CardTitle>
                <CardDescription>For growing teams</CardDescription>
                <div className="text-3xl font-bold mt-4">
                  $9<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>10 projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>10 team members per project</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Advanced task management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>10 GB storage</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Subscribe Now</Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="flex flex-col border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-gray-800">
              <div className="bg-blue-600 text-white text-center py-2 text-sm font-medium">Most Popular</div>
              <CardHeader>
                <CardTitle>Pro Plan</CardTitle>
                <CardDescription>For professional teams</CardDescription>
                <div className="text-3xl font-bold mt-4">
                  $29<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Unlimited projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Unlimited team members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Advanced task management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>50 GB storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Subscribe Now</Button>
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Enterprise Plan</CardTitle>
                <CardDescription>For large organizations</CardDescription>
                <div className="text-3xl font-bold mt-4">
                  Custom<span className="text-sm font-normal text-gray-500 dark:text-gray-400"> pricing</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Everything in Pro Plan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Customizable workflows</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Dedicated account manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>1 TB storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span>Premium security features</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">
                  Contact Sales
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-18 bg-white dark:bg-gray-900" ref={testimonialsRef}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="flex flex-col">
                <CardContent className="pt-6 flex-grow">
                  <div className="mb-4 text-yellow-500 flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">&quot;{testimonial.text}&quot;</p>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-18 bg-blue-600 dark:bg-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Project Management?</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Join thousands of teams who have improved their workflow with SetUp.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/dashboard">
              <Button className="bg-white text-blue-600 hover:bg-gray-100">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Page;