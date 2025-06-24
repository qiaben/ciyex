"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams?.get('role');
  const { user, isLoaded } = useUser();

  // Loading and error state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      // If user is signed up, redirect based on role
      if (role === 'doctor') {
        router.push('/doctor-registration');
      } else if (role === 'patient') {
        router.push('/patient/registration');
      }
    }
  }, [user, isLoaded, router, role]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md">
        <SignUp 
          redirectUrl={role === 'doctor' ? '/doctor-registration' : '/patient/registration'}
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm",
              headerTitle: "text-2xl font-bold text-gray-900 dark:text-gray-100",
              headerSubtitle: "text-gray-600 dark:text-gray-400",
              formButtonPrimary: "bg-[#10b981] hover:bg-[#0e9e6e]",
              footerActionLink: "text-[#10b981] hover:text-[#0e9e6e]",
              formFieldInput: "border-gray-300 dark:border-gray-600 focus:border-emerald-500 focus:ring-emerald-500",
            }
          }}
        />
      </div>
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">Setting up your account...</div>
          </div>
        </div>
      )}
      {/* Error Overlay */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <div className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">Sign Up Error</div>
            <div className="text-gray-700 dark:text-gray-200 mb-4">{error}</div>
            <button
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-600"
              onClick={() => setError(null)}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 