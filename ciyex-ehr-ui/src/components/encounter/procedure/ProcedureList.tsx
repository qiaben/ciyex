// "use client";
//
// import { useEffect, useMemo, useState } from "react";
// import { fetchWithOrg } from "@/utils/fetchWithOrg";
// import type { ApiResponse, ProcedureDto } from "@/utils/types";
// import ProcedureForm from "./ProcedureForm";
//
// type Props = { patientId: number; encounterId: number };
//
// export default function ProcedureList({ patientId, encounterId }: Props) {
//     const [items, setItems] = useState<ProcedureDto[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [showForm, setShowForm] = useState(false);
//     const [editing, setEditing] = useState<ProcedureDto | null>(null);
//
//     async function load() {
//         setLoading(true);
//         setError(null);
//         try {
//             // GET /api/procedures/{patientId}/{encounterId}
//             const res = await fetchWithOrg(`/api/procedures/${patientId}/${encounterId}`);
//             const json = (await res.json()) as ApiResponse<ProcedureDto[]>;
//             if (!res.ok || !json.success) throw new Error(json.message || "Load failed");
//             setItems(json.data || []);
//         } catch (e: unknown) {
//             setError(e instanceof Error ? e.message : "Something went wrong");
//         } finally {
//             setLoading(false);
//         }
//     }
//
//     useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [patientId, encounterId]);
//
//     function onSaved(saved: ProcedureDto) {
//         setShowForm(false);
//         setEditing(null);
//         setItems((prev) => {
//             const i = prev.findIndex((x) => x.id === saved.id);
//             if (i >= 0) { const copy = [...prev]; copy[i] = saved; return copy; }
//             return [saved, ...prev];
//         });
//     }
//
//     async function remove(id: number) {
//         if (!confirm("Delete this procedure?")) return;
//         try {
//             const res = await fetchWithOrg(`/api/procedures/${patientId}/${encounterId}/${id}`, { method: "DELETE" });
//             const json = (await res.json()) as ApiResponse<void>;
//             if (!res.ok || !json.success) throw new Error(json.message || "Delete failed");
//             setItems((p) => p.filter((x) => x.id !== id));
//         } catch (e: unknown) {
//             alert(e instanceof Error ? e.message : "Something went wrong");
//         }
//     }
//
//     const sorted = useMemo(() => {
//         return [...items].sort((a, b) => {
//             const d1 = a.audit?.lastModifiedDate || a.audit?.createdDate || a.datePerformed || "";
//             const d2 = b.audit?.lastModifiedDate || b.audit?.createdDate || b.datePerformed || "";
//             return d2.localeCompare(d1);
//         });
//     }, [items]);
//
//     return (
//         <div className="space-y-4">
//             <div className="flex items-center justify-between">
//                 <h2 className="text-xl font-semibold">Procedures</h2>
//                 <button
//                     onClick={() => { setEditing(null); setShowForm((s) => !s); }}
//                     className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
//                 >
//                     {showForm ? "Close" : "Add Procedure"}
//                 </button>
//             </div>
//
//             {showForm && (
//                 <ProcedureForm
//                     patientId={patientId}
//                     encounterId={encounterId}
//                     editing={editing}
//                     onSaved={onSaved}
//                     onCancel={() => { setShowForm(false); setEditing(null); }}
//                 />
//             )}
//
//             {loading && <div className="text-gray-600">Loading...</div>}
//             {error && <div className="text-red-600">{error}</div>}
//             {!loading && !error && sorted.length === 0 && (
//                 <div className="rounded-xl border p-4 text-gray-600">No procedures yet.</div>
//             )}
//
//             <ul className="space-y-3">
//                 {sorted.map((p) => (
//                     <li key={p.id} className="rounded-2xl border p-4 bg-white shadow-sm">
//                         <div className="flex items-start justify-between gap-4">
//                             <div className="space-y-1">
//                                 <p className="font-medium text-gray-900">
//                                     {p.procedureName}
//                                     {p.procedureCode ? ` · ${p.procedureCode}` : ""}
//                                     {p.status ? ` · ${p.status}` : ""}
//                                 </p>
//                                 <p className="text-sm text-gray-700">
//                                     {p.datePerformed ? `Date: ${p.datePerformed}` : ""}
//                                     {p.performer ? ` · Performer: ${p.performer}` : ""}
//                                 </p>
//                                 <p className="text-sm text-gray-700">
//                                     {p.bodySite ? `Site: ${p.bodySite}` : ""}
//                                     {p.laterality ? ` · ${p.laterality}` : ""}
//                                     {p.modifiers ? ` · Mod: ${p.modifiers}` : ""}
//                                     {p.anesthesia ? ` · Anes: ${p.anesthesia}` : ""}
//                                 </p>
//                                 {p.notes && <p className="text-gray-800 whitespace-pre-wrap">{p.notes}</p>}
//                                 <p className="text-xs text-gray-500">
//                                     {p.audit?.createdDate && <>Created: {p.audit.createdDate}</>}
//                                     {p.audit?.lastModifiedDate && <> · Updated: {p.audit.lastModifiedDate}</>}
//                                 </p>
//                             </div>
//                             <div className="flex gap-2">
//                                 <button
//                                     onClick={() => { setEditing(p); setShowForm(true); }}
//                                     className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
//                                 >
//                                     Edit
//                                 </button>
//                                 <button
//                                     onClick={() => remove(p.id!)}
//                                     className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
//                                 >
//                                     Delete
//                                 </button>
//                             </div>
//                         </div>
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, ProcedureDto } from "@/utils/types";
import ProcedureForm from "./ProcedureForm";

type Props = { patientId: number; encounterId: number };

export default function ProcedureList({ patientId, encounterId }: Props) {
    const [items, setItems] = useState<ProcedureDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<ProcedureDto | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            // GET /api/procedures/{patientId}/{encounterId}
            const res = await fetchWithOrg(`/api/procedures/${patientId}/${encounterId}`);
            const json = (await res.json()) as ApiResponse<ProcedureDto[]>;
            if (!res.ok || !json.success) throw new Error(json.message || "Load failed");
            setItems(json.data || []);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [patientId, encounterId]);

    function onSaved(saved: ProcedureDto) {
        setShowForm(false);
        setEditing(null);
        setItems((prev) => {
            const i = prev.findIndex((x) => x.id === saved.id);
            if (i >= 0) { const copy = [...prev]; copy[i] = saved; return copy; }
            return [saved, ...prev];
        });
    }

    async function remove(id: number) {
        if (!confirm("Delete this procedure?")) return;
        try {
            const res = await fetchWithOrg(`/api/procedures/${patientId}/${encounterId}/${id}`, { method: "DELETE" });
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
                <h2 className="text-xl font-semibold">Procedures</h2>
                <button
                    onClick={() => { setEditing(null); setShowForm((s) => !s); }}
                    className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
                >
                    {showForm ? "Close" : "Add Procedure"}
                </button>
            </div>

            {showForm && (
                <ProcedureForm
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
                <div className="rounded-xl border p-4 text-gray-600">No procedures yet.</div>
            )}

            <ul className="space-y-3">
                {sorted.map((p) => (
                    <li key={p.id} className="rounded-2xl border p-4 bg-white shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <p className="font-medium text-gray-900">
                                    {p.cpt4} · {p.description}
                                    {typeof p.units === "number" ? ` · Units: ${p.units}` : ""}
                                    {p.rate ? ` · $${p.rate}` : ""}
                                </p>

                                <p className="text-sm text-gray-700">
                                    {p.relatedIcds ? `ICDs: ${p.relatedIcds}` : ""}
                                </p>

                                {(p.hospitalBillingStart || p.hospitalBillingEnd) && (
                                    <p className="text-sm text-gray-700">
                                        {p.hospitalBillingStart ? `HB Start: ${p.hospitalBillingStart}` : ""}
                                        {p.hospitalBillingEnd ? ` · HB End: ${p.hospitalBillingEnd}` : ""}
                                    </p>
                                )}

                                {(p.modifier1 || p.modifier2 || p.modifier3 || p.modifier4) && (
                                    <p className="text-sm text-gray-700">
                                        Modifiers:
                                        {p.modifier1 ? ` ${p.modifier1}` : ""}
                                        {p.modifier2 ? `, ${p.modifier2}` : ""}
                                        {p.modifier3 ? `, ${p.modifier3}` : ""}
                                        {p.modifier4 ? `, ${p.modifier4}` : ""}
                                    </p>
                                )}

                                {p.note && <p className="text-gray-800 whitespace-pre-wrap">{p.note}</p>}

                                <p className="text-xs text-gray-500">
                                    {p.audit?.createdDate && <>Created: {p.audit.createdDate}</>}
                                    {p.audit?.lastModifiedDate && <> · Updated: {p.audit.lastModifiedDate}</>}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setEditing(p); setShowForm(true); }}
                                    className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => remove(p.id!)}
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
