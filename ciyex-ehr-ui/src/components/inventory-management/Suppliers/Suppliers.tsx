"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/app/(admin)/layout";

/** Types & Seed */
type Supplier = {
    id: string;
    name: string;
    contact: string;
    phone: string;
    email: string;
    rating: number;
};

const seedSuppliers: Supplier[] = [
    { id: "S-001", name: "MediSupply Co.", contact: "Rina Patel", phone: "+91 98765 00001", email: "sales@medisupply.co", rating: 5 },
    { id: "S-002", name: "HealthPro Distributors", contact: "Arun Kumar", phone: "+91 99223 00045", email: "contact@healthpro.in", rating: 4 },
    { id: "S-003", name: "Clinic Essentials", contact: "Farah Khan", phone: "+91 98111 22233", email: "orders@clinicessentials.in", rating: 4 },
];

/** UI */
function TableShell({ children }: { children: React.ReactNode }) {
    return <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900">{children}</div>;
}
function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
            {title && (
                <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                    <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</h3>
                </div>
            )}
            <div className="p-4">{children}</div>
        </div>
    );
}

/** Component */
export default function Suppliers() {
    const [suppliers, setSuppliers] = useState<Supplier[]>(seedSuppliers);
    const [addOpen, setAddOpen] = useState(false);

    function addSupplier(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const s: Supplier = {
            id: `S-${Math.floor(Math.random() * 900 + 100)}`,
            name: String(fd.get("name") || "New Supplier"),
            contact: String(fd.get("contact") || ""),
            phone: String(fd.get("phone") || ""),
            email: String(fd.get("email") || ""),
            rating: Number(fd.get("rating") || 4),
        };
        setSuppliers((prev) => [s, ...prev]);
        setAddOpen(false);
    }

    return (
        <AdminLayout>
            <div className="p-6">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    Suppliers
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Manage supplier information, ratings, and contact details.
                </p>
            </div>
            <div className="space-y-4">
            <div className="flex items-center">
                <Button onClick={() => setAddOpen(true)} className="rounded-2xl">
                    + Add Supplier
                </Button>
            </div>

            <TableShell>
                <table className="w-full table-auto text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr className="text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Contact</th>
                        <th className="px-6 py-3">Phone</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Rating</th>
                    </tr>
                    </thead>
                    <tbody>
                    {suppliers.map((s) => (
                        <tr key={s.id} className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                            <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">{s.name}</td>
                            <td className="px-6 py-3 text-gray-700 dark:text-gray-200">{s.contact}</td>
                            <td className="px-6 py-3 text-gray-700 dark:text-gray-200">{s.phone}</td>
                            <td className="px-6 py-3 text-gray-700 dark:text-gray-200">{s.email}</td>
                            <td className="px-6 py-3 text-gray-700 dark:text-gray-200">{"★".repeat(s.rating)}{"☆".repeat(5 - s.rating)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </TableShell>

            {addOpen && (
                <Panel title="Add Supplier">
                    <form onSubmit={addSupplier} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label className="dark:text-slate-300">Name</Label>
                                <Input name="name" required className="dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                            </div>
                            <div>
                                <Label className="dark:text-slate-300">Contact</Label>
                                <Input name="contact" className="dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                            </div>
                            <div>
                                <Label className="dark:text-slate-300">Phone</Label>
                                <Input name="phone" className="dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                            </div>
                            <div>
                                <Label className="dark:text-slate-300">Email</Label>
                                <Input name="email" type="email" className="dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                            </div>
                            <div>
                                <Label className="dark:text-slate-300">Rating (1–5)</Label>
                                <Input name="rating" type="number" min={1} max={5} defaultValue={4} className="dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="button" onClick={() => setAddOpen(false)} className="rounded-2xl">
                                Cancel
                            </Button>
                            <Button type="submit" className="rounded-2xl">
                                Save Supplier
                            </Button>
                        </div>
                    </form>
                </Panel>
            )}
        </div>
        </AdminLayout>
    );
}
