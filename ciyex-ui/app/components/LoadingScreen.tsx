'use client';

import { PulseLoader } from 'react-spinners';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
        <PulseLoader color="#10b981" size={16} className="mx-auto mb-4" />
        <p className="text-lg">Loading...</p>
        </div>
    </div>
  );
} 