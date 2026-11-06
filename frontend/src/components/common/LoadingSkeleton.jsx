import React from 'react';

export default function LoadingSkeleton({ className = '', height = 'h-4', width = 'w-full', rounded = 'rounded-md' }) {
  return (
    <div 
      className={`bg-slate-200 dark:bg-slate-700 animate-pulse ${height} ${width} ${rounded} ${className}`} 
      aria-hidden="true" 
    />
  );
}
