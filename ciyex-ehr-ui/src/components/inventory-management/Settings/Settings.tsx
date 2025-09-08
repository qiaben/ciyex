"use client";

import React, { useState } from "react";
import Label from "@/components/form/Label";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/app/(admin)/layout";

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

function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label?: string }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"}`}
        >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${checked ? "translate-x-5" : "translate-x-1"}`} />
        </button>
    );
}

/** Component */
export default function Settings() {
    const [lowStockAlerts, setLowStockAlerts] = useState(true);
    const [autoReorder, setAutoReorder] = useState(false);
    const [threshold, setThreshold] = useState(10);

    return (
        <AdminLayout>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Inventory Settings
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Configure inventory thresholds, alerts, and auto-reorder rules.
            </p>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Panel title="Alerts & Notifications">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">Low Stock Alerts</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Notify when stock dips below minimum</div>
                        </div>
                        <Switch checked={lowStockAlerts} onChange={() => setLowStockAlerts(!lowStockAlerts)} label="Low Stock Alerts" />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">Auto-Reorder Suggestions</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Generate draft POs for critical items</div>
                        </div>
                        <Switch checked={autoReorder} onChange={() => setAutoReorder(!autoReorder)} label="Auto-Reorder Suggestions" />
                    </div>
                </div>
            </Panel>

            <Panel title="Thresholds">
                <div className="space-y-2">
                    <Label className="dark:text-slate-300">Critical Low (%)</Label>
                    <Input
                        type="number"
                        min={1}
                        max={50}
                        value={threshold}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setThreshold(Number(e.target.value))}
                        className="dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                    <div className="text-xs text-slate-500 dark:text-slate-400">Items below this percentage of minimum stock are marked “Critical”.</div>
                </div>
            </Panel>
        </div>
        </AdminLayout>
    );
}
