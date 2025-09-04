"use client";

import { useEffect, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, FeeScheduleDto } from "@/utils/types";
import FeeScheduleForm from "./FeeScheduleForm";

type Props = { patientId: number; encounterId: number };

type SignoffDtoLite = { status?: "Draft"|"ReadyForSignature"|"Signed"|"CosignRequested"|"Cosigned"|"Locked" };

export default function FeeScheduleCard({ patientId, encounterId }: Props) {
    const [item, setItem] = useState<FeeScheduleDto | null>(null);
    const [locked, setLocked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        setErr(null);
        try {
            // 1) fee schedule
            const fsRes = await fetchWithOrg(`/api/fee-schedule/${patientId}/${encounterId}`);
            const fsJson = (await fsRes.json()) as ApiResponse<FeeScheduleDto | null>;
            if (!fsRes.ok || !fsJson.success) throw new Error(fsJson.message || "Load failed");
            setItem(fsJson.data || null);

            // 2) signoff (to set read-only)
            const soRes = await fetchWithOrg(`/api/signoff/${patientId}/${encounterId}`);
            if (soRes.ok) {
                const soJson = (await soRes.json()) as ApiResponse<SignoffDtoLite | null>;
                const isLocked = !!soJson?.data && (soJson.data.status === "Locked");
                setLocked(isLocked);
            } else {
                setLocked(false);
            }
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
                <h2 className="text-xl font-semibold">Fee Schedule</h2>
                {locked ? (
                    <span className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm">Locked</span>
                ) : item?.audit ? (
                    <span className="text-xs text-gray-600">
            {item.audit.createdDate && <>Created: {item.audit.createdDate}</>}
                        {item.audit.lastModifiedDate && <> · Updated: {item.audit.lastModifiedDate}</>}
          </span>
                ) : null}
            </div>

            {loading && <div className="text-gray-600">Loading...</div>}
            {err && <div className="text-red-600">{err}</div>}

            <FeeScheduleForm
                patientId={patientId}
                encounterId={encounterId}
                value={item}
                readOnly={locked}
                onSaved={(saved) => setItem(saved)}
            />
        </div>
    );
}
