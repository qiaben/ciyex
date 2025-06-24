import { MaybeNavbar } from "@/components/MaybeNavbar";
import { Sidebar } from "@/components/sidebar";
import React from "react";
import { redirect } from "next/navigation";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full min-h-screen bg-background relative">
      {/* Theme-aware background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.02)_50%,transparent_75%)] dark:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer pointer-events-none"></div>

      <div className="fixed top-0 left-0 h-screen w-14 lg:w-[5rem] xl:w-[6rem] hover:w-[14%] md:hover:w-[8%] lg:hover:w-[16%] xl:hover:w-[14%] z-50 transition-all duration-300 ease-in-out flex flex-col justify-between border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* z-50 ensures sidebar is always above navbar */}
        <Sidebar />
      </div>

      <div className="ml-14 lg:ml-[5rem] xl:ml-[6rem] transition-all duration-300 flex flex-col min-w-0 min-h-screen">
        {/* Lower z-index for navbar will be set in its component if needed */}
        <MaybeNavbar />
        <div className="flex-1 w-full min-w-0 bg-background">{children}</div>
      </div>
    </div>
  );
};

export default ProtectedLayout;