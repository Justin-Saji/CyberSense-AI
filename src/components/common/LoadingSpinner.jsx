import React from 'react';
import { Shield } from 'lucide-react';

export const LoadingSpinner = ({ fullScreen = false, message = 'Loading CyberSense AI...' }) => {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-sky-400/20 border-t-sky-400 animate-spin"></div>
        <Shield className="w-7 h-7 text-blue-500 absolute animate-pulse" />
      </div>
      {message && <p className="text-sm font-semibold tracking-wider text-slate-300 uppercase">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0F172A]/90 backdrop-blur-md flex items-center justify-center">
        {spinnerContent}
      </div>
    );
  }

  return <div className="py-12 flex justify-center">{spinnerContent}</div>;
};
