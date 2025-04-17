"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { redirect, useSearchParams } from "next/navigation";
import Loader from "@/components/Loader";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, isLoading } = useSelector((state: RootState) => state.user);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectTo');
  
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      setAuthCheckComplete(true);
    }
  }, []);

  // Show loader if on server-side, still loading, or auth check not complete
  if (typeof window === 'undefined' || isLoading || !authCheckComplete) {
    return <Loader />;
  }
  
  // Only redirect after client-side hydration
  if (token) {
    redirect(redirectTo || "/dashboard");
  }

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="w-full p-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold flex items-center cursor-pointer">
            <span className="text-blue-600 dark:text-blue-400">Set</span>
            <span className="text-gray-900 dark:text-white">Up</span>
          </Link>
          <ThemeToggle />
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          {children}
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SetUp. All rights reserved.
        </footer>
      </div>
    </NextThemesProvider>
  );
}