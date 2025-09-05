"use client";
import AdminLayout from "@/app/(admin)/layout";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import TemplateManagement from "../Template/TemplateManagement";
import { ArrowDownToLine, ArrowUpToLine } from "lucide-react";

/* ------------ Types ------------ */
type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

type FolderType = "inbox" | "sent" | "archive";

type Message = {
    id: number;
    sender: string;
    recipient: string;
    time: string;
    createdAt: number;
    subject: string;
    body: string;
    folder: FolderType;
    avatar?: { initials: string; color: string };
    isRead?: boolean;
};

type Patient = { id: number; firstName: string; lastName: string };
type Provider = {
    id: number;
    identification?: { firstName?: string; lastName?: string };
};
type Template = {
    id: number;
    templateName: string;
    subject: string;
    body: string;
    archived?: boolean;
};

// ✅ Backend-facing DTO
type CommunicationDto = {
    id: number;
    sender: string;
    recipient: string;
    subject: string;
    payload: string; // backend field (was message)
    status: string;
};

const STORAGE_MSGS = "hinisoft:messaging:all";

/* ------------ Helpers ------------ */
function formatTime(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function initials(name: string) {
    const parts = name.split(/\s+/).filter(Boolean);
    return (
        (parts[0]?.[0] || "").toUpperCase() + (parts[1]?.[0] || "").toUpperCase()
    );
}

function saveMessages(msgs: Message[]) {
    try {
        localStorage.setItem(STORAGE_MSGS, JSON.stringify(msgs));
    } catch {
        // ignore
    }
}

const avatarColors = [
    "bg-blue-600",
    "bg-pink-600",
    "bg-green-600",
    "bg-red-600",
    "bg-orange-600",
    "bg-purple-600",
    "bg-indigo-600",
];

/* ------------ Component ------------ */
export default function MessagingPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const hydratedOnce = useRef(false);

    // view toggles
    const [currentFolder, setCurrentFolder] = useState<FolderType>("inbox");
    const [showTemplates, setShowTemplates] = useState(false);

    // search
    const [query, setQuery] = useState("");

    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 50;

    // compose
    const [isCreating, setIsCreating] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>("");
    const [selectedProviderId, setSelectedProviderId] = useState<string>("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | "">("");

    // replying
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [replyBody, setReplyBody] = useState("");

    const isSendDisabled =
        !subject || !body || !selectedProviderId || !selectedPatientId;

    /* ---- Load patients/providers ---- */
    useEffect(() => {
        if (!isCreating) return;

        const loadPatients = async () => {
            try {
                const res = await fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/patients?page=0&size=50`
                );
                const json: ApiResponse<{ content: Patient[] }> = await res.json();
                if (json.success && Array.isArray(json.data?.content)) {
                    setPatients(json.data.content);
                }
            } catch (err) {
                console.error("Error loading patients:", err);
            }
        };

        const loadProviders = async () => {
            try {
                const res = await fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/providers?status=ACTIVE`
                );
                const json: ApiResponse<Provider[]> = await res.json();
                if (json.success && Array.isArray(json.data)) {
                    setProviders(json.data);
                }
            } catch (err) {
                console.error("Error loading providers:", err);
            }
        };

        void loadPatients();
        void loadProviders();
    }, [isCreating]);

    /* ---- Load templates ---- */
    useEffect(() => {
        const loadTemplates = async () => {
            try {
                const res = await fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/templates`
                );
                const json: ApiResponse<Template[]> = await res.json();
                if (json.success && Array.isArray(json.data)) {
                    setTemplates(json.data);
                }
            } catch (err) {
                console.error("Error loading templates:", err);
            }
        };
        void loadTemplates();
    }, []);

    /* ---- Hydrate messages from backend ---- */
    useEffect(() => {
        if (hydratedOnce.current) return;
        hydratedOnce.current = true;

        const loadCommunications = async () => {
            try {
                const res = await fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/communications`
                );
                const json: ApiResponse<CommunicationDto[]> = await res.json();
                if (json.success && Array.isArray(json.data)) {
                    const mapped: Message[] = json.data.map((comm, idx) => ({
                        id: comm.id,
                        sender: comm.sender,
                        recipient: comm.recipient,
                        subject: comm.subject,
                        body: comm.payload,
                        createdAt: Date.now(),
                        time: formatTime(Date.now()),
                        folder: "sent",
                        avatar: {
                            initials: initials(comm.sender),
                            color: avatarColors[idx % avatarColors.length],
                        },
                        isRead: true,
                    }));
                    setMessages(mapped);
                    saveMessages(mapped);
                }
            } catch (err) {
                console.error("Error loading communications:", err);
            }
        };

        void loadCommunications();
    }, []);

    /* ---- Unread count ---- */
    const unreadInboxCount = useMemo(
        () => messages.filter((m) => m.folder === "inbox" && !m.isRead).length,
        [messages]
    );

    /* ---- Filter rows ---- */
    const rows = useMemo(() => {
        const q = query.trim().toLowerCase();
        return messages
            .filter((m) => !showTemplates && m.folder === currentFolder)
            .filter(
                (m) =>
                    !q ||
                    m.sender.toLowerCase().includes(q) ||
                    m.recipient.toLowerCase().includes(q) ||
                    m.subject.toLowerCase().includes(q) ||
                    m.body.toLowerCase().includes(q)
            )
            .sort((a, b) => b.createdAt - a.createdAt);
    }, [messages, query, currentFolder, showTemplates]);

    const paginatedRows = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return rows.slice(start, start + pageSize);
    }, [rows, currentPage]);

    /* ---- Template helpers ---- */
    const composeTemplateOptions = useMemo(
        () => templates.filter((t) => !t.archived),
        [templates]
    );

    function applySelectedTemplate() {
        const t = composeTemplateOptions.find((t) => t.id === selectedTemplateId);
        if (t) {
            setSubject(t.subject);
            setBody(t.body);
        }
    }

    /* ---- Message helpers ---- */
    async function createMessage() {
        if (isSendDisabled) return;
        const provider = providers.find((p) => String(p.id) === selectedProviderId);
        const patient = patients.find((p) => String(p.id) === selectedPatientId);

        const payloadObj = {
            sender: provider
                ? `${provider.identification?.firstName || ""} ${
                    provider.identification?.lastName || ""
                }`
                : "Provider",
            recipient: patient
                ? `${patient.firstName} ${patient.lastName}`
                : "Patient",
            subject,
            payload: body, // ✅ renamed
            status: "QUEUED",
        };

        try {
            const res = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/communications`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payloadObj),
                }
            );
            const json: ApiResponse<CommunicationDto> = await res.json();

            if (json.success && json.data) {
                const comm = json.data;
                const now = Date.now();

                const savedMsg: Message = {
                    id: comm.id,
                    sender: comm.sender,
                    recipient: comm.recipient,
                    subject: comm.subject,
                    body: comm.payload,
                    createdAt: now,
                    time: formatTime(now),
                    folder: "sent",
                    avatar: {
                        initials: initials(comm.sender),
                        color: avatarColors[messages.length % avatarColors.length],
                    },
                    isRead: true,
                };

                const updated = [savedMsg, ...messages];
                setMessages(updated);
                saveMessages(updated);
            }
        } catch (err) {
            console.error("Error creating communication:", err);
        }

        setIsCreating(false);
        setSubject("");
        setBody("");
        setSelectedPatientId("");
        setSelectedProviderId("");
        setSelectedTemplateId("");
        setAttachments([]);
    }

    async function sendReply() {
        if (!replyingTo || !replyBody.trim()) return;
        const now = Date.now();

        const payloadObj = {
            sender: replyingTo.recipient,
            recipient: replyingTo.sender,
            subject: `Re: ${replyingTo.subject}`,
            payload: replyBody, // ✅ renamed
            status: "QUEUED",
        };

        try {
            const res = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/communications`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payloadObj),
                }
            );
            const json: ApiResponse<CommunicationDto> = await res.json();

            if (json.success && json.data) {
                const comm = json.data;

                const replyMsg: Message = {
                    id: comm.id,
                    sender: comm.sender,
                    recipient: comm.recipient,
                    subject: comm.subject,
                    body: comm.payload,
                    createdAt: now,
                    time: formatTime(now),
                    folder: "sent",
                    isRead: true,
                };

                const updated = [replyMsg, ...messages];
                setMessages(updated);
                saveMessages(updated);
            }
        } catch (err) {
            console.error("Error sending reply:", err);
        }

        setReplyingTo(null);
        setReplyBody("");
    }

    function archiveMessage(id: number) {
        setMessages((prev) => {
            const updated = prev.map((m) =>
                m.id === id ? { ...m, folder: "archive" as const } : m
            );
            saveMessages(updated);
            return updated;
        });
    }

    function restoreMessage(
        id: number,
        targetFolder: Exclude<FolderType, "archive">
    ) {
        setMessages((prev) => {
            const updated = prev.map((m) =>
                m.id === id ? { ...m, folder: targetFolder } : m
            );
            saveMessages(updated);
            return updated;
        });
    }

    function markAsRead(id: number) {
        setMessages((prev) => {
            const updated = prev.map((m) =>
                m.id === id ? { ...m, isRead: true } : m
            );
            saveMessages(updated);
            return updated;
        });
    }

    /* ------------ Render ------------ */
    return (
        <AdminLayout>
            <div className="px-4 pt-0 pb-4">
                {/* Top Tabs & Actions */}
                <div className="flex justify-between items-center -mt-2 mb-1">
                    <div className="flex items-center gap-2">
                        {(["inbox", "sent", "archive"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => {
                                    setShowTemplates(false);
                                    setCurrentFolder(f);
                                    setCurrentPage(1);
                                }}
                                className={`px-3 py-1.5 rounded text-sm ${
                                    !showTemplates && currentFolder === f
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700"
                                }`}
                            >
                                {f === "inbox" ? (
                                    <span className="inline-flex items-center gap-2">
                  Inbox
                                        {unreadInboxCount > 0 && (
                                            <span
                                                className="inline-flex min-w-[20px] h-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs px-1">
                      {unreadInboxCount}
                    </span>
                                        )}
                </span>
                                ) : (
                                    f.charAt(0).toUpperCase() + f.slice(1)
                                )}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowTemplates(true)}
                            className={`px-3 py-1.5 rounded text-sm ${
                                showTemplates
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                        >
                            Templates
                        </button>
                    </div>

                    <div className="flex-1 flex justify-center">
                        {!showTemplates && (
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search messages..."
                                className="px-3 py-1.5 border rounded w-1/3 text-sm"
                            />
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {!showTemplates ? (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 shadow text-sm"
                            >
                                Compose
                            </button>
                        ) : (
                            <button
                                onClick={() => window.dispatchEvent(new Event("openAddTemplate"))}
                                className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 shadow text-sm"
                            >
                                Add Template
                            </button>
                        )}
                    </div>
                </div>

                {/* CONTENT AREA */}
                {!showTemplates ? (
                    <>
                        {/* -------- Messages Table -------- */}
                        <table className="w-full border rounded bg-white shadow-sm text-sm">
                            <thead className="bg-gray-100 text-left">
                            <tr>
                                <th className="px-3 py-2">From</th>
                                <th className="px-3 py-2">To</th>
                                <th className="px-3 py-2">Subject</th>
                                <th className="px-3 py-2">Date/Time</th>
                                <th className="px-3 py-2 text-right">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedRows.length > 0 ? (
                                paginatedRows.map((m) => {
                                    const isInboxUnread = m.folder === "inbox" && !m.isRead;
                                    return (
                                        <tr key={m.id} className="border-t hover:bg-gray-50">
                                            <td className="px-3 py-2 flex items-center gap-2">
                        <span
                            className={`w-2 h-2 rounded-full ${
                                isInboxUnread ? "bg-blue-500" : "bg-transparent"
                            }`}
                        />
                                                <div
                                                    className={`w-8 h-8 flex items-center justify-center rounded-full text-white text-xs font-bold shadow ${m.avatar?.color}`}
                                                >
                                                    {m.avatar?.initials}
                                                </div>
                                                <span className="truncate">{m.sender}</span>
                                            </td>
                                            <td className="px-3 py-2">{m.recipient}</td>
                                            <td
                                                className={`px-3 py-2 truncate max-w-[260px] ${
                                                    isInboxUnread
                                                        ? "font-semibold text-gray-900"
                                                        : "text-gray-800"
                                                }`}
                                                title={m.body}
                                            >
                                                {m.subject}
                                                {isInboxUnread && (
                                                    <span
                                                        className="ml-2 inline-block text-[10px] font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 px-2 py-[2px] rounded">
                            NEW
                          </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                                                {new Date(m.createdAt).toLocaleDateString()} {m.time}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                {currentFolder === "archive" ? (
                                                    <button
                                                        onClick={() =>
                                                            restoreMessage(
                                                                m.id,
                                                                m.sender.includes("Provider") ? "sent" : "inbox"
                                                            )
                                                        }
                                                        className="text-green-600 hover:text-green-800"
                                                        title="Restore"
                                                    >
                                                        <ArrowUpToLine className="w-5 h-5"/>
                                                    </button>
                                                ) : (
                                                    <div className="flex gap-3 justify-end items-center">
                                                        <button
                                                            onClick={() => {
                                                                if (m.folder === "inbox" && !m.isRead)
                                                                    markAsRead(m.id);
                                                                setReplyingTo(m);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800"
                                                            title="Reply"
                                                        >
                                                            ↩
                                                        </button>
                                                        <button
                                                            onClick={() => archiveMessage(m.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Archive"
                                                        >
                                                            <ArrowDownToLine className="w-5 h-5"/>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-3 py-4 text-center text-gray-500 text-sm"
                                    >
                                        No messages found.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {rows.length > pageSize && (
                            <div className="flex justify-end items-center gap-2 mt-3 text-sm">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                <span>
                Page {currentPage} of {Math.ceil(rows.length / pageSize)}
              </span>
                                <button
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            p < Math.ceil(rows.length / pageSize) ? p + 1 : p
                                        )
                                    }
                                    disabled={currentPage >= Math.ceil(rows.length / pageSize)}
                                    className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <TemplateManagement/>
                )}
            </div>

            {/* Reply Modal */}
            {replyingTo && (
                <div className="fixed inset-0 z-[99999] grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-lg font-semibold mb-4">
                            Reply to {replyingTo.sender}
                        </h2>
                        <textarea
                            rows={5}
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value)}
                            placeholder="Type your reply..."
                            className="w-full p-2 border rounded"
                        />
                        <div className="flex justify-end gap-2 mt-3">
                            <button
                                onClick={() => {
                                    setReplyingTo(null);
                                    setReplyBody("");
                                }}
                                className="px-4 py-2 rounded bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={sendReply}
                                disabled={!replyBody.trim()}
                                className={`px-4 py-2 rounded ${
                                    replyBody.trim()
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-300 text-gray-600"
                                }`}
                            >
                                Send Reply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Compose Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-[99999] grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-lg font-semibold mb-4">New Message</h2>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs">From (Provider)</label>
                                    <select
                                        value={selectedProviderId}
                                        onChange={(e) => setSelectedProviderId(e.target.value)}
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="">-- Choose Provider --</option>
                                        {providers.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.identification?.firstName} {p.identification?.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs">Recipient (Patient)</label>
                                    <select
                                        value={selectedPatientId}
                                        onChange={(e) => setSelectedPatientId(e.target.value)}
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="">-- Choose Patient --</option>
                                        {patients.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.firstName} {p.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Template dropdown */}
                            <div className="flex gap-2">
                                <select
                                    value={selectedTemplateId === "" ? "" : String(selectedTemplateId)}
                                    onChange={(e) =>
                                        setSelectedTemplateId(
                                            e.target.value === "" ? "" : Number(e.target.value)
                                        )
                                    }
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="">Choose a template</option>
                                    {composeTemplateOptions.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.templateName}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={applySelectedTemplate}
                                    className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                                >
                                    Use
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedTemplateId("");
                                        setSubject("");
                                        setBody("");
                                    }}
                                    className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                                >
                                    Clear
                                </button>
                            </div>

                            <input
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Subject"
                                className="w-full p-2 border rounded"
                            />

                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={5}
                                placeholder="Message..."
                                className="w-full p-2 border rounded"
                            />

                            <div className="flex justify-between items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <label className="px-4 py-2 rounded bg-gray-100 cursor-pointer text-sm">
                                        Attach
                                        <input
                                            type="file"
                                            multiple
                                            hidden
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files || []);
                                                setAttachments((prev) =>
                                                    [...prev, ...files].slice(0, 5)
                                                );
                                            }}
                                        />
                                    </label>
                                    <button
                                        onClick={() => setIsCreating(false)}
                                        className="px-4 py-2 rounded bg-gray-100"
                                    >
                                        Discard
                                    </button>
                                </div>
                                <button
                                    onClick={createMessage}
                                    disabled={isSendDisabled}
                                    className={`px-4 py-2 rounded ${
                                        isSendDisabled
                                            ? "bg-gray-300 text-gray-600"
                                            : "bg-blue-600 text-white"
                                    }`}
                                >
                                    Send
                                </button>
                            </div>

                            {attachments.length > 0 && (
                                <ul className="mt-2 text-xs text-gray-600">
                                    {attachments.map((f, idx) => (
                                        <li key={idx}>{f.name}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}