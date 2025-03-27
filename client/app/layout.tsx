import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ReduxProvider from "@/lib/ReduxProvider.client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AppContextProvider } from "@/context/AppContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SetUp",
  description: "Modern project management application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
          <ReduxProvider>
            <AppContextProvider>
              {children}
              <Toaster />
            </AppContextProvider>
          </ReduxProvider>
        </NextThemesProvider>
      </body>
    </html>
  );
}