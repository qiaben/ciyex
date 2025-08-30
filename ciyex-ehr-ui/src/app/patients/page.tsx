"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import AdminLayout from "@/app/(admin)/layout";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Patient {
    id: number;
    firstName: string;
    lastName: string;
    middleName: string;
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
    number: number;
    size: number;
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

const badgeColors = [
    "bg-pink-200 text-pink-700",
    "bg-green-200 text-green-700",
    "bg-blue-200 text-blue-700",
    "bg-yellow-200 text-yellow-700",
    "bg-purple-200 text-purple-700",
    "bg-teal-200 text-teal-700",
    "bg-indigo-200 text-indigo-700",
    "bg-red-200 text-red-700",
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
    const [editPatient, setEditPatient] = useState<Patient | null>(null);

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
        const updatedRecent = [
            patient,
            ...recentPatients.filter((p) => p.id !== patient.id),
        ].slice(0, 5);
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
                const res = await fetchWithAuth(url, {signal});
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
                if (err instanceof Error && err.name !== "AbortError") {
                    setError("An error occurred while fetching patients: " + err.message);
                }
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
        setEditPatient(patient);
    };

    const handleDelete = async (patient: Patient) => {
        if (!confirm(`Delete patient ${patient.firstName} ${patient.lastName}?`)) return;
        await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patient.id}`, {
            method: "DELETE",
        });
        fetchPatients(currentPage, patientsPerPage, search);
    };

    const handleSaveEdit = async (updatedPatient: Patient) => {
        if (!updatedPatient) return;
        await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${updatedPatient.id}`,
            {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(updatedPatient),
            }
        );
        fetchPatients(currentPage, patientsPerPage, search); // Refresh list after saving
        setEditPatient(null); // Close the edit modal
    };

    // ✅ Loading / Error
    if (loading) {
        return (
            <AdminLayout>
                <div className="p-4 text-gray-500 text-sm">Loading patients...</div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="p-4 text-red-500 text-sm">{error}</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="flex flex-col min-h-[calc(100vh-56px)] bg-[#f8fafb]">
                {/* Recent patients + search */}
                <div className="flex flex-wrap justify-between gap-2 px-2 py-1 items-start mb-4">
                    <div>
                        {recentPatients.length > 0 && (
                            <>
                                <div className="text-xs text-gray-700 mb-1">Recent patients</div>
                                <div className="flex flex-wrap gap-1">
                                    {recentPatients.slice(0, 5).map((patient) => (
                                        <Link
                                            key={patient.id}
                                            href={`/patients/${patient.id}/`}
                                            onClick={() => handlePatientClick(patient)}
                                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border text-xs hover:bg-gray-50"
                                        >
                                            <div
                                                className={`flex items-center justify-center h-6 w-6 rounded-full text-[11px] font-semibold ${getBadgeColor(
                                                    patient.id
                                                )}`}
                                            >
                                                {getInitials(patient.firstName, patient.lastName)}
                                            </div>
                                            <span className="text-xs font-medium">
                        {patient.firstName} {patient.lastName}
                      </span>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Search */}
                    <form onSubmit={(e) => e.preventDefault()} className="relative w-52 sm:w-60 mt-6">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/>
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
                            className="w-full pl-9 pr-3 py-1 text-xs border rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white border-t border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-[12px]">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-2 py-1 text-left text-[11px] text-gray-500 uppercase">Name</th>
                                <th className="px-2 py-1 text-left text-[11px] text-gray-500 uppercase">MRN</th>
                                <th className="px-2 py-1 text-left text-[11px] text-gray-500 uppercase">Email</th>
                                <th className="px-2 py-1 text-left text-[11px] text-gray-500 uppercase">Phone</th>
                                <th className="px-2 py-1 text-left text-[11px] text-gray-500 uppercase">DOB</th>
                                <th className="px-2 py-1 text-left text-[11px] text-gray-500 uppercase">Gender</th>
                                <th className="px-2 py-1 text-left text-[11px] text-gray-500 uppercase">Status</th>
                                <th className="px-2 py-1 text-center text-[11px] text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {patients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-gray-50">
                                    <td
                                        className="px-2 py-1 flex items-center gap-2 cursor-pointer"
                                        onClick={() => goToPatient(patient)}
                                    >
                                        <div
                                            className={`h-6 w-6 flex items-center justify-center rounded-full text-[11px] font-semibold ${getBadgeColor(
                                                patient.id
                                            )}`}
                                        >
                                            {getInitials(patient.firstName, patient.lastName)}
                                        </div>
                                        <span className="font-medium text-gray-700">
                        {patient.firstName} {patient.lastName}
                      </span>
                                    </td>
                                    <td className="px-2 py-1 text-gray-600">{patient.id}</td>
                                    <td className="px-2 py-1 text-gray-600">{patient.email || "N/A"}</td>
                                    <td className="px-2 py-1 text-gray-600">{patient.phoneNumber || "N/A"}</td>
                                    <td className="px-2 py-1 text-gray-600">{formatDate(patient.dateOfBirth)}</td>
                                    <td className="px-2 py-1 text-gray-600">{patient.gender || "N/A"}</td>
                                    <td className="px-2 py-1">
                      <span
                          className="inline-block bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                        {patient.status || "Active"}
                      </span>
                                    </td>
                                    <td className="px-2 py-1 text-center">
                                        <div className="flex justify-center gap-2">
                                            {/* Edit */}
                                            <button
                                                onClick={() => handleEdit(patient)}
                                                className="text-gray-500 hover:text-blue-600"
                                            >
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
                                                        d="M16.862 4.487l2.651 2.65M6.75 14.6l-1.5 4.5 4.5-1.5L19.512 7.137"
                                                    />
                                                </svg>
                                            </button>
                                            {/* Delete */}
                                            <button
                                                onClick={() => handleDelete(patient)}
                                                className="text-gray-500 hover:text-red-600"
                                            >
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
                                                        d="M6 7h12M9 11v6m6-6v6M4 7h16l-1 12H6L4 7zm3-3h10v2H7V4z"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-3 flex items-center justify-between px-2 py-1 border-t bg-white text-[11px]">
                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={handlePrevious}
                                className="px-2 py-0.5 border rounded disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <div>
                                Page {currentPage} of {totalPages}
                            </div>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={handleNext}
                                className="px-2 py-0.5 border rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <div>
                                Showing {patients.length} of {totalItems}
                            </div>
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

            {/* Edit Patient Modal */}
            {editPatient && (
                <Dialog open={true} onOpenChange={() => setEditPatient(null)}>
                    <DialogContent
                        className="max-w-2xl"
                        onClose={() => setEditPatient(null)}
                    >

                        <DialogHeader>
                            <DialogTitle>Edit Patient</DialogTitle>
                            <DialogDescription>Update the patient details</DialogDescription>
                        </DialogHeader>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSaveEdit(editPatient);
                            }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-red-500">First Name *</label>
                                    <input
                                        name="firstName"
                                        required
                                        placeholder="First name"
                                        value={editPatient.firstName}
                                        onChange={(e) =>
                                            setEditPatient({...editPatient, firstName: e.target.value})
                                        }
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Middle Name</label>
                                    <input
                                        name="middleName"
                                        placeholder="Middle (optional)"
                                        value={editPatient.middleName}
                                        onChange={(e) =>
                                            setEditPatient({...editPatient, middleName: e.target.value})
                                        }
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-red-500">Last Name *</label>
                                    <input
                                        name="lastName"
                                        required
                                        placeholder="Last name"
                                        value={editPatient.lastName}
                                        onChange={(e) =>
                                            setEditPatient({...editPatient, lastName: e.target.value})
                                        }
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                                    <input
                                        name="phoneNumber"
                                        value={editPatient.phoneNumber}
                                        onChange={(e) =>
                                            setEditPatient({...editPatient, phoneNumber: e.target.value})
                                        }
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Gender</label>
                                    <select
                                        name="gender"
                                        value={editPatient.gender}
                                        onChange={(e) =>
                                            setEditPatient({...editPatient, gender: e.target.value})
                                        }
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                            </div>

                            <DialogFooter>
                                <button
                                    type="button"
                                    onClick={() => setEditPatient(null)}
                                    className="px-3 py-1.5 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </DialogFooter>
                        </form>

                    </DialogContent>

                </Dialog>
            )}
        </AdminLayout>
    );
}
