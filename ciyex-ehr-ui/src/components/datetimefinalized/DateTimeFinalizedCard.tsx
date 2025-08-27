"use client";

import { useEffect, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, DateTimeFinalizedDto } from "@/utils/types";
import DateTimeFinalizedForm from "./DateTimeFinalizedForm";

type Props = { patientId: number; encounterId: number };

export default function DateTimeFinalizedCard({ patientId, encounterId }: Props) {
    const [item, setItem] = useState<DateTimeFinalizedDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        setErr(null);
        try {
            // GET /api/datetime-finalized/{patientId}/{encounterId}
            const res = await fetchWithOrg(`/api/datetime-finalized/${patientId}/${encounterId}`);
            const json = (await res.json()) as ApiResponse<DateTimeFinalizedDto | null>;
            if (!res.ok || !json.success) throw new Error(json.message || "Load failed");
            setItem(json.data || null);
            // after
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setLoading(false);
        }

    }

    useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [patientId, encounterId]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Date/Time Finalized</h2>
                {item?.finalizedAt ? (
                    <span className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm">
            {item.locked ? "Finalized & Locked" : "Finalized"}
          </span>
                ) : (
                    <span className="rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-sm">Pending</span>
                )}
            </div>

            {loading && <div className="text-gray-600">Loading...</div>}
            {err && <div className="text-red-600">{err}</div>}

            {!loading && item?.finalizedAt && (
                <div className="rounded-xl border p-4 bg-white text-sm text-gray-800 space-y-1">
                    <p><b>Finalized At:</b> {item.finalizedAt}</p>
                    {item.finalizedBy && <p><b>Finalized By:</b> {item.finalizedBy}</p>}
                    {item.timezone && <p><b>Timezone:</b> {item.timezone}</p>}
                    {item.source && <p><b>Source:</b> {item.source}</p>}
                    {item.notes && <p className="whitespace-pre-wrap"><b>Notes:</b> {item.notes}</p>}
                    <p className="text-xs text-gray-500">
                        {item.audit?.createdDate && <>Created: {item.audit.createdDate}</>}
                        {item.audit?.lastModifiedDate && <> · Updated: {item.audit.lastModifiedDate}</>}
                    </p>
                </div>
            )}

            <DateTimeFinalizedForm
                patientId={patientId}
                encounterId={encounterId}
                value={item}
                onSaved={(saved) => setItem(saved)}
            />
        </div>
    );
}
