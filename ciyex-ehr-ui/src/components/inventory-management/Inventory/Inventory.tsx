"use client";

import React, {useEffect, useMemo, useState} from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/app/(admin)/layout";
import {fetchWithAuth} from "@/utils/fetchWithAuth";
import Alert from "@/components/ui/alert/Alert";




const API_URL = process.env.NEXT_PUBLIC_API_URL!;


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
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<string>("All");
    const [type, setType] = useState<string>("All");
    const [expiry, setExpiry] = useState<string>("Any");
    const [addOpen, setAddOpen] = useState(false);
    const [selected, setSelected] = useState<InventoryItem | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);


    // ✅ Alert state
    const [alertData, setAlertData] = useState<{
        variant: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
    } | null>(null);

    // ✅ Auto-dismiss after 4s
    useEffect(() => {
        if (alertData) {
            const timer = setTimeout(() => setAlertData(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [alertData]);




    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await fetchWithAuth(
                    `${API_URL}/api/inventory?page=${currentPage - 1}&size=${pageSize}`
                );
                const json = await res.json();
                if (res.ok && json.success && json.data?.content) {
                    const items: InventoryItem[] = json.data.content.map((d: Record<string, unknown>) => ({
                        id: String(d.id),
                        name: d.name,
                        category: d.category,
                        lot: d.lot ?? undefined,
                        expiry: d.expiry ?? undefined,
                        sku: d.sku,
                        stock: d.stock,
                        unit: d.unit,
                        minStock: d.minStock,
                        location: d.location,
                        status: d.status,
                    }));
                    setInventory(items);
                    setTotalPages(json.data.totalPages);
                    setTotalItems(json.data.totalElements);
                } else {
                    setInventory([]);
                }
            } catch (err) {
                console.error("Failed to fetch inventory:", err);
                setInventory([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [currentPage, pageSize]);



    // Load items from backend
        useEffect(() => {
            (async () => {
                try {
                    const res = await fetchWithAuth(`${API_URL}/api/inventory/list`);
                    const json = await res.json();
                    if (res.ok && json.success && Array.isArray(json.data)) {
                        const items: InventoryItem[] = json.data.map((d: Record<string, unknown>) => ({                            id: String(d.id),
                            name: d.name,
                            category: d.category,
                            lot: d.lot ?? undefined,
                            expiry: d.expiry ?? undefined,
                            sku: d.sku,
                            stock: d.stock,
                            unit: d.unit,
                            minStock: d.minStock,
                            location: d.location,
                            status: d.status,
                        }));
                        setInventory(items);
                    }
                } catch (err) {
                    console.error("Failed to fetch inventory:", err);
                }
            })();
        }, []);


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

    async function addItem(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);

        const dto = {
            name: String(form.get("name") || "New Item"),
            category: (String(form.get("category")) as InventoryItem["category"]) || "Consumable",
            lot: (String(form.get("lot") || "").trim() || undefined),
            expiry: (String(form.get("expiry") || "").trim() || undefined),
            sku: String(form.get("sku") || "SKU-NEW"),
            stock: Number(form.get("stock") || 0),
            unit: String(form.get("unit") || "pcs"),
            minStock: Number(form.get("minStock") || 0),
            location: String(form.get("location") || "Main"),
            status: (String(form.get("status")) as InventoryItem["status"]) || "Active",
        };

        try {
            const res = await fetchWithAuth(`${API_URL}/api/inventory`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dto),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Failed to create");

            const created = json.data;
            const uiItem: InventoryItem = {
                id: String(created.id),
                name: created.name,
                category: created.category,
                lot: created.lot ?? undefined,
                expiry: created.expiry ?? undefined,
                sku: created.sku,
                stock: created.stock,
                unit: created.unit,
                minStock: created.minStock,
                location: created.location,
                status: created.status,
            };

            setInventory(prev => [uiItem, ...prev]);
            setAddOpen(false);

            // ✅ Success alert
            setAlertData({
                variant: "success",
                title: "Item Added",
                message: `${created.name} was added successfully.`,
            });
        } catch (err) {
            console.error("Create inventory failed:", err);
            // ✅ Error alert
            setAlertData({
                variant: "error",
                title: "Error",
                message: "Failed to add inventory item.",
            });
        }
    }

    async function editItem(id: string, updates: Partial<InventoryItem>) {
        try {
            const res = await fetchWithAuth(`${API_URL}/api/inventory/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Failed");

            const updated = json.data;
            setInventory(prev =>
                prev.map(i => (i.id === id ? { ...i, ...updated } : i))
            );
            setSelected(null);

            // ✅ Success alert
            setAlertData({
                variant: "success",
                title: "Item Updated",
                message: `${updated.name} was updated successfully.`,
            });
        } catch (err) {
            console.error("Edit failed:", err);

            // ✅ Error alert
            setAlertData({
                variant: "error",
                title: "Error",
                message: "Failed to update inventory item.",
            });
        }
    }

    async function deleteItem(id: string) {
        if (!confirm("Are you sure you want to delete this item?")) {
            return;
        }

        try {
            const res = await fetchWithAuth(`${API_URL}/api/inventory/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Failed");

            setInventory(prev => prev.filter(i => i.id !== id));
            setSelected(null);

            // ✅ Success alert
            setAlertData({
                variant: "success",
                title: "Item Deleted",
                message: "The inventory item was deleted successfully.",
            });
        } catch (err) {
            console.error("Delete failed:", err);

            // ✅ Error alert
            setAlertData({
                variant: "error",
                title: "Error",
                message: "Failed to delete inventory item.",
            });
        }
    }


    return (
        <AdminLayout>
            <div className="container mx-auto p-6 overflow-x-hidden text-gray-800 dark:text-gray-200">
                {/* ✅ Alert at the top */}
                {alertData && (
                    <div className="mb-4">
                        <Alert
                            variant={alertData.variant}
                            title={alertData.title}
                            message={alertData.message}
                        />
                    </div>
                )}
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
                    <Button
                        onClick={() => setAddOpen(true)}
                        className="w-30 h-10 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
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
                                    <Button
                                        className="rounded-2xl px-3 py-1 text-xs"
                                        onClick={() => {
                                            setSelected(i);
                                            setEditMode(false);   // ✅ reset editMode when opening
                                        }}
                                    >
                                        Details
                                    </Button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </TableShell>

            {/* Pagenation*/}
            <div className="mt-3 flex items-center justify-between px-3 py-2 border-t bg-white dark:bg-gray-900 dark:border-gray-700 text-sm">
                <div className="flex items-center gap-3">
                    <button
                        disabled={currentPage === 1 || loading}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1.5 border rounded disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800"
                    >
                        Prev
                    </button>
                    <div>Page {currentPage} of {totalPages}</div>
                    <button
                        disabled={currentPage === totalPages || loading}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="px-3 py-1.5 border rounded disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800"
                    >
                        Next
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <div>Showing {loading ? "…" : inventory.length} of {totalItems}</div>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="border rounded px-3 py-1.5 bg-white dark:bg-gray-800 dark:border-gray-600 text-sm"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>


            {/* Details Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">

                        {/* Header */}
                        <div className="flex items-start justify-between px-6 py-4 border-b dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Item Details — {selected.name}
                            </h3>
                            <button
                                onClick={() => {
                                    setSelected(null);
                                    setEditMode(false);
                                }}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 max-h-[70vh] overflow-y-auto text-sm">
                            {editMode ? (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const form = new FormData(e.currentTarget);
                                        editItem(selected!.id, {
                                            name: String(form.get("name")),
                                            category: form.get("category") as "Consumable" | "Device",
                                            lot: String(form.get("lot") || ""),
                                            expiry: String(form.get("expiry") || ""),
                                            sku: String(form.get("sku") || ""),
                                            stock: Number(form.get("stock") || 0),
                                            unit: String(form.get("unit") || ""),
                                            minStock: Number(form.get("minStock") || 0),
                                            location: String(form.get("location") || ""),
                                            status: form.get("status") as "Active" | "Inactive",
                                        });
                                    }}
                                    className="grid grid-cols-1 gap-6 sm:grid-cols-2"
                                >
                                    <div>
                                        <Label>Name</Label>
                                        <Input name="name" defaultValue={selected.name} className="h-10" />
                                    </div>
                                    <div>
                                        <Label>Category</Label>
                                        <select
                                            name="category"
                                            defaultValue={selected.category}
                                            className="h-10 w-full rounded-md border px-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                        >
                                            <option value="Consumable">Consumable</option>
                                            <option value="Device">Device</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label>Lot</Label>
                                        <Input name="lot" defaultValue={selected.lot} className="h-10" />
                                    </div>
                                    <div>
                                        <Label>Expiry</Label>
                                        <Input type="date" name="expiry" defaultValue={selected.expiry} className="h-10" />
                                    </div>
                                    <div>
                                        <Label>SKU</Label>
                                        <Input name="sku" defaultValue={selected.sku} className="h-10" />
                                    </div>
                                    <div>
                                        <Label>Stock</Label>
                                        <Input type="number" name="stock" defaultValue={selected.stock} className="h-10" />
                                    </div>
                                    <div>
                                        <Label>Unit</Label>
                                        <Input name="unit" defaultValue={selected.unit} className="h-10" />
                                    </div>
                                    <div>
                                        <Label>Min. Required</Label>
                                        <Input type="number" name="minStock" defaultValue={selected.minStock} className="h-10" />
                                    </div>
                                    <div>
                                        <Label>Clinic</Label>
                                        <Input name="location" defaultValue={selected.location} className="h-10" />
                                    </div>
                                    <div>
                                        <Label>Status</Label>
                                        <select
                                            name="status"
                                            defaultValue={selected.status}
                                            className="h-10 w-full rounded-md border px-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>

                                    <div className="col-span-2 flex gap-2 mt-4">
                                        <Button type="button" onClick={() => setEditMode(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">Save Changes</Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <Info label="Name" value={selected.name} />
                                    <Info label="Category" value={selected.category} />
                                    <Info label="Lot" value={selected.lot || "—"} />
                                    <Info label="Expiry" value={dateLabel(selected.expiry)} />
                                    <Info label="SKU" value={selected.sku} />
                                    <Info label="Stock" value={selected.stock} />
                                    <Info label="Unit" value={selected.unit} />
                                    <Info label="Min. Required" value={String(selected.minStock)} />
                                    <Info label="Clinic" value={selected.location} />
                                    <Info label="Status" value={selected.status} />
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t dark:border-gray-700">
                            <Button
                                onClick={() => {
                                    setSelected(null);
                                    setEditMode(false);   // ✅ reset editMode when closing
                                }}
                            >
                                Close
                            </Button>
                            {!editMode && (
                                <Button onClick={() => setEditMode(true)}>Edit</Button>
                            )}
                            <Button className="rounded-2xl">Create Reorder</Button>
                            <Button
                                className="rounded-2xl bg-rose-600 text-white hover:bg-rose-700"
                                onClick={() => setDeleteTarget(selected)}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}



            {/* Add form */}
            {addOpen && (
                <Panel title="Add Inventory Item">
                    <form onSubmit={addItem} className="grid grid-cols-1 gap-6 sm:grid-cols-2 text-sm">
                        <div>
                            <Label className="dark:text-slate-300">Name</Label>
                            <Input name="name" required className="h-10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                        </div>
                        <div>
                            <Label className="dark:text-slate-300">Category</Label>
                            <select
                                name="category"
                                defaultValue="Consumable"
                                className="h-10 w-full rounded-md border border-slate-300 px-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            >
                                <option value="Consumable">Consumable</option>
                                <option value="Device">Device</option>
                            </select>
                        </div>

                        <div>
                            <Label className="dark:text-slate-300">Lot</Label>
                            <Input name="lot" placeholder="LOT- / SN-" className="h-10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                        </div>
                        <div>
                            <Label className="dark:text-slate-300">Expiry</Label>
                            <Input name="expiry" type="date" className="h-10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                        </div>

                        <div>
                            <Label className="dark:text-slate-300">SKU</Label>
                            <Input name="sku" required className="h-10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                        </div>
                        <div>
                            <Label className="dark:text-slate-300">Unit</Label>
                            <Input name="unit" placeholder="pcs / box / pair" required className="h-10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                        </div>

                        <div>
                            <Label className="dark:text-slate-300">On Hand</Label>
                            <Input name="stock" type="number" min={0} required className="h-10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                        </div>
                        <div>
                            <Label className="dark:text-slate-300">Min. Required</Label>
                            <Input name="minStock" type="number" min={0} required className="h-10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                        </div>

                        <div>
                            <Label className="dark:text-slate-300">Clinic</Label>
                            <Input name="location" placeholder="Main" className="h-10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                        </div>
                        <div>
                            <Label className="dark:text-slate-300">Status</Label>
                            <select
                                name="status"
                                defaultValue="Active"
                                className="h-10 w-full rounded-md border border-slate-300 px-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="col-span-2 flex items-center gap-2 mt-4">
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

            {/* ✅ Delete confirmation modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Delete Item
                        </h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            Are you sure you want to delete{" "}
                            <span className="font-medium">{deleteTarget.name}</span>?
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setDeleteTarget(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-rose-600 text-white hover:bg-rose-700"
                                onClick={async () => {
                                    await deleteItem(deleteTarget.id);
                                    setDeleteTarget(null);
                                }}
                            >
                                Yes, Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
            </div>
        </AdminLayout>
    );
}
