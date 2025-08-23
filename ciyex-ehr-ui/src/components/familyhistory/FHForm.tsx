"use client";

import { useEffect, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, FamilyHistoryDto } from "@/utils/types";

type Props = {
    patientId: number;
    encounterId: number;
    editing?: FamilyHistoryDto | null;
    onSaved: (saved: FamilyHistoryDto) => void;
    onCancel?: () => void;
};

const RELATIONS = [
    "Mother","Father","Sister","Brother","Daughter","Son",
    "Maternal Grandmother","Maternal Grandfather","Paternal Grandmother","Paternal Grandfather",
    "Aunt","Uncle","Cousin","Other"
];

export default function FHForm({ patientId, encounterId, editing, onSaved, onCancel }: Props) {
    const [relation, setRelation] = useState(RELATIONS[0]);
    const [condition, setCondition] = useState("");
    const [ageOfOnset, setAgeOfOnset] = useState<number | "">("");
    const [status, setStatus] = useState("Unknown");
    const [hereditary, setHereditary] = useState(false);
    const [notes, setNotes] = useState("");

    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (editing?.id) {
            setRelation(editing.relation || RELATIONS[0]);
            setCondition(editing.condition || "");
            setAgeOfOnset(typeof editing.ageOfOnset === "number" ? editing.ageOfOnset : "");
            setStatus(editing.status || "Unknown");
            setHereditary(!!editing.hereditary);
            setNotes(editing.notes || "");
        } else {
            setRelation(RELATIONS[0]); setCondition(""); setAgeOfOnset("");
            setStatus("Unknown"); setHereditary(false); setNotes("");
        }
    }, [editing]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);

        try {
            const body: FamilyHistoryDto = {
                patientId,
                encounterId,
                relation,
                condition: condition.trim(),
                ...(ageOfOnset !== "" ? { ageOfOnset: Number(ageOfOnset) } : {}),
                ...(status ? { status } : {}),
                ...(notes ? { notes } : {}),
                ...(hereditary ? { hereditary } : {}),
                ...(editing?.id ? { id: editing.id } : {}),
            };

            const url = editing?.id
                ? `/api/family-history/${patientId}/${encounterId}/${editing.id}`
                : `/api/family-history/${patientId}/${encounterId}`;

            const method = editing?.id ? "PUT" : "POST";

            const res = await fetchWithOrg(url, { method, body: JSON.stringify(body) });
            const json = (await res.json()) as ApiResponse<FamilyHistoryDto>;
            if (!res.ok || !json.success) throw new Error(json.message || "Save failed");

            onSaved(json.data!);
            if (!editing?.id) {
                setRelation(RELATIONS[0]); setCondition(""); setAgeOfOnset("");
                setStatus("Unknown"); setHereditary(false); setNotes("");
            }
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border p-4 shadow-sm bg-white">
            <h3 className="text-lg font-semibold">{editing?.id ? "Edit Family History" : "Add Family History"}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium mb-1">Relation</label>
                    <select className="w-full rounded-lg border px-3 py-2 focus:ring" value={relation} onChange={(e) => setRelation(e.target.value)}>
                        {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Condition</label>
                    <input
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        placeholder="e.g., Diabetes Mellitus Type 2"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Age of Onset</label>
                    <input
                        type="number"
                        min={0}
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={ageOfOnset}
                        onChange={(e) => setAgeOfOnset(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select className="w-full rounded-lg border px-3 py-2 focus:ring" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="Alive">Alive</option>
                        <option value="Deceased">Deceased</option>
                        <option value="Unknown">Unknown</option>
                    </select>
                </div>

                <div className="md:col-span-2 flex items-center gap-2">
                    <input id="hereditary" type="checkbox" checked={hereditary} onChange={(e) => setHereditary(e.target.checked)} />
                    <label htmlFor="hereditary" className="text-sm">Hereditary</label>
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
