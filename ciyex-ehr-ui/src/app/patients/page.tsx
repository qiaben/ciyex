"use client";

import React, { useEffect, useState,useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import AdminLayout from "@/app/(admin)/layout";
import Link from "next/link";

interface Patient {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: string;
    status?: string;
}

interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number; // current page index (0-based)
    size: number;
    // optionally other Spring fields
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

const badgeColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-teal-500",
];

export default function PatientListPage() {
    const router = useRouter();

    const [patients, setPatients] = useState<Patient[]>([]);
    const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Server-driven pagination state
    const [currentPage, setCurrentPage] = useState<number>(1); // UI 1-based
    const [patientsPerPage, setPatientsPerPage] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);

    // Search (server-side)
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");

    // debounce input to avoid a request per keystroke
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
        return () => clearTimeout(t);
    }, [searchTerm]);

    // reset page to 1 when debounced search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    useEffect(() => {
        const recent = JSON.parse(localStorage.getItem("recentPatients") || "[]");
        setRecentPatients(recent);
    }, []);

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    const getInitials = (firstName: string, lastName: string) =>
        `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();

    const getBadgeColor = (id: number) => badgeColors[id % badgeColors.length];

    const handlePatientClick = (patient: Patient) => {
        const updatedRecent = [patient, ...recentPatients.filter((p) => p.id !== patient.id)].slice(
            0,
            5
        );
        setRecentPatients(updatedRecent);
        localStorage.setItem("recentPatients", JSON.stringify(updatedRecent));
    };

    const goToPatient = (patient: Patient) => {
        handlePatientClick(patient);
        router.push(`/patients/${patient.id}/`);
    };

    const fetchPatients = useCallback(
        async (page: number, size: number, search: string, signal?: AbortSignal) => {
            setLoading(true);
            setError(null);
            try {
                const base = `${process.env.NEXT_PUBLIC_API_URL}/api/patients`;
                const params = new URLSearchParams();
                // backend expects 0-based page index
                params.set("page", String(Math.max(0, page - 1)));
                params.set("size", String(size));
                params.set("sort", "id,asc");
                if (search) params.set("search", search);

                const url = `${base}?${params.toString()}`;
                const res = await fetchWithAuth(url, { signal });
                const contentType = res.headers.get("content-type") || "";

                if (!contentType.includes("application/json")) {
                    // We expect JSON from the server (ApiResponse<Page<PatientDto>>)
                    throw new Error("Expected JSON response from server but got: " + contentType);
                }

                const body = (await res.json()) as ApiResponse<PageResponse<Patient>>;

                if (!body) throw new Error("Empty response from server");
                if (!body.success) {
                    throw new Error(body.message || "Failed to fetch patients");
                }
                if (!body.data) {
                    // No data payload
                    setPatients([]);
                    setTotalPages(1);
                    setTotalItems(0);
                    return;
                }

                const pageData = body.data;
                setPatients(pageData.content || []);
                setTotalPages(Math.max(1, pageData.totalPages ?? 1));
                setTotalItems(pageData.totalElements ?? (pageData.content?.length ?? 0));
                // sync UI's 1-based page with server number (server returns 0-based)
                setCurrentPage((prev) => {
                    const serverPage1 = (pageData.number ?? (page - 1)) + 1;
                    return prev === serverPage1 ? prev : serverPage1;
                });
            } catch (err: unknown) {
                if (err instanceof DOMException && err.name === "AbortError") return;
                console.error("Fetch patients error:", err);
                setError("An error occurred while fetching patients: " + (err as Error).message);
                setPatients([]);
                setTotalPages(1);
                setTotalItems(0);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // Trigger fetch when page, size or debounced search changes
    useEffect(() => {
        const controller = new AbortController();
        fetchPatients(currentPage, patientsPerPage, debouncedSearch, controller.signal);
        return () => controller.abort();
    }, [currentPage, patientsPerPage, debouncedSearch, fetchPatients]);

    if (loading)
        return (
            <AdminLayout>
                <div className="w-full p-1 text-sm">Loading patients...</div>
            </AdminLayout>
        );

    if (error)
        return (
            <AdminLayout>
                <div className="w-full p-1 text-sm text-red-500">{error}</div>
            </AdminLayout>
        );

    const handlePrevious = () => setCurrentPage((p) => Math.max(1, p - 1));
    const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

    return (
        <AdminLayout>
            <div className="w-full min-h-[calc(100vh-56px)] bg-[#f8fafb] m-0 p-0">
                {/* Top row: Recent patients (left) • Search • Create button (right) */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-2">
                    {/* Left: Recent patients */}
                    <div className="min-w-0">
                        {recentPatients.length > 0 ? (
                            <>
                                <div className="text-xs text-gray-700 mb-1">Recent patients</div>
                                <div className="flex flex-wrap gap-1">
                                    {recentPatients.slice(0, 5).map((patient) => (
                                        <Link
                                            key={patient.id}
                                            href={`/patients/${patient.id}/`}
                                            onClick={() => handlePatientClick(patient)}
                                            className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md border border-gray-200 bg-white text-xs text-gray-700 hover:bg-gray-50"
                                        >
                                            <div
                                                className={`flex items-center justify-center h-5 w-5 rounded-full text-[11px] font-semibold text-white ${getBadgeColor(
                                                    patient.id
                                                )}`}
                                            >
                                                {getInitials(patient.firstName, patient.lastName)}
                                            </div>
                                            <span className="text-xs font-medium leading-4">
                                                {patient.firstName} {patient.lastName}
                                            </span>
                                            <span className="ml-1 px-1 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded">
                                                MRN {patient.id}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-xs text-gray-600">No recent patients</div>
                        )}
                    </div>

                    {/* Right: Search + Create */}
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Search patients"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-40 px-2 py-1 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-0"
                            aria-label="Search patients"
                        />


                        <Link
                            href="/patients/new"
                            className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                            aria-label="Create patient"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-4 w-4"
                                aria-hidden="true"
                            >
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            <span>Create patient</span>
                        </Link>
                    </div>
                </div>

                {/* Table */}
                <div className="w-full">
                    <div className="bg-white border-t border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full table-fixed text-sm">
                                <colgroup>
                                    <col className="w-[20%]" />
                                    <col className="w-[8%]" />
                                    <col className="w-[22%]" />
                                    <col className="w-[15%]" />
                                    <col className="w-[12%]" />
                                    <col className="w-[10%]" />
                                    <col className="w-[13%]" />
                                </colgroup>

                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-400 uppercase">
                                        Name
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-400 uppercase">
                                        MRN
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-400 uppercase">
                                        Email
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-400 uppercase">
                                        Phone
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-400 uppercase">
                                        DOB
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-400 uppercase">
                                        Gender
                                    </th>
                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-400 uppercase">
                                        Status
                                    </th>
                                </tr>
                                </thead>

                                <tbody className="bg-white divide-y divide-gray-100">
                                {patients.length > 0 ? (
                                    patients.map((patient) => (
                                        <tr
                                            key={patient.id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => goToPatient(patient)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault();
                                                    goToPatient(patient);
                                                }
                                            }}
                                            tabIndex={0}
                                            role="button"
                                            aria-label={`Open patient ${patient.firstName} ${patient.lastName} dashboard`}
                                        >
                                            <td className="px-2 py-2 align-top">
                                                <div className="flex items-start gap-2">
                                                    <div
                                                        className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-semibold text-white ${getBadgeColor(
                                                            patient.id
                                                        )}`}
                                                    >
                                                        {getInitials(patient.firstName, patient.lastName)}
                                                    </div>
                                                    <div className="leading-tight">
                                                        <div className="text-sm font-semibold text-gray-700">
                                                            {patient.firstName} {patient.lastName}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-2 py-2 align-top text-sm text-gray-500">
                                                {patient.id}
                                            </td>

                                            <td className="px-2 py-2 align-top text-sm text-gray-500 break-words">
                                                {patient.email || "N/A"}
                                            </td>

                                            <td className="px-2 py-2 align-top text-sm text-gray-500">
                                                {patient.phoneNumber || "N/A"}
                                            </td>

                                            <td className="px-2 py-2 align-top text-sm text-gray-500">
                                                {formatDate(patient.dateOfBirth)}
                                            </td>

                                            <td className="px-2 py-2 align-top text-sm text-gray-500">
                                                {patient.gender || "N/A"}
                                            </td>

                                            <td className="px-2 py-2 align-top">
                                                    <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                                                        {patient.status || "Active"}
                                                    </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-2 py-5 text-center text-gray-500">
                                            No patients found
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-2 py-2 border-t bg-white">
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={handlePrevious}
                                    className="px-2 py-1 text-sm border rounded disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                <div className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </div>

                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={handleNext}
                                    className="px-2 py-1 text-sm border rounded disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-sm text-gray-600">
                                    Showing {patients.length} of {totalItems} patients
                                </div>

                                <select
                                    value={patientsPerPage}
                                    onChange={(e) => {
                                        setPatientsPerPage(Number(e.target.value));
                                        setCurrentPage(1); // reset page when page size changes
                                    }}
                                    className="text-sm border rounded px-2 py-1 bg-white"
                                    aria-label="Patients per page"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}