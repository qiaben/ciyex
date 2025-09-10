"use client";

import React from "react";
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

/** Seed (same as your page) */
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

/** UI primitives (copied from your page) */
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

function SimpleBarChart<T extends Record<string, unknown>>({
                                                               data,
                                                               valueKey,
                                                               labelKey,
                                                           }: {
    data: T[];
    valueKey: keyof T & string;
    labelKey: keyof T & string;
}) {
    const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);

    return (
        <div className="space-y-3">
            {data.map((d, i) => {
                const v = Number(d[valueKey]) || 0;
                const pct = Math.round((v / max) * 100);
                return (
                    <div key={i}>
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>{String(d[labelKey])}</span>
                            <span className="tabular-nums">{v}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function MetricCard({ title, value, subtext, tone }: { title: string; value: string; subtext?: string; tone?: "warn" | "ok" }) {
    return (
        <Panel>
            <div className="text-sm text-slate-500 dark:text-slate-400">{title}</div>
            <div className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-100">{value}</div>
            {subtext && <div className={`mt-1 text-xs ${tone === "warn" ? "text-amber-600" : "text-slate-500 dark:text-slate-400"}`}>{subtext}</div>}
        </Panel>
    );
}

/** Component */
export default function Dashboard() {
    const totalSkus = seedInventory.length;
    const lowStock = seedInventory.filter((i) => i.stock <= i.minStock).length;
    const pendingOrders = seedOrders.filter((o) => o.status === "Pending").length;
    const suppliers = seedSuppliers.length;

    const ordersByMonth = [
        { month: "Mar", orders: 21 },
        { month: "Apr", orders: 25 },
        { month: "May", orders: 28 },
        { month: "Jun", orders: 22 },
        { month: "Jul", orders: 24 },
        { month: "Aug", orders: 31 },
    ];

    const stockHealth = [
        { label: "Adequate", value: 68 },
        { label: "Low", value: 22 },
        { label: "Critical", value: 10 },
    ];

    return (
        <AdminLayout>
            <div className="p-6">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    Inventory Dashboard
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Track stock, purchase orders, suppliers, and equipment upkeep.
                </p>
            </div>
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Total SKUs" value={String(totalSkus)} subtext="Tracked items" />
                <MetricCard title="Low / Critical" value={String(lowStock)} subtext="Needs restock" tone="warn" />
                <MetricCard title="Pending Orders" value={String(pendingOrders)} subtext="Awaiting receipt" />
                <MetricCard title="Suppliers" value={String(suppliers)} subtext="Active partners" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Panel title="Orders (Last 6 Months)" className="lg:col-span-2">
                    <SimpleBarChart data={ordersByMonth} valueKey="orders" labelKey="month" />
                    <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">Numbers represent order count per month.</div>
                </Panel>

                <Panel title="Stock Health">
                    <div className="space-y-2">
                        {stockHealth.map((s) => (
                            <div key={s.label} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`inline-block h-2 w-2 rounded-full ${s.label === "Critical" ? "bg-rose-500" : s.label === "Low" ? "bg-amber-500" : "bg-indigo-500"}`} />
                                    <span className="text-sm text-slate-600 dark:text-slate-300">{s.label}</span>
                                </div>
                                <Pill>{s.value}%</Pill>
                            </div>
                        ))}
                    </div>
                </Panel>
            </div>
        </div>
        </AdminLayout>
    );
}
