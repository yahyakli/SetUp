"use client";

import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="w-full p-4 flex justify-end">
          <ThemeToggle />
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          {children}
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SetUp. All rights reserved.
        </footer>
      </div>
    </ThemeProvider>
  );
}