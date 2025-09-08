"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import AdminLayout from "@/app/(admin)/layout";

/** Types & Seed */
type MaintenanceTask = {
    id: string;
    equipment: string;
    dueDate: string; // ISO
    assignee: string;
    status: "Open" | "In Progress" | "Done";
};

const seedMaintenance: MaintenanceTask[] = [
    { id: "MT-01", equipment: "Autoclave #2", dueDate: "2025-09-10", assignee: "Facilities", status: "Open" },
    { id: "MT-02", equipment: "Refrigerator #1", dueDate: "2025-09-07", assignee: "BioMed", status: "In Progress" },
    { id: "MT-03", equipment: "X-Ray Machine", dueDate: "2025-09-20", assignee: "Vendor", status: "Open" },
];

/** UI */
function TableShell({ children }: { children: React.ReactNode }) {
    return <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900">{children}</div>;
}

function Pill({
                  children,
                  tone = "neutral",
              }: {
    children: React.ReactNode;
    tone?: "neutral" | "warn" | "ok";
}) {
    const map: Record<"neutral" | "warn" | "ok", string> = {
        neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
        warn: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
        ok: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
    };
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${map[tone]}`}>{children}</span>;
}

/** Component */
export default function Maintenance() {
    const [tasks, setTasks] = useState<MaintenanceTask[]>(seedMaintenance);

    function toggleStatus(id: string) {
        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: t.status === "Done" ? "Open" : "Done" } : t))
        );
    }

    return (
        <AdminLayout>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Maintenance
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Track scheduled maintenance and upkeep of equipment.
            </p>
        <div className="space-y-4">
            <TableShell>
                <table className="w-full table-auto text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr className="text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                        <th className="px-6 py-3">Equipment</th>
                        <th className="px-6 py-3">Due</th>
                        <th className="px-6 py-3">Assignee</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tasks.map((t) => (
                        <tr key={t.id} className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                            <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">{t.equipment}</td>
                            <td className="px-6 py-3 text-gray-700 dark:text-gray-200">{t.dueDate}</td>
                            <td className="px-6 py-3 text-gray-700 dark:text-gray-200">{t.assignee}</td>
                            <td className="px-6 py-3">
                                <Pill tone={t.status === "Done" ? "ok" : "warn"}>{t.status}</Pill>
                            </td>
                            <td className="px-6 py-3 text-right">
                                <Button onClick={() => toggleStatus(t.id)} className="rounded-2xl px-3 py-1 text-xs">
                                    {t.status === "Done" ? "Reopen" : "Mark Done"}
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </TableShell>
        </div>
        </AdminLayout>
    );
}
