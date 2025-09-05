"use client";

import React, { useMemo, useState } from "react";
import { Inter } from "next/font/google";
import AdminLayout from "@/app/(admin)/layout";

const inter = Inter({ subsets: ["latin"] });

// ---------------- Lookup Options ----------------
const STATUS_OPTIONS = ["NEW", "PENDING", "COMPLETED"];

const PROCEDURE_OPTIONS = [
    { code: "4548-4", display: "HbA1c" },
    { code: "2093-3", display: "Cholesterol, Total" },
    { code: "718-7", display: "Hemoglobin" },
];

const DIAGNOSIS_OPTIONS = [
    { code: "E11.9", display: "Type 2 Diabetes Mellitus without complications" },
    { code: "I10", display: "Essential (primary) hypertension" },
    { code: "E78.5", display: "Hyperlipidemia, unspecified" },
];

// ---------------- Types ----------------
export type LabOrderDto = {
    id?: number;
    orderNumber?: string;
    procedureCode?: string;
    procedureDisplay?: string;
    diagnosisCode?: string;
    status?: string;
    orderDate?: string; // yyyy-MM-dd HH:mm
    result?: string;
};

// ---------------- Component ----------------
export default function LabOrderPage({ className = "" }) {
    const [items, setItems] = useState<LabOrderDto[]>([]);
    const [query, setQuery] = useState("");
    const [creating, setCreating] = useState<LabOrderDto>({ status: "NEW" });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [draft, setDraft] = useState<LabOrderDto | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    // ---------------- Local CRUD ----------------
    function createOne() {
        const newItem: LabOrderDto = { ...creating, id: Date.now() };
        setItems((prev) => [newItem, ...prev]);
        setCreating({ status: "NEW" });
        flashToast("✅ Lab order created (local only)");
    }

    function saveEdit() {
        if (!draft || !editingId) return;
        setItems((prev) => prev.map((it) => (it.id === editingId ? draft : it)));
        cancelEdit();
        flashToast("✅ Saved changes (local only)");
    }

    function removeOne(id?: number) {
        if (!id) return;
        setItems((prev) => prev.filter((it) => it.id !== id));
        flashToast("🗑️ Deleted (local only)");
    }

    function startEdit(item: LabOrderDto) {
        if (!item.id) return;
        setEditingId(item.id);
        setDraft({ ...item });
    }

    function cancelEdit() {
        setEditingId(null);
        setDraft(null);
    }

    function onDraftChange<K extends keyof LabOrderDto>(key: K, value: LabOrderDto[K]) {
        if (!draft) return;
        setDraft({ ...draft, [key]: value });
    }

    function flashToast(msg: string) {
        setToast(msg);
        setTimeout(() => setToast(null), 2000);
    }

    // ---------------- Filter ----------------
    const filtered = useMemo(() => {
        if (!query) return items;
        const q = query.toLowerCase();
        return items.filter((it) =>
            `${it.orderNumber || ""} ${it.procedureCode || ""} ${it.procedureDisplay || ""} ${
                it.diagnosisCode || ""
            } ${it.status || ""} ${it.result || ""}`
                .toLowerCase()
                .includes(q)
        );
    }, [items, query]);

    // ---------------- Render ----------------
    return (
        <AdminLayout>
            <div className={`${inter.className} ${className} max-w-7xl mx-auto p-4`}>
                <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Lab Orders</h1>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search (order #, procedure, diagnosis, status, result)"
                        className="w-full sm:w-80 rounded-xl border px-3 py-2 text-sm shadow-sm"
                    />
                </header>

                {toast && (
                    <div className="mb-3 rounded-xl bg-black/80 px-3 py-2 text-sm text-white shadow-lg">
                        {toast}
                    </div>
                )}

                {/* Quick Create Form */}
                <div className="mb-4 rounded-2xl border bg-white p-3 shadow-sm">
                    <div className="mb-2 text-sm font-medium text-gray-700">Quick create</div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-6">
                        <Field
                            label="Order #"
                            value={creating.orderNumber || ""}
                            onChange={(v: string) => setCreating((c) => ({ ...c, orderNumber: v }))}
                            placeholder="e.g. ORD-123"
                        />

                        <LookupField
                            label="Procedure code"
                            value={creating.procedureCode || ""}
                            onChange={(v: string) => {
                                const selected = PROCEDURE_OPTIONS.find((opt) => opt.code === v);
                                setCreating((c) => ({
                                    ...c,
                                    procedureCode: selected?.code,
                                    procedureDisplay: selected?.display,
                                }));
                            }}
                            options={PROCEDURE_OPTIONS}
                        />

                        <LookupField
                            label="Diagnosis code"
                            value={creating.diagnosisCode || ""}
                            onChange={(v: string) => {
                                const selected = DIAGNOSIS_OPTIONS.find((opt) => opt.code === v);
                                setCreating((c) => ({ ...c, diagnosisCode: selected?.code }));
                            }}
                            options={DIAGNOSIS_OPTIONS}
                        />

                        <DropdownField
                            label="Status"
                            value={creating.status || "NEW"}
                            onChange={(v: string) => setCreating((c) => ({ ...c, status: v }))}
                            options={STATUS_OPTIONS}
                        />

                        <Field
                            label="Result"
                            value={creating.result || ""}
                            onChange={(v: string) => setCreating((c) => ({ ...c, result: v }))}
                            placeholder="Result text"
                            textarea
                            className="md:col-span-2"
                        />

                        <Field
                            label="Order Date"
                            value={creating.orderDate || ""}
                            onChange={(v: string) =>
                                setCreating((c) => ({ ...c, orderDate: formatDateTime(v) }))
                            }
                            type="datetime-local"
                        />

                        <div className="flex items-end">
                            <button
                                onClick={createOne}
                                className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm text-white"
                            >
                                + Add
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                    <div className="grid grid-cols-12 border-b bg-gray-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                        <div className="col-span-2">Order #</div>
                        <div className="col-span-2">Procedure code</div>
                        <div className="col-span-2">Diagnosis code</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-3">Result</div>
                        <div className="col-span-1 text-right">Actions</div>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="px-3 py-6 text-sm text-gray-500">No lab orders found.</div>
                    ) : (
                        <ul className="divide-y">
                            {filtered.map((item) => (
                                <li
                                    key={item.id}
                                    className="grid grid-cols-12 items-start px-3 py-2 text-sm"
                                >
                                    {/* Order # */}
                                    <div className="col-span-2 pr-2">
                                        {item.orderNumber || "—"}
                                        <div className="mt-1 text-[11px] text-gray-500">
                                            {item.orderDate || ""}
                                        </div>
                                    </div>

                                    {/* Procedure */}
                                    <div className="col-span-2 pr-2">
                                        <span className="font-medium">{item.procedureDisplay || "—"}</span>{" "}
                                        {item.procedureCode && (
                                            <span className="text-gray-500">({item.procedureCode})</span>
                                        )}
                                    </div>

                                    {/* Diagnosis */}
                                    <div className="col-span-2 pr-2">
                                        {item.diagnosisCode || "—"}
                                        <div className="mt-1 text-[11px] text-gray-500">
                                            {item.status || ""}
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-2 pr-2">
                                        <Badge text={item.status || "—"} />
                                    </div>

                                    {/* Result */}
                                    <div className="col-span-3 pr-2 whitespace-pre-wrap">
                                        {item.result || "—"}
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-1 flex justify-end gap-2">
                                        <button
                                            onClick={() => startEdit(item)}
                                            className="rounded border px-3 py-1 text-xs"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => removeOne(item.id)}
                                            className="rounded border px-3 py-1 text-xs text-red-600"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Edit Form */}
                {editingId && draft && (
                    <div className="mt-4 rounded-2xl border bg-white p-4 shadow-sm">
                        <h3 className="mb-2 text-sm font-medium text-gray-700">Edit Lab Order</h3>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                            <Field
                                label="Order #"
                                value={draft.orderNumber || ""}
                                onChange={(v) => onDraftChange("orderNumber", v)}
                            />
                            <LookupField
                                label="Procedure code"
                                value={draft.procedureCode || ""}
                                onChange={(v) => {
                                    const sel = PROCEDURE_OPTIONS.find((opt) => opt.code === v);
                                    onDraftChange("procedureCode", sel?.code || "");
                                    onDraftChange("procedureDisplay", sel?.display || "");
                                }}
                                options={PROCEDURE_OPTIONS}
                            />
                            <LookupField
                                label="Diagnosis code"
                                value={draft.diagnosisCode || ""}
                                onChange={(v) => onDraftChange("diagnosisCode", v)}
                                options={DIAGNOSIS_OPTIONS}
                            />
                            <DropdownField
                                label="Status"
                                value={draft.status || "NEW"}
                                onChange={(v) => onDraftChange("status", v)}
                                options={STATUS_OPTIONS}
                            />
                        </div>
                        <Field
                            label="Result"
                            value={draft.result || ""}
                            onChange={(v) => onDraftChange("result", v)}
                            textarea
                            className="mt-2"
                        />
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={saveEdit}
                                className="rounded bg-green-600 px-4 py-2 text-sm text-white"
                            >
                                Save
                            </button>
                            <button
                                onClick={cancelEdit}
                                className="rounded bg-gray-400 px-4 py-2 text-sm text-white"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

// ---------------- Helpers ----------------
function formatDateTime(value: string) {
    if (!value) return "";
    return value.replace("T", " ").slice(0, 16);
}

function Field({
                   label,
                   value,
                   onChange,
                   placeholder,
                   type = "text",
                   textarea = false,
                   className = "",
               }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
    textarea?: boolean;
    className?: string;
}) {
    return (
        <label className={`flex flex-col ${className}`}>
            {label && <span className="mb-1 text-xs text-gray-600">{label}</span>}
            {textarea ? (
                <textarea
                    className="rounded-xl border px-3 py-2 text-sm shadow-sm"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            ) : (
                <input
                    type={type}
                    className="rounded-xl border px-3 py-2 text-sm shadow-sm"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            )}
        </label>
    );
}

function DropdownField({
                           label,
                           value,
                           onChange,
                           options,
                           className = "",
                       }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: string[];
    className?: string;
}) {
    return (
        <label className={`flex flex-col ${className}`}>
            {label && <span className="mb-1 text-xs text-gray-600">{label}</span>}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm shadow-sm"
            >
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </label>
    );
}

function LookupField({
                         label,
                         value,
                         onChange,
                         options,
                         className = "",
                     }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { code: string; display: string }[];
    className?: string;
}) {
    return (
        <label className={`flex flex-col ${className}`}>
            {label && <span className="mb-1 text-xs text-gray-600">{label}</span>}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm shadow-sm"
            >
                <option value="">Select…</option>
                {options.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                        {opt.display} ({opt.code})
                    </option>
                ))}
            </select>
        </label>
    );
}

function Badge({ text }: { text: string }) {
    const tone =
        text?.toLowerCase() === "completed"
            ? "bg-green-100 text-green-800"
            : text?.toLowerCase() === "pending"
                ? "bg-amber-100 text-amber-800"
                : "bg-gray-100 text-gray-800";
    return (
        <span className={`inline-flex rounded-full px-2 py-1 text-xs ${tone}`}>
      {text || "—"}
    </span>
    );
}
