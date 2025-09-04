"use client";

import { useState, useEffect } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, ProviderSignatureDto } from "@/utils/types";

type Props = {
    patientId: number;
    encounterId: number;
    value?: ProviderSignatureDto | null;
    onSaved: (saved: ProviderSignatureDto) => void;
};

export default function ProviderSignatureForm({ patientId, encounterId, value, onSaved }: Props) {
    const [signatureText, setSignatureText] = useState("");
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const signed = value?.status === "Signed" || value?.status === "Locked";

    useEffect(() => {
        setSignatureText(value?.signatureText || "");
    }, [value]);

    async function sign() {
        if (!confirm("Apply electronic signature? This will lock your attestation.")) return;
        setSaving(true);
        setErr(null);

        try {
            const body: ProviderSignatureDto = {
                patientId,
                encounterId,
                signatureText: signatureText.trim() || `Electronically signed`,
                status: "Signed",
                ...(value?.id ? { id: value.id } : {}),
            };

            const url = value?.id
                ? `/api/provider-signature/${patientId}/${encounterId}/${value.id}`
                : `/api/provider-signature/${patientId}/${encounterId}`;

            const method = value?.id ? "PUT" : "POST";

            const res = await fetchWithOrg(url, { method, body: JSON.stringify(body) });
            const json = (await res.json()) as ApiResponse<ProviderSignatureDto>;
            if (!res.ok || !json.success) throw new Error(json.message || "Sign failed");
            onSaved(json.data!);
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="rounded-2xl border p-4 shadow-sm bg-white space-y-3">
            <label className="block text-sm font-medium mb-1">Signature Text</label>
            <input
                className="w-full rounded-lg border px-3 py-2 focus:ring"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                disabled={signed}
                placeholder='e.g., "Electronically signed by Dr. Alice Johnson"'
            />
            {err && <p className="text-sm text-red-600">{err}</p>}

            <div className="flex gap-2">
                {!signed && (
                    <button
                        onClick={sign}
                        disabled={saving}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {saving ? "Signing..." : "Sign"}
                    </button>
                )}
                {signed && (
                    <span className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm">
            Signed
          </span>
                )}
            </div>
        </div>
    );
}
