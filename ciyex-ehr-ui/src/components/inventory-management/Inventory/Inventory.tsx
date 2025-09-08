"use client";

import React, { useMemo, useState } from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/app/(admin)/layout";

/** Types */
type InventoryItem = {
    id: string;
    name: string;
    category: "Consumable" | "Device";
    lot?: string;
    expiry?: string; // ISO
    sku: string;
    stock: number;
    unit: string;
    minStock: number;
    location: string;
    status: "Active" | "Inactive";
};

/** Helpers */
const dateLabel = (iso?: string) => (iso && iso.trim().length ? iso : "—");

/** Seed */
const seedInventory: InventoryItem[] = [
    { id: "1", name: "Syringes 5ml", category: "Consumable", lot: "LOT-77821", expiry: "2025-10-20", sku: "SYR-5-500", stock: 540, unit: "pcs", minStock: 200, location: "Main", status: "Active" },
    { id: "2", name: "Insulin Pump", category: "Device", lot: "SN-44522", sku: "INS-PMP-110", stock: 8, unit: "pcs", minStock: 5, location: "Endocrine", status: "Active" },
    { id: "3", name: "Test Strips", category: "Consumable", lot: "LOT-99201", expiry: "2025-09-05", sku: "TST-STR-300", stock: 120, unit: "box", minStock: 100, location: "Outreach", status: "Active" },
    { id: "4", name: "Surgical Gloves (M)", category: "Consumable", lot: "LOT-GLV-001", expiry: "2025-12-31", sku: "GLV-M-001", stock: 1200, unit: "pair", minStock: 400, location: "Main", status: "Active" },
    { id: "5", name: "Surgical Masks", category: "Consumable", lot: "LOT-MSK-010", expiry: "2025-11-15", sku: "MSK-STD-010", stock: 350, unit: "box", minStock: 300, location: "Main", status: "Active" },
    { id: "6", name: "IV Set", category: "Device", lot: "SN-IV-200", sku: "IV-SET-200", stock: 95, unit: "pcs", minStock: 120, location: "Ward A", status: "Active" },
    { id: "7", name: "Hand Sanitizer 500ml", category: "Consumable", lot: "LOT-SAN-020", expiry: "2025-09-30", sku: "SAN-500-020", stock: 45, unit: "bottle", minStock: 80, location: "OPD", status: "Active" },
    { id: "8", name: "Thermal Paper Roll", category: "Consumable", lot: "LOT-THP-050", expiry: "2025-10-10", sku: "THP-ROL-050", stock: 18, unit: "roll", minStock: 25, location: "Radiology", status: "Inactive" },
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

function Info({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <div className="text-slate-500 dark:text-slate-400">{label}</div>
            <div className="font-medium text-slate-900 dark:text-slate-100">{value}</div>
        </div>
    );
}


/** Component */
export default function Inventory() {
    const [inventory, setInventory] = useState<InventoryItem[]>(seedInventory);
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<string>("All");
    const [type, setType] = useState<string>("All");
    const [expiry, setExpiry] = useState<string>("Any");
    const [addOpen, setAddOpen] = useState(false);
    const [selected, setSelected] = useState<InventoryItem | null>(null);

    const isExpired = (d?: string) => (d ? new Date(d) < new Date(new Date().toDateString()) : false);
    const isExpiringSoon = (d?: string) => {
        if (!d) return false;
        const today = new Date(new Date().toDateString());
        const soon = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        const dt = new Date(d);
        return dt >= today && dt <= soon;
    };

    const filtered = useMemo(() => {
        return inventory.filter((i) => {
            const q = query.toLowerCase();
            const matches = !q || `${i.name} ${i.sku} ${i.location} ${i.category} ${i.lot ?? ""}`.toLowerCase().includes(q);
            const st = status === "All" || i.status === status;
            const tp = type === "All" || i.category === (type as InventoryItem["category"]);
            let expCheck = true;
            if (expiry === "Expired") expCheck = isExpired(i.expiry);
            if (expiry === "Expiring Soon") expCheck = isExpiringSoon(i.expiry);
            return matches && st && tp && expCheck;
        });
    }, [inventory, query, status, type, expiry]);

    function addItem(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const item: InventoryItem = {
            id: String(Date.now()),
            name: String(form.get("name") || "New Item"),
            category: (String(form.get("category")) as InventoryItem["category"]) || "Consumable",
            lot: String(form.get("lot") || ""),
            expiry: String(form.get("expiry") || ""),
            sku: String(form.get("sku") || "SKU-NEW"),
            stock: Number(form.get("stock") || 0),
            unit: String(form.get("unit") || "pcs"),
            minStock: Number(form.get("minStock") || 0),
            location: String(form.get("location") || "Main"),
            status: (String(form.get("status")) as InventoryItem["status"]) || "Active",
        };
        setInventory((prev) => [item, ...prev]);
        setAddOpen(false);
    }

    return (
        <AdminLayout>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Inventory
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Manage stock items, expiry dates, and stock levels.
            </p>
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-end gap-3">
                <div>
                    <Label className="text-sm text-slate-700 dark:text-slate-300">Type</Label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="h-9 w-48 rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                        <option value="All">All</option>
                        <option value="Consumable">Consumable</option>
                        <option value="Device">Device</option>
                    </select>
                </div>
                <div>
                    <Label className="text-sm text-slate-700 dark:text-slate-300">Status</Label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="h-9 w-40 rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                        <option value="All">All</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
                <div>
                    <Label className="text-sm text-slate-700 dark:text-slate-300">Expiry</Label>
                    <select
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="h-9 w-44 rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                        <option value="Any">Any</option>
                        <option value="Expired">Expired</option>
                        <option value="Expiring Soon">Expiring Soon</option>
                    </select>
                </div>
                <div className="ml-auto">
                    <Input
                        className="w-72 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                        placeholder="Search items…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <div>
                    <Button onClick={() => setAddOpen(true)} className="rounded-2xl">
                        + Add Item
                    </Button>
                </div>
            </div>

            {/* Table */}
            <TableShell>
                <table className="w-full table-auto text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr className="text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                        <th className="px-6 py-3">Item</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Lot</th>
                        <th className="px-6 py-3">Expiry</th>
                        <th className="px-6 py-3 text-right">On Hand</th>
                        <th className="px-6 py-3">Clinic</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.map((i) => {
                        const pillTone = i.stock === 0 ? "danger" : i.stock <= i.minStock ? "warn" : "ok";
                        const pillText = i.stock === 0 ? "Out" : i.stock <= i.minStock ? "Low" : "OK";
                        return (
                            <tr key={i.id} className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                                <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">{i.name}</td>
                                <td className="px-6 py-3 text-gray-700 dark:text-gray-200">{i.category}</td>
                                <td className="px-6 py-3 text-gray-700 dark:text-gray-200">{i.lot || "—"}</td>
                                <td className="px-6 py-3 text-gray-700 dark:text-gray-200">{dateLabel(i.expiry)}</td>
                                <td className="px-6 py-3 text-right tabular-nums text-gray-700 dark:text-gray-200">{i.stock}</td>
                                <td className="px-6 py-3 text-gray-700 dark:text-gray-200">{i.location}</td>
                                <td className="px-6 py-3"><Pill tone={pillTone}>{pillText}</Pill>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <Button className="rounded-2xl px-3 py-1 text-xs" onClick={() => setSelected(i)}>
                                        Details
                                    </Button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </TableShell>

            {/* Details */}
            {selected && (
                <Panel title={`Item Details — ${selected.name}`}>
                    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                        <Info label="Category" value={selected.category} />
                        <Info label="SKU" value={selected.sku} />
                        <Info label="Lot" value={selected.lot || "—"} />
                        <Info label="Expiry" value={dateLabel(selected.expiry)} />
                        <Info label="On Hand" value={`${selected.stock} ${selected.unit}`} />
                        <Info label="Min. Required" value={String(selected.minStock)} />
                        <Info label="Clinic" value={selected.location} />
                        <Info label="Status" value={selected.status} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Button className="rounded-2xl" onClick={() => setSelected(null)}>
                            Close
                        </Button>
                        <Button className="rounded-2xl">Create Reorder</Button>
                    </div>
                </Panel>
            )}

            {/* Add form */}
            {addOpen && (
                <Panel title="Add Inventory Item">
                    <form onSubmit={addItem} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label className="dark:text-slate-300">Name</Label>
                                <Input name="name" required className="dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                            </div>
                            <div>
                                <Label className="dark:text-slate-300">Category</Label>
                                <select name="category" defaultValue="Consumable" className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                                    <option value="Consumable">Consumable</option>
                                    <option value="Device">Device</option>
                                </select>
                            </div>
                            <div>
                                <Label className="dark:text-slate-300">Lot</Label>
                                <Input name="lot" placeholder="LOT- / SN-" className="dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                            </div>
                            <div>
                                <Label className="dark:text-slate-300">Expiry</Label>
                                <Input name="expiry" type="date" className="dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                            </div>
                            <div>
                                <Label className="dark:text-slate-300">SKU</Label>
                                <Input name="sku" required className="dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                            </div>
                            <div>
                                <Label className="dark:text-slate-300">Unit</Label>
                                <Input name="unit" placeholder="pcs / box / pair" required className="dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                            </div>
                            <div>
                                <Label className="dark:text-slate-300">On Hand</Label>
                                <Input name="stock" type="number" min={0} required className="dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                            </div>
                            <div>
                                <Label className="dark:text-slate-300">Min. Required</Label>
                                <Input name="minStock" type="number" min={0} required className="dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                            </div>
                            <div>
                                <Label className="dark:text-slate-300">Clinic</Label>
                                <Input name="location" placeholder="Main" className="dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                            </div>
                            <div className="sm:col-span-2">
                                <Label className="dark:text-slate-300">Status</Label>
                                <select name="status" defaultValue="Active" className="mt-1 h-9 rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="button" onClick={() => setAddOpen(false)} className="rounded-2xl">
                                Cancel
                            </Button>
                            <Button type="submit" className="rounded-2xl">
                                Save Item
                            </Button>
                        </div>
                    </form>
                </Panel>
            )}
        </div>
        </AdminLayout>
    );
}
