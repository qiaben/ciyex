"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";
import { usePathname } from "next/navigation";

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    const { isExpanded, isHovered, isMobileOpen } = useSidebar();
    const pathname = usePathname();

    // ✅ compute title directly (no useEffect, no flicker)
    const mapping: Record<string, string> = {
        "/dashboard": "Dashboard",
        "/patients": "Patients",
        "/calendar": "Calendar",
        "/profile": "User Profile",
        "/settings/providers": "Providers",
        "/settings":"Providers",
        // "/settings/providers/edit": "Provider",
    };
    const pageTitle = Object.entries(mapping).find(([key]) => pathname.startsWith(key))?.[1] || "";

    const mainContentMargin = isMobileOpen
        ? "ml-0"
        : isExpanded || isHovered
            ? "lg:ml-[290px]"
            : "lg:ml-[90px]";

    return (
        <div className="min-h-screen xl:flex">
            <AppSidebar />
            <Backdrop />

            <div
                className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
            >
                {/* ✅ Pass pageTitle down */}
                <AppHeader pageTitle={pageTitle} />

                <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
