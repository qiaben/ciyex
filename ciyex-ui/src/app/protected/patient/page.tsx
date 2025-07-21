"use client";

import React, { useEffect, useState } from "react";

interface Patient {
    id: number;
    fullName: string;
    dob: string;
    email: string;
    phone: string;
}

export default function PatientListPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch patient data from your API
    useEffect(() => {
        async function fetchPatients() {
            setLoading(true);
            try {
                const res = await fetch("/api/patients"); // Replace with your API endpoint
                if (!res.ok) throw new Error("Failed to fetch patients");
                const data: Patient[] = await res.json();
                setPatients(data);
            } catch (err: any) {
                setError(err.message || "Unknown error");
            } finally {
                setLoading(false);
            }
        }
        fetchPatients();
    }, []);

    // Filter patients by search term
    const filteredPatients = patients.filter((p) =>
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Patient List</h1>

            <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4 w-full max-w-md px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {loading && <p>Loading patients...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {!loading && !error && (
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Date of Birth
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Phone
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredPatients.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                    No patients found.
                                </td>
                            </tr>
                        )}
                        {filteredPatients.map((patient) => (
                            <tr key={patient.id} className="hover:bg-gray-100 cursor-pointer">
                                <td className="px-6 py-4 whitespace-nowrap">{patient.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{patient.dob}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{patient.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{patient.phone}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
