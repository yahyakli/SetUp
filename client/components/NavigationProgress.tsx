"use client";

import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import { useEffect, useRef } from 'react';

// Custom styles for NProgress
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({
  minimum: 0.2,
  easing: 'ease',
  speed: 400,
  showSpinner: false,
});

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isChangingRef = useRef(false);
  const loadingKeyRef = useRef('');
  
  // Monitor route changes with refs instead of state
  useEffect(() => {
    // Track navigation with a key based on the current path and search params
    const currentKey = pathname + searchParams.toString();
    
    if (loadingKeyRef.current && loadingKeyRef.current !== currentKey) {
      // Route change completed
      NProgress.done();
      isChangingRef.current = false;
      loadingKeyRef.current = '';
    }
  }, [pathname, searchParams]);

  // Set up event listeners for navigation events
  useEffect(() => {
    const handleRouteChangeStart = () => {
      if (!isChangingRef.current) {
        isChangingRef.current = true;
        loadingKeyRef.current = pathname + searchParams.toString();
        NProgress.start();
      }
    };

    const handleRouteChangeComplete = () => {
      NProgress.done();
      isChangingRef.current = false;
      loadingKeyRef.current = '';
    };

    // Add event listeners to document for detecting clicks on links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && 
          link.href && 
          link.href.startsWith(window.location.origin) && 
          !link.href.includes('#') && 
          !e.ctrlKey && 
          !e.metaKey) {
        handleRouteChangeStart();
      }
    };

    // Monitor network activity to better track page loading
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      
      // Only track navigation-related requests
      if (typeof url === 'string' && (
          url.includes('/_next/data') || 
          url.endsWith('.json') || 
          url.endsWith('.js') ||
          !url.includes('/api/') // Exclude pure API calls that aren't page data
      )) {
        if (!isChangingRef.current) {
          handleRouteChangeStart();
        }
        
        return originalFetch.apply(this, [input, init])
          .then(response => {
            if (response.status >= 200 && response.status < 300) {
              // Wait a bit for the DOM to update before marking as complete
              setTimeout(handleRouteChangeComplete, 100);
            }
            return response;
          })
          .catch(error => {
            handleRouteChangeComplete();
            throw error;
          });
      }
      
      return originalFetch.apply(this, [input, init]);
    };

    document.addEventListener('click', handleClick);

    return () => {
      // Clean up
      document.removeEventListener('click', handleClick);
      window.fetch = originalFetch;
      NProgress.done();
    };
  }, [pathname, searchParams]);

  // Also monitor for initial page load
  useEffect(() => {
    // Handle initial load
    if (document.readyState === 'loading') {
      NProgress.start();
      
      const handleLoad = () => {
        NProgress.done();
        document.removeEventListener('DOMContentLoaded', handleLoad);
      };
      
      document.addEventListener('DOMContentLoaded', handleLoad);
      
      return () => {
        document.removeEventListener('DOMContentLoaded', handleLoad);
      };
    }
  }, []);

  return null;
} 