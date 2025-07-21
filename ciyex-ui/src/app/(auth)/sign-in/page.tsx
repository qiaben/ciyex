"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

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

export default function SignInPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get role from URL param, if provided
    const initialRole = searchParams.get("role") || "";

    // Step 1: login form
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // Step 2: selection
    const [loginResponse, setLoginResponse] = useState<LoginResponse | null>(null);
    const [selectedOrg, setSelectedOrg] = useState<string>("");
    const [selectedFacility, setSelectedFacility] = useState<string>("");
    const [selectedRole, setSelectedRole] = useState(initialRole);
    // UI states
    const [error, setError] = useState<string>("");
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);

    // Use NEXT_PUBLIC_API_URL from environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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
                setLoginResponse(data);
                setStep(2); // Show org/facility/role picker
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
    const handleSelect = () => {
        if (!selectedOrg || !selectedFacility || !selectedRole) {
            setError("Please select all options.");
            return;
        }
        // Save data to localStorage
        localStorage.setItem("token", loginResponse?.data?.token || "");
        localStorage.setItem("orgId", selectedOrg);
        localStorage.setItem("facilityId", selectedFacility);
        localStorage.setItem("role", selectedRole);
        localStorage.setItem("userEmail", loginResponse?.data?.email || "");
        localStorage.setItem("userFullName", loginResponse?.data?.fullName || "");
        // Redirect to dashboard or wherever appropriate
        router.replace("/dashboard");
    };

    // When org changes, clear facility/role
    React.useEffect(() => {
        setSelectedFacility("");
        setSelectedRole(initialRole);
        // eslint-disable-next-line
    }, [selectedOrg]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-xl shadow">
                <h2 className="text-2xl font-bold text-center">Sign In</h2>

                {error && (
                    <div className="p-2 text-red-600 border border-red-300 bg-red-50 rounded mb-2 text-center">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium">
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
                                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium">
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
                                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            <label className="block text-sm font-medium">
                                Select Practice/Organization
                            </label>
                            <select
                                value={selectedOrg}
                                onChange={e => setSelectedOrg(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border rounded-lg"
                                required
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
                                    <label className="block text-sm font-medium">
                                        Select Location/Facility
                                    </label>
                                    <select
                                        value={selectedFacility}
                                        onChange={e => setSelectedFacility(e.target.value)}
                                        className="mt-1 w-full px-3 py-2 border rounded-lg"
                                        required
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
                                    <label className="block text-sm font-medium">
                                        Select Role
                                    </label>
                                    <select
                                        value={selectedRole}
                                        onChange={e => setSelectedRole(e.target.value)}
                                        className="mt-1 w-full px-3 py-2 border rounded-lg"
                                        required
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
                        >
                            Continue
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
