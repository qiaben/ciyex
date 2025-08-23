"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, ChiefComplaintDto } from "@/utils/types";
import ChiefComplaintForm from "./ChiefComplaintForm";

type Props = {
    patientId: number;
    encounterId: number;
};

function fmtDate(d?: string | number[]) {
    if (!d) return "";
    if (Array.isArray(d)) {
        const [y, m, day, h = 0, min = 0] = d;
        const dt = new Date(Date.UTC(Number(y), Number(m) - 1, Number(day), Number(h), Number(min)));
        return dt.toISOString().slice(0, 10);
    }
    return (d as string).slice(0, 10);
}

export default function ChiefComplaintList({ patientId, encounterId }: Props) {
    const [items, setItems] = useState<ChiefComplaintDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<ChiefComplaintDto | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            // GET /api/chief-complaints/{patientId}/{encounterId}
            const res = await fetchWithOrg(`/api/chief-complaints/${patientId}/${encounterId}`, {
                method: "GET",
            });
            const json = (await res.json()) as ApiResponse<ChiefComplaintDto[]>;
            if (!res.ok || !json.success) throw new Error(json.message || "Load failed");
            setItems(json.data || []);
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Something went wrong");

    } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId, encounterId]);

    function onSaved(saved: ChiefComplaintDto) {
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
        if (!confirm("Delete this complaint?")) return;
        try {
            const res = await fetchWithOrg(
                `/api/chief-complaints/${patientId}/${encounterId}/${id}`,
                { method: "DELETE" }
            );
            const json = (await res.json()) as ApiResponse<void>;
            if (!res.ok || !json.success) throw new Error(json.message || "Delete failed");
            setItems((p) => p.filter((x) => x.id !== id));
        }catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Something went wrong");
        }
    }

    const sorted = useMemo(() => {
        return [...items].sort((a, b) => {
            const d1 = fmtDate(a.updatedAt) || fmtDate(a.createdAt) || "";
            const d2 = fmtDate(b.updatedAt) || fmtDate(b.createdAt) || "";
            return d2.localeCompare(d1);
        });
    }, [items]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Chief Complaint</h2>
                <button
                    onClick={() => {
                        setEditing(null);
                        setShowForm((s) => !s);
                    }}
                    className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
                >
                    {showForm ? "Close" : "Add CC"}
                </button>
            </div>

            {showForm && (
                <ChiefComplaintForm
                    patientId={patientId}
                    encounterId={encounterId}
                    editing={editing}
                    onSaved={onSaved}
                    onCancel={() => {
                        setShowForm(false);
                        setEditing(null);
                    }}
                />
            )}

            {loading && <div className="text-gray-600">Loading...</div>}
            {error && <div className="text-red-600">{error}</div>}
            {!loading && !error && sorted.length === 0 && (
                <div className="rounded-xl border p-4 text-gray-600">No chief complaints yet.</div>
            )}

            <ul className="space-y-3">
                {sorted.map((cc) => (
                    <li key={cc.id} className="rounded-2xl border p-4 bg-white shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <p className="font-medium text-gray-900">{cc.complaint}</p>
                                {cc.details && <p className="text-gray-700 whitespace-pre-wrap">{cc.details}</p>}
                                <p className="text-xs text-gray-500">
                                    {cc.createdAt && <>Created: {fmtDate(cc.createdAt)}</>}
                                    {cc.updatedAt && <> · Updated: {fmtDate(cc.updatedAt)}</>}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditing(cc);
                                        setShowForm(true);
                                    }}
                                    className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => remove(cc.id!)}
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
