"use client";

import { useEffect, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, ProviderNoteDto } from "@/utils/types";

type Props = {
    patientId: number;
    encounterId: number;
    editing?: ProviderNoteDto | null;
    onSaved: (saved: ProviderNoteDto) => void;
    onCancel?: () => void;
};

const NOTE_TYPES = ["General", "Attending", "Addendum", "Other"];

export default function ProviderNoteForm({ patientId, encounterId, editing, onSaved, onCancel }: Props) {
    const [noteType, setNoteType] = useState(NOTE_TYPES[0]);
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const isSigned = !!editing?.signed; // lock if signed

    useEffect(() => {
        if (editing?.id) {
            setNoteType(editing.noteType || NOTE_TYPES[0]);
            setContent(editing.content || "");
        } else {
            setNoteType(NOTE_TYPES[0]);
            setContent("");
        }
    }, [editing]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isSigned) return; // extra guard: don’t allow submit when signed

        setSaving(true);
        setErr(null);

        try {
            const body: ProviderNoteDto = {
                patientId,
                encounterId,
                noteType,
                content: content.trim(),
                ...(editing?.id ? { id: editing.id } : {}),
            };

            const url = editing?.id
                ? `/api/provider-notes/${patientId}/${encounterId}/${editing.id}`
                : `/api/provider-notes/${patientId}/${encounterId}`;
            const method = editing?.id ? "PUT" : "POST";

            const res = await fetchWithOrg(url, { method, body: JSON.stringify(body) });
            const json = (await res.json()) as ApiResponse<ProviderNoteDto>;
            if (!res.ok || !json.success) throw new Error(json.message || "Save failed");

            onSaved(json.data!);
            if (!editing?.id) {
                setNoteType(NOTE_TYPES[0]);
                setContent("");
            }
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border p-4 shadow-sm bg-white">
            <h3 className="text-lg font-semibold">
                {editing?.id ? (isSigned ? "View Note (Signed)" : "Edit Note") : "Add Note"}
            </h3>

            <div>
                <label className="block text-sm font-medium mb-1">Note Type</label>
                <select
                    className="w-full rounded-lg border px-3 py-2 focus:ring"
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value)}
                    disabled={isSigned}
                >
                    {NOTE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                    className="w-full rounded-lg border px-3 py-2 focus:ring min-h-28"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter provider note..."
                    required
                    disabled={isSigned}
                />
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}

            <div className="flex gap-2">
                {!isSigned && (
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {saving ? "Saving..." : editing?.id ? "Update" : "Save"}
                    </button>
                )}
                {onCancel && (
                    <button type="button" onClick={onCancel} className="rounded-xl border px-4 py-2 hover:bg-gray-50">
                        {isSigned ? "Close" : "Cancel"}
                    </button>
                )}
            </div>
        </form>
    );
}
