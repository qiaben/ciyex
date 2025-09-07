// "use client";
//
// import { useEffect, useMemo, useState } from "react";
// import { fetchWithOrg } from "@/utils/fetchWithOrg";
// import type { ApiResponse, PhysicalExamDto } from "@/utils/types";
// import PEForm from "./PEForm";
//
// type Props = {
//     patientId: number;
//     encounterId: number;
// };
//
// export default function PEList({ patientId, encounterId }: Props) {
//     const [items, setItems] = useState<PhysicalExamDto[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [showForm, setShowForm] = useState(false);
//     const [editing, setEditing] = useState<PhysicalExamDto | null>(null);
//
//     async function load() {
//         setLoading(true);
//         setError(null);
//         try {
//             // GET /api/physical-exam/{patientId}/{encounterId}
//             const res = await fetchWithOrg(`/api/physical-exam/${patientId}/${encounterId}`);
//             const json = (await res.json()) as ApiResponse<PhysicalExamDto[]>;
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
//     function onSaved(saved: PhysicalExamDto) {
//         setShowForm(false);
//         setEditing(null);
//         setItems((prev) => {
//             const i = prev.findIndex((x) => x.id === saved.id);
//             if (i >= 0) {
//                 const copy = [...prev];
//                 copy[i] = saved;
//                 return copy;
//             }
//             return [saved, ...prev];
//         });
//     }
//
//     async function remove(id: number) {
//         if (!confirm("Delete this physical exam?")) return;
//         try {
//             const res = await fetchWithOrg(`/api/physical-exam/${patientId}/${encounterId}/${id}`, { method: "DELETE" });
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
//             const d1 = a.audit?.lastModifiedDate || a.audit?.createdDate || "";
//             const d2 = b.audit?.lastModifiedDate || b.audit?.createdDate || "";
//             return d2.localeCompare(d1);
//         });
//     }, [items]);
//
//     return (
//         <div className="space-y-4">
//             <div className="flex items-center justify-between">
//                 <h2 className="text-xl font-semibold">Physical Examination</h2>
//                 <button
//                     onClick={() => { setEditing(null); setShowForm((s) => !s); }}
//                     className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
//                 >
//                     {showForm ? "Close" : "Add Physical Exam"}
//                 </button>
//             </div>
//
//             {showForm && (
//                 <PEForm
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
//                 <div className="rounded-xl border p-4 text-gray-600">No physical exam recorded yet.</div>
//             )}
//
//             <ul className="space-y-3">
//                 {sorted.map((pe) => (
//                     <li key={pe.id} className="rounded-2xl border p-4 bg-white shadow-sm">
//                         <div className="space-y-2">
//                             {pe.summary && <p className="text-gray-900 whitespace-pre-wrap">{pe.summary}</p>}
//
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                                 {(pe.sections || []).map((s, idx) => (
//                                     <div key={`${s.name}-${idx}`} className="rounded-lg border p-3">
//                                         <p className="font-medium">
//                                             {s.name} · <span className={s.status === "Abnormal" ? "text-red-600" : "text-gray-700"}>{s.status || "NotExamined"}</span>
//                                         </p>
//                                         {s.finding && <p className="text-sm text-gray-800 mt-1">Finding: {s.finding}</p>}
//                                         {s.notes && <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">{s.notes}</p>}
//                                     </div>
//                                 ))}
//                             </div>
//
//                             <p className="text-xs text-gray-500">
//                                 {pe.audit?.createdDate && <>Created: {pe.audit.createdDate}</>}
//                                 {pe.audit?.lastModifiedDate && <> · Updated: {pe.audit.lastModifiedDate}</>}
//                             </p>
//                         </div>
//
//                         <div className="mt-3 flex gap-2">
//                             <button
//                                 onClick={() => { setEditing(pe); setShowForm(true); }}
//                                 className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
//                             >
//                                 Edit
//                             </button>
//                             <button
//                                 onClick={() => remove(pe.id!)}
//                                 className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
//                             >
//                                 Delete
//                             </button>
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
import type { ApiResponse, PhysicalExamDto } from "@/utils/types";
import PEForm from "./PEForm";

type Props = {
    patientId: number;
    encounterId: number;
};

function keyToTitle(k: string) {
    return k
        .toLowerCase()
        .split("_")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");
}

export default function PEList({ patientId, encounterId }: Props) {
    const [items, setItems] = useState<PhysicalExamDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<PhysicalExamDto | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchWithOrg(`/api/physical-exam/${patientId}/${encounterId}`);
            const json = (await res.json()) as ApiResponse<PhysicalExamDto[]>;
            if (!res.ok || !json.success) throw new Error(json.message || "Load failed");
            setItems(json.data || []);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [patientId, encounterId]);

    function onSaved(saved: PhysicalExamDto) {
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
        if (!confirm("Delete this physical exam?")) return;
        try {
            const res = await fetchWithOrg(`/api/physical-exam/${patientId}/${encounterId}/${id}`, { method: "DELETE" });
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
                <h2 className="text-xl font-semibold">Physical Examination</h2>
                <button
                    onClick={() => { setEditing(null); setShowForm((s) => !s); }}
                    className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
                >
                    {showForm ? "Close" : "Add Physical Exam"}
                </button>
            </div>

            {showForm && (
                <PEForm
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
                <div className="rounded-xl border p-4 text-gray-600">No physical exam recorded yet.</div>
            )}

            <ul className="space-y-3">
                {sorted.map((pe) => (
                    <li key={pe.id} className="rounded-2xl border p-4 bg-white shadow-sm">
                        <div className="space-y-2">
                            {pe.summary && <p className="text-gray-900 whitespace-pre-wrap">{pe.summary}</p>}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {(pe.sections || []).map((s, idx) => (
                                    <div key={`${s.sectionKey}-${idx}`} className="rounded-lg border p-3">
                                        <p className="font-medium flex items-center gap-2">
                                            {keyToTitle(s.sectionKey)}
                                            {s.allNormal ? (
                                                <span className="text-xs rounded-full border px-2 py-0.5">All normal</span>
                                            ) : (
                                                <span className="text-xs rounded-full border px-2 py-0.5">Abnormal</span>
                                            )}
                                        </p>
                                        {s.normalText && (
                                            <p className="text-sm text-gray-800 mt-1">
                                                <b>Normal Text:</b> {s.normalText}
                                            </p>
                                        )}
                                        {s.findings && (
                                            <p className="text-sm text-gray-800 mt-1">
                                                <b>Findings:</b> {s.findings}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <p className="text-xs text-gray-500">
                                {pe.audit?.createdDate && <>Created: {pe.audit.createdDate}</>}
                                {pe.audit?.lastModifiedDate && <> · Updated: {pe.audit.lastModifiedDate}</>}
                            </p>
                        </div>

                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={() => { setEditing(pe); setShowForm(true); }}
                                className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => remove(pe.id!)}
                                className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

