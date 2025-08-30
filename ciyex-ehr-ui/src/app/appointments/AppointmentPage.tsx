"use client";

import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/app/(admin)/layout";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

// Types
export type AppointmentRow = {
    id: number;
    visitType: string;
    patientId: number;
    providerId: number;
    appointmentStartDate: string;
    appointmentEndDate: string;
    appointmentStartTime: string;
    appointmentEndTime: string;
    priority: string;
    locationId: number;
    status: string;
    reason: string;
};

interface Category {
    title: string;
    optionName: string;
}

// Constants
const PROVIDERS = ["All Providers", "Dr. Smith", "PA Jones"];

const INITIAL_DATA: AppointmentRow[] = [
    {
        id: 1,
        visitType: "Office Visit",
        patientId: 101,
        providerId: 201,
        appointmentStartDate: "2025-08-28",
        appointmentEndDate: "2025-08-28",
        appointmentStartTime: "09:00",
        appointmentEndTime: "09:30",
        priority: "Normal",
        locationId: 1,
        status: "Scheduled",
        reason: "Check-up",
    },
    {
        id: 2,
        visitType: "New Patient",
        patientId: 102,
        providerId: 202,
        appointmentStartDate: "2025-08-28",
        appointmentEndDate: "2025-08-28",
        appointmentStartTime: "10:00",
        appointmentEndTime: "10:45",
        priority: "High",
        locationId: 2,
        status: "Confirmed",
        reason: "Initial Consultation",
    },
];

// Helpers
const pad = (n: number) => n.toString().padStart(2, "0");
function formatToMMDDYYYY(iso: string): string {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
}
function parseMMDDYYYY(s: string): string | null {
    if (!s) return null;
    const parts = s.split("/");
    if (parts.length !== 3) return null;
    const [mmStr, ddStr, yyyyStr] = parts;
    const mm = parseInt(mmStr, 10);
    const dd = parseInt(ddStr, 10);
    const yyyy = parseInt(yyyyStr, 10);
    if (Number.isNaN(mm) || Number.isNaN(dd) || Number.isNaN(yyyy)) return null;
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
    const d = new Date(Date.UTC(yyyy, mm - 1, dd));
    if (d.getUTCFullYear() !== yyyy || d.getUTCMonth() !== mm - 1 || d.getUTCDate() !== dd) return null;
    return `${yyyy}-${pad(mm)}-${pad(dd)}`;
}
function timeFromMMDDYYYY(s: string, fallback: number): number {
    const iso = parseMMDDYYYY(s);
    return iso ? new Date(iso).getTime() : fallback;
}

export default function AppointmentPage() {
    const [category, setCategory] = useState<string>("");
    const [categories, setCategories] = useState<string[]>([]);
    const [provider, setProvider] = useState(PROVIDERS[0]);
    const [from, setFrom] = useState("08/28/2025");
    const [to, setTo] = useState("08/28/2025");
    const [patientId, setPatientId] = useState("");
    const [rows, setRows] = useState<AppointmentRow[]>(INITIAL_DATA);

    const filtered = useMemo(() => {
        const fromTime = timeFromMMDDYYYY(from, -Infinity);
        const toTime = timeFromMMDDYYYY(to, Infinity);

        return rows.filter((r) => {
            const d = new Date(r.appointmentStartDate).getTime();
            const matchDate = d >= fromTime && d <= toTime;
            const matchProvider = provider === "All Providers" ? true : true; // placeholder
            const matchCategory = category ? r.visitType === category : true;
            const matchPid = patientId ? String(r.patientId) === patientId.trim() : true;
            return matchDate && matchProvider && matchCategory && matchPid;
        });
    }, [rows, from, to, provider, category, patientId]);

    const total = filtered.length;

    const onFilter = () => {};
    const onRefresh = () => {
        setCategory("");
        setProvider(PROVIDERS[0]);
        setPatientId("");
        setRows([...INITIAL_DATA]);
    };
    const onPrint = () => window.print();
    const onKiosk = () => alert("Kiosk mode placeholder");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/list-options/list/Visit Type`
                );
                if (!res.ok) throw new Error("Failed to fetch categories");
                const data = await res.json();
                setCategories(data.map((c: Category) => c.title || c.optionName));
            } catch {
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    return (
        <AdminLayout>
            <div className="px-5 py-6 font-sans text-[15px] text-slate-800 dark:text-slate-100">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        Flow Board
                    </h1>
                    <div className="text-slate-700 dark:text-slate-300 text-sm">
                        <span className="italic font-semibold">Total appointments:</span> {total}
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="rounded-md border px-3 py-2 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700"
                        >
                            <option value="" disabled hidden>
                                Visit Categories
                            </option>
                            {categories.map((c) => (
                                <option key={c}>{c}</option>
                            ))}
                        </select>

                        <select
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            className="rounded-md border px-3 py-2 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700"
                        >
                            {PROVIDERS.map((p) => (
                                <option key={p}>{p}</option>
                            ))}
                        </select>

                        <input
                            placeholder="From (MM/DD/YYYY)"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="w-36 rounded-md border px-3 py-2 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700"
                        />
                        <input
                            placeholder="To (MM/DD/YYYY)"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="w-36 rounded-md border px-3 py-2 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700"
                        />

                        <input
                            placeholder="Patient ID"
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            className="w-32 rounded-md border px-3 py-2 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button onClick={onFilter} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                            Filter
                        </button>
                        <button onClick={() => alert("Settings placeholder")} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                            Setting
                        </button>
                        <button onClick={onRefresh} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                            Refresh
                        </button>
                        <button onClick={onPrint} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                            Print
                        </button>
                        <button onClick={onKiosk} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                            Kiosk
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                    <table className="min-w-[1300px] w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                            <th>ID</th>
                            <th>Patient ID</th>
                            <th>Provider ID</th>
                            <th>Visit Type</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Priority</th>
                            <th>Location ID</th>
                            <th>Status</th>
                            <th>Reason</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map((r) => (
                            <tr
                                key={r.id}
                                className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                <td className="px-3 py-2">{r.id}</td>
                                <td className="px-3 py-2">{r.patientId}</td>
                                <td className="px-3 py-2">{r.providerId}</td>
                                <td className="px-3 py-2">{r.visitType}</td>
                                <td className="px-3 py-2">{formatToMMDDYYYY(r.appointmentStartDate)}</td>
                                <td className="px-3 py-2">{formatToMMDDYYYY(r.appointmentEndDate)}</td>
                                <td className="px-3 py-2">{r.appointmentStartTime}</td>
                                <td className="px-3 py-2">{r.appointmentEndTime}</td>
                                <td className="px-3 py-2">{r.priority}</td>
                                <td className="px-3 py-2">{r.locationId}</td>
                                <td className="px-3 py-2">{r.status}</td>
                                <td className="px-3 py-2">{r.reason}</td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={15} className="px-3 py-6 text-center text-gray-500">
                                    No results
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
