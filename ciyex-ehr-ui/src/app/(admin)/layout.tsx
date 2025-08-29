"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isExpanded, isHovered, isMobileOpen } = useSidebar();
    const pathname = usePathname() ?? ""; // ✅ declare only once with fallback

    // ✅ compute title directly
    const mapping: Record<string, string> = {
        "/dashboard": "Dashboard",
        "/patients": "Patients",
        "/calendar": "Calendar",
        "/profile": "User Profile",
        "/settings/providers": "Providers",
        "/settings/insurance": "Insurance Companies",

        "/settings": "Providers",
    };

    const pageTitle =
        Object.entries(mapping).find(([key]) => pathname.startsWith(key))?.[1] || "";

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
                {/* ✅ Page header */}
                <AppHeader pageTitle={pageTitle} />

                {/* ✅ Smaller gap below topbar */}
                <div className="px-2 md:px-2 pt-1">{children}</div>

            </div>
        </div>
    );
}
