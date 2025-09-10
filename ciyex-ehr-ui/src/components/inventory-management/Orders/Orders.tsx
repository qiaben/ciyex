"use client";

import React, { useMemo, useState } from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/app/(admin)/layout";

/** Types */
type Order = {
    id: string;
    supplier: string;
    date: string; // ISO
    status: "Pending" | "Received" | "Cancelled";
    itemsCount: number;
    amount: number;
};

type Supplier = {
    id: string;
    name: string;
    contact: string;
    phone: string;
    email: string;
    rating: number;
};

/** Helpers */
const currency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

/** Seed */
const seedOrders: Order[] = [
    { id: "PO-1001", supplier: "MediSupply Co.", date: "2025-08-05", status: "Pending", itemsCount: 12, amount: 48500 },
    { id: "PO-1002", supplier: "HealthPro Distributors", date: "2025-08-12", status: "Received", itemsCount: 7, amount: 19250 },
    { id: "PO-1003", supplier: "Clinic Essentials", date: "2025-08-28", status: "Pending", itemsCount: 5, amount: 7600 },
];

const seedSuppliers: Supplier[] = [
    { id: "S-001", name: "MediSupply Co.", contact: "Rina Patel", phone: "+91 98765 00001", email: "sales@medisupply.co", rating: 5 },
    { id: "S-002", name: "HealthPro Distributors", contact: "Arun Kumar", phone: "+91 99223 00045", email: "contact@healthpro.in", rating: 4 },
    { id: "S-003", name: "Clinic Essentials", contact: "Farah Khan", phone: "+91 98111 22233", email: "orders@clinicessentials.in", rating: 4 },
];

/** UI primitives */
function TableShell({ children }: { children: React.ReactNode }) {
    return <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900">{children}</div>;
}
function Panel({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-none ${className}`}>
            {title && (
                <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                    <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</h3>
                </div>
            )}
            <div className="p-4">{children}</div>
        </div>
    );
}
function Pill({ children, tone = "neutral" as const }: { children: React.ReactNode; tone?: "neutral" | "warn" | "ok" | "danger" }) {
    const map: Record<string, string> = {
        neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
        warn: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
        ok: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
        danger: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200",
    };
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${map[tone]}`}>{children}</span>;
}

/** Component */
export default function Orders() {
    const [orders, setOrders] = useState<Order[]>(seedOrders);
    const [suppliers] = useState<Supplier[]>(seedSuppliers);
    const [createOpen, setCreateOpen] = useState(false);
    const [status, setStatus] = useState<string>("All");

    const filtered = useMemo(() => orders.filter((o) => status === "All" || o.status === status), [orders, status]);

    function createOrder(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const supplier = String(fd.get("supplier") || suppliers[0]?.name || "Unknown");
        const amount = Number(fd.get("amount") || 0);
        const itemsCount = Number(fd.get("itemsCount") || 1);
        const newOrder: Order = {
            id: `PO-${Math.floor(Math.random() * 9000) + 1000}`,
            supplier,
            date: new Date().toISOString().slice(0, 10),
            status: "Pending",
            itemsCount,
            amount,
        };
        setOrders((prev) => [newOrder, ...prev]);
        setCreateOpen(false);
    }

    return (
        <AdminLayout>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Orders
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                View and manage purchase orders, statuses, and receipts.
            </p>
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <Label className="text-sm text-slate-700 dark:text-slate-300">Status</Label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="h-9 w-40 rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                        <option value="All">All</option>
                        <option value="Pending">Pending</option>
                        <option value="Received">Received</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
                <div className="ml-auto">
                    <Button onClick={() => setCreateOpen(true)} className="rounded-2xl">
                        + Create Order
                    </Button>
                </div>
            </div>

            <TableShell>
                <table className="w-full table-auto text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr className="text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                        <th className="px-6 py-3">PO #</th>
                        <th className="px-6 py-3">Supplier</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Items</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.map((o) => (
                        <tr key={o.id} className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                            <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">{o.id}</td>
                            <td className="px-6 py-3 text-gray-700 dark:text-gray-200">{o.supplier}</td>
                            <td className="px-6 py-3 text-gray-700 dark:text-gray-200">{o.date}</td>
                            <td className="px-6 py-3"><Pill tone={o.status === "Cancelled" ? "danger" : o.status === "Pending" ? "warn" : "ok"}>{o.status}</Pill></td>
                            <td className="px-6 py-3 text-right text-gray-700 dark:text-gray-200">{o.itemsCount}</td>
                            <td className="px-6 py-3 text-right text-gray-700 dark:text-gray-200">{currency(o.amount)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </TableShell>

            {createOpen && (
                <Panel title="Create Purchase Order">
                    <form onSubmit={createOrder} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label className="dark:text-slate-300">Supplier</Label>
                                <select name="supplier" className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.name}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label className="dark:text-slate-300">Items Count</Label>
                                <Input name="itemsCount" type="number" min={1} defaultValue={1} className="dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                            </div>
                            <div className="sm:col-span-2">
                                <Label className="dark:text-slate-300">Amount (₹)</Label>
                                <Input name="amount" type="number" min={0} defaultValue={0} className="dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="button" onClick={() => setCreateOpen(false)} className="rounded-2xl">
                                Cancel
                            </Button>
                            <Button type="submit" className="rounded-2xl">
                                Create
                            </Button>
                        </div>
                    </form>
                </Panel>
            )}
        </div>
        </AdminLayout>
    );
}
