"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, AssignedProviderDto } from "@/utils/types";
import AssignedProviderForm from "./AssignedProviderForm";

type Props = { patientId: number; encounterId: number };

export default function AssignedProviderList({ patientId, encounterId }: Props) {
    const [items, setItems] = useState<AssignedProviderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<AssignedProviderDto | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            // GET /api/assigned-providers/{patientId}/{encounterId}
            const res = await fetchWithOrg(`/api/assigned-providers/${patientId}/${encounterId}`);
            const json = (await res.json()) as ApiResponse<AssignedProviderDto[]>;
            if (!res.ok || !json.success) throw new Error(json.message || "Load failed");
            setItems(json.data || []);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [patientId, encounterId]);

    function onSaved(saved: AssignedProviderDto) {
        setShowForm(false);
        setEditing(null);
        setItems((prev) => {
            const i = prev.findIndex((x) => x.id === saved.id);
            if (i >= 0) {
                const copy = [...prev]; copy[i] = saved; return copy;
            }
            return [saved, ...prev];
        });
    }

    async function remove(id: number) {
        if (!confirm("Remove this assignment?")) return;
        try {
            const res = await fetchWithOrg(`/api/assigned-providers/${patientId}/${encounterId}/${id}`, { method: "DELETE" });
            const json = (await res.json()) as ApiResponse<void>;
            if (!res.ok || !json.success) throw new Error(json.message || "Delete failed");
            setItems((p) => p.filter((x) => x.id !== id));
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Something went wrong");
        }
    }

    const sorted = useMemo(() => {
        // Show Primary & Attending first, then others by lastModified/created
        const rank: Record<string, number> = { Primary: 0, Attending: 1, Consultant: 2, Nurse: 3, Scribe: 4, Other: 5 };
        return [...items].sort((a, b) => {
            const r = (rank[a.role] ?? 9) - (rank[b.role] ?? 9);
            if (r !== 0) return r;
            const d1 = a.audit?.lastModifiedDate || a.audit?.createdDate || a.startDate || "";
            const d2 = b.audit?.lastModifiedDate || b.audit?.createdDate || b.startDate || "";
            return d2.localeCompare(d1);
        });
    }, [items]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Assigned Provider(s)</h2>
                <button
                    onClick={() => { setEditing(null); setShowForm((s) => !s); }}
                    className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
                >
                    {showForm ? "Close" : "Assign Provider"}
                </button>
            </div>

            {showForm && (
                <AssignedProviderForm
                    patientId={patientId}
                    encounterId={encounterId}
                    editing={editing}
                    onSaved={onSaved}
                    onCancel={() => { setShowForm(false); setEditing(null); }}
                />
            )}

            {loading && <div className="text-gray-600">Loading...</div>}
            {error && <div className="text-red-600">{error}</div>}
            {!loading && !error && sorted.length === 0 && (
                <div className="rounded-xl border p-4 text-gray-600">No providers assigned yet.</div>
            )}

            <ul className="space-y-3">
                {sorted.map((ap) => (
                    <li key={ap.id} className="rounded-2xl border p-4 bg-white shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <p className="font-medium text-gray-900">
                                    {ap.providerName ? `${ap.providerName}` : `Provider #${ap.providerId}`} · {ap.role}
                                </p>
                                <p className="text-sm text-gray-700">
                                    {ap.startDate ? `Start: ${ap.startDate}` : ""}
                                    {ap.endDate ? ` · End: ${ap.endDate}` : ""}
                                </p>
                                {ap.notes && <p className="text-gray-800 whitespace-pre-wrap">{ap.notes}</p>}
                                <p className="text-xs text-gray-500">
                                    {ap.audit?.createdDate && <>Created: {ap.audit.createdDate}</>}
                                    {ap.audit?.lastModifiedDate && <> · Updated: {ap.audit.lastModifiedDate}</>}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setEditing(ap); setShowForm(true); }}
                                    className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => remove(ap.id!)}
                                    className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
