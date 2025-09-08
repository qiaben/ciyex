"use client";

import React from "react";
import AdminLayout from "@/app/(admin)/layout";

/** Types & Seed */
type Order = {
    id: string;
    supplier: string;
    date: string;
    status: "Pending" | "Received" | "Cancelled";
    itemsCount: number;
    amount: number;
};

const seedOrders: Order[] = [
    { id: "PO-1001", supplier: "MediSupply Co.", date: "2025-08-05", status: "Pending", itemsCount: 12, amount: 48500 },
    { id: "PO-1002", supplier: "HealthPro Distributors", date: "2025-08-12", status: "Received", itemsCount: 7, amount: 19250 },
    { id: "PO-1003", supplier: "Clinic Essentials", date: "2025-08-28", status: "Pending", itemsCount: 5, amount: 7600 },
];

/** UI */
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

/** Component */
export default function Records() {
    const trend = [
        { day: "Mon", stock: 820 },
        { day: "Tue", stock: 790 },
        { day: "Wed", stock: 770 },
        { day: "Thu", stock: 760 },
        { day: "Fri", stock: 740 },
        { day: "Sat", stock: 735 },
        { day: "Sun", stock: 730 },
    ];

    return (
        <AdminLayout>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Records
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Maintain records of past stock movements and audit history.
            </p>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Panel title="Weekly Stock Consumption">
                <SimpleBarChart data={trend} valueKey="stock" labelKey="day" />
            </Panel>
            <Panel title="Monthly Orders (count)">
                <SimpleBarChart data={[{ month: "Aug", value: seedOrders.length }]} valueKey="value" labelKey="month" />
            </Panel>
        </div>
        </AdminLayout>
    );
}
