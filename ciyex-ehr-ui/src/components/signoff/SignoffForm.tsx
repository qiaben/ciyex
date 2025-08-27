"use client";

import { useEffect, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, SignoffDto, SignoffStatus } from "@/utils/types";

type Props = {
    patientId: number;
    encounterId: number;
    value?: SignoffDto | null;
    onSaved: (saved: SignoffDto) => void;
};

export default function SignoffForm({ patientId, encounterId, value, onSaved }: Props) {
    const [attestationText, setAttestationText] = useState("");
    const [ackBilling, setAckBilling] = useState(false);
    const [lockEncounter, setLockEncounter] = useState(true);
    const [cosigner, setCosigner] = useState("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        setAttestationText(value?.attestationText || "");
        setAckBilling(!!value?.acknowledgeBillingComplete);
        setLockEncounter(value?.lockEncounter ?? true);
        setCosigner(value?.cosigner || "");
        setNotes(value?.notes || "");
    }, [value]);

    async function saveDraft(status: SignoffStatus = value?.status || "Draft") {
        setSaving(true);
        setErr(null);
        try {
            const body: SignoffDto = {
                patientId,
                encounterId,
                status,
                attestationText: attestationText.trim(),
                acknowledgeBillingComplete: ackBilling,
                lockEncounter,
                ...(cosigner ? { cosigner: cosigner.trim() } : {}),
                ...(notes ? { notes: notes.trim() } : {}),
                ...(value?.id ? { id: value.id } : {}),
            };

            const url = value?.id
                ? `/api/signoff/${patientId}/${encounterId}/${value.id}`
                : `/api/signoff/${patientId}/${encounterId}`;

            const method = value?.id ? "PUT" : "POST";

            const res = await fetchWithOrg(url, { method, body: JSON.stringify(body) });
            const json = (await res.json()) as ApiResponse<SignoffDto>;
            if (!res.ok || !json.success) throw new Error(json.message || "Save failed");
            onSaved(json.data!);
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    async function finalize() {
        if (!ackBilling) {
            setErr("Please acknowledge billing is complete before finalizing.");
            return;
        }
        if (!confirm("Finalize and sign this encounter? This may lock further edits.")) return;

        setSaving(true);
        setErr(null);
        try {
            // Preferred dedicated finalize endpoint:
            let res = await fetchWithOrg(
                `/api/signoff/${patientId}/${encounterId}/${value?.id ?? ""}/finalize`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        attestationText: attestationText.trim(),
                        lockEncounter,
                    }),
                }
            );

            // Fallback: if finalize endpoint not found, just PUT status=Signed
            if (res.status === 404) {
                const body: SignoffDto = {
                    patientId,
                    encounterId,
                    status: lockEncounter ? "Locked" : "Signed",
                    attestationText: attestationText.trim(),
                    acknowledgeBillingComplete: ackBilling,
                    lockEncounter,
                    ...(value?.id ? { id: value.id } : {}),
                    ...(cosigner ? { cosigner: cosigner.trim() } : {}),
                    ...(notes ? { notes: notes.trim() } : {}),
                };
                res = await fetchWithOrg(
                    `/api/signoff/${patientId}/${encounterId}/${value?.id ?? ""}`,
                    { method: "PUT", body: JSON.stringify(body) }
                );
            }

            const json = (await res.json()) as ApiResponse<SignoffDto>;
            if (!res.ok || !json.success) throw new Error(json.message || "Finalize failed");
            onSaved(json.data!);
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    const locked = value?.status === "Locked";
    const signed = value?.status === "Signed" || locked;

    return (
        <div className="space-y-4 rounded-2xl border p-4 shadow-sm bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Attestation</label>
                    <textarea
                        className="w-full rounded-lg border px-3 py-2 focus:ring min-h-24"
                        value={attestationText}
                        onChange={(e) => setAttestationText(e.target.value)}
                        placeholder='e.g., "I attest that this note accurately reflects my findings and plan."'
                        disabled={signed}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        id="ack"
                        type="checkbox"
                        checked={ackBilling}
                        onChange={(e) => setAckBilling(e.target.checked)}
                        disabled={signed}
                    />
                    <label htmlFor="ack" className="text-sm">
                        Billing/Coding completed & ready for submission
                    </label>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        id="lock"
                        type="checkbox"
                        checked={lockEncounter}
                        onChange={(e) => setLockEncounter(e.target.checked)}
                        disabled={signed}
                    />
                    <label htmlFor="lock" className="text-sm">
                        Lock encounter on sign‑off
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Request Cosign (optional)</label>
                    <input
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={cosigner}
                        onChange={(e) => setCosigner(e.target.value)}
                        placeholder="Cosigner name or ID"
                        disabled={signed}
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Internal Notes (optional)</label>
                    <textarea
                        className="w-full rounded-lg border px-3 py-2 focus:ring min-h-20"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={signed}
                    />
                </div>
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}

            <div className="flex flex-wrap items-center gap-2">
                {!signed && (
                    <>
                        <button
                            type="button"
                            onClick={() => saveDraft("Draft")}
                            disabled={saving}
                            className="rounded-xl border px-4 py-2 hover:bg-gray-50"
                        >
                            Save Draft
                        </button>
                        <button
                            type="button"
                            onClick={() => saveDraft("ReadyForSignature")}
                            disabled={saving}
                            className="rounded-xl border px-4 py-2 hover:bg-gray-50"
                        >
                            Mark Ready
                        </button>
                        <button
                            type="button"
                            onClick={finalize}
                            disabled={saving || !ackBilling}
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
                            title={!ackBilling ? "Acknowledge billing before finalizing" : ""}
                        >
                            Finalize & Sign
                        </button>
                    </>
                )}
                {signed && (
                    <span className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm">
            {value?.status === "Locked" ? "Locked" : "Signed"}
          </span>
                )}
            </div>
        </div>
    );
}
