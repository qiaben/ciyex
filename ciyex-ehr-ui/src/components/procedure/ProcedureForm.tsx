"use client";

import { useEffect, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, ProcedureDto } from "@/utils/types";

type Props = {
    patientId: number;
    encounterId: number;
    editing?: ProcedureDto | null;
    onSaved: (saved: ProcedureDto) => void;
    onCancel?: () => void;
};

const STATUS = ["Planned", "InProgress", "Completed", "Aborted"] as const;
const LATERALITY = ["Left", "Right", "Bilateral", "Midline"] as const;

export default function ProcedureForm({ patientId, encounterId, editing, onSaved, onCancel }: Props) {
    const [procedureCode, setProcedureCode] = useState("");
    const [procedureName, setProcedureName] = useState("");
    const [datePerformed, setDatePerformed] = useState("");
    const [status, setStatus] = useState<ProcedureDto["status"]>("Completed");
    const [performer, setPerformer] = useState("");
    const [bodySite, setBodySite] = useState("");
    const [laterality, setLaterality] = useState<ProcedureDto["laterality"]>();
    const [modifiers, setModifiers] = useState("");
    const [anesthesia, setAnesthesia] = useState("");
    const [notes, setNotes] = useState("");

    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (editing?.id) {
            setProcedureCode(editing.procedureCode || "");
            setProcedureName(editing.procedureName || "");
            setDatePerformed(editing.datePerformed ? editing.datePerformed.slice(0, 10) : "");
            setStatus(editing.status || "Completed");
            setPerformer(editing.performer || "");
            setBodySite(editing.bodySite || "");
            setLaterality(editing.laterality);
            setModifiers(editing.modifiers || "");
            setAnesthesia(editing.anesthesia || "");
            setNotes(editing.notes || "");
        } else {
            setProcedureCode("");
            setProcedureName("");
            setDatePerformed(new Date().toISOString().slice(0, 10));
            setStatus("Completed");
            setPerformer("");
            setBodySite("");
            setLaterality(undefined);
            setModifiers("");
            setAnesthesia("");
            setNotes("");
        }
    }, [editing]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);

        try {
            const body: ProcedureDto = {
                patientId,
                encounterId,
                procedureName: procedureName.trim(),
                ...(procedureCode ? { procedureCode: procedureCode.trim() } : {}),
                ...(datePerformed ? { datePerformed } : {}),
                ...(status ? { status } : {}),
                ...(performer ? { performer: performer.trim() } : {}),
                ...(bodySite ? { bodySite: bodySite.trim() } : {}),
                ...(laterality ? { laterality } : {}),
                ...(modifiers ? { modifiers: modifiers.trim() } : {}),
                ...(anesthesia ? { anesthesia: anesthesia.trim() } : {}),
                ...(notes ? { notes: notes.trim() } : {}),
                ...(editing?.id ? { id: editing.id } : {}),
            };

            const url = editing?.id
                ? `/api/procedures/${patientId}/${encounterId}/${editing.id}`
                : `/api/procedures/${patientId}/${encounterId}`;

            const method = editing?.id ? "PUT" : "POST";

            const res = await fetchWithOrg(url, { method, body: JSON.stringify(body) });
            const json = (await res.json()) as ApiResponse<ProcedureDto>;
            if (!res.ok || !json.success) throw new Error(json.message || "Save failed");

            onSaved(json.data!);
            if (!editing?.id) {
                setProcedureCode("");
                setProcedureName("");
                setDatePerformed(new Date().toISOString().slice(0, 10));
                setStatus("Completed");
                setPerformer("");
                setBodySite("");
                setLaterality(undefined);
                setModifiers("");
                setAnesthesia("");
                setNotes("");
            }
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border p-4 shadow-sm bg-white">
            <h3 className="text-lg font-semibold">{editing?.id ? "Edit Procedure" : "Add Procedure"}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Procedure Name</label>
                    <input
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={procedureName}
                        onChange={(e) => setProcedureName(e.target.value)}
                        placeholder="e.g., Laceration repair, Colonoscopy"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Procedure Code</label>
                    <input
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={procedureCode}
                        onChange={(e) => setProcedureCode(e.target.value)}
                        placeholder="CPT/HCPCS/PCS"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Date Performed</label>
                    <input
                        type="date"
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={datePerformed}
                        onChange={(e) => setDatePerformed(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as ProcedureDto["status"])}
                    >
                        {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Performer</label>
                    <input
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={performer}
                        onChange={(e) => setPerformer(e.target.value)}
                        placeholder="Provider"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Body Site</label>
                    <input
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={bodySite}
                        onChange={(e) => setBodySite(e.target.value)}
                        placeholder="e.g., Knee, Abdomen"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Laterality</label>
                    <select
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={laterality || ""}
                        onChange={(e) => setLaterality((e.target.value || undefined) as ProcedureDto["laterality"])}
                    >
                        <option value="">—</option>
                        {LATERALITY.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Modifiers</label>
                    <input
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={modifiers}
                        onChange={(e) => setModifiers(e.target.value)}
                        placeholder='e.g., "25,59"'
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Anesthesia</label>
                    <input
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={anesthesia}
                        onChange={(e) => setAnesthesia(e.target.value)}
                        placeholder="Local/General/etc."
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                        className="w-full rounded-lg border px-3 py-2 focus:ring min-h-24"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Procedure details"
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
