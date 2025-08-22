"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, EncounterDto } from "@/utils/types";
import EncounterForm from "./EncounterForm";
import Link from "next/link";

type Props = {
    patientId: number;
};

export default function EncounterList({ patientId }: Props) {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<EncounterDto[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<EncounterDto | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            // assumes GET /api/encounters?patientId=...
            const res = await fetchWithOrg(`/api/encounters?patientId=${patientId}`, { method: "GET" });
            const json = (await res.json()) as ApiResponse<EncounterDto[]>;
            if (!res.ok || !json.success) throw new Error(json.message || "Load failed");
            setItems(json.data || []);
        } catch (e: any) {
            setError(e.message || "Error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); /* eslint-disable react-hooks/exhaustive-deps */ }, [patientId]);

    async function remove(id: number) {
        if (!confirm("Delete this encounter?")) return;
        const res = await fetchWithOrg(`/api/encounters/${id}`, { method: "DELETE" });
        const json = (await res.json()) as ApiResponse<void>;
        if (!res.ok || !json.success) {
            alert(json.message || "Delete failed");
            return;
        }
        setItems((p) => p.filter((x) => x.id !== id));
    }

    function onSaved(e: EncounterDto) {
        setShowForm(false);
        setEditing(null);
        setItems((prev) => {
            const i = prev.findIndex((x) => x.id === e.id);
            if (i >= 0) {
                const copy = [...prev];
                copy[i] = e;
                return copy;
            }
            return [e, ...prev];
        });
    }

    const sorted = useMemo(
        () =>
            [...items].sort((a, b) => {
                const d1 = a.audit?.lastModifiedDate || a.audit?.createdDate || a.encounterDate || "";
                const d2 = b.audit?.lastModifiedDate || b.audit?.createdDate || b.encounterDate || "";
                return d2.localeCompare(d1);
            }),
        [items]
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Encounters</h2>
                <button
                    onClick={() => { setEditing(null); setShowForm((s) => !s); }}
                    className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
                >
                    {showForm ? "Close" : "Add Encounter"}
                </button>
            </div>

            {showForm && (
                <EncounterForm patientId={patientId} editing={editing} onSaved={onSaved} onCancel={() => { setShowForm(false); setEditing(null); }} />
            )}

            {loading && <div className="text-gray-600">Loading...</div>}
            {error && <div className="text-red-600">{error}</div>}
            {!loading && !error && sorted.length === 0 && (
                <div className="rounded-xl border p-4 text-gray-600">No encounters yet.</div>
            )}

            <ul className="space-y-3">
                {sorted.map((e) => (
                    <li key={e.id} className="rounded-2xl border p-4 bg-white shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="font-medium">{e.encounterDate} · {e.status || "OPEN"}</p>
                                <p className="text-gray-700">{e.reason || "-"}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setEditing(e); setShowForm(true); }}
                                    className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => remove(e.id!)}
                                    className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                                >
                                    Delete
                                </button>
                                {/* Link to PMH for this encounter */}
                                <Link
                                    className="rounded-lg bg-gray-900 text-white px-3 py-1.5 hover:bg-black"
                                    href={`/patients/${e.patientId}/encounters/${e.id}/medical-history`}
                                >
                                    Medical History
                                </Link>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
