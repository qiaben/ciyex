import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <Loader2 className="animate-spin text-emerald-600 w-12 h-12 mb-4" />
      <span className="text-lg text-gray-700 font-semibold">Loading patient info...</span>
    </div>
  );
} 