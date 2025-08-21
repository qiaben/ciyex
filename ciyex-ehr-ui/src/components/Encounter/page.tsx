"use client";
import React, { useEffect, useMemo, useState } from "react";
import { X, Plus, Pencil, Trash2, RefreshCcw, Search } from "lucide-react";

// -----------------------------
// Types aligned with EncounterDto.java
// -----------------------------
export type Encounter = {
    id?: number;
    visitCategory?: string;
    encounterProvider?: string;
    type?: string;
    sensitivity?: string;
    dischargeDisposition?: string;
    reasonForVisit?: string;
    createdAt?: number;
    updatedAt?: number;
    orgId?: number;
    inCollection?: boolean;
};

// Small helper to get orgId from localStorage (your app already uses this pattern)
function getOrgId(): number | undefined {
    try {
        const raw = localStorage.getItem("orgId");
        if (!raw) return undefined;
        const n = Number(raw);
        return Number.isFinite(n) ? n : undefined;
    } catch {
        return undefined;
    }
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
    const orgId = getOrgId();
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(orgId ? { "X-Org-Id": String(orgId) } : {}),
        ...(init?.headers || {}),
    };
    const res = await fetch(url, { ...init, headers, cache: "no-store" });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
    }
    return res.json();
}

// The backend appears to wrap payloads as ApiResponse<T>
// We'll decode gracefully if it's wrapped, otherwise accept raw.
function unwrap<T>(data: any): T {
    if (data && typeof data === "object" && "data" in data && ("success" in data || "message" in data)) {
        return (data.data ?? null) as T;
    }
    return data as T;
}

// -----------------------------
// UI Primitives
// -----------------------------
function Button({ className = "", children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium shadow-sm border border-slate-200 hover:bg-slate-50 active:scale-[.99] transition ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={`w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
            {...props}
        />
    );
}

function Textarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            className={`w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
            {...props}
        />
    );
}

function Badge({ children }: { children: React.ReactNode }) {
    return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{children}</span>;
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b px-5 py-4">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100" aria-label="Close">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
            </div>
        </div>
    );
}

// -----------------------------
// Encounter Form
// -----------------------------
function EncounterForm({
                           initial,
                           onSubmit,
                           submitting,
                       }: {
    initial?: Partial<Encounter>;
    submitting?: boolean;
    onSubmit: (values: Encounter) => void;
}) {
    const [values, setValues] = useState<Encounter>(() => ({
        visitCategory: initial?.visitCategory || "",
        encounterProvider: initial?.encounterProvider || "",
        type: initial?.type || "",
        sensitivity: initial?.sensitivity || "",
        dischargeDisposition: initial?.dischargeDisposition || "",
        reasonForVisit: initial?.reasonForVisit || "",
        inCollection: initial?.inCollection ?? false,
        id: initial?.id,
        orgId: initial?.orgId,
    }));

    function update<K extends keyof Encounter>(key: K, v: Encounter[K]) {
        setValues((s) => ({ ...s, [key]: v }));
    }

    return (
        <form
            className="space-y-4"
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit(values);
            }}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium">Visit Category</label>
                    <Input value={values.visitCategory || ""} onChange={(e) => update("visitCategory", e.target.value)} placeholder="e.g., Outpatient / Inpatient" />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Encounter Provider</label>
                    <Input value={values.encounterProvider || ""} onChange={(e) => update("encounterProvider", e.target.value)} placeholder="e.g., Dr. Smith" />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Type</label>
                    <Input value={values.type || ""} onChange={(e) => update("type", e.target.value)} placeholder="e.g., Consultation, Follow-up" />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Sensitivity</label>
                    <Input value={values.sensitivity || ""} onChange={(e) => update("sensitivity", e.target.value)} placeholder="e.g., Normal / Confidential" />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Discharge Disposition</label>
                    <Input value={values.dischargeDisposition || ""} onChange={(e) => update("dischargeDisposition", e.target.value)} placeholder="e.g., Home, Transfer" />
                </div>
                <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium">Reason for Visit</label>
                    <Textarea rows={3} value={values.reasonForVisit || ""} onChange={(e) => update("reasonForVisit", e.target.value)} placeholder="Chief complaint / reason..." />
                </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
                <label className="inline-flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300"
                        checked={!!values.inCollection}
                        onChange={(e) => update("inCollection", e.target.checked)}
                    />
                    In Collections
                </label>
                {!!values.id && <Badge>Encounter ID: {values.id}</Badge>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
                <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                    {submitting ? "Saving..." : values.id ? "Update Encounter" : "Create Encounter"}
                </Button>
            </div>
        </form>
    );
}

// -----------------------------
// Main Page Component (list + create/edit modal)
// -----------------------------
export default function EncounterPage() {
    const [items, setItems] = useState<Encounter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Encounter | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((e) =>
            [
                e.visitCategory,
                e.encounterProvider,
                e.type,
                e.sensitivity,
                e.dischargeDisposition,
                e.reasonForVisit,
                String(e.id ?? ""),
            ]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q))
        );
    }, [items, query]);

    async function load() {
        try {
            setLoading(true);
            setError(null);
            // Try list endpoint – expecting ApiResponse<EncounterDto[]> or raw array
            const data = await api<any>("/api/encounters", { method: "GET" });
            const list = unwrap<Encounter[]>(data) || [];
            setItems(list);
        } catch (e: any) {
            setError(e?.message || "Failed to load encounters");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    function openCreate() {
        setEditing(null);
        setModalOpen(true);
    }
    function openEdit(row: Encounter) {
        setEditing(row);
        setModalOpen(true);
    }

    async function handleSave(values: Encounter) {
        setSubmitting(true);
        try {
            const payload = { ...values, orgId: getOrgId() };
            if (values.id) {
                const res = await api<any>(`/api/encounters/${values.id}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                });
                const updated = unwrap<Encounter>(res);
                setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
            } else {
                const res = await api<any>("/api/encounters", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                const created = unwrap<Encounter>(res);
                setItems((prev) => [created, ...prev]);
            }
            setModalOpen(false);
        } catch (e: any) {
            alert(e?.message || "Save failed");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(row: Encounter) {
        if (!row.id) return;
        if (!confirm(`Delete encounter #${row.id}?`)) return;
        try {
            await api(`/api/encounters/${row.id}`, { method: "DELETE" });
            setItems((prev) => prev.filter((i) => i.id !== row.id));
        } catch (e: any) {
            alert(e?.message || "Delete failed");
        }
    }

    return (
        <div className="mx-auto max-w-7xl p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Encounters</h1>
                    <p className="text-slate-600">Create, search, and manage patient encounters.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={load} className="bg-white"><RefreshCcw className="h-4 w-4" /> Refresh</Button>
                    <Button onClick={openCreate} className="bg-indigo-600 text-white hover:bg-indigo-700"><Plus className="h-4 w-4" /> New Encounter</Button>
                </div>
            </div>

            {/* Search */}
            <div className="mb-4 flex items-center gap-2">
                <div className="relative w-full sm:w-96">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search by provider, type, reason..."
                        className="pl-9"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="rounded-2xl border border-slate-200 bg-white">
                {loading ? (
                    <div className="p-10 text-center text-slate-500">Loading encounters…</div>
                ) : error ? (
                    <div className="p-10 text-center text-rose-600">{error}</div>
                ) : filtered.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">No encounters found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] table-auto text-left">
                            <thead>
                            <tr className="border-b bg-slate-50 text-sm">
                                <th className="px-4 py-3 font-medium">ID</th>
                                <th className="px-4 py-3 font-medium">Visit Category</th>
                                <th className="px-4 py-3 font-medium">Provider</th>
                                <th className="px-4 py-3 font-medium">Type</th>
                                <th className="px-4 py-3 font-medium">Sensitivity</th>
                                <th className="px-4 py-3 font-medium">Discharge</th>
                                <th className="px-4 py-3 font-medium">Reason</th>
                                <th className="px-4 py-3 font-medium">Collections</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.map((e) => (
                                <tr key={e.id} className="border-b last:border-none hover:bg-slate-50/60">
                                    <td className="px-4 py-3 text-sm text-slate-600">{e.id}</td>
                                    <td className="px-4 py-3 text-sm">{e.visitCategory || "—"}</td>
                                    <td className="px-4 py-3 text-sm">{e.encounterProvider || "—"}</td>
                                    <td className="px-4 py-3 text-sm">{e.type || "—"}</td>
                                    <td className="px-4 py-3 text-sm">{e.sensitivity || "—"}</td>
                                    <td className="px-4 py-3 text-sm">{e.dischargeDisposition || "—"}</td>
                                    <td className="px-4 py-3 text-sm max-w-[320px] truncate" title={e.reasonForVisit || ""}>{e.reasonForVisit || "—"}</td>
                                    <td className="px-4 py-3 text-sm">{e.inCollection ? <Badge>Yes</Badge> : <span className="text-slate-400">No</span>}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Button className="px-3 py-1" onClick={() => openEdit(e)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button className="px-3 py-1" onClick={() => handleDelete(e)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Encounter" : "New Encounter"}>
                <EncounterForm initial={editing ?? undefined} submitting={submitting} onSubmit={handleSave} />
            </Modal>
        </div>
    );
}
