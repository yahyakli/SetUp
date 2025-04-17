'use client';

import { Suspense, ReactNode } from 'react';
import Loader from '@/components/Loader';

interface ClientSideWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ClientSideWrapper({ 
  children, 
  fallback = <Loader /> 
}: ClientSideWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
} 