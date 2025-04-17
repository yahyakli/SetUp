'use client';

import { createContext, useContext, ReactNode, Suspense } from 'react';
import { useSearchParams as useNextSearchParams } from 'next/navigation';
import Loader from '@/components/Loader';

// Create a context to store search params
const SearchParamsContext = createContext<URLSearchParams | null>(null);

// Component that reads search params and provides them via context
function SearchParamsReader() {
  const searchParams = useNextSearchParams();
  return (
    <SearchParamsContext.Provider value={searchParams}>
      <SearchParamsProviderContent />
    </SearchParamsContext.Provider>
  );
}

// Content component that renders children
function SearchParamsProviderContent() {
  return <>{useContext(SearchParamsProviderContext)}</>;
}

// Context to store the children
const SearchParamsProviderContext = createContext<ReactNode>(null);

// Main provider component
export function SearchParamsProvider({ children }: { children: ReactNode }) {
  return (
    <SearchParamsProviderContext.Provider value={children}>
      <Suspense fallback={<Loader />}>
        <SearchParamsReader />
      </Suspense>
    </SearchParamsProviderContext.Provider>
  );
}

// Hook to use search params safely
export function useSafeSearchParams() {
  const params = useContext(SearchParamsContext);
  return params;
} 