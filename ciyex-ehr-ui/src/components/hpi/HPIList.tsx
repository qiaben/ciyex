"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, HpiDto } from "@/utils/types";
import HPIForm from "./HPIForm";

type Props = {
    patientId: number;
    encounterId: number;
};

export default function HPIList({ patientId, encounterId }: Props) {
    const [items, setItems] = useState<HpiDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<HpiDto | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            // GET /api/history-of-present-illness/{patientId}/{encounterId}
            const res = await fetchWithOrg(`/api/history-of-present-illness/${patientId}/${encounterId}`);
            const json = (await res.json()) as ApiResponse<HpiDto[]>;
            if (!res.ok || !json.success) throw new Error(json.message || "Load failed");
            setItems(json.data || []);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [patientId, encounterId]);

    function onSaved(saved: HpiDto) {
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
        if (!confirm("Delete this HPI entry?")) return;
        try {
            const res = await fetchWithOrg(`/api/history-of-present-illness/${patientId}/${encounterId}/${id}`, { method: "DELETE" });
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
                <h2 className="text-xl font-semibold">History of Present Illness (HPI)</h2>
                <button
                    onClick={() => { setEditing(null); setShowForm((s) => !s); }}
                    className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
                >
                    {showForm ? "Close" : "Add HPI"}
                </button>
            </div>

            {showForm && (
                <HPIForm
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
                <div className="rounded-xl border p-4 text-gray-600">No HPI entries yet.</div>
            )}

            <ul className="space-y-3">
                {sorted.map((hpi) => (
                    <li key={hpi.id} className="rounded-2xl border p-4 bg-white shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <p className="text-gray-900 whitespace-pre-wrap">{hpi.narrative}</p>
                                <p className="text-xs text-gray-500">
                                    {hpi.audit?.createdDate && <>Created: {hpi.audit.createdDate}</>}
                                    {hpi.audit?.lastModifiedDate && <> · Updated: {hpi.audit.lastModifiedDate}</>}
                                </p>
                                {/* Show structured fields if available */}
                                <div className="text-xs text-gray-600 space-x-2">
                                    {hpi.onset && <span><b>Onset:</b> {hpi.onset}</span>}
                                    {hpi.duration && <span><b>Duration:</b> {hpi.duration}</span>}
                                    {hpi.severity && <span><b>Severity:</b> {hpi.severity}</span>}
                                    {hpi.location && <span><b>Location:</b> {hpi.location}</span>}
                                    {hpi.character && <span><b>Character:</b> {hpi.character}</span>}
                                    {hpi.timing && <span><b>Timing:</b> {hpi.timing}</span>}
                                    {hpi.aggravatingFactors && <span><b>Aggravating:</b> {hpi.aggravatingFactors}</span>}
                                    {hpi.alleviatingFactors && <span><b>Alleviating:</b> {hpi.alleviatingFactors}</span>}
                                    {hpi.associatedSymptoms && <span><b>Assoc.:</b> {hpi.associatedSymptoms}</span>}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setEditing(hpi); setShowForm(true); }}
                                    className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => remove(hpi.id!)}
                                    className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                                >
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
