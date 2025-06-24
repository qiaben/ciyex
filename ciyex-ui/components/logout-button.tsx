"use client";

import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import React from "react";

export const LogoutButton = () => {
  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart');
    }
  };
  return (
    <SignOutButton>
      <button
        className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-emerald-50/50 hover:text-emerald-600 transition-all duration-300 group/link border border-transparent hover:border-emerald-100 hover:shadow-sm"
        onClick={handleSignOut}
      >
        <div className="group-hover/link:scale-110 transition-transform duration-300">
          <LogOut className="size-5 text-emerald-600" />
        </div>
        <span className="hidden lg:block text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Logout
        </span>
      </button>
    </SignOutButton>
  );
};