"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import {fetchWithAuth} from "@/utils/fetchWithAuth";

interface Org {
    orgId: number;
    orgName: string;
    roles: string[];
    facilities: {
        facilityId: number;
        facilityName: string;
        roles: string[];
    }[];
}

interface LoginResponse {
    success: boolean;
    message: string;
    data?: {
        firstName: string;
        LastName: string;
        phone: string;
        dateOfBirth: number[];
        email: string;
        token: string;
        orgIds: number[];
        orgs: Org[];
        userId: number;
        city?: string;
        state?: string;
        country?: string;
        street?: string;
        street2?: string;
        postalCode?: string;
        securityQuestion?: string;
        securityAnswer?: string;
    };
}

export default function SignInForm() {
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const orgId = localStorage.getItem("orgId");
        const facilityId = localStorage.getItem("facilityId");
        const role = localStorage.getItem("role");
        if (token && orgId && facilityId && role) {
            try {
                const decoded: { exp: number } = jwtDecode(token);
                if (decoded.exp * 1000 > Date.now()) {
                    router.push("/");
                }
            } catch {
                // Invalid token
            }
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetchWithAuth(`${apiUrl}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",   // 👈 Force Spring to return JSON
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("❌ Login failed:", res.status, errorText);
                throw new Error(`Login failed with status ${res.status}`);
            }

            const data: LoginResponse = await res.json(); // safely JSON now ✅

            if (data.success && data.data) {
                const {
                    token,
                    email,
                    firstName,
                    LastName,
                    phone,
                    dateOfBirth,
                    orgs,
                    orgIds,
                } = data.data;

                const fullName = `${firstName} ${LastName}`.trim();
                const org = orgs[0];
                const role = org.roles?.[0] || "UNKNOWN";

                localStorage.setItem("orgIds", JSON.stringify(orgIds));
                localStorage.setItem("token", token);
                localStorage.setItem("userEmail", email);
                localStorage.setItem("userFullName", fullName);
                localStorage.setItem("orgId", org.orgId.toString());
                localStorage.setItem("role", role);

                if (org.facilities?.length > 0) {
                    localStorage.setItem("facilityId", org.facilities[0].facilityId.toString());
                }

                localStorage.setItem("user", JSON.stringify({
                    firstName,
                    lastName: LastName,
                    email,
                    phone,
                    fullName,
                    profileImage: "/images/user/owner.jpg",
                    dateOfBirth,
                    orgName: org.orgName,
                    role,
                    city: data.data.city,
                    state: data.data.state,
                    country: data.data.country,
                    street: data.data.street,
                    street2: data.data.street2,
                    postalCode: data.data.postalCode,
                    securityQuestion: data.data.securityQuestion,
                    securityAnswer: data.data.securityAnswer,
                }));

                if (orgIds.length > 1) {
                    router.push("/practice-switch");
                } else {
                    router.push("/dashboard");
                }
            } else {
                setError(data.message || "Invalid credentials");
            }
        } catch (err) {
            console.error("🚨 Login error caught:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex flex-col flex-1 lg:w-1/2 w-full">
            <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon />
                    Back to dashboard
                </Link>
            </div>

            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div className="mb-5 sm:mb-8">
                    <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                        Sign In
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enter your email and password to sign in!
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
                    <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                        Sign in with Google
                    </button>
                    <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                        Sign in with X
                    </button>
                </div>

                <div className="relative py-3 sm:py-5">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-800" />
                    </div>
                    <div className="relative flex justify-center text-sm">
            <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
              Or
            </span>
                    </div>
                </div>

                {error && (
                    <div className="mb-3 text-sm text-center text-red-600 border border-red-200 bg-red-50 py-2 px-4 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div>
                            <Label>
                                Email <span className="text-error-500">*</span>
                            </Label>
                            <Input
                                placeholder="info@gmail.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>
                                Password <span className="text-error-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                >
                  {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Checkbox checked={isChecked} onChange={setIsChecked} />
                                <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                  Keep me logged in
                </span>
                            </div>
                            <Link
                                href="/reset-password"
                                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div>
                            <Button className="w-full" size="sm" type="submit" disabled={loading}>
                                {loading ? "Signing in..." : "Sign in"}
                            </Button>
                        </div>
                    </div>
                </form>

                <div className="mt-5">
                    <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/signup"
                            className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                        >
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
