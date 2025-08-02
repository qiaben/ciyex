"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Patient {
    id: string;
    fullName: string;
    homePhone: string;
    ssn: string;
    dob: string;
    externalId: string;
}

export default function PatientListPage() {
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 10;
    const [activeTab, setActiveTab] = useState("list");
    const [search, setSearch] = useState("");

    const fetchPatients = async (url: string) => {
        try {
            const res = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                    "X-Org-Id": localStorage.getItem("orgId") || "1",
                    "X-Facility-Id": localStorage.getItem("facilityId") || "1",
                    "X-Role": localStorage.getItem("role") || "provider",
                },
            });

            const json = await res.json();
            const data = json.patients || []; // <-- updated

            const parsed: Patient[] = data.map((p: any) => ({
                id: p.id,
                fullName: p.fullName,
                homePhone: p.homePhone || "",
                ssn: "", // since ssn is not returned, leave it blank or add support later
                dob: p.dob,
                externalId: p.externalId || "",
            }));

            setPatients(parsed);
            setTotal(json.total || parsed.length); // fallback works fine
        } catch (error) {
            console.error("Failed to fetch patients:", error);
        }
    };

    useEffect(() => {
        const endpoint =
            activeTab === "list"
                ? `http://localhost:8080/api/patient/list`
                : `http://localhost:8080/api/patient/recent`;

        fetchPatients(endpoint);
    }, [page, activeTab]);

    const filtered = patients.filter((p) => {
        const q = search.toLowerCase();
        return (
            p.fullName.toLowerCase().includes(q) ||
            p.homePhone.toLowerCase().includes(q) ||
            p.ssn.toLowerCase().includes(q) ||
            p.dob.toLowerCase().includes(q) ||
            p.externalId.toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="p-6 min-h-screen text-gray-800" style={{ backgroundColor: "#f9fcff" }}>
            <div className="flex justify-between items-center mb-5">
                <h1 className="text-3xl font-bold text-gray-800">Patient Finder</h1>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="border border-gray-400 px-3 py-1.5 rounded w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        onClick={() => router.push("/dashboard/patients/new")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
                    >
                        + Add New Patient
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex mb-4 border-b text-sm font-medium">
                <button
                    onClick={() => setActiveTab("list")}
                    className={`px-4 py-2 rounded-t-lg ${activeTab === "list" ? "bg-white text-black border border-b-0" : "bg-gray-100 text-gray-500"}`}
                >
                    Patient List
                </button>
                <button
                    onClick={() => setActiveTab("recent")}
                    className={`px-4 py-2 rounded-t-lg ml-2 ${activeTab === "recent" ? "bg-white text-black border border-b-0" : "bg-gray-100 text-gray-500"}`}
                >
                    Recent Patients
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded border border-gray-300 shadow-sm">
                <table className="min-w-full text-sm bg-white">
                    <thead className="bg-blue-50 text-gray-700">
                    <tr>
                        <th className="px-4 py-2 border-b">Full Name</th>
                        <th className="px-4 py-2 border-b">Home Phone</th>
                        <th className="px-4 py-2 border-b">SSN</th>
                        <th className="px-4 py-2 border-b">Date of Birth</th>
                        <th className="px-4 py-2 border-b">External ID</th>
                        <th className="px-4 py-2 border-b text-center">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.map((p) => (
                        <tr key={p.id} className="hover:bg-blue-50 transition duration-150">
                            <td className="px-4 py-2 text-blue-700 font-medium underline cursor-pointer">
                                {p.fullName}
                            </td>
                            <td className="px-4 py-2">{p.homePhone}</td>
                            <td className="px-4 py-2">{p.ssn}</td>
                            <td className="px-4 py-2">{p.dob}</td>
                            <td className="px-4 py-2">{p.externalId}</td>
                            <td className="px-4 py-2 text-center">
                                <button
                                    onClick={() => router.push(`/dashboard/patients/${p.id}`)}
                                    className="text-blue-600 hover:underline mr-3"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => router.push(`/dashboard/patients/edit/${p.id}`)}
                                    className="text-green-600 hover:underline"
                                >
                                    Edit
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="text-sm text-gray-700 mt-4 flex items-center justify-between">
                <p>Showing {filtered.length} of {total} entries</p>
                <div className="flex gap-1 items-center">
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        className="px-3 py-1 border rounded bg-white hover:bg-gray-100"
                        disabled={page === 1}
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1 border rounded bg-gray-100">{page}</span>
                    <button
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        className="px-3 py-1 border rounded bg-white hover:bg-gray-100"
                        disabled={page === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
