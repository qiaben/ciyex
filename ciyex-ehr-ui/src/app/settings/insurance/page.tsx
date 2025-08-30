"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import AdminLayout from "@/app/(admin)/layout";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Button from "@/components/ui/button/Button";

type InsuranceCompany = {
    id: number;
    payerId?: string;
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    status: "ACTIVE" | "ARCHIVED";
    audit: {
        createdDate: string;
        lastModifiedDate: string;
    };
};

type CompanyForm = {
    payerId: string;
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
};

export default function InsurancePage() {
    const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
    const [filtered, setFiltered] = useState<InsuranceCompany[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editCompany, setEditCompany] = useState<InsuranceCompany | null>(null);
    const [form, setForm] = useState<CompanyForm>({
        payerId: "",
        name: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
    });
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const loadCompanies = async () => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/insurance-companies`
            );
            const data = await res.json();
            setCompanies(data);
            setFiltered(data);
        } catch (err) {
            console.error("Error loading companies:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCompanies();
    }, []);

    useEffect(() => {
        if (!search.trim()) {
            setFiltered(companies);
        } else {
            setFiltered(
                companies.filter((c) =>
                    c.name.toLowerCase().includes(search.toLowerCase())
                )
            );
        }
        setPage(1);
    }, [search, companies]);

    const handleSave = async () => {
        try {
            const method = editCompany ? "PUT" : "POST";
            const url = editCompany
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/insurance-companies/${editCompany.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/insurance-companies`;
            await fetchWithAuth(url, {
                method,
                body: JSON.stringify(form),
            });
            setOpen(false);
            setEditCompany(null);
            setForm({
                payerId: "",
                name: "",
                address: "",
                city: "",
                state: "",
                postalCode: "",
                country: "",
            });
            loadCompanies();
        } catch (err) {
            console.error("Error saving company:", err);
        }
    };

    const handleToggleStatus = async (company: InsuranceCompany) => {
        const action = company.status === "ACTIVE" ? "archive" : "activate";
        try {
            await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/insurance-companies/${company.id}/${action}`,
                { method: "POST" }
            );
            loadCompanies();
        } catch (err) {
            console.error(`Error trying to ${action} company:`, err);
        }
    };

    const openAddModal = () => {
        setEditCompany(null);
        setForm({
            payerId: "",
            name: "",
            address: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
        });
        setOpen(true);
    };

    const openEditModal = (company: InsuranceCompany) => {
        setEditCompany(company);
        setForm({
            payerId: company.payerId || "",
            name: company.name,
            address: company.address,
            city: company.city,
            state: company.state,
            postalCode: company.postalCode,
            country: company.country,
        });
        setOpen(true);
    };

    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(filtered.length / pageSize);

    return (
        <AdminLayout>
            <div className="p-4">
                {/* Search + Add Row */}
                <div className="flex justify-between items-center gap-2 mt-1 mb-3">
                    <Input
                        placeholder="Search Companies"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="!w-40 max-w-[180px] text-xs border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                    />
                    <button
                        onClick={openAddModal}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow hover:from-blue-600 hover:to-indigo-600 transition"
                    >
                        + Add Insurance
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
                    {loading ? (
                        <p className="p-3 text-gray-500 text-xs">
                            Loading insurance companies...
                        </p>
                    ) : (
                        <table className="w-full text-xs">
                            <thead className="sticky top-0 bg-gray-50 z-10">
                            <tr className="text-left text-gray-600">
                                <th className="px-2 py-1.5">Payer ID</th>
                                <th className="px-2 py-1.5">Name</th>
                                <th className="px-2 py-1.5">Address</th>
                                <th className="px-2 py-1.5">City</th>
                                <th className="px-2 py-1.5">State</th>
                                <th className="px-2 py-1">Postal Code</th>
                                <th className="px-2 py-1">Country</th>
                                <th className="px-2 py-1">Status</th>
                                <th className="px-2 py-1">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginated.map((c) => (
                                <tr key={c.id} className="hover:bg-blue-50 text-gray-700">
                                    <td className="px-2 py-1">{c.payerId || "-"}</td>
                                    <td className="px-2 py-1 font-medium">{c.name}</td>
                                    <td className="px-2 py-1">{c.address}</td>
                                    <td className="px-2 py-1">{c.city}</td>
                                    <td className="px-2 py-1">{c.state}</td>
                                    <td className="px-2 py-1">{c.postalCode}</td>
                                    <td className="px-2 py-1">{c.country}</td>
                                    <td className="px-2 py-1">
                                        {c.status === "ACTIVE" ? (
                                            <span className="px-2 py-0.5 text-[11px] rounded-full bg-green-100 text-green-700 font-medium inline-flex items-center gap-1">
                          <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                          >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Active
                        </span>
                                        ) : (
                                            <span className="px-2 py-0.5 text-[11px] rounded-full bg-gray-200 text-gray-600 font-medium inline-flex items-center gap-1">
                          <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                          >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M20 7H4m16 0v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7m16 0L18 3H6L4 7"
                            />
                          </svg>
                          Archived
                        </span>
                                        )}
                                    </td>
                                    <td className="px-2 py-1.5 flex space-x-2">
                                        {/* Edit */}
                                        <button
                                            onClick={() => openEditModal(c)}
                                            className="h-8 w-8 flex items-center justify-center rounded-md border border-gray-300 hover:bg-blue-50"
                                            title="Edit"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 text-blue-600"
                                                viewBox="0 0 30 30"
                                                fill="currentColor"
                                            >
                                                <path d="M 22.828125 3 C 22.316375 3 21.804562 3.1954375 21.414062 3.5859375 L 19 6 L 24 11 L 26.414062 8.5859375 C 27.195062 7.8049375 27.195062 6.5388125 26.414062 5.7578125 L 24.242188 3.5859375 C 23.851688 3.1954375 23.339875 3 22.828125 3 z M 17 8 L 5.2597656 19.740234 C 5.2597656 19.740234 6.1775313 19.658 6.5195312 20 C 6.8615312 20.342 6.58 22.58 7 23 C 7.42 23.42 9.6438906 23.124359 9.9628906 23.443359 C 10.281891 23.762359 10.259766 24.740234 10.259766 24.740234 L 22 13 L 17 8 z M 4 23 L 3.0566406 25.671875 A 1 1 0 0 0 3 26 A 1 1 0 0 0 4 27 A 1 1 0 0 0 4.328125 26.943359 A 1 1 0 0 0 4.3378906 26.939453 L 4.3632812 26.931641 A 1 1 0 0 0 4.3691406 26.927734 L 7 26 L 5.5 24.5 L 4 23 z"></path>
                                            </svg>
                                        </button>

                                        {/* Archive / Activate */}
                                        <button
                                            onClick={() => handleToggleStatus(c)}
                                            className="h-8 w-8 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50"
                                            title={c.status === "ACTIVE" ? "Archive" : "Activate"}
                                        >
                                            {c.status === "ACTIVE" ? (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 text-gray-600"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                >
                                                    <path d="M20.54 5.23l-1.39-1.39C18.77 3.34 18.4 3 18 3H6c-.4 0-.77.34-1.15.84L3.46 5.23C3.18 5.5 3 5.9 3 6.31V8c0 .55.45 1 1 1v9c0 1.66 1.34 3 3 3h10c1.66 0 3-1.34 3-3V9c.55 0 1-.45 1-1V6.31c0-.41-.18-.81-.46-1.08zM12 17c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2zm6-9H6V7h12v1z"></path>
                                                </svg>
                                            ) : (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 text-green-600"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
                    <p>
                        Showing {(page - 1) * pageSize + 1}-
                        {Math.min(page * pageSize, filtered.length)} of {filtered.length}
                    </p>
                    <div className="flex space-x-1">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            Prev
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>

                {/* Modal */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent onClose={() => setOpen(false)}>
                        <DialogHeader>
                            <DialogTitle className="text-gray-700 text-sm">
                                {editCompany ? "Edit Insurance Company" : "Add Insurance Company"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                            {(Object.keys(form) as (keyof CompanyForm)[]).map((field) => (
                                <Input
                                    key={field}
                                    placeholder={field}
                                    value={form[field] ?? ""}
                                    onChange={(e) =>
                                        setForm({ ...form, [field]: e.target.value })
                                    }
                                    className="border-gray-300 text-sm"
                                />
                            ))}
                            <Button onClick={handleSave} variant="primary" size="sm">
                                {editCompany ? "Update" : "Save"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
