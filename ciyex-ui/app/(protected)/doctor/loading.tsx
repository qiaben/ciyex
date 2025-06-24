import { PulseLoader } from 'react-spinners';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-transparent">
      <div className="text-center">
        <PulseLoader color="#10b981" size={16} className="mx-auto mb-4" />
        <p className="text-lg">Loading...</p>
      </div>
    </div>
  );
} 