"use client";
import React, { useState, useEffect } from "react";
import { ClipboardList, Info } from "lucide-react";
import Navbar from '@/components/navbar/Navbar';
import FooterSection from '@/components/sections/FooterSection';
import { usePathname } from 'next/navigation';
import { trackFormSubmission } from '@/utils/analytics';

const cognitoFormUrl = process.env.NEXT_PUBLIC_COGNITO_FORM_URL;

const QuickRegistrationPage = () => {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Listen for messages from the Cognito Form iframe
    const handleMessage = (event: MessageEvent) => {
      // Verify the message is from Cognito Forms
      if (event.origin.includes('cognitoforms.com')) {
        try {
          // Check if the data is already an object
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          
          // Log the data for debugging
          console.log('Form message received:', data);
          
          // Check if it's a form submission event
          if (data.type === 'cognito-form-submit' || data.event === 'form-submit') {
            trackFormSubmission('quick_registration', true);
          }
        } catch (error) {
          console.error('Error processing form message:', error);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <>
      <style jsx global>{`
        .cog-loader {
          display: none !important;
          background: none !important;
          animation: none !important;
        }
      `}</style>
      <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
        <Navbar hideBookInstantly={pathname === '/quick-registration'} />
        <div className="w-full flex flex-col items-center pt-24 md:pt-32 pb-10 md:pb-16 px-2 sm:px-4">
          <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 md:px-8 flex flex-col items-center gap-2 mb-6 md:mb-8">
            <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-emerald-200 tracking-tight mb-1 text-center">
              <ClipboardList className="h-7 w-7 md:h-8 md:w-8 text-emerald-600" />
              Quick Registration
            </h1>
            <div className="w-full mt-6 mb-4">
              <div className="relative flex flex-col sm:flex-row items-start gap-2 sm:gap-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-l-2 border-emerald-500 dark:border-emerald-400 rounded-xl p-3 sm:p-6 shadow-xl">
                <div className="flex-shrink-0 pt-1 pl-1">
                  <Info className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-serif font-bold text-gray-900 dark:text-emerald-100 mb-1 tracking-tight">
                    Request a Provider Review
                    <span className="ml-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 align-middle bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                      No Live Appointment Needed
                    </span>
                  </h2>
                  <p className="text-gray-700 dark:text-gray-200 text-xs sm:text-sm md:text-base leading-relaxed">
                    Complete this secure form to request a review from one of our <span className="font-semibold text-emerald-700 dark:text-emerald-300">licensed medical providers</span>. No video visit is required.
                    A provider will review your request and respond <span className="font-semibold text-emerald-700 dark:text-emerald-300">within 3 hours</span> or sooner during normal business hours.
                    <br />
                    <span className="block mt-1">You may receive a message, phone call, or email if additional information is needed or if the provider wishes to share important care instructions.</span>
                    <span className="block mt-2 font-semibold text-emerald-700 dark:text-emerald-300">Self-pay fee: $29, payable at the time of form completion.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex-1" style={{ minHeight: '60vh' }}>
            <div className="w-full h-[70vh] md:h-[80vh] bg-white overflow-hidden relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                  <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                </div>
              )}
              <iframe
                src={cognitoFormUrl}
                allow="payment"
                style={{ border: 0, width: '100%', height: '100%', background: 'white' }}
                title="Quick Registration Form"
                className="w-full h-full min-h-[400px] hide-scrollbar"
                onLoad={() => setTimeout(() => setLoading(false), 1000)}
              />
            </div>
          </div>
        </div>
        <FooterSection />
      </div>
    </>
  );
};

export default QuickRegistrationPage; 