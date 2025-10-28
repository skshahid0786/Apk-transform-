import React from 'react';

interface LoaderProps {
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message = "Analyzing Pixels..." }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs text-cyan-400">{message}</p>
    </div>
  );
};