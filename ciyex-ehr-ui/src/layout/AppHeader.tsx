"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";

import React, { useState, useCallback, useEffect, useRef } from "react";
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

    const [formData, setFormData] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        phoneNumber: "",
        email: "",
        smsConsent: false,
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const resetForm = () => {
        setFormData({
            firstName: "",
            middleName: "",
            lastName: "",
            gender: "",
            dateOfBirth: "",
            phoneNumber: "",
            email: "",
            smsConsent: false,
        });
        setEditingPatientId(null);
        setErrorMessage("");
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
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

    // 🔍 Run search when Enter pressed or ⌘K button clicked
    const runSearch = useCallback(() => {
        if (searchTerm.trim()) {
            router.push(`/patients?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    }, [searchTerm, router]);  // Added dependencies for searchTerm and router

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "k") {
                event.preventDefault();
                inputRef.current?.focus();
            }
            if (event.key === "Enter" && document.activeElement === inputRef.current) {
                event.preventDefault();
                runSearch();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [runSearch, searchTerm]);  // Include runSearch in the dependency array

    return (
        <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-50 dark:bg-gray-900">
            <div className="flex items-center justify-between w-full px-4 py-2">
                {/* Left: Sidebar + Title */}
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

                {/* Center: Search */}
                <div className="flex-1 max-w-md mx-8">
                    <div className="relative">
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
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search or type command..."
                            className="h-11 w-full rounded-lg border border-gray-200 pl-9 pr-14 text-sm text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={runSearch}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-500"
                        >
                            ⌘ K
                        </button>
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            resetForm();
                            setModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 text-blue-700 px-3 py-1.5 text-sm font-medium hover:bg-blue-200"
                    >
                        {/* Avatar icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" className="w-5 h-5">
                            <path
                                className="stroke-[#6C3DB7]"
                                d="M24,28H6c-1.1,0-2-0.9-2-2v0c0-3.9,3.1-7,7-7h8c3.9,0,7,3.1,7,7v0C26,27.1,25.1,28,24,28z"
                            />
                            <circle className="fill-[#6EBAFF]" cx="15" cy="9" r="6" />
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
                <DialogContent
                    className="max-w-2xl"
                    onClose={() => {
                        setModalOpen(false);
                        resetForm();
                    }}
                >
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">
                            {editingPatientId ? "Edit Patient" : "Create Patient"}
                        </DialogTitle>
                        <DialogDescription>
                            Fill out the patient details below.
                        </DialogDescription>
                    </DialogHeader>

                    <form className="space-y-6">
                        {/* Form fields... */}
                    </form>

                    {errorMessage && (
                        <p className="text-red-600 text-sm mt-3">{errorMessage}</p>
                    )}

                    <DialogFooter className="flex justify-between items-center mt-6">
                        {/* Consent Checkbox */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="smsConsent"
                                name="smsConsent"
                                checked={formData.smsConsent}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="smsConsent" className="text-sm text-gray-700">
                                Allow to receive SMS notifications
                            </label>
                        </div>

                        <div className="flex gap-2">
                            {editingPatientId && (
                                <button
                                    onClick={handleDelete}
                                    className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600"
                                >
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
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </header>
    );
};

export default AppHeader;
