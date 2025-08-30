import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
            <ThemeProvider>
                <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col sm:p-0">
                    {/* Left side - Auth form */}
                    {children}

                    {/* Right side - Dark Green background (always) */}
                    <div className="lg:w-1/2 w-full h-full lg:flex items-center justify-center hidden bg-[#064e3b]">
                        <div className="flex flex-col items-center max-w-xs text-center">
                            {/* Background grid shape (optional) */}
                            <GridShape />

                            {/* Inline SVG Logo */}
                            <Link href="/" className="block mb-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="360"
                                    height="90"
                                    viewBox="0 0 1024 417"
                                    className="fill-current text-white"
                                >
                                    <text
                                        x="0"
                                        y="280"
                                        fontSize="280"
                                        fontWeight="bold"
                                    >
                                        Ciyex
                                    </text>
                                </svg>
                            </Link>

                            {/* EHR tagline */}
                            <p className="mt-1 text-sm sm:text-base text-gray-100">
                                Secure Electronic Health Record (EHR) Management for Providers
                            </p>
                        </div>
                    </div>

                    {/* Theme Toggler */}
                    <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
                        <ThemeTogglerTwo />
                    </div>
                </div>
            </ThemeProvider>
        </div>
    );
}
