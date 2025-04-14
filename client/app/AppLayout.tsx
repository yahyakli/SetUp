"use client";

import { Footer } from "@/components/Footer";
import Loader from "@/components/Loader";
import { Navbar } from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import { usePathname, useRouter } from "next/navigation";
import { useNotificationEvents } from '@/hooks/useNotificationEvents';
import { useEffect } from "react";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, authCheckComplete, isAuthenticated } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();
  useNotificationEvents();

  useEffect(() => {
    // Only run on client-side and after auth check is complete
    if (typeof window !== 'undefined' && authCheckComplete && !isAuthenticated) {
      // Encode the current path to use as a redirect parameter
      const encodedRedirect = encodeURIComponent(pathname);
      router.push(`/login?redirectTo=${encodedRedirect}`);
    }
  }, [authCheckComplete, isAuthenticated, pathname, router]);

  // If we're on server-side or still loading user data, show loader
  if (typeof window === 'undefined' || isLoading || !authCheckComplete) {
    return <Loader />;
  }

  // Don't redirect here anymore, we do it in the useEffect
  if (!isAuthenticated) {
    return <Loader />;
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