"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, PatientMedicalHistoryDto } from "@/utils/types";
import PMHForm from "./PMHForm";

type Props = {
    patientId: number;
    encounterId: number;
};

export default function PMHList({ patientId, encounterId }: Props) {
    const [items, setItems] = useState<PatientMedicalHistoryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<PatientMedicalHistoryDto | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            // GET /api/patient-medical-history/{patientId}/{encounterId}
            const res = await fetchWithOrg(`/api/patient-medical-history/${patientId}/${encounterId}`);
            const json = (await res.json()) as ApiResponse<PatientMedicalHistoryDto[]>;
            if (!res.ok || !json.success) throw new Error(json.message || "Load failed");
            setItems(json.data || []);
        } catch (e: any) {
            setError(e.message || "Error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); /* eslint-disable react-hooks/exhaustive-deps */ }, [patientId, encounterId]);

    function onSaved(x: PatientMedicalHistoryDto) {
        setShowForm(false);
        setEditing(null);
        setItems((prev) => {
            const i = prev.findIndex((p) => p.id === x.id);
            if (i >= 0) {
                const copy = [...prev]; copy[i] = x; return copy;
            }
            return [x, ...prev];
        });
    }

    async function remove(id: number) {
        if (!confirm("Delete this entry?")) return;
        const res = await fetchWithOrg(`/api/patient-medical-history/${patientId}/${encounterId}/${id}`, { method: "DELETE" });
        const json = (await res.json()) as ApiResponse<void>;
        if (!res.ok || !json.success) { alert(json.message || "Delete failed"); return; }
        setItems((p) => p.filter((i) => i.id !== id));
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
                <h3 className="text-lg font-semibold">Patient Medical History</h3>
                <button
                    onClick={() => { setEditing(null); setShowForm((s) => !s); }}
                    className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
                >
                    {showForm ? "Close" : "Add History"}
                </button>
            </div>

            {showForm && (
                <PMHForm
                    patientId={patientId}
                    encounterId={encounterId}
                    editing={editing}
                    onSaved={onSaved}
                    onCancel={() => { setShowForm(false); setEditing(null); }}
                />
            )}

            {loading && <div className="text-gray-600">Loading...</div>}
            {error && <div className="text-red-600">{error}</div>}
            {!loading && !error && sorted.length === 0 && <div className="rounded-xl border p-4 text-gray-600">No history yet.</div>}

            <ul className="space-y-3">
                {sorted.map((it) => (
                    <li key={it.id} className="rounded-2xl border p-4 bg-white shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <p className="whitespace-pre-wrap text-gray-900">{it.description}</p>
                                <p className="text-xs text-gray-500">
                                    {it.audit?.createdDate && <>Created: {it.audit.createdDate}</>}
                                    {it.audit?.lastModifiedDate && <> · Updated: {it.audit.lastModifiedDate}</>}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setEditing(it); setShowForm(true); }} className="rounded-lg border px-3 py-1.5 hover:bg-gray-50">
                                    Edit
                                </button>
                                <button onClick={() => remove(it.id!)} className="rounded-lg border px-3 py-1.5 hover:bg-gray-50">
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
