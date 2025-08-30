"use client";

import React from "react";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isExpanded, isHovered, isMobileOpen } = useSidebar();
    const pathname = usePathname() || ""; // ✅ fallback if undefined

    // Route → Title mapping
    const mapping: Record<string, string> = {
        "/dashboard": "Dashboard",
        "/patients": "Patients",
        "/calendar": "Calendar",
        "/profile": "User Profile",
        "/settings/providers": "Providers",
        "/settings/forms/lists": "Forms",
        "/settings/forms/admin": "Form Admin",
        "/settings/insurance": "Insurance Companies", // ✅ added
        "/settings": "Settings",
        "/appointments": "Appointments",
    };

    const pageTitle =
        Object.entries(mapping)
            .filter(([key]) => pathname.startsWith(key))
            .sort((a, b) => b[0].length - a[0].length)[0]?.[1] || "";


    const mainContentMargin = isMobileOpen
        ? "ml-0"
        : isExpanded || isHovered
            ? "lg:ml-[290px]"
            : "lg:ml-[90px]";

    return (
        // Base layer now theme-aware + unified typography
        <div className="min-h-screen xl:flex font-sans text-[15px] leading-6 antialiased transition-colors duration-300 bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
            <AppSidebar />
            <Backdrop />

            <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
                <AppHeader pageTitle={pageTitle} />

                {/* Content area picks up theme automatically; children can use their own cards*/}
                <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
                    {/* ✅ Force remount of child on route change */}
                    <div key={pathname} className="transition-colors duration-300">{children}</div>
                </div>
            </div>
        </div>
    );
}
