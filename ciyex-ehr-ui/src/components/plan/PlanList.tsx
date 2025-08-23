"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, PlanDto } from "@/utils/types";
import PlanForm from "./PlanForm";

type Props = {
    patientId: number;
    encounterId: number;
};

export default function PlanList({ patientId, encounterId }: Props) {
    const [items, setItems] = useState<PlanDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<PlanDto | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            // GET /api/plan/{patientId}/{encounterId}
            const res = await fetchWithOrg(`/api/plan/${patientId}/${encounterId}`);
            const json = (await res.json()) as ApiResponse<PlanDto[]>;
            if (!res.ok || !json.success) throw new Error(json.message || "Load failed");
            setItems(json.data || []);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [patientId, encounterId]);

    function onSaved(saved: PlanDto) {
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
        if (!confirm("Delete this plan?")) return;
        try {
            const res = await fetchWithOrg(`/api/plan/${patientId}/${encounterId}/${id}`, { method: "DELETE" });
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
                <h2 className="text-xl font-semibold">Plan</h2>
                <button
                    onClick={() => { setEditing(null); setShowForm((s) => !s); }}
                    className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
                >
                    {showForm ? "Close" : "Add Plan"}
                </button>
            </div>

            {showForm && (
                <PlanForm
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
                <div className="rounded-xl border p-4 text-gray-600">No plan recorded yet.</div>
            )}

            <ul className="space-y-3">
                {sorted.map((p) => (
                    <li key={p.id} className="rounded-2xl border p-4 bg-white shadow-sm">
                        <div className="space-y-2">
                            {p.planText && <p className="text-gray-900 whitespace-pre-wrap">{p.planText}</p>}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {p.medications && <div className="rounded-lg border p-3"><p className="font-medium">Medications</p><p className="text-sm whitespace-pre-wrap">{p.medications}</p></div>}
                                {p.labs && <div className="rounded-lg border p-3"><p className="font-medium">Labs</p><p className="text-sm whitespace-pre-wrap">{p.labs}</p></div>}
                                {p.imaging && <div className="rounded-lg border p-3"><p className="font-medium">Imaging</p><p className="text-sm whitespace-pre-wrap">{p.imaging}</p></div>}
                                {p.procedures && <div className="rounded-lg border p-3"><p className="font-medium">Procedures</p><p className="text-sm whitespace-pre-wrap">{p.procedures}</p></div>}
                                {p.referrals && <div className="rounded-lg border p-3"><p className="font-medium">Referrals</p><p className="text-sm whitespace-pre-wrap">{p.referrals}</p></div>}
                                {p.followUp && <div className="rounded-lg border p-3"><p className="font-medium">Follow‑Up</p><p className="text-sm whitespace-pre-wrap">{p.followUp}</p></div>}
                                {p.patientInstructions && <div className="rounded-lg border p-3 md:col-span-2"><p className="font-medium">Patient Instructions</p><p className="text-sm whitespace-pre-wrap">{p.patientInstructions}</p></div>}
                            </div>
                            <p className="text-xs text-gray-500">
                                {p.audit?.createdDate && <>Created: {p.audit.createdDate}</>}
                                {p.audit?.lastModifiedDate && <> · Updated: {p.audit.lastModifiedDate}</>}
                            </p>
                        </div>

                        <div className="mt-3 flex gap-2">
                            <button onClick={() => { setEditing(p); setShowForm(true); }} className="rounded-lg border px-3 py-1.5 hover:bg-gray-50">
                                Edit
                            </button>
                            <button onClick={() => remove(p.id!)} className="rounded-lg border px-3 py-1.5 hover:bg-gray-50">
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
