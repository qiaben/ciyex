"use client";

import { useEffect, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, CodeDto } from "@/utils/types";

type Props = {
    patientId: number;
    encounterId: number;
    editing?: CodeDto | null;
    onSaved: (saved: CodeDto) => void;
    onCancel?: () => void;
};

const CODE_TYPES: CodeDto["codeType"][] = ["CPT", "HCPCS", "ICD10", "ICD10PCS", "Modifier", "Other"];
const STATUSES: NonNullable<CodeDto["status"]>[] = ["Draft", "Ready", "Billed", "Denied", "Paid"];

export default function CodeForm({ patientId, encounterId, editing, onSaved, onCancel }: Props) {
    const [codeType, setCodeType] = useState<CodeDto["codeType"]>("CPT");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [units, setUnits] = useState<number | "">("");
    const [amount, setAmount] = useState<number | "">("");
    const [diagnosisPointers, setDiagnosisPointers] = useState("");
    const [modifiers, setModifiers] = useState("");
    const [status, setStatus] = useState<CodeDto["status"]>("Draft");
    const [notes, setNotes] = useState("");

    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (editing?.id) {
            setCodeType(editing.codeType || "CPT");
            setCode(editing.code || "");
            setDescription(editing.description || "");
            setUnits(typeof editing.units === "number" ? editing.units : "");
            setAmount(typeof editing.amount === "number" ? editing.amount : "");
            setDiagnosisPointers(editing.diagnosisPointers || "");
            setModifiers(editing.modifiers || "");
            setStatus(editing.status || "Draft");
            setNotes(editing.notes || "");
        } else {
            setCodeType("CPT");
            setCode("");
            setDescription("");
            setUnits("");
            setAmount("");
            setDiagnosisPointers("");
            setModifiers("");
            setStatus("Draft");
            setNotes("");
        }
    }, [editing]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);

        try {
            const body: CodeDto = {
                patientId,
                encounterId,
                codeType,
                code: code.trim(),
                ...(description ? { description: description.trim() } : {}),
                ...(units !== "" ? { units: Number(units) } : {}),
                ...(amount !== "" ? { amount: Number(amount) } : {}),
                ...(diagnosisPointers ? { diagnosisPointers: diagnosisPointers.trim() } : {}),
                ...(modifiers ? { modifiers: modifiers.trim() } : {}),
                ...(status ? { status } : {}),
                ...(notes ? { notes: notes.trim() } : {}),
                ...(editing?.id ? { id: editing.id } : {}),
            };

            const url = editing?.id
                ? `/api/codes/${patientId}/${encounterId}/${editing.id}`
                : `/api/codes/${patientId}/${encounterId}`;
            const method = editing?.id ? "PUT" : "POST";

            const res = await fetchWithOrg(url, { method, body: JSON.stringify(body) });
            const json = (await res.json()) as ApiResponse<CodeDto>;
            if (!res.ok || !json.success) throw new Error(json.message || "Save failed");

            onSaved(json.data!);
            if (!editing?.id) {
                setCodeType("CPT"); setCode(""); setDescription(""); setUnits(""); setAmount("");
                setDiagnosisPointers(""); setModifiers(""); setStatus("Draft"); setNotes("");
            }
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    // small helper to append common CPT modifiers
    function addModifier(m: string) {
        const curr = modifiers ? modifiers.split(",").map(s => s.trim()).filter(Boolean) : [];
        if (!curr.includes(m)) {
            const next = [...curr, m].join(",");
            setModifiers(next);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border p-4 shadow-sm bg-white">
            <h3 className="text-lg font-semibold">{editing?.id ? "Edit Code" : "Add Code"}</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                    <label className="block text-sm font-medium mb-1">Code Type</label>
                    <select className="w-full rounded-lg border px-3 py-2 focus:ring"
                            value={codeType} onChange={(e) => setCodeType(e.target.value as CodeDto["codeType"])}>
                        {CODE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Code</label>
                    <input className="w-full rounded-lg border px-3 py-2 focus:ring"
                           value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g., 99214 / M54.50" required />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Units</label>
                    <input type="number" min={0}
                           className="w-full rounded-lg border px-3 py-2 focus:ring"
                           value={units} onChange={(e) => setUnits(e.target.value === "" ? "" : Number(e.target.value))} />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input className="w-full rounded-lg border px-3 py-2 focus:ring"
                           value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Charge Amount</label>
                    <input type="number" min={0} step="0.01"
                           className="w-full rounded-lg border px-3 py-2 focus:ring"
                           value={amount} onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))} />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Diagnosis Pointers</label>
                    <input className="w-full rounded-lg border px-3 py-2 focus:ring"
                           value={diagnosisPointers} onChange={(e) => setDiagnosisPointers(e.target.value)}
                           placeholder='e.g., "A,B" to map to Assessment list' />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Modifiers</label>
                    <input className="w-full rounded-lg border px-3 py-2 focus:ring"
                           value={modifiers} onChange={(e) => setModifiers(e.target.value)} placeholder='e.g., "25,59"' />
                    {/* Quick chips */}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        {["25","59","GT","LT","RT"].map(m => (
                            <button key={m} type="button"
                                    onClick={() => addModifier(m)}
                                    className="rounded-full border px-2 py-0.5 hover:bg-gray-50">
                                + {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select className="w-full rounded-lg border px-3 py-2 focus:ring"
                            value={status ?? "Draft"} onChange={(e) => setStatus(e.target.value as CodeDto["status"])}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="md:col-span-3">
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea className="w-full rounded-lg border px-3 py-2 focus:ring min-h-20"
                              value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}

            <div className="flex gap-2">
                <button type="submit" disabled={saving}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60">
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
