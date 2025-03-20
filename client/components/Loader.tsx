"use client"

import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black">
      <div className="relative h-16 w-16">
        {/* Outer spinning ring */}
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"></div>
        
        {/* Middle spinning ring - opposite direction */}
        <div className="absolute inset-0 m-1 animate-[spin_1s_linear_infinite_reverse] rounded-full border-4 border-b-primary border-r-transparent border-t-transparent border-l-transparent"></div>
        
        {/* Inner pulsing circle */}
        <div className="absolute inset-0 m-3 animate-pulse rounded-full bg-primary/20 dark:bg-primary/30"></div>
      </div>
      
      <div className="mt-6 flex flex-col items-center">
        <p className="font-mono text-sm tracking-wider text-gray-600 dark:text-gray-300">
          Loading
        </p>
        <div className="mt-2 flex space-x-1">
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-75"></div>
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-150"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;