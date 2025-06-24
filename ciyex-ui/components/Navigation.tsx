"use client";

import { Activity, Calendar, FileText, History, CreditCard, Stethoscope, Menu, X, BarChart, ClipboardList, Star } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ReviewForm } from "./dialogs/review-form";

interface NavigationProps {
  userId: string | null;
  isPatient: boolean;
  isAdmin: boolean;
  isAppointmentCompleted: boolean;
  appointmentId: string;
  doctorId: string | undefined;
}

export const Navigation = ({ userId, isPatient, isAdmin, isAppointmentCompleted, appointmentId, doctorId }: NavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchParams = useSearchParams() || new URLSearchParams();
  const router = useRouter();
  const activeTab = (searchParams && searchParams.get('cat')) || 'charts';

  const navItems = [
    { id: "charts", label: "Charts", icon: BarChart },
    { id: "appointments", label: "Appointments", icon: ClipboardList },
    { id: "diagnosis", label: "Diagnosis", icon: Stethoscope },
    { id: "medical-history", label: "Medical History", icon: History },
    { id: "billing", label: "Billing & Payments", icon: CreditCard },
  ];

  const handleTabClick = (tabId: string) => {
    const params = new URLSearchParams((searchParams && searchParams.toString()) || '');
    params.set('cat', tabId);
    router.push(`?${params.toString()}`);
    setMobileMenuOpen(false);
  };

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="px-3 sm:px-4 lg:px-6 xl:px-8 py-4 lg:py-6 max-w-[1920px] mx-auto">
        {/* Header with title and mobile controls */}
         
          
          <div className="flex items-center gap-3">
        
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-300 border border-slate-200 dark:border-slate-700"
            >
              {mobileMenuOpen ? (
                <X size={20} className="text-slate-600 dark:text-slate-300" />
              ) : (
                <Menu size={20} className="text-slate-600 dark:text-slate-300" />
              )}
            </button>
          </div>
        
        {/* Navigation - responsive design */}
        <nav className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } lg:block`}>
          <div className="flex flex-col lg:flex-row gap-2 lg:gap-3 items-start lg:items-center justify-between">
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleTabClick(item.id);
                    }}
                    className={`
                      flex items-center gap-3 px-4 sm:px-5 lg:px-6 py-3 lg:py-2.5 rounded-xl font-medium transition-all duration-300 group w-full lg:w-auto
                      ${isActive 
                        ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-lg shadow-slate-800/20 dark:shadow-slate-200/20 scale-[1.02]' 
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300/50 dark:hover:border-600/50 hover:shadow-md'
                      }
                    `}
                  >
                    <Icon size={18} className={`transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`} />
                    <span className="text-sm lg:text-base font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
            {userId && isPatient && isAppointmentCompleted && (
              <ReviewForm staffId={doctorId || ""} appointmentId={appointmentId} />
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};
