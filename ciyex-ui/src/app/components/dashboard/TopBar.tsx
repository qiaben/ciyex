// components/dashboard/TopBar.tsx
"use client";
import React, { useState } from "react";
import { Bell, UserCircle, LogOut, Repeat } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TopBar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem("token");
        // Optionally, also remove other session info here if needed
        router.replace("/sign-in");
    };

    // For closing dropdown when clicking outside
    React.useEffect(() => {
        const close = () => setMenuOpen(false);
        if (menuOpen) document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, [menuOpen]);

    return (
        <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-6 shadow-sm relative">
            <div className="font-bold text-xl tracking-wide">Ciyex Dashboard</div>
            <div className="flex items-center gap-4">
                <button className="hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full p-2">
                    <Bell className="w-5 h-5" />
                </button>
                <div className="relative">
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            setMenuOpen(v => !v);
                        }}
                        className="hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full p-2"
                    >
                        <UserCircle className="w-7 h-7" />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow z-20 py-2">
                            <Link
                                href="/switch-context"
                                className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 w-full"
                                onClick={() => setMenuOpen(false)}
                            >
                                <Repeat className="w-4 h-4" />
                                Switch Org
                            </Link>
                            <button
                                className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 w-full text-left"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
