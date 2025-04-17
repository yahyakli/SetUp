import { headers } from 'next/headers';
import Link from 'next/link';

export default function NotFound() {
  // Force server-side rendering
  headers();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-6">The page you are looking for does not exist.</p>
      <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Return to Home
      </Link>
    </div>
  );
}

// This should be in a separate config file or layout, not in a client component
// export const dynamic = 'force-dynamic'; 