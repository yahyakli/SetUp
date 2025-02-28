import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent"></div>
        
        <div className="absolute inset-0 m-6 animate-pulse rounded-full bg-gray-300"></div>
      </div>
      
      <p className="mt-8 font-mono text-sm text-gray-400 tracking-wider">loading...</p>
    </div>
  );
};

export default Loader;