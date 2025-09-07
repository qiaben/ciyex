"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, DateTimeFinalizedDto } from "@/utils/types";

type Props = {
    patientId: number;
    encounterId: number;
    value?: DateTimeFinalizedDto | null;
    onSaved: (saved: DateTimeFinalizedDto) => void;
};

function toLocalInputValue(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    // datetime-local expects "YYYY-MM-DDTHH:mm"
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInputValue(v: string) {
    // Treat input as local time; send ISO string
    const d = new Date(v);
    return d.toISOString();
}

export default function DateTimeFinalizedForm({ patientId, encounterId, value, onSaved }: Props) {
    const [finalizedLocal, setFinalizedLocal] = useState("");
    const [timezone, setTimezone] = useState("");
    const [locked, setLocked] = useState(true);
    const [source, setSource] = useState("Manual");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        setFinalizedLocal(toLocalInputValue(value?.finalizedAt));
        setTimezone(value?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "");
        setLocked(value?.locked ?? true);
        setSource(value?.source || "Manual");
        setNotes(value?.notes || "");
    }, [value]);

    const canEdit = useMemo(() => !value?.locked, [value?.locked]);

    async function saveCustom() {
        try {
            setSaving(true);
            setErr(null);
            const body: DateTimeFinalizedDto = {
                patientId,
                encounterId,
                finalizedAt: finalizedLocal ? fromLocalInputValue(finalizedLocal) : undefined,
                timezone,
                locked,
                source,
                ...(notes ? { notes: notes.trim() } : {}),
                ...(value?.id ? { id: value.id } : {}),
            };

            const url = value?.id
                ? `/api/datetime-finalized/${patientId}/${encounterId}/${value.id}`
                : `/api/datetime-finalized/${patientId}/${encounterId}`;
            const method = value?.id ? "PUT" : "POST";

            const res = await fetchWithOrg(url, { method, body: JSON.stringify(body) });
            const json = (await res.json()) as ApiResponse<DateTimeFinalizedDto>;
            if (!res.ok || !json.success) throw new Error(json.message || "Save failed");
            onSaved(json.data!);
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    async function setNow() {
        if (!confirm("Set finalized date/time to now?")) return;
        setSaving(true);
        setErr(null);
        try {
            // Preferred: dedicated endpoint
            let res = await fetchWithOrg(
                `/api/datetime-finalized/${patientId}/${encounterId}/${value?.id ?? ""}/finalize-now`,
                {
                    method: "POST",
                    body: JSON.stringify({ locked }),
                }
            );

            // Fallback: just PUT with current timestamp
            if (res.status === 404) {
                const nowIso = new Date().toISOString();
                const body: DateTimeFinalizedDto = {
                    patientId,
                    encounterId,
                    finalizedAt: nowIso,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || timezone || "",
                    locked,
                    source: "Manual",
                    ...(value?.id ? { id: value.id } : {}),
                    ...(notes ? { notes: notes.trim() } : {}),
                };
                res = await fetchWithOrg(
                    `/api/datetime-finalized/${patientId}/${encounterId}/${value?.id ?? ""}`,
                    { method: value?.id ? "PUT" : "POST", body: JSON.stringify(body) }
                );
            }

            const json = (await res.json()) as ApiResponse<DateTimeFinalizedDto>;
            if (!res.ok || !json.success) throw new Error(json.message || "Finalize-now failed");
            onSaved(json.data!);
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="rounded-2xl border p-4 shadow-sm bg-white space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium mb-1">Finalized Date/Time</label>
                    <input
                        type="datetime-local"
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={finalizedLocal}
                        onChange={(e) => setFinalizedLocal(e.target.value)}
                        disabled={!canEdit}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Timezone</label>
                    <input
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        placeholder="e.g., Asia/Kolkata"
                        disabled={!canEdit}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        id="lock"
                        type="checkbox"
                        checked={locked}
                        onChange={(e) => setLocked(e.target.checked)}
                        disabled={!canEdit}
                    />
                    <label htmlFor="lock" className="text-sm">Lock encounter after finalization</label>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Source</label>
                    <input
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        placeholder="Signoff / ProviderSignature / Manual"
                        disabled={!canEdit}
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                    <textarea
                        className="w-full rounded-lg border px-3 py-2 focus:ring min-h-20"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={!canEdit}
                    />
                </div>
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}

            <div className="flex flex-wrap items-center gap-2">
                {canEdit ? (
                    <>
                        <button
                            type="button"
                            onClick={saveCustom}
                            disabled={saving}
                            className="rounded-xl border px-4 py-2 hover:bg-gray-50"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={setNow}
                            disabled={saving}
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                            Set to Now
                        </button>
                    </>
                ) : (
                    <span className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm">Locked</span>
                )}
            </div>
        </div>
    );
}
