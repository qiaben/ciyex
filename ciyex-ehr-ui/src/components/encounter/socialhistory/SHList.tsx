// "use client";
//
// import { useEffect, useMemo, useState } from "react";
// import { fetchWithOrg } from "@/utils/fetchWithOrg";
// import type { ApiResponse, SocialHistoryDto } from "@/utils/types";
// import SHForm from "./SHForm";
//
// type Props = {
//     patientId: number;
//     encounterId: number;
// };
//
// export default function SHList({ patientId, encounterId }: Props) {
//     const [items, setItems] = useState<SocialHistoryDto[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [showForm, setShowForm] = useState(false);
//     const [editing, setEditing] = useState<SocialHistoryDto | null>(null);
//
//     async function load() {
//         setLoading(true);
//         setError(null);
//         try {
//             // GET /api/social-history/{patientId}/{encounterId}
//             const res = await fetchWithOrg(`/api/social-history/${patientId}/${encounterId}`);
//             const json = (await res.json()) as ApiResponse<SocialHistoryDto[]>;
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
//     function onSaved(saved: SocialHistoryDto) {
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
//         if (!confirm("Delete this social history entry?")) return;
//         try {
//             const res = await fetchWithOrg(`/api/social-history/${patientId}/${encounterId}/${id}`, { method: "DELETE" });
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
//                 <h2 className="text-xl font-semibold">Social History (SH)</h2>
//                 <button
//                     onClick={() => { setEditing(null); setShowForm((s) => !s); }}
//                     className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
//                 >
//                     {showForm ? "Close" : "Add SH"}
//                 </button>
//             </div>
//
//             {showForm && (
//                 <SHForm
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
//                 <div className="rounded-xl border p-4 text-gray-600">No social history yet.</div>
//             )}
//
//             <ul className="space-y-3">
//                 {sorted.map((sh) => (
//                     <li key={sh.id} className="rounded-2xl border p-4 bg-white shadow-sm">
//                         <div className="flex items-start justify-between gap-4">
//                             <div className="space-y-1">
//                                 <p className="font-medium text-gray-900">
//                                     {sh.category}
//                                     {sh.status ? ` · ${sh.status}` : ""}
//                                     {sh.frequency ? ` · ${sh.frequency}` : ""}
//                                     {typeof sh.quantityPerDay === "number" ? ` · Qty/day: ${sh.quantityPerDay}` : ""}
//                                     {typeof sh.years === "number" ? ` · Years: ${sh.years}` : ""}
//                                 </p>
//                                 {sh.duration && <p className="text-gray-800">Duration: {sh.duration}</p>}
//                                 {sh.notes && <p className="text-gray-800 whitespace-pre-wrap">{sh.notes}</p>}
//                                 <p className="text-xs text-gray-500">
//                                     {sh.audit?.createdDate && <>Created: {sh.audit.createdDate}</>}
//                                     {sh.audit?.lastModifiedDate && <> · Updated: {sh.audit.lastModifiedDate}</>}
//                                 </p>
//                             </div>
//                             <div className="flex gap-2">
//                                 <button
//                                     onClick={() => { setEditing(sh); setShowForm(true); }}
//                                     className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
//                                 >
//                                     Edit
//                                 </button>
//                                 <button
//                                     onClick={() => remove(sh.id!)}
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
import type { ApiResponse, SocialHistoryDto, SocialHistoryEntryDto } from "@/utils/types";
import SHForm from "./SHForm";

type Props = { patientId: number | string; encounterId: number | string };

// Safely parse JSON (DELETE often returns empty body or HTML on error)
async function safeJson<T = unknown>(res: Response): Promise<T | null> {
    const text = await res.text().catch(() => "");
    if (!text) return null;
    try { return JSON.parse(text) as T; } catch { return null; }
}

export default function SHList({ patientId, encounterId }: Props) {
    // Coerce to numbers defensively
    const pid = typeof patientId === "string" ? Number(patientId) : patientId;
    const eid = typeof encounterId === "string" ? Number(encounterId) : encounterId;

    // Only fetch when BOTH ids are finite positive numbers
    const canFetch =
        Number.isFinite(pid) && (pid as number) > 0 &&
        Number.isFinite(eid) && (eid as number) > 0;

    const [items, setItems] = useState<SocialHistoryEntryDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [editing, setEditing] = useState<SocialHistoryEntryDto | null>(null);

    async function load() {
        if (!canFetch) {
            // Route params may still be resolving — render a quiet placeholder
            setLoading(false);
            setError(null);
            setItems([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const url = `/api/social-history/${pid}/${eid}`;
            const res = await fetchWithOrg(url);
            const json = (await safeJson<ApiResponse<SocialHistoryDto>>(res)) ?? undefined;

            // Debug line to see exactly what the backend returned
            console.debug("[SH] GET", url, { ok: res.ok, status: res.status, json });

            if (!res.ok) {
                setError(`Load failed (${res.status})`);
                setItems([]);
                return;
            }
            if (!json || json.success !== true) {
                setError(json?.message || "Load failed");
                setItems([]);
                return;
            }

            setItems(Array.isArray(json.data?.entries) ? json.data!.entries : []);
        } catch (e: unknown) {
            console.error("[SH] load error:", e);
            setError(e instanceof Error ? e.message : "Something went wrong");
            setItems([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canFetch, pid, eid]);

    function onSaved(saved: SocialHistoryEntryDto) {
        setShowForm(false);
        setEditing(null);
        setItems((prev) => {
            const i = prev.findIndex((x) => x.id === saved.id);
            if (i >= 0) {
                const next = [...prev];
                next[i] = saved;
                return next;
            }
            return [saved, ...prev];
        });
    }

    async function remove(id: number) {
        if (typeof window !== "undefined" && !confirm("Delete this social history entry?")) return;

        try {
            const url = `/api/social-history/${pid}/${eid}/${id}`;
            const res = await fetchWithOrg(url, { method: "DELETE" });
            const json = await safeJson<ApiResponse<void>>(res);

            console.debug("[SH] DELETE", url, { ok: res.ok, status: res.status, json });

            if (!res.ok) {
                alert(`Delete failed (${res.status})`);
                return;
            }
            if (json && json.success === false) {
                alert(json.message || "Delete failed");
                return;
            }
            setItems((p) => p.filter((x) => x.id !== id));
        } catch (e: unknown) {
            console.error("[SH] delete error:", e);
            alert(e instanceof Error ? e.message : "Something went wrong");
        }
    }

    const sorted = useMemo(() => {
        const arr = Array.isArray(items) ? items : [];
        try {
            return [...arr].sort((a, b) => (a?.category || "").localeCompare(b?.category || ""));
        } catch {
            return arr;
        }
    }, [items]);

    // Early placeholder while ids aren’t ready (prevents any render-time surprises upstream)
    if (!canFetch) {
        return (
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Social History (SH)</h2>
                <div className="rounded-xl border p-4 text-gray-600">Waiting for patient/encounter…</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Social History (SH)</h2>
                <button
                    onClick={() => { setEditing(null); setShowForm((s) => !s); }}
                    className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
                >
                    {showForm ? "Close" : "Add SH"}
                </button>
            </div>

            {showForm && (
                <SHForm
                    patientId={Number(pid)}
                    encounterId={Number(eid)}
                    editing={editing}
                    onSaved={onSaved}
                    onCancel={() => { setShowForm(false); setEditing(null); }}
                />
            )}

            {loading && <div className="text-gray-600">Loading...</div>}
            {error && <div className="text-red-600">{error}</div>}
            {!loading && !error && sorted.length === 0 && (
                <div className="rounded-xl border p-4 text-gray-600">No social history yet.</div>
            )}

            <ul className="space-y-3">
                {sorted.map((sh, i) => (
                    <li key={sh?.id ?? `${sh?.category ?? "sh"}-${i}`} className="rounded-2xl border p-4 bg-white shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <p className="font-medium text-gray-900">
                                    {sh?.category}: {sh?.value || "—"}
                                </p>
                                {sh?.details && <p className="text-gray-800 whitespace-pre-wrap">{sh.details}</p>}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { if (sh) { setEditing(sh); setShowForm(true); } }}
                                    className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                                >
                                    Edit
                                </button>
                                {sh?.id && (
                                    <button
                                        onClick={() => remove(sh.id!)}
                                        className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
