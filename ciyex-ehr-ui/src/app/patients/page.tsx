"use client";
import React, { useEffect, useState, useCallback } from "react";
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
    mrn: number;
    status?: string;
}

interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
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

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [patientsPerPage, setPatientsPerPage] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);

    const [search, setSearch] = useState("");

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
        const updatedRecent = [patient, ...recentPatients.filter((p) => p.id !== patient.id)].slice(0, 5);
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
                params.set("page", String(Math.max(0, page - 1)));
                params.set("size", String(size));
                params.set("sort", "id,asc");
                if (search) params.set("search", search);

                const url = `${base}?${params.toString()}`;
                const res = await fetchWithAuth(url, { signal });
                const contentType = res.headers.get("content-type") || "";

                if (!contentType.includes("application/json")) {
                    throw new Error("Expected JSON response but got: " + contentType);
                }

                const body = (await res.json()) as ApiResponse<PageResponse<Patient>>;
                if (!body.success) throw new Error(body.message || "Failed to fetch patients");
                if (!body.data) {
                    setPatients([]);
                    setTotalPages(1);
                    setTotalItems(0);
                    return;
                }

                const pageData = body.data;
                setPatients(pageData.content || []);
                setTotalPages(Math.max(1, pageData.totalPages ?? 1));
                setTotalItems(pageData.totalElements ?? (pageData.content?.length ?? 0));
                setCurrentPage((pageData.number ?? (page - 1)) + 1);
            } catch (err: unknown) {
                if (err instanceof DOMException && err.name === "AbortError") return;
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

    useEffect(() => {
        const controller = new AbortController();
        fetchPatients(currentPage, patientsPerPage, search, controller.signal);
        return () => controller.abort();
    }, [currentPage, patientsPerPage, search, fetchPatients]);

    const handlePrevious = () => setCurrentPage((p) => Math.max(1, p - 1));
    const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

    const handleEdit = (patient: Patient) => {
        window.dispatchEvent(new CustomEvent("openPatientModal", { detail: patient }));
    };

    const handleDelete = async (patient: Patient) => {
        if (!confirm(`Delete patient ${patient.firstName} ${patient.lastName}?`)) return;
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patient.id}`, {
                method: "DELETE",
            });
            const body = await res.json();
            if (body.success) {
                fetchPatients(currentPage, patientsPerPage, search);
            } else {
                alert(body.message || "Failed to delete patient");
            }
        } catch (err) {
            alert("Error deleting patient: " + (err as Error).message);
        }
    };

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

    return (
        <AdminLayout>
            <div className="flex flex-col min-h-[calc(100vh-56px)] bg-[#f8fafb]">
                {/* Recent patients + search */}
                <div className="flex flex-wrap justify-between gap-2 px-2 py-1 items-start">
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
                                            className="inline-flex items-center gap-2 px-2 py-1 rounded-md border border-gray-200 bg-white text-xs text-gray-700 hover:bg-gray-50"
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
                                        </Link>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-xs text-gray-600">No recent patients</div>
                        )}
                    </div>

                    {/* Search bar */}
                    <form onSubmit={(e) => e.preventDefault()} className="relative w-52 sm:w-60 mt-6">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" />
              </svg>
            </span>
                        <input
                            type="text"
                            placeholder="Search patients..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                        />
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white border-t border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed text-[13px] min-h-[400px]">
                            <colgroup>
                                <col className="w-[15%]" />
                                <col className="w-[6%]" />
                                <col className="w-[20%]" />
                                <col className="w-[14%]" />
                                <col className="w-[12%]" />
                                <col className="w-[8%]" />
                                <col className="w-[8%]" />
                                <col className="w-[10%]" />
                            </colgroup>
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-2 py-1.5 text-[11px] font-semibold text-gray-500 uppercase text-left">Name</th>
                                <th className="px-1 py-1.5 text-left text-[11px] font-semibold text-gray-500 uppercase">MRN</th>
                                <th className="px-1 py-1.5 text-left text-[11px] font-semibold text-gray-500 uppercase">Email</th>
                                <th className="px-1 py-1.5 text-left text-[11px] font-semibold text-gray-500 uppercase">Phone</th>
                                <th className="px-1 py-1.5 text-left text-[11px] font-semibold text-gray-500 uppercase">DOB</th>
                                <th className="px-1 py-1.5 text-left text-[11px] font-semibold text-gray-500 uppercase">Gender</th>
                                <th className="px-1 py-1.5 text-left text-[11px] font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-1 py-1.5 text-center text-[11px] font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                            {patients.length > 0 ? (
                                patients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-gray-50">
                                        <td className="px-2 py-1.5">
                                            <div
                                                onClick={() => goToPatient(patient)}
                                                className="flex items-center gap-2 cursor-pointer"
                                            >
                                                <div
                                                    className={`flex items-center justify-center h-6 w-6 rounded-full text-[11px] font-semibold text-white ${getBadgeColor(
                                                        patient.id
                                                    )}`}
                                                >
                                                    {getInitials(patient.firstName, patient.lastName)}
                                                </div>
                                                <span className="font-medium text-gray-700">
                            {patient.firstName} {patient.lastName}
                          </span>
                                            </div>
                                        </td>
                                        <td className="px-1 py-1.5 text-gray-600">{patient.id}</td>
                                        <td className="px-1 py-1.5 text-gray-600 break-words">{patient.email || "N/A"}</td>
                                        <td className="px-1 py-1.5 text-gray-600">{patient.phoneNumber || "N/A"}</td>
                                        <td className="px-1 py-1.5 text-gray-600">{formatDate(patient.dateOfBirth)}</td>
                                        <td className="px-1 py-1.5 text-gray-600">{patient.gender || "N/A"}</td>
                                        <td className="px-1 py-1.5">
                        <span className="inline-block bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                          {patient.status || "Active"}
                        </span>
                                        </td>
                                        <td className="px-1 py-1.5 text-center flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(patient)}
                                                className="text-gray-500 hover:text-blue-600"
                                                aria-label="Edit"
                                            >
                                                {/* Pencil (edit) icon */}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M16.862 4.487l2.651 2.65m-2.651-2.65L6.75 14.6l-1.5 4.5 4.5-1.5L19.512 7.137m-2.65-2.65a1.875 1.875 0 112.651 2.65L9.75 16.35m6.75-11.863L9.75 16.35"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(patient)}
                                                className="text-gray-500 hover:text-red-600"
                                                aria-label="Delete"
                                            >
                                                {/* Trash (delete) icon */}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6 7h12m-9 4v6m6-6v6M4 7h16l-1 12a2 2 0 01-2 2H7a2 2 0 01-2-2L4 7zm3-3h10v2H7V4z"
                                                    />
                                                </svg>
                                            </button>
                                        </td>
                                        <td className="px-1 py-1.5 text-center flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(patient)}
                                                className="text-gray-500 hover:text-blue-600"
                                                aria-label="Edit"
                                            >
                                                {/* Pencil (edit) icon */}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M16.862 4.487l2.651 2.65m-2.651-2.65L6.75 14.6l-1.5 4.5 4.5-1.5L19.512 7.137m-2.65-2.65a1.875 1.875 0 112.651 2.65L9.75 16.35m6.75-11.863L9.75 16.35"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(patient)}
                                                className="text-gray-500 hover:text-red-600"
                                                aria-label="Delete"
                                            >
                                                {/* Trash (delete) icon */}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6 7h12m-9 4v6m6-6v6M4 7h16l-1 12a2 2 0 01-2 2H7a2 2 0 01-2-2L4 7zm3-3h10v2H7V4z"
                                                    />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-2 py-3 text-center text-gray-500">
                                        No patients found
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-2 py-1.5 border-t bg-white text-[11px]">
                        <div className="flex items-center gap-2">
                            <button disabled={currentPage === 1} onClick={handlePrevious} className="px-2 py-0.5 border rounded disabled:opacity-50">Prev</button>
                            <div>Page {currentPage} of {totalPages}</div>
                            <button disabled={currentPage === totalPages} onClick={handleNext} className="px-2 py-0.5 border rounded disabled:opacity-50">Next</button>
                        </div>
                        <div className="flex items-center gap-3">
                            <div>Showing {patients.length} of {totalItems}</div>
                            <select
                                value={patientsPerPage}
                                onChange={(e) => {
                                    setPatientsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="border rounded px-2 py-0.5 bg-white text-[11px]"
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
        </AdminLayout>
    );
}
