"use client";

import React, { useState } from "react";
import { Home, Users, User, ClipboardList, Settings } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const menu = [
    { label: "Dashboard", icon: <Home />, href: "/doctor" },
    { label: "Users", icon: <Users />, href: "/doctor/users", roles: ["SUPER_ADMIN", "ADMIN"] },
    { label: "Patients", icon: <User />, href: "/doctor/patients", roles: ["DOCTOR", "NURSE", "RECEPTIONIST"] },
    { label: "Appointments", icon: <ClipboardList />, href: "/doctor/appointments" },
    { label: "Settings", icon: <Settings />, href: "/doctor/settings" }
];

export default function SidebarMenu() {
    const [open, setOpen] = useState(true);

    return (
        <motion.aside
            animate={{ width: open ? 220 : 56 }}
            className="bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 shadow-lg min-h-screen transition-all duration-200"
        >
            <button
                className="w-full flex justify-end p-2"
                onClick={() => setOpen((o) => !o)}
            >
                <span className="text-xs">{open ? "<" : ">"}</span>
            </button>

            <nav>
                {menu.map((item) => (
                    <Link
                        href={item.href}
                        key={item.label}
                        className="flex items-center p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <span className="mr-3">{item.icon}</span>
                        {open && <span>{item.label}</span>}
                    </Link>
                ))}
            </nav>
        </motion.aside>
    );
}
