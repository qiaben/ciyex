// components/dashboard/TopBar.tsx
import React from "react";
import { Bell, UserCircle } from "lucide-react";

export default function TopBar() {
    return (
        <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-6 shadow-sm">
            <div className="font-bold text-xl tracking-wide">Ciyex Dashboard</div>
            <div className="flex items-center gap-4">
                <button className="hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full p-2">
                    <Bell className="w-5 h-5" />
                </button>
                <button className="hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full p-2">
                    <UserCircle className="w-7 h-7" />
                </button>
            </div>
        </header>
    );
}
