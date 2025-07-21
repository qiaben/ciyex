// components/dashboard/DashboardLayout.tsx
import React from "react";
import SidebarMenu from "./SidebarMenu";
import TopBar from "./TopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-neutral-900">
            <SidebarMenu />
            <div className="flex-1 flex flex-col">
                <TopBar />
                <main className="flex-1 p-4">{children}</main>
            </div>
        </div>
    );
}
