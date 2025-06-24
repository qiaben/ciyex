"use client";

import React from "react";
import Link from "next/link";
import CartDropdown from "@/components/elab/CartDropdown";
import { CartProvider } from "@/components/context/CartContext";
import UserProfile from '@/components/elab/UserProfile';
import { Award } from "lucide-react";
import { ThemeToggle } from '@/components/ThemeToggle';
import NotificationBell from '@/components/elab/NotificationBell';

export const ElabNavbar = () => (
  <CartProvider>
    <div className="h-16 px-6 flex items-center justify-between bg-background text-foreground border-b border-border">
      <div className="flex items-center gap-6">
        <Link href="" className="text-xl md:text-2xl font-bold text-elab-medical-blue">
          <div className="flex items-center">
            Direct Consumer Lab
          </div>
        </Link>
      </div>
      <div className="hidden md:flex items-center space-x-3">
              
              {/* <div className="flex items-center border-l border-gray-300 pl-3"> */}
                <Award size={16} className="text-elab-medical-blue mr-1" />
                <span className="text-sm font-medium">Certified Labs</span>
              {/* </div> */}
              
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <NotificationBell />
                <UserProfile />
              </div>
            </div>
      </div>
  </CartProvider>
); 