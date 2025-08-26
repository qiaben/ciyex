"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, FamilyHistoryDto } from "@/utils/types";
import FHForm from "./FHForm";

type Props = {
    patientId: number;
    encounterId: number;
};

export default function FHList({ patientId, encounterId }: Props) {
    const [items, setItems] = useState<FamilyHistoryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<FamilyHistoryDto | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            // GET /api/family-history/{patientId}/{encounterId}
            const res = await fetchWithOrg(`/api/family-history/${patientId}/${encounterId}`);
            const json = (await res.json()) as ApiResponse<FamilyHistoryDto[]>;
            if (!res.ok || !json.success) throw new Error(json.message || "Load failed");
            setItems(json.data || []);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [patientId, encounterId]);

    function onSaved(saved: FamilyHistoryDto) {
        setShowForm(false);
        setEditing(null);
        setItems((prev) => {
            const i = prev.findIndex((x) => x.id === saved.id);
            if (i >= 0) {
                const copy = [...prev];
                copy[i] = saved;
                return copy;
            }
            return [saved, ...prev];
        });
    }

    async function remove(id: number) {
        if (!confirm("Delete this family history record?")) return;
        try {
            const res = await fetchWithOrg(`/api/family-history/${patientId}/${encounterId}/${id}`, { method: "DELETE" });
            const json = (await res.json()) as ApiResponse<void>;
            if (!res.ok || !json.success) throw new Error(json.message || "Delete failed");
            setItems((p) => p.filter((x) => x.id !== id));
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Something went wrong");
        }
    }

    const sorted = useMemo(() => {
        return [...items].sort((a, b) => {
            const d1 = a.audit?.lastModifiedDate || a.audit?.createdDate || "";
            const d2 = b.audit?.lastModifiedDate || b.audit?.createdDate || "";
            return d2.localeCompare(d1);
        });
    }, [items]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Family History (FH)</h2>
                <button
                    onClick={() => { setEditing(null); setShowForm((s) => !s); }}
                    className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
                >
                    {showForm ? "Close" : "Add FH"}
                </button>
            </div>

            {showForm && (
                <FHForm
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
                <div className="rounded-xl border p-4 text-gray-600">No family history yet.</div>
            )}

            <ul className="space-y-3">
                {sorted.map((fh) => (
                    <li key={fh.id} className="rounded-2xl border p-4 bg-white shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <p className="font-medium text-gray-900">
                                    {fh.relation}: {fh.condition}
                                    {typeof fh.ageOfOnset === "number" ? ` · Onset: ${fh.ageOfOnset}` : ""}
                                    {fh.status ? ` · ${fh.status}` : ""}
                                    {fh.hereditary ? " · Hereditary" : ""}
                                </p>
                                {fh.notes && <p className="text-gray-800 whitespace-pre-wrap">{fh.notes}</p>}
                                <p className="text-xs text-gray-500">
                                    {fh.audit?.createdDate && <>Created: {fh.audit.createdDate}</>}
                                    {fh.audit?.lastModifiedDate && <> · Updated: {fh.audit.lastModifiedDate}</>}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setEditing(fh); setShowForm(true); }} className="rounded-lg border px-3 py-1.5 hover:bg-gray-50">
                                    Edit
                                </button>
                                <button onClick={() => remove(fh.id!)} className="rounded-lg border px-3 py-1.5 hover:bg-gray-50">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
