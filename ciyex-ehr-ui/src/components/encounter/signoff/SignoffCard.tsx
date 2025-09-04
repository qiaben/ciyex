// "use client";
//
// import { useEffect, useMemo, useState } from "react";
// import { fetchWithOrg } from "@/utils/fetchWithOrg";
// import type { ApiResponse, SignoffDto } from "@/utils/types";
// import SignoffForm from "./SignoffForm";
//
// type Props = { patientId: number; encounterId: number };
//
// export default function SignoffCard({ patientId, encounterId }: Props) {
//     const [item, setItem] = useState<SignoffDto | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [err, setErr] = useState<string | null>(null);
//
//     async function load() {
//         setLoading(true);
//         setErr(null);
//         try {
//             // GET /api/signoff/{patientId}/{encounterId}
//             const res = await fetchWithOrg(`/api/signoff/${patientId}/${encounterId}`);
//             const json = (await res.json()) as ApiResponse<SignoffDto | null>;
//             if (!res.ok || !json.success) throw new Error(json.message || "Load failed");
//             setItem(json.data || null);
//         } catch (e: unknown) {
//             setErr(e instanceof Error ? e.message : "Something went wrong");
//         } finally {
//             setLoading(false);
//         }
//
//     }
//
//     useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [patientId, encounterId]);
//
//     const badge = useMemo(() => {
//         const s = item?.status || "Draft";
//         const map: Record<string, string> = {
//             Draft: "bg-gray-100 text-gray-700",
//             ReadyForSignature: "bg-amber-100 text-amber-700",
//             Signed: "bg-green-100 text-green-700",
//             CosignRequested: "bg-blue-100 text-blue-700",
//             Cosigned: "bg-teal-100 text-teal-700",
//             Locked: "bg-green-100 text-green-700",
//         };
//         return <span className={`rounded-full px-3 py-1 text-sm ${map[s] || "bg-gray-100 text-gray-700"}`}>{s}</span>;
//     }, [item?.status]);
//
//     return (
//         <div className="space-y-4">
//             <div className="flex items-center justify-between">
//                 <h2 className="text-xl font-semibold">Sign‑off / Finalization</h2>
//                 {badge}
//             </div>
//
//             {loading && <div className="text-gray-600">Loading...</div>}
//             {err && <div className="text-red-600">{err}</div>}
//
//             {!loading && (
//                 <>
//                     {/* Signature summary */}
//                     {item?.signedBy && (
//                         <div className="rounded-xl border p-4 bg-white">
//                             <p className="text-sm text-gray-800">
//                                 <b>Signed by:</b> {item.signedBy}
//                                 {item.signedAt ? ` · ${item.signedAt}` : ""}
//                                 {item.lockEncounter ? " · Locked" : ""}
//                             </p>
//                             {item.cosigner && (
//                                 <p className="text-sm text-gray-800">
//                                     <b>Cosigner:</b> {item.cosigner}
//                                     {item.cosignedAt ? ` · ${item.cosignedAt}` : ""}
//                                 </p>
//                             )}
//                             {item.attestationText && (
//                                 <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2">
//                                     <b>Attestation:</b> {item.attestationText}
//                                 </p>
//                             )}
//                         </div>
//                     )}
//
//                     {/* Editor / actions */}
//                     <SignoffForm
//                         patientId={patientId}
//                         encounterId={encounterId}
//                         value={item}
//                         onSaved={(saved) => setItem(saved)}
//                     />
//                 </>
//             )}
//         </div>
//     );
// }


"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, SignoffDto } from "@/utils/types";
import SignoffForm from "./SignoffForm";

type Props = { patientId: number; encounterId: number };

export default function SignoffCard({ patientId, encounterId }: Props) {
    const [item, setItem] = useState<SignoffDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        setErr(null);
        try {
            // POST create-or-fetch
            const res = await fetchWithOrg(`/api/signoffs/${patientId}/${encounterId}`, {
                method: "POST",
                body: JSON.stringify({ patientId, encounterId }),
            });
            const json = (await res.json()) as ApiResponse<SignoffDto | null>;
            if (!res.ok || !json.success) throw new Error(json.message || "Load failed");
            setItem(json.data || null);
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId, encounterId]);

    const badge = useMemo(() => {
        const s = item?.status || "Draft";
        const map: Record<string, string> = {
            Draft: "bg-gray-100 text-gray-700",
            ReadyForSignature: "bg-amber-100 text-amber-700",
            Signed: "bg-green-100 text-green-700",
            CosignRequested: "bg-blue-100 text-blue-700",
            Cosigned: "bg-teal-100 text-teal-700",
            Locked: "bg-green-100 text-green-700",
        };
        return (
            <span className={`rounded-full px-3 py-1 text-sm ${map[s] || "bg-gray-100 text-gray-700"}`}>
        {s}
      </span>
        );
    }, [item?.status]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Sign-off / Finalization</h2>
                {badge}
            </div>

            {loading && <div className="text-gray-600">Loading...</div>}
            {err && <div className="text-red-600">{err}</div>}

            {!loading && (
                <>
                    {item?.signedBy && (
                        <div className="rounded-xl border p-4 bg-white">
                            <p className="text-sm text-gray-800">
                                <b>Signed by:</b> {item.signedBy}
                                {item.signedAt ? ` · ${item.signedAt}` : ""}
                                {item.lockEncounter ? " · Locked" : ""}
                            </p>
                            {item.cosigner && (
                                <p className="text-sm text-gray-800">
                                    <b>Cosigner:</b> {item.cosigner}
                                    {item.cosignedAt ? ` · ${item.cosignedAt}` : ""}
                                </p>
                            )}
                            {item.attestationText && (
                                <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2">
                                    <b>Attestation:</b> {item.attestationText}
                                </p>
                            )}
                        </div>
                    )}

                    <SignoffForm
                        patientId={patientId}
                        encounterId={encounterId}
                        value={item}
                        onSaved={(saved) => setItem(saved)}
                    />
                </>
            )}
        </div>
    );
}
