"use client";

import { Footer } from "@/components/Footer";
import Loader from "@/components/Loader";
import { Navbar } from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import { redirect } from "next/navigation";
import { useNotificationEvents } from '@/hooks/useNotificationEvents';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, authCheckComplete, isAuthenticated } = useAppContext();
  useNotificationEvents();

  // If we're on server-side or still loading user data, show loader
  if (typeof window === 'undefined' || isLoading || !authCheckComplete) {
    return <Loader />;
  }

  // Only redirect after auth check is complete and we're on client-side
  if (!isAuthenticated) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;