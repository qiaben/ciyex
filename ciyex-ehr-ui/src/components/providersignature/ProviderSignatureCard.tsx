"use client";

import { useEffect, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, ProviderSignatureDto } from "@/utils/types";
import ProviderSignatureForm from "./ProviderSignatureForm";

type Props = { patientId: number; encounterId: number };

export default function ProviderSignatureCard({ patientId, encounterId }: Props) {
    const [item, setItem] = useState<ProviderSignatureDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        setErr(null);
        try {
            const res = await fetchWithOrg(`/api/provider-signature/${patientId}/${encounterId}`);
            const json = (await res.json()) as ApiResponse<ProviderSignatureDto | null>;
            if (!res.ok || !json.success) throw new Error(json.message || "Load failed");
            setItem(json.data || null);
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [patientId, encounterId]);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Provider Signature</h2>
            {loading && <div className="text-gray-600">Loading...</div>}
            {err && <div className="text-red-600">{err}</div>}

            {!loading && (
                <>
                    {item?.signedBy && (
                        <div className="rounded-xl border p-4 bg-white space-y-1">
                            <p className="text-sm text-gray-800">
                                <b>Signed by:</b> {item.signedBy}
                                {item.signedAt ? ` · ${item.signedAt}` : ""}
                            </p>
                            {item.signatureText && (
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.signatureText}</p>
                            )}
                        </div>
                    )}

                    <ProviderSignatureForm
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
