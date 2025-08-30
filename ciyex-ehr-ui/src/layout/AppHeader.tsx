"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface AppHeaderProps {
    pageTitle?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ pageTitle }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingPatientId, setEditingPatientId] = useState<number | null>(null);
    const { toggleSidebar } = useSidebar();
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // ✅ correct fields for backend
    const [formData, setFormData] = useState({
        medicalRecordNumber: "",
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        phoneNumber: "",
        email: "",
    });

    const [errorMessage, setErrorMessage] = useState("");

    const resetForm = () => {
        setFormData({
            medicalRecordNumber: "",
            firstName: "",
            middleName: "",
            lastName: "",
            gender: "",
            dateOfBirth: "",
            phoneNumber: "",
            email: "",
        });
        setEditingPatientId(null);
        setErrorMessage("");
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            let response: Response;

            const payload = { ...formData };

            if (editingPatientId) {
                response = await fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${editingPatientId}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...payload, id: editingPatientId }),
                    }
                );
            } else {
                response = await fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/patients`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );
            }

            const res = await response.json();
            if (res.success) {
                setModalOpen(false);
                resetForm();
                router.refresh();
            } else {
                setErrorMessage(res.message || "Failed to save patient");
            }
        } catch {
            setErrorMessage("Something went wrong.");
        }
    };

    const handleDelete = async () => {
        if (!editingPatientId) return;
        if (!confirm("Are you sure you want to delete this patient?")) return;

        try {
            const response = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${editingPatientId}`,
                { method: "DELETE" }
            );
            const res = await response.json();
            if (res.success) {
                setModalOpen(false);
                resetForm();
                router.refresh();
            } else {
                setErrorMessage(res.message || "Failed to delete patient");
            }
        } catch {
            setErrorMessage("Something went wrong.");
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "k") {
                event.preventDefault();
                inputRef.current?.focus();
            }
        };
        document.addEventListener("keydown", handleKeyDown);

        const handleOpenModal = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail) {
                setFormData({
                    medicalRecordNumber: detail.medicalRecordNumber || "",
                    firstName: detail.firstName || "",
                    middleName: detail.middleName || "",
                    lastName: detail.lastName || "",
                    gender: detail.gender || "",
                    dateOfBirth: detail.dateOfBirth || "",
                    phoneNumber: detail.phoneNumber || "",
                    email: detail.email || "",
                });
                setEditingPatientId(detail.id);
            }
            setModalOpen(true);
        };
        window.addEventListener("openPatientModal", handleOpenModal);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("openPatientModal", handleOpenModal);
        };
    }, []);

    return (
        <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-50 dark:bg-gray-900">
            <div className="flex items-center justify-between w-full px-4 py-2">
                {/* Sidebar toggle + Title */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleSidebar}
                        className="flex items-center justify-center h-11 w-11 rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-600"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    {pageTitle && <h1 className="text-lg font-semibold">{pageTitle}</h1>}
                </div>

                {/* Search */}
                <div className="mx-6">
                    <form>
                        <div className="relative w-70">
              <span className="absolute inset-y-0 left-3 flex items-center">
                <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
                  />
                </svg>
              </span>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search or type command..."
                                className="h-11 w-full rounded-lg border border-gray-200 pl-9 pr-14 text-sm text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500"
                            />
                            <button className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-500">
                                ⌘ K
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            resetForm();
                            setModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 text-blue-700 px-3 py-1.5 text-sm font-medium hover:bg-blue-200"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Create</span>
                    </button>
                    <ThemeToggleButton />
                    <NotificationDropdown />
                    <UserDropdown />
                </div>
            </div>

            {/* Patient Modal */}
            <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
                <DialogContent onClose={() => setModalOpen(false)}>
                    <DialogHeader>
                        <DialogTitle>
                            {editingPatientId ? "Edit Patient" : "Create Patient"}
                        </DialogTitle>
                        <DialogDescription>
                            Fill out the patient details below.
                        </DialogDescription>
                    </DialogHeader>

                    <form className="space-y-3">
                        <input
                            name="medicalRecordNumber"
                            placeholder="Medical Record Number"
                            value={formData.medicalRecordNumber}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                        />
                        <input
                            name="firstName"
                            placeholder="First Name"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                        />
                        <input
                            name="middleName"
                            placeholder="Middle Name"
                            value={formData.middleName}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                        />
                        <input
                            name="lastName"
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                        />
                        <input
                            name="phoneNumber"
                            placeholder="Phone Number"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                        />
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                        />
                    </form>

                    {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}

                    <DialogFooter>
                        {editingPatientId && (
                            <button
                                onClick={handleDelete}
                                className="px-3 py-1.5 flex items-center gap-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setModalOpen(false);
                                resetForm();
                            }}
                            className="px-3 py-1.5 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            {editingPatientId ? "Update" : "Save"}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </header>
    );
};

export default AppHeader;
