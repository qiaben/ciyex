"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    const roleRaw = user.publicMetadata?.role;
    const role = typeof roleRaw === 'string' ? roleRaw.toLowerCase() : undefined;
    if (role === "doctor") {
      router.replace("/doctor");
    } else if (role === "patient") {
      router.replace("/patient");
    } else if (role === "admin") {
      router.replace("/admin");
    }
  }, [user, isLoaded, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-700">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
} 