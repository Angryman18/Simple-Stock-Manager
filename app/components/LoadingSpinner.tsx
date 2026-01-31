"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  isLoading: boolean;
}

export function LoadingSpinner({ isLoading }: LoadingSpinnerProps) {
  if (!isLoading) return null;

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center'>
      {/* Blur background */}
      <div className='absolute inset-0 bg-black/20 backdrop-blur-sm' />

      {/* Spinner */}
      <div className='relative z-10 flex flex-col items-center gap-4'>
        <div className='rounded-full bg-white p-6 shadow-lg'>
          <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
        </div>
        <p className='text-sm font-medium text-gray-700 bg-white px-4 py-2 rounded-lg shadow-lg'>
          Loading...
        </p>
      </div>
    </div>
  );
}
