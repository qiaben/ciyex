"use client";

import { useEffect, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, SocialHistoryDto } from "@/utils/types";

type Props = {
    patientId: number;
    encounterId: number;
    editing?: SocialHistoryDto | null;
    onSaved: (saved: SocialHistoryDto) => void;
    onCancel?: () => void;
};

const CATEGORIES = [
    "Tobacco",
    "Alcohol",
    "Drugs",
    "Occupation",
    "Exercise",
    "Diet",
    "Caffeine",
    "Sexual",
    "Living Situation",
    "Marital",
    "Pets",
    "Other",
];

const STATUS_OPTS = ["Current", "Former", "Never", "Occasional", "Unknown"];

export default function SHForm({ patientId, encounterId, editing, onSaved, onCancel }: Props) {
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [status, setStatus] = useState<string>("");
    const [frequency, setFrequency] = useState("");
    const [duration, setDuration] = useState("");
    const [quantityPerDay, setQuantityPerDay] = useState<number | "">("");
    const [years, setYears] = useState<number | "">("");
    const [notes, setNotes] = useState("");

    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (editing?.id) {
            setCategory(editing.category || CATEGORIES[0]);
            setStatus(editing.status || "");
            setFrequency(editing.frequency || "");
            setDuration(editing.duration || "");
            setQuantityPerDay(
                typeof editing.quantityPerDay === "number" ? editing.quantityPerDay : ""
            );
            setYears(typeof editing.years === "number" ? editing.years : "");
            setNotes(editing.notes || "");
        } else {
            setCategory(CATEGORIES[0]);
            setStatus("");
            setFrequency("");
            setDuration("");
            setQuantityPerDay("");
            setYears("");
            setNotes("");
        }
    }, [editing]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);

        try {
            const body: SocialHistoryDto = {
                patientId,
                encounterId,
                category,
                ...(status ? { status } : {}),
                ...(frequency ? { frequency } : {}),
                ...(duration ? { duration } : {}),
                ...(quantityPerDay !== "" ? { quantityPerDay: Number(quantityPerDay) } : {}),
                ...(years !== "" ? { years: Number(years) } : {}),
                ...(notes ? { notes } : {}),
                ...(editing?.id ? { id: editing.id } : {}),
            };

            const url = editing?.id
                ? `/api/social-history/${patientId}/${encounterId}/${editing.id}`
                : `/api/social-history/${patientId}/${encounterId}`;

            const method = editing?.id ? "PUT" : "POST";

            const res = await fetchWithOrg(url, { method, body: JSON.stringify(body) });
            const json = (await res.json()) as ApiResponse<SocialHistoryDto>;
            if (!res.ok || !json.success) throw new Error(json.message || "Save failed");

            onSaved(json.data!);
            if (!editing?.id) {
                setCategory(CATEGORIES[0]);
                setStatus("");
                setFrequency("");
                setDuration("");
                setQuantityPerDay("");
                setYears("");
                setNotes("");
            }
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border p-4 shadow-sm bg-white">
            <h3 className="text-lg font-semibold">{editing?.id ? "Edit Social History" : "Add Social History"}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <input
                        list="sh-status"
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        placeholder="e.g., Current / Former / Never"
                    />
                    <datalist id="sh-status">
                        {STATUS_OPTS.map((s) => (
                            <option key={s} value={s} />
                        ))}
                    </datalist>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Frequency</label>
                    <input
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        placeholder="e.g., Daily, Weekly, Socially"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Duration</label>
                    <input
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="e.g., 10 years"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Quantity / Day</label>
                    <input
                        type="number"
                        min={0}
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={quantityPerDay}
                        onChange={(e) => setQuantityPerDay(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="e.g., 5 (cigarettes/drinks)"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Years</label>
                    <input
                        type="number"
                        min={0}
                        className="w-full rounded-lg border px-3 py-2 focus:ring"
                        value={years}
                        onChange={(e) => setYears(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="e.g., 8"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                        className="w-full rounded-lg border px-3 py-2 focus:ring min-h-24"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional details"
                    />
                </div>
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}

            <div className="flex items-center gap-2">
                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                    {saving ? "Saving..." : editing?.id ? "Update" : "Save"}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="rounded-xl border px-4 py-2 hover:bg-gray-50">
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
