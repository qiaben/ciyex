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

// 🔹 Strongly typed form
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
            <div className="p-3 space-y-3">
                {/* Search & Add Row */}
                <div className="flex justify-between items-center">
                    <Input
                        placeholder="Search companies..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border-gray-300 w-64 text-sm"
                    />
                    <Button onClick={openAddModal} variant="primary" size="sm">
                        + Add Insurance
                    </Button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
                    {loading ? (
                        <p className="p-4 text-gray-500 text-sm">
                            Loading insurance companies...
                        </p>
                    ) : (
                        <table className="w-full text-xs">
                            <thead>
                            <tr className="bg-gray-50 text-left text-gray-600 text-sm">
                                <th className="p-2">Payer ID</th>
                                <th className="p-2">Name</th>
                                <th className="p-2">Address</th>
                                <th className="p-2">City</th>
                                <th className="p-2">State</th>
                                <th className="p-2">Postal Code</th>
                                <th className="p-2">Country</th>
                                <th className="p-2">Status</th>
                                <th className="p-2">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginated.map((c) => (
                                <tr key={c.id} className="hover:bg-blue-50 text-gray-700">
                                    <td className="p-2">{c.payerId || "-"}</td>
                                    <td className="p-2 font-medium">{c.name}</td>
                                    <td className="p-2">{c.address}</td>
                                    <td className="p-2">{c.city}</td>
                                    <td className="p-2">{c.state}</td>
                                    <td className="p-2">{c.postalCode}</td>
                                    <td className="p-2">{c.country}</td>
                                    <td className="p-2">
                                        {c.status === "ACTIVE" ? (
                                            <span className="px-1.5 py-0.5 text-[11px] rounded-full bg-green-100 text-green-700 font-medium flex items-center gap-1 w-fit">
                          <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-3 h-3"
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
                                            <span className="px-1.5 py-0.5 text-[11px] rounded-full bg-gray-200 text-gray-600 font-medium flex items-center gap-1 w-fit">
                          <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-3 h-3"
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
                                    <td className="p-2 flex space-x-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEditModal(c)}
                                            startIcon={
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-3 h-3 text-blue-600"
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
                                            }
                                        >
                                            <span className="sr-only">Edit</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleToggleStatus(c)}
                                            startIcon={
                                                c.status === "ACTIVE" ? (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="w-3 h-3 text-gray-600"
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
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="w-3 h-3 text-green-600"
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
                                                )
                                            }
                                        >
                        <span className="sr-only">
                          {c.status === "ACTIVE" ? "Archive" : "Activate"}
                        </span>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-3 text-xs text-gray-600">
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
                            ← Prev
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Next →
                        </Button>
                    </div>
                </div>

                {/* Modal */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent>
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
