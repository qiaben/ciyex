"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithOrg } from "@/utils/fetchWithOrg";
import type { ApiResponse, ProviderNoteDto } from "@/utils/types";
import ProviderNoteForm from "./ProviderNoteForm";

type Props = { patientId: number; encounterId: number };

export default function ProviderNoteList({ patientId, encounterId }: Props) {
    const [items, setItems] = useState<ProviderNoteDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<ProviderNoteDto | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchWithOrg(`/api/provider-notes/${patientId}/${encounterId}`);
            const json = (await res.json()) as ApiResponse<ProviderNoteDto[]>;
            if (!res.ok || !json.success) throw new Error(json.message || "Load failed");
            setItems(json.data || []);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [patientId, encounterId]);

    function onSaved(saved: ProviderNoteDto) {
        setShowForm(false);
        setEditing(null);
        setItems((prev) => {
            const i = prev.findIndex((x) => x.id === saved.id);
            if (i >= 0) { const copy = [...prev]; copy[i] = saved; return copy; }
            return [saved, ...prev];
        });
    }

    async function remove(id: number) {
        if (!confirm("Delete this note?")) return;
        try {
            const res = await fetchWithOrg(`/api/provider-notes/${patientId}/${encounterId}/${id}`, { method: "DELETE" });
            const json = (await res.json()) as ApiResponse<void>;
            if (!res.ok || !json.success) throw new Error(json.message || "Delete failed");
            setItems((p) => p.filter((x) => x.id !== id));
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Something went wrong");
        }
    }

    // NEW: sign a note (preferred dedicated endpoint; fallback to simple PUT)
    async function signNote(note: ProviderNoteDto) {
        if (!note.id) return;
        if (!confirm("Sign this note? This will lock further edits.")) return;

        try {
            // Try dedicated sign endpoint first
            let res = await fetchWithOrg(
                `/api/provider-notes/${patientId}/${encounterId}/${note.id}/sign`,
                { method: "POST", body: JSON.stringify({}) }
            );

            // If not available, fallback to PUT with signed: true
            if (res.status === 404) {
                res = await fetchWithOrg(
                    `/api/provider-notes/${patientId}/${encounterId}/${note.id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify({
                            ...note,
                            signed: true,
                            // ensure required fields are present in fallback
                            patientId,
                            encounterId,
                            noteType: note.noteType ?? "General",
                            content: note.content ?? "",
                        }),
                    }
                );
            }

            const json = (await res.json()) as ApiResponse<ProviderNoteDto>;
            if (!res.ok || !json?.success) throw new Error(json?.message || "Sign failed");

            const updated = json.data!;
            setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Something went wrong");
        }
    }

    const sorted = useMemo(() => {
        return [...items].sort((a, b) => {
            const d1 = a.audit?.lastModifiedDate || a.audit?.createdDate || "";
            const d2 = b.audit?.lastModifiedDate || b.audit?.createdDate || "";
            return d2.localeCompare(d1);
        });
    }, [items]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Provider Notes</h2>
                <button
                    onClick={() => { setEditing(null); setShowForm((s) => !s); }}
                    className="rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
                >
                    {showForm ? "Close" : "Add Note"}
                </button>
            </div>

            {showForm && (
                <ProviderNoteForm
                    patientId={patientId}
                    encounterId={encounterId}
                    editing={editing}
                    onSaved={onSaved}
                    onCancel={() => { setShowForm(false); setEditing(null); }}
                />
            )}

            {loading && <div className="text-gray-600">Loading...</div>}
            {error && <div className="text-red-600">{error}</div>}
            {!loading && !error && sorted.length === 0 && (
                <div className="rounded-xl border p-4 text-gray-600">No provider notes yet.</div>
            )}

            <ul className="space-y-3">
                {sorted.map((note) => {
                    const locked = !!note.signed;
                    return (
                        <li key={note.id} className="rounded-2xl border p-4 bg-white shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="font-medium text-gray-900">
                                        {note.noteType || "General"} · {locked ? "Signed" : "Draft"}
                                    </p>
                                    <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                                    <p className="text-xs text-gray-500">
                                        {note.audit?.createdDate && <>Created: {note.audit.createdDate}</>}
                                        {note.audit?.lastModifiedDate && <> · Updated: {note.audit.lastModifiedDate}</>}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setEditing(note); setShowForm(true); }}
                                        className={`rounded-lg border px-3 py-1.5 hover:bg-gray-50 ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
                                        disabled={locked}
                                        title={locked ? "Note is signed and cannot be edited" : "Edit"}
                                    >
                                        Edit
                                    </button>

                                    {!locked && (
                                        <button
                                            onClick={() => signNote(note)}
                                            className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                                            title="Sign (locks further edits)"
                                        >
                                            Sign
                                        </button>
                                    )}

                                    <button
                                        onClick={() => remove(note.id!)}
                                        className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
