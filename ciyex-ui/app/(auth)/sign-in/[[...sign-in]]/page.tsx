"use client";
import { SignIn } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
    
export default function SignInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams?.get('role');
  const { user, isLoaded } = useUser();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role) {
      setRedirecting(true);
      const userRole = user.publicMetadata.role as string;
      setTimeout(() => {
        router.push(`/${userRole}`);
      }, 800); // short delay for UX
    }
  }, [user, isLoaded, router]);

  // Determine sign up redirect URL based on role
  const getSignUpUrl = () => {
    if (role === 'doctor') return '/sign-up?redirect_url=/doctor-registration&role=doctor';
    return '/sign-up?redirect_url=/patient/registration&role=patient';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <SignIn 
        fallbackRedirectUrl="/"
        appearance={{
          elements: {
            formButtonPrimary: 'bg-[#10b981] hover:bg-[#059669]',
            footerActionLink: 'text-[#10b981] hover:text-[#059669] cursor-pointer',
          },
        }}
        afterSignInUrl={`/${role || ''}`}
        signUpUrl={getSignUpUrl()}
      />
      {redirecting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">Redirecting to your dashboard...</div>
        </div>
      )}
    </div>
  );
} 