"use client";
import React from "react";
import { PinContainer } from "@/components/ui/3d-pin";
import { FileText } from "lucide-react";

export default function AnimatedPinDemo() {
  return (
    <div className="h-[40rem] w-full flex items-center justify-center">
      <PinContainer
        title="Submit symptoms & get prescription online - $29 only"
        href="/quick-registration"
      >
        <div className="
          flex flex-col items-center justify-center
          p-7 sm:p-8 w-[20rem] h-[22rem]
          rounded-xl
          bg-white/90 dark:bg-zinc-900/90
          border border-emerald-100 dark:border-emerald-900
          shadow-md
          transition-colors
        ">
          <div className="mb-3 w-full text-center">
            <span className="text-xs font-medium tracking-wide text-emerald-600 dark:text-emerald-300 uppercase opacity-80">
              Tap here to book your prescription
            </span>
          </div>
          <div className="mb-2">
            <FileText className="h-7 w-7 text-emerald-500 dark:text-emerald-300 opacity-80" />
          </div>
          <h3 className="max-w-xs pb-1 m-0 font-semibold text-xl md:text-2xl text-center text-zinc-800 dark:text-zinc-100 tracking-tight">
            Submit symptoms & get prescription online
          </h3>
          <div className="text-3xl md:text-4xl font-bold text-center mt-3 mb-1 text-emerald-600 dark:text-emerald-300">
            $29 <span className="text-base font-medium align-top">only</span>
          </div>
          <div className="mt-1 text-center text-sm font-normal text-zinc-500 dark:text-zinc-300 italic">
            Fast, secure, and affordable online prescriptions
          </div>
          <div className="w-10 h-px bg-zinc-200 dark:bg-zinc-700 my-5" />
          <button
            type="button"
            className="px-6 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
          >
            Book Now
          </button>
        </div>
      </PinContainer>
    </div>
  );
} 