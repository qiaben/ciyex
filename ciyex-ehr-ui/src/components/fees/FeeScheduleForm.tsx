"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, FeeScheduleDto, FeeScheduleEntryDto, CodeDto } from "@/utils/types";

type Props = {
    patientId: number;
    encounterId: number;
    value?: FeeScheduleDto | null;
    readOnly?: boolean;
    onSaved: (saved: FeeScheduleDto) => void;
};

const PRESET_ROWS: Array<Partial<FeeScheduleEntryDto>> = [
    { code: "99213", description: "Office/outpatient est, low", units: 1, unitPrice: 0 },
    { code: "99214", description: "Office/outpatient est, mod", units: 1, unitPrice: 0 },
    { code: "J1885", description: "Ketorolac inj per 15mg", units: 1, unitPrice: 0 },
    { code: "93000", description: "ECG w/ interp", units: 1, unitPrice: 0 },
];

function money(n?: number) {
    const x = typeof n === "number" ? n : 0;
    return x.toFixed(2);
}

export default function FeeScheduleForm({ patientId, encounterId, value, readOnly, onSaved }: Props) {
    const [effectiveDate, setEffectiveDate] = useState("");
    const [payer, setPayer] = useState("");
    const [remarks, setRemarks] = useState("");
    const [entries, setEntries] = useState<FeeScheduleEntryDto[]>([
        { code: "", description: "", units: 1, unitPrice: 0, modifiers: "", notes: "" },
    ]);
    const [discount, setDiscount] = useState<number | "">("");
    const [tax, setTax] = useState<number | "">("");

    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (value?.id) {
            setEffectiveDate(value?.effectiveDate?.slice(0, 10) || value?.effectiveDate || "");

            setPayer(value.payer || "");
            setRemarks(value.remarks || "");
            setEntries((value.entries && value.entries.length > 0)
                ? value.entries.map(e => ({
                    id: e.id,
                    code: e.code || "",
                    description: e.description || "",
                    modifiers: e.modifiers || "",
                    units: typeof e.units === "number" ? e.units : 1,
                    unitPrice: typeof e.unitPrice === "number" ? e.unitPrice : 0,
                    lineTotal: e.lineTotal,
                    notes: e.notes || "",
                }))
                : [{ code: "", description: "", units: 1, unitPrice: 0, modifiers: "", notes: "" }]
            );
            setDiscount(typeof value.discount === "number" ? value.discount : "");
            setTax(typeof value.tax === "number" ? value.tax : "");
        } else {
            setEffectiveDate(new Date().toISOString().slice(0, 10));
            setPayer("");
            setRemarks("");
            setEntries([{ code: "", description: "", units: 1, unitPrice: 0, modifiers: "", notes: "" }]);
            setDiscount("");
            setTax("");
        }
    }, [value]);

    function setEntry(i: number, patch: Partial<FeeScheduleEntryDto>) {
        if (readOnly) return;
        setEntries(prev => {
            const copy = [...prev];
            copy[i] = { ...copy[i], ...patch };
            return copy;
        });
    }
    function addRow() {
        if (readOnly) return;
        setEntries(prev => [...prev, { code: "", description: "", units: 1, unitPrice: 0, modifiers: "", notes: "" }]);
    }
    function removeRow(i: number) {
        if (readOnly) return;
        setEntries(prev => prev.filter((_, idx) => idx !== i));
    }
    function addPreset(p: Partial<FeeScheduleEntryDto>) {
        if (readOnly) return;
        setEntries(prev => [...prev, { code: p.code || "", description: p.description || "", units: p.units ?? 1, unitPrice: p.unitPrice ?? 0, modifiers: "", notes: "" }]);
    }

    const computed = useMemo(() => {
        const lines = entries.map(e => {
            const u = typeof e.units === "number" ? e.units : Number(e.units || 0);
            const p = typeof e.unitPrice === "number" ? e.unitPrice : Number(e.unitPrice || 0);
            const total = Math.max(0, u) * Math.max(0, p);
            return { ...e, _lineTotal: total };
        });
        const subtotal = lines.reduce((s, e) => s + e._lineTotal, 0);
        const disc = typeof discount === "number" ? discount : 0;
        const tx = typeof tax === "number" ? tax : 0;
        const total = Math.max(0, subtotal - disc + tx);
        return { lines, subtotal, total };
    }, [entries, discount, tax]);

    async function save() {
        if (readOnly) return;
        setSaving(true);
        setErr(null);
        try {
            const body: FeeScheduleDto = {
                patientId,
                encounterId,
                ...(effectiveDate ? { effectiveDate } : {}),
                ...(payer ? { payer: payer.trim() } : {}),
                ...(remarks ? { remarks: remarks.trim() } : {}),
                entries: computed.lines.map(e => ({
                    id: e.id,
                    code: e.code?.trim() || undefined,
                    description: e.description?.trim() || undefined,
                    modifiers: e.modifiers?.trim() || undefined,
                    units: typeof e.units === "number" ? e.units : Number(e.units || 0),
                    unitPrice: typeof e.unitPrice === "number" ? e.unitPrice : Number(e.unitPrice || 0),
                    lineTotal: e._lineTotal,
                    notes: e.notes?.trim() || undefined,
                })),
                ...(typeof discount === "number" ? { discount } : {}),
                ...(typeof tax === "number" ? { tax } : {}),
            };

            const url = value?.id
                ? `/api/fee-schedule/${patientId}/${encounterId}/${value.id}`
                : `/api/fee-schedule/${patientId}/${encounterId}`;
            const method = value?.id ? "PUT" : "POST";

            const res = await fetchWithOrg(url, { method, body: JSON.stringify(body) });
            const json = (await res.json()) as ApiResponse<FeeScheduleDto>;
            if (!res.ok || !json.success) throw new Error(json.message || "Save failed");
            onSaved(json.data!);
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    // IMPORT: from Billing & Coding
    async function importFromCoding() {
        if (readOnly) return;
        try {
            const res = await fetchWithOrg(`/api/codes/${patientId}/${encounterId}`);
            const json = (await res.json()) as ApiResponse<CodeDto[]>;
            if (!res.ok || !json.success) throw new Error(json.message || "Import failed");

            const rows: FeeScheduleEntryDto[] = (json.data || []).map((c) => ({
                code: c.code,
                description: c.description,
                modifiers: c.modifiers,
                units: typeof c.units === "number" ? c.units : 1,
                unitPrice: typeof c.amount === "number" ? c.amount : 0,
                notes: c.notes,
            }));
            if (rows.length === 0) return alert("No codes to import.");

            // merge: concatenate (avoid duplicates by (code,modifiers) if desired)
            setEntries(prev => [...prev, ...rows]);
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Import failed");
        }
    }

    // CSV EXPORT
    function exportCSV() {
        const header = ["Code","Description","Modifiers","Units","Unit Price","Line Total","Notes"];
        const lines = computed.lines.map(e => [
            e.code ?? "",
            (e.description ?? "").replaceAll('"','""'),
            e.modifiers ?? "",
            String(e.units ?? 0),
            String(e.unitPrice ?? 0),
            money(e._lineTotal),
            (e.notes ?? "").replaceAll('"','""'),
        ]);
        const rows = [header, ...lines]
            .map(cols => cols.map(c => `"${c}"`).join(","))
            .join("\r\n");
        const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `fee_schedule_${patientId}_${encounterId}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }


    return (
        <div className="space-y-4 rounded-2xl border p-4 shadow-sm bg-white">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">{value?.id ? "Edit Fee Schedule" : "Create Fee Schedule"}</h3>
                <div className="flex flex-wrap items-center gap-2">
                    {!readOnly && (
                        <>
                            <button type="button" onClick={importFromCoding} className="rounded-xl border px-3 py-1.5 hover:bg-gray-50">
                                Import from Codes
                            </button>
                            <div className="hidden md:flex items-center gap-1">
                                {PRESET_ROWS.map((p) => (
                                    <button
                                        key={p.code}
                                        type="button"
                                        onClick={() => addPreset(p)}
                                        className="rounded-full border px-2 py-0.5 text-xs hover:bg-gray-50"
                                        title={p.description}
                                    >
                                        + {p.code}
                                    </button>
                                ))}
                            </div>
                            <button type="button" onClick={save} disabled={saving}
                                    className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60">
                                {saving ? "Saving..." : value?.id ? "Update" : "Save"}
                            </button>
                        </>
                    )}
                    <button type="button" onClick={exportCSV} className="rounded-xl border px-3 py-1.5 hover:bg-gray-50">
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                    <label className="block text-sm font-medium mb-1">Effective Date</label>
                    <input type="date" className="w-full rounded-lg border px-3 py-2 focus:ring"
                           value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} disabled={readOnly}/>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Payer / Plan</label>
                    <input className="w-full rounded-lg border px-3 py-2 focus:ring"
                           value={payer} onChange={(e) => setPayer(e.target.value)} placeholder="e.g., Blue Cross PPO" disabled={readOnly}/>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Remarks</label>
                    <input className="w-full rounded-lg border px-3 py-2 focus:ring"
                           value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional" disabled={readOnly}/>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm border-separate border-spacing-y-2">
                    <thead className="text-left text-gray-600">
                    <tr>
                        <th className="px-2">Code</th>
                        <th className="px-2">Description</th>
                        <th className="px-2">Mods</th>
                        <th className="px-2 w-24">Units</th>
                        <th className="px-2 w-32">Unit Price</th>
                        <th className="px-2 w-32 text-right">Line Total</th>
                        <th className="px-2">Notes</th>
                        {!readOnly && <th className="px-2"></th>}
                    </tr>
                    </thead>
                    <tbody>
                    {entries.map((e, i) => {
                        const u = typeof e.units === "number" ? e.units : Number(e.units || 0);
                        const p = typeof e.unitPrice === "number" ? e.unitPrice : Number(e.unitPrice || 0);
                        const line = Math.max(0, u) * Math.max(0, p);
                        return (
                            <tr key={i} className="bg-white rounded-xl shadow-sm">
                                <td className="px-2 py-2 align-top">
                                    <input className="w-28 rounded-lg border px-2 py-1 focus:ring"
                                           value={e.code || ""} onChange={(x) => setEntry(i, { code: x.target.value })} placeholder="99214" disabled={readOnly}/>
                                </td>
                                <td className="px-2 py-2 align-top">
                                    <input className="w-full rounded-lg border px-2 py-1 focus:ring"
                                           value={e.description || ""} onChange={(x) => setEntry(i, { description: x.target.value })} placeholder="Office/outpatient visit..." disabled={readOnly}/>
                                </td>
                                <td className="px-2 py-2 align-top">
                                    <input className="w-20 rounded-lg border px-2 py-1 focus:ring"
                                           value={e.modifiers || ""} onChange={(x) => setEntry(i, { modifiers: x.target.value })} placeholder="25,59" disabled={readOnly}/>
                                </td>
                                <td className="px-2 py-2 align-top">
                                    <input type="number" min={0} className="w-20 rounded-lg border px-2 py-1 focus:ring"
                                           value={e.units ?? 0}
                                           onChange={(x) => setEntry(i, { units: x.target.value === "" ? 0 : Number(x.target.value) })} disabled={readOnly}/>
                                </td>
                                <td className="px-2 py-2 align-top">
                                    <input type="number" min={0} step="0.01" className="w-28 rounded-lg border px-2 py-1 focus:ring"
                                           value={e.unitPrice ?? 0}
                                           onChange={(x) => setEntry(i, { unitPrice: x.target.value === "" ? 0 : Number(x.target.value) })} disabled={readOnly}/>
                                </td>
                                <td className="px-2 py-2 align-top text-right align-middle">
                                    ₹{money(line)}
                                </td>
                                <td className="px-2 py-2 align-top">
                                    <input className="w-full rounded-lg border px-2 py-1 focus:ring"
                                           value={e.notes || ""} onChange={(x) => setEntry(i, { notes: x.target.value })} placeholder="Optional" disabled={readOnly}/>
                                </td>
                                {!readOnly && (
                                    <td className="px-2 py-2 align-top">
                                        <button type="button" onClick={() => removeRow(i)} className="rounded-lg border px-2 py-1 hover:bg-gray-50">
                                            Remove
                                        </button>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
                {!readOnly && (
                    <div className="mt-3">
                        <button type="button" onClick={addRow} className="rounded-xl border px-3 py-1.5 hover:bg-gray-50">+ Add Line</button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2" />
                <div>
                    <label className="block text-sm font-medium mb-1">Discount</label>
                    <input type="number" min={0} step="0.01" className="w-full rounded-lg border px-3 py-2 focus:ring"
                           value={discount} onChange={(e) => setDiscount(e.target.value === "" ? "" : Number(e.target.value))} disabled={readOnly}/>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Tax</label>
                    <input type="number" min={0} step="0.01" className="w-full rounded-lg border px-3 py-2 focus:ring"
                           value={tax} onChange={(e) => setTax(e.target.value === "" ? "" : Number(e.target.value))} disabled={readOnly}/>
                </div>
            </div>

            <div className="flex justify-end text-sm">
                <div className="rounded-xl border p-3 w-full md:w-80 bg-gray-50">
                    <div className="flex justify-between"><span>Subtotal</span><span>₹{money(computed.subtotal)}</span></div>
                    <div className="flex justify-between"><span>Discount</span><span>₹{money(typeof discount === "number" ? discount : 0)}</span></div>
                    <div className="flex justify-between"><span>Tax</span><span>₹{money(typeof tax === "number" ? tax : 0)}</span></div>
                    <div className="mt-1 border-t pt-1 flex justify-between font-semibold"><span>Total</span><span>₹{money(computed.total)}</span></div>
                </div>
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}
        </div>
    );
}
