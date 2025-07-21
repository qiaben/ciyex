"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface Org {
    orgId: number;
    orgName: string;
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
        orgIds: number[];
        orgs: Org[];
        facilityIds: number[];
        userId: number;
        email: string;
        fullName: string;
        token: string;
    };
}

export default function SignInForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const initialRole = searchParams.get("role") || "";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginResponse, setLoginResponse] = useState<LoginResponse | null>(null);
    const [selectedOrg, setSelectedOrg] = useState<string>("");
    const [selectedFacility, setSelectedFacility] = useState<string>("");
    const [selectedRole, setSelectedRole] = useState(initialRole);
    const [error, setError] = useState<string>("");
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [selecting, setSelecting] = useState(false);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Auto-redirect if already logged in and context is present
    useEffect(() => {
        const token = localStorage.getItem("token");
        const orgId = localStorage.getItem("orgId");
        const facilityId = localStorage.getItem("facilityId");
        const role = localStorage.getItem("role");
        if (token && orgId && facilityId && role) {
            try {
                const decoded: { exp: number } = jwtDecode(token);
                if (decoded.exp * 1000 > Date.now()) {
                    router.replace("/dashboard");
                }
            } catch {
                // invalid token, show login
            }
        }
    }, [router]);

    // Step 1: Submit login
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data: LoginResponse = await res.json();
            if (data.success && data.data) {
                // Always update JWT and user info
                localStorage.setItem("token", data.data.token);
                localStorage.setItem("userEmail", data.data.email || "");
                localStorage.setItem("userFullName", data.data.fullName || "");

                // Check if context is already present
                const orgId = localStorage.getItem("orgId");
                const facilityId = localStorage.getItem("facilityId");
                const role = localStorage.getItem("role");

                if (orgId && facilityId && role) {
                    router.replace("/dashboard");
                } else {
                    setLoginResponse(data);
                    setStep(2); // show selection step
                    setError("");
                }
            } else {
                setError(data.message || "Invalid credentials");
            }
        } catch (err: any) {
            setError("Server error");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: After selection, store data and redirect
    const handleSelect = async () => {
        if (!selectedOrg || !selectedFacility || !selectedRole) {
            setError("Please select all options.");
            return;
        }
        setSelecting(true);

        // Save context data to localStorage
        localStorage.setItem("orgId", selectedOrg);
        localStorage.setItem("facilityId", selectedFacility);
        localStorage.setItem("role", selectedRole);

        setTimeout(() => {
            router.replace("/dashboard");
        }, 100);
    };

    // When org changes, clear facility/role
    useEffect(() => {
        setSelectedFacility("");
        setSelectedRole(initialRole);
        // eslint-disable-next-line
    }, [selectedOrg]);

    return (
        <div className="bg-gradient-to-tr from-blue-100 via-blue-200 to-blue-400 min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-xl">
                <h2 className="text-3xl font-extrabold text-center text-blue-700 mb-2 tracking-tight">
                    Sign In
                </h2>

                {error && (
                    <div className="p-2 text-red-600 border border-red-300 bg-red-50 rounded mb-2 text-center">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                            disabled={loading}
                        >
                            {loading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>
                )}

                {step === 2 && loginResponse?.data && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Select Practice/Organization
                            </label>
                            <select
                                value={selectedOrg}
                                onChange={e => setSelectedOrg(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                                disabled={selecting}
                            >
                                <option value="">-- Select Organization --</option>
                                {loginResponse.data.orgs.map(org => (
                                    <option value={org.orgId} key={org.orgId}>
                                        {org.orgName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedOrg && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Select Location/Facility
                                    </label>
                                    <select
                                        value={selectedFacility}
                                        onChange={e => setSelectedFacility(e.target.value)}
                                        className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        required
                                        disabled={selecting}
                                    >
                                        <option value="">-- Select Facility --</option>
                                        {loginResponse.data.orgs
                                            .find(org => org.orgId === parseInt(selectedOrg))
                                            ?.facilities.map(fac => (
                                                <option value={fac.facilityId} key={fac.facilityId}>
                                                    {fac.facilityName}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Select Role
                                    </label>
                                    <select
                                        value={selectedRole}
                                        onChange={e => setSelectedRole(e.target.value)}
                                        className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        required
                                        disabled={selecting}
                                    >
                                        <option value="">-- Select Role --</option>
                                        {loginResponse.data.orgs
                                            .find(org => org.orgId === parseInt(selectedOrg))
                                            ?.facilities.find(fac => fac.facilityId === parseInt(selectedFacility))
                                            ?.roles.map(role => (
                                                <option value={role} key={role}>
                                                    {role}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </>
                        )}

                        <button
                            onClick={handleSelect}
                            className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                            disabled={selecting}
                        >
                            {selecting ? "Redirecting..." : "Continue"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
