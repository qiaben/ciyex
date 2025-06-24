import { Sidebar } from '@/components/sidebar';
import { ElabNavbar } from '@/components/elab/ElabNavbar';
import CartDropdown from '@/components/elab/CartDropdown';
import React from 'react';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ml-14 lg:ml-[5rem] xl:ml-[6rem] transition-all duration-300 flex flex-col min-w-0 min-h-screen">
      <ElabNavbar />
      <div className="fixed top-0 left-0 h-screen w-14 lg:w-[5rem] xl:w-[6rem] hover:w-[14%] md:hover:w-[8%] lg:hover:w-[16%] xl:hover:w-[14%] z-20 transition-all duration-300 ease-in-out flex flex-col justify-between border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Sidebar />
      </div>
      <div className="ml-14 lg:ml-[5rem] xl:ml-[6rem] flex flex-col min-h-screen">
        <div className="flex-1 px-4 py-8 overflow-x-auto relative">
          {/* Glassmorphic Cart */}
          <div className="absolute right-8 top-4 z-50">
            <div className="backdrop-blur-md bg-white/70 dark:bg-neutral-900/70 border border-blue-200 dark:border-neutral-700 rounded-xl shadow-lg flex items-center p-2 transition-all">
              <CartDropdown />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
} 