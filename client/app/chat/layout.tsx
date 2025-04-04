"use client";

import { Navbar } from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import Loader from "@/components/Loader";
import { redirect } from "next/navigation";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, authCheckComplete, isAuthenticated } = useAppContext();

  // If we're on server-side or still loading user data, show loader
  if (typeof window === 'undefined' || isLoading || !authCheckComplete) {
    return <Loader />;
  }

  // Only redirect after auth check is complete and we're on client-side
  if (!isAuthenticated) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-gray-900 overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
} 