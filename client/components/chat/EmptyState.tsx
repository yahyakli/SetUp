"use client";

import React from 'react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <div className="max-w-md">
        <h3 className="text-xl font-bold mb-2 dark:text-white">Select a conversation</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Choose a conversation from the list or start a new one to begin messaging
        </p>
      </div>
    </div>
  );
} 