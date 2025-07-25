"use client";

import React from "react";
import SidebarMenu from "./SidebarMenu";
import TopBar from "./TopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-blue-50 dark:bg-blue-100">
            {/* Sidebar */}
            <SidebarMenu />

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                <TopBar />
                <main className="flex-1 p-4">{children}</main>
            </div>
        </div>
    );
}
