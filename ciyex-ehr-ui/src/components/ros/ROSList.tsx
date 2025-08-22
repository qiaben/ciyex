"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, RosDto } from "@/utils/types";
import ROSForm from "./ROSForm";

type Props = {
    patientId: number;
    encounterId: number;
};

export default function ROSList({ patientId, encounterId }: Props) {
    const [items, setItems] = useState<RosDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<RosDto | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            // GET /api/review-of-systems/{patientId}/{encounterId}
            const res = await fetchWithOrg(`/api/review-of-systems/${patientId}/${encounterId}`);
            const json = (await res.json()) as ApiResponse<RosDto[]>;
            if (!res.ok || !json.success) throw new Error(json.message || "Load failed");
            setItems(json.data || []);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [patientId, encounterId]);

    function onSaved(saved: RosDto) {
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
        if (!confirm("Delete this ROS entry?")) return;
        try {
            const res = await fetchWithOrg(`/api/review-of-systems/${patientId}/${encounterId}/${id}`, { method: "DELETE" });
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
                <h2 className="text-xl font-semibold">Review of Systems (ROS)</h2>
                <button
                    onClick={() => { setEditing(null); setShowForm((s) => !s); }}
                    className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
                >
                    {showForm ? "Close" : "Add ROS"}
                </button>
            </div>

            {showForm && (
                <ROSForm
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
                <div className="rounded-xl border p-4 text-gray-600">No ROS entries yet.</div>
            )}

            <ul className="space-y-3">
                {sorted.map((ros) => (
                    <li key={ros.id} className="rounded-2xl border p-4 bg-white shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <p className="font-medium text-gray-900">
                                    {ros.system} · {ros.status}
                                </p>
                                {ros.finding && <p className="text-gray-800">Finding: {ros.finding}</p>}
                                {ros.notes && <p className="text-gray-700 whitespace-pre-wrap">{ros.notes}</p>}
                                <p className="text-xs text-gray-500">
                                    {ros.audit?.createdDate && <>Created: {ros.audit.createdDate}</>}
                                    {ros.audit?.lastModifiedDate && <> · Updated: {ros.audit.lastModifiedDate}</>}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setEditing(ros); setShowForm(true); }}
                                    className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => remove(ros.id!)}
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
