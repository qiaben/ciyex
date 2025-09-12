
"use client";

import { useEffect, useState, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { fetchWithOrg } from "@/utils/fetchWithOrg";


type Encounter = {
    id: number;
    encounterDate?: string; // ISO
    visitCategory?: string;
    encounterProvider?: string;
    type?: string;
    sensitivity?: string;
    dischargeDisposition?: string;
    reasonForVisit?: string;
};

type ApiResponse<T> = { success: boolean; message?: string; data?: T };

const INITIAL_FORM = {
    visitCategory: "OPD",
    encounterProvider: "",
    type: "",
    sensitivity: "Normal",
    dischargeDisposition: "",
    reasonForVisit: "",
};

export default function EncounterTableExpandable({ patientId }: { patientId: number }) {
    const router = useRouter();

    const [rows, setRows] = useState<Encounter[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // New Encounter
    const [openNew, setOpenNew] = useState(false);
    const [newForm, setNewForm] = useState({ ...INITIAL_FORM });

    // Edit Encounter
    const [openEdit, setOpenEdit] = useState(false);
    const [editing, setEditing] = useState<Encounter | null>(null);

    const base = `/api/${patientId}/encounters`; // resolved by fetchWithOrg

    // ---- LOAD LIST ----
    async function load() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchWithOrg(base, { method: "GET" });
            const body: ApiResponse<Encounter[]> = await res.json();
            if (!res.ok || !body?.success) throw new Error(body?.message || `HTTP ${res.status}`);
            setRows((body.data ?? []).sort((a, b) => b.id - a.id));
        } catch (e: unknown) {
            setRows([]);
            setError(e instanceof Error ? e.message : "Failed to fetch encounters.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId]);

    // ---- CREATE ----
    async function createEncounter() {
        setSaving(true);
        setError(null);
        try {
            const res = await fetchWithOrg(base, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newForm),
            });
            const body: ApiResponse<Encounter> = await res.json();
            if (!res.ok || !body?.success) throw new Error(body?.message || `HTTP ${res.status}`);
            setOpenNew(false);
            setNewForm({ ...INITIAL_FORM });
            await load();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to create encounter.");
        } finally {
            setSaving(false);
        }
    }

    // ---- UPDATE ----
    async function updateEncounter() {
        if (!editing?.id) return;
        setSaving(true);
        setError(null);
        try {
            const res = await fetchWithOrg(`${base}/${editing.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editing),
            });
            const body: ApiResponse<Encounter> = await res.json();
            if (!res.ok || !body?.success) throw new Error(body?.message || `HTTP ${res.status}`);
            setOpenEdit(false);
            setEditing(null);
            await load();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to update encounter.");
        } finally {
            setSaving(false);
        }
    }

    // ---- DELETE ----
    async function deleteEncounter(id: number) {
        if (!confirm(`Delete encounter #${id}?`)) return;
        setSaving(true);
        setError(null);
        try {
            const res = await fetchWithOrg(`${base}/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await load();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to delete encounter.");
        } finally {
            setSaving(false);
        }
    }

    // Open edit modal when clicking anywhere on the row (except the action cell)
    function onRowClick(enc: Encounter) {
        setEditing({ ...enc });
        setOpenEdit(true);
    }

    // Prevent row-click when action buttons are used
    function stop(e: MouseEvent) {
        e.stopPropagation();
    }

    const newDisabled =
        !newForm.encounterProvider.trim() || !newForm.type.trim() || !newForm.reasonForVisit.trim();

    const editDisabled =
        !editing?.encounterProvider?.trim() ||
        !editing?.type?.trim() ||
        !editing?.reasonForVisit?.trim();

    return (
        <div className="bg-white border rounded-xl shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="text-sm font-semibold text-neutral-800">Encounters</h3>
                <button
                    onClick={() => setOpenNew(true)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                    + New Encounter
                </button>
            </div>

            {error && (
                <div className="px-4 py-2 text-sm text-red-700 bg-red-50 border-b border-red-200">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                    <tr>
                        <th className="px-3 py-2 text-left">ID</th>
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-left">Visit Category</th>
                        <th className="px-3 py-2 text-left">Provider</th>
                        <th className="px-3 py-2 text-left">Type</th>
                        <th className="px-3 py-2 text-left">Reason</th>
                        <th className="px-3 py-2 text-left w-36">Action</th>
                    </tr>
                    </thead>

                    <tbody className="divide-y">
                    {loading && (
                        <tr>
                            <td colSpan={7} className="px-3 py-6 text-center text-neutral-500">
                                Loading…
                            </td>
                        </tr>
                    )}

                    {!loading &&
                        rows.map((e) => (
                            <tr
                                key={e.id}
                                className="hover:bg-neutral-50 cursor-pointer"
                                onClick={() => onRowClick(e)}
                            >
                                <td className="px-3 py-2">{e.id}</td>
                                <td className="px-3 py-2">
                                    {e.encounterDate ? new Date(e.encounterDate).toLocaleString() : "-"}
                                </td>
                                <td className="px-3 py-2">{e.visitCategory || "-"}</td>
                                <td className="px-3 py-2">{e.encounterProvider || "-"}</td>
                                <td className="px-3 py-2">{e.type || "-"}</td>
                                <td className="px-3 py-2">{e.reasonForVisit || "-"}</td>

                                {/* ACTIONS */}
                                <td className="px-3 py-2" onClick={stop}>
                                    <div className="flex items-center gap-2">
                                        {/* (+) opens tabs page */}
                                        <button
                                            onClick={() =>
                                                router.push(`/patients/${patientId}/encounters/${e.id}`)
                                            }
                                            title="Open encounter tabs"
                                            className="h-7 w-7 grid place-items-center rounded-full border hover:bg-neutral-100"
                                        >
                                            +
                                        </button>

                                        {/* Delete (tailwind alternative styling) */}
                                        <button
                                            onClick={() => deleteEncounter(e.id)}
                                            className="px-2 py-1 rounded-lg border text-red-700 hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                    {!loading && rows.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-3 py-6 text-center text-neutral-500">
                                No encounters yet.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* -------- New Encounter (Tailwind modal) -------- */}
            {openNew && (
                <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-4">
                        <div className="text-lg font-semibold mb-3">New Encounter</div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="grid gap-1">
                                <span className="text-sm">Visit Category</span>
                                <select
                                    className="border rounded-lg px-3 py-2"
                                    value={newForm.visitCategory}
                                    onChange={(e) => setNewForm((f) => ({ ...f, visitCategory: e.target.value }))}
                                >
                                    <option value="OPD">OPD</option>
                                    <option value="IPD">IPD</option>
                                    <option value="ER">ER</option>
                                </select>
                            </label>

                            <label className="grid gap-1">
                <span className="text-sm">
                  Provider<span className="text-red-500">*</span>
                </span>
                                <input
                                    className="border rounded-lg px-3 py-2"
                                    placeholder='e.g. "Dr. Smith"'
                                    value={newForm.encounterProvider}
                                    onChange={(e) => setNewForm((f) => ({ ...f, encounterProvider: e.target.value }))}
                                />
                            </label>

                            <label className="grid gap-1">
                <span className="text-sm">
                  Type<span className="text-red-500">*</span>
                </span>
                                <input
                                    className="border rounded-lg px-3 py-2"
                                    placeholder="Consultation / Follow-up / Telehealth…"
                                    value={newForm.type}
                                    onChange={(e) => setNewForm((f) => ({ ...f, type: e.target.value }))}
                                />
                            </label>

                            <label className="grid gap-1">
                                <span className="text-sm">Sensitivity</span>
                                <select
                                    className="border rounded-lg px-3 py-2"
                                    value={newForm.sensitivity}
                                    onChange={(e) => setNewForm((f) => ({ ...f, sensitivity: e.target.value }))}
                                >
                                    <option value="Normal">Normal</option>
                                    <option value="Restricted">Restricted</option>
                                </select>
                            </label>

                            <label className="grid gap-1 md:col-span-2">
                                <span className="text-sm">Discharge Disposition</span>
                                <input
                                    className="border rounded-lg px-3 py-2"
                                    placeholder='e.g. "Home"'
                                    value={newForm.dischargeDisposition}
                                    onChange={(e) =>
                                        setNewForm((f) => ({ ...f, dischargeDisposition: e.target.value }))
                                    }
                                />
                            </label>

                            <label className="grid gap-1 md:col-span-2">
                <span className="text-sm">
                  Reason for Visit<span className="text-red-500">*</span>
                </span>
                                <textarea
                                    className="border rounded-lg px-3 py-2"
                                    rows={3}
                                    placeholder="General checkup"
                                    value={newForm.reasonForVisit}
                                    onChange={(e) =>
                                        setNewForm((f) => ({ ...f, reasonForVisit: e.target.value }))
                                    }
                                />
                            </label>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                className="px-3 py-1.5 rounded-lg bg-neutral-200 hover:bg-neutral-300"
                                onClick={() => setOpenNew(false)}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                                onClick={createEncounter}
                                disabled={saving || newDisabled}
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* -------- Edit Encounter (Tailwind modal) -------- */}
            {openEdit && editing && (
                <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-4">
                        <div className="text-lg font-semibold mb-3">Edit Encounter #{editing.id}</div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="grid gap-1">
                                <span className="text-sm">Visit Category</span>
                                <select
                                    className="border rounded-lg px-3 py-2"
                                    value={editing.visitCategory || ""}
                                    onChange={(e) =>
                                        setEditing((f) => (f ? { ...f, visitCategory: e.target.value } : f))
                                    }
                                >
                                    <option value="OPD">OPD</option>
                                    <option value="IPD">IPD</option>
                                    <option value="ER">ER</option>
                                </select>
                            </label>

                            <label className="grid gap-1">
                <span className="text-sm">
                  Provider<span className="text-red-500">*</span>
                </span>
                                <input
                                    className="border rounded-lg px-3 py-2"
                                    value={editing.encounterProvider || ""}
                                    onChange={(e) =>
                                        setEditing((f) => (f ? { ...f, encounterProvider: e.target.value } : f))
                                    }
                                />
                            </label>

                            <label className="grid gap-1">
                <span className="text-sm">
                  Type<span className="text-red-500">*</span>
                </span>
                                <input
                                    className="border rounded-lg px-3 py-2"
                                    value={editing.type || ""}
                                    onChange={(e) => setEditing((f) => (f ? { ...f, type: e.target.value } : f))}
                                />
                            </label>

                            <label className="grid gap-1">
                                <span className="text-sm">Sensitivity</span>
                                <select
                                    className="border rounded-lg px-3 py-2"
                                    value={editing.sensitivity || "Normal"}
                                    onChange={(e) =>
                                        setEditing((f) => (f ? { ...f, sensitivity: e.target.value } : f))
                                    }
                                >
                                    <option value="Normal">Normal</option>
                                    <option value="Restricted">Restricted</option>
                                </select>
                            </label>

                            <label className="grid gap-1 md:col-span-2">
                                <span className="text-sm">Discharge Disposition</span>
                                <input
                                    className="border rounded-lg px-3 py-2"
                                    value={editing.dischargeDisposition || ""}
                                    onChange={(e) =>
                                        setEditing((f) => (f ? { ...f, dischargeDisposition: e.target.value } : f))
                                    }
                                />
                            </label>

                            <label className="grid gap-1 md:col-span-2">
                <span className="text-sm">
                  Reason for Visit<span className="text-red-500">*</span>
                </span>
                                <textarea
                                    className="border rounded-lg px-3 py-2"
                                    rows={3}
                                    value={editing.reasonForVisit || ""}
                                    onChange={(e) =>
                                        setEditing((f) => (f ? { ...f, reasonForVisit: e.target.value } : f))
                                    }
                                />
                            </label>
                        </div>

                        <div className="mt-4 flex justify-between">
                            <button
                                className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200"
                                onClick={() => {
                                    setOpenEdit(false);
                                    setEditing(null);
                                }}
                                disabled={saving}
                            >
                                Close
                            </button>

                            <div className="flex gap-2">
                                <button
                                    className="px-3 py-1.5 rounded-lg border text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                        if (editing?.id) deleteEncounter(editing.id);
                                        setOpenEdit(false);
                                    }}
                                    disabled={saving}
                                >
                                    Delete
                                </button>
                                <button
                                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                                    onClick={updateEncounter}
                                    disabled={saving || editDisabled}
                                >
                                    {saving ? "Saving..." : "Update"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
