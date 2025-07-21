"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

// Types
interface Org {
    orgId: number;
    orgName: string;
    facilities: {
        facilityId: number;
        facilityName: string;
        roles: string[];
    }[];
}

interface TokenData {
    orgs: Org[];
    email: string;
    fullName: string;
    // ...other fields as needed
}

export default function SwitchContext() {
    const [orgs, setOrgs] = useState<Org[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<string>("");
    const [selectedFacility, setSelectedFacility] = useState<string>("");
    const [selectedRole, setSelectedRole] = useState<string>("");
    const [error, setError] = useState<string>("");
    const router = useRouter();

    // Decode orgs/facilities/roles from JWT on mount
    useEffect(() => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Not authenticated");
                router.replace("/sign-in");
                return;
            }
            const decoded = jwtDecode<TokenData>(token);
            setOrgs(decoded.orgs || []);
        } catch (e) {
            setError("Session expired, please sign in again.");
            router.replace("/sign-in");
        }
    }, [router]);

    // When org changes, clear facility/role
    useEffect(() => {
        setSelectedFacility("");
        setSelectedRole("");
    }, [selectedOrg]);

    // When facility changes, clear role
    useEffect(() => {
        setSelectedRole("");
    }, [selectedFacility]);

    const handleSwitch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrg || !selectedFacility || !selectedRole) {
            setError("Please select all options.");
            return;
        }
        localStorage.setItem("orgId", selectedOrg);
        localStorage.setItem("facilityId", selectedFacility);
        localStorage.setItem("role", selectedRole);
        router.replace("/dashboard");
    };

    return (
        <div className="bg-gradient-to-tr from-blue-100 via-blue-200 to-blue-400 min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-xl">
                <h2 className="text-3xl font-extrabold text-center mb-2 text-blue-700 tracking-tight">
                    Switch Practice/Facility/Role
                </h2>
                <p className="text-center text-gray-500 mb-4 text-base">
                    Choose where you want to work
                </p>
                {error && (
                    <div className="p-2 text-red-600 border border-red-300 bg-red-50 rounded mb-2 text-center">
                        {error}
                    </div>
                )}
                <form className="space-y-4" onSubmit={handleSwitch}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Organization/Practice</label>
                        <select
                            value={selectedOrg}
                            onChange={e => setSelectedOrg(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        >
                            <option value="">-- Select Organization --</option>
                            {orgs.map(org => (
                                <option value={org.orgId} key={org.orgId}>
                                    {org.orgName}
                                </option>
                            ))}
                        </select>
                    </div>
                    {selectedOrg && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Facility/Location</label>
                            <select
                                value={selectedFacility}
                                onChange={e => setSelectedFacility(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            >
                                <option value="">-- Select Facility --</option>
                                {orgs.find(o => o.orgId === parseInt(selectedOrg))?.facilities.map(fac => (
                                    <option value={fac.facilityId} key={fac.facilityId}>
                                        {fac.facilityName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {selectedOrg && selectedFacility && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select
                                value={selectedRole}
                                onChange={e => setSelectedRole(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            >
                                <option value="">-- Select Role --</option>
                                {orgs
                                    .find(o => o.orgId === parseInt(selectedOrg))
                                    ?.facilities.find(f => f.facilityId === parseInt(selectedFacility))
                                    ?.roles.map(role => (
                                        <option value={role} key={role}>
                                            {role}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                    >
                        Switch
                    </button>
                </form>
            </div>
        </div>
    );
}
