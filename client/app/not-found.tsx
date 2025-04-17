'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
export default function NotFound() {
  // Force server-side rendering
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full p-8 bg-background rounded-lg shadow-lg text-center">
        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-6 flex items-center justify-center">
          <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">404</span>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </Button>
          
          <Button asChild variant="outline">
            <Button className="flex items-center gap-2" variant="secondary" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Disable static generation for this page
export const dynamic = 'force-dynamic'; 