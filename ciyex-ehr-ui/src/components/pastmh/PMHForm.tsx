"use client";

import { useEffect, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, PastMedicalHistoryDto } from "@/utils/types";

type Props = {
    patientId: number;
    encounterId: number;
    editing?: PastMedicalHistoryDto | null;
    onSaved: (saved: PastMedicalHistoryDto) => void;
    onCancel?: () => void;
};

export default function PMHForm({ patientId, encounterId, editing, onSaved, onCancel }: Props) {
    const [condition, setCondition] = useState("");
    const [diagnosisDate, setDiagnosisDate] = useState("");
    const [status, setStatus] = useState("Active");
    const [notes, setNotes] = useState("");

    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        setCondition(editing?.condition ?? "");
        setDiagnosisDate((editing as any)?.diagnosisDate?.slice?.(0, 10) || editing?.diagnosisDate || "");
        setStatus(editing?.status ?? "Active");
        setNotes(editing?.notes ?? "");
    }, [editing]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);

        try {
            const body: PastMedicalHistoryDto = {
                patientId,
                encounterId,
                condition: condition.trim(),
                ...(diagnosisDate ? { diagnosisDate } : {}),
                ...(status ? { status } : {}),
                ...(notes ? { notes } : {}),
                ...(editing?.id ? { id: editing.id } : {}),
            };

            const url = editing?.id
                ? `/api/past-medical-history/${patientId}/${encounterId}/${editing.id}`
                : `/api/past-medical-history/${patientId}/${encounterId}`;

            const method = editing?.id ? "PUT" : "POST";

            const res = await fetchWithOrg(url, { method, body: JSON.stringify(body) });
            const json = (await res.json()) as ApiResponse<PastMedicalHistoryDto>;
            if (!res.ok || !json.success) throw new Error(json.message || "Save failed");

            onSaved(json.data!);
            if (!editing?.id) {
                setCondition(""); setDiagnosisDate(""); setStatus("Active"); setNotes("");
            }
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border p-4 shadow-sm bg-white">
            <h3 className="text-lg font-semibold">{editing?.id ? "Edit PMH Entry" : "Add PMH Entry"}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Condition</label>
                    <input
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        placeholder="e.g., Hypertension"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Diagnosis Date</label>
                    <input
                        type="date"
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={diagnosisDate}
                        onChange={(e) => setDiagnosisDate(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="Active">Active</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Unknown">Unknown</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                        className="w-full rounded-lg border px-3 py-2 focus:ring min-h-24"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional details"
                    />
                </div>
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}

            <div className="flex items-center gap-2">
                <button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60">
                    {saving ? "Saving..." : editing?.id ? "Update" : "Save"}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="rounded-xl border px-4 py-2 hover:bg-gray-50">
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
