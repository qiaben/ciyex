"use client";

import { useState } from "react";
import AdminLayout from "@/app/(admin)/layout";
import Alert from "@/components/ui/alert/Alert";

type Message = {
  id: number;
  threadId: number;
  date: string;
  subject: string;
  body: string;
  from: "You" | "Clinic";
  attachments?: string[]; // file names/URLs
  requiresAck?: boolean;
  acknowledged?: boolean;
  read?: boolean;
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      threadId: 100,
      date: "2025-09-01T09:30",
      subject: "Upcoming Appointment Reminder",
      body: "Your appointment is scheduled for Sep 5 at 10:00 AM.",
      from: "Clinic",
      read: false,
    },
    {
      id: 2,
      threadId: 100,
      date: "2025-09-02T11:15",
      subject: "Upcoming Appointment Reminder",
      body: "Thanks, I’ll be there.",
      from: "You",
      read: true,
    },
    {
      id: 3,
      threadId: 200,
      date: "2025-09-10T08:20",
      subject: "Lab Results Available",
      body: "Your blood test results are available in the portal.",
      from: "Clinic",
      requiresAck: true,
      read: false,
    },
  ]);

  const [activeThread, setActiveThread] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ subject: "", body: "" });

  const [alert, setAlert] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  function getThreads() {
    const threads: {
      id: number;
      subject: string;
      lastDate: string;
      lastBody: string;
      unread: boolean;
    }[] = [];
    messages.forEach((m) => {
      const existing = threads.find((t) => t.id === m.threadId);
      if (!existing) {
        threads.push({
          id: m.threadId,
          subject: m.subject,
          lastDate: m.date,
          lastBody: m.body,
          unread: m.from === "Clinic" && !m.read,
        });
      } else if (m.date > existing.lastDate) {
        existing.lastDate = m.date;
        existing.lastBody = m.body;
        if (m.from === "Clinic" && !m.read) existing.unread = true;
      }
    });
    return threads.sort((a, b) => (a.lastDate < b.lastDate ? 1 : -1));
  }

  function handleSendMessage() {
    if (!activeThread || !newMessage.trim()) return;
    const msg: Message = {
      id: Date.now(),
      threadId: activeThread,
      date: new Date().toISOString(),
      subject: messages.find((m) => m.threadId === activeThread)?.subject || "Message",
      body: newMessage,
      from: "You",
      attachments: attachments.map((f) => f.name),
      read: true,
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
    setAttachments([]);
  }

  function handleNewThread(e: React.FormEvent) {
    e.preventDefault();
    const newThreadId = Date.now();
    const msg: Message = {
      id: newThreadId,
      threadId: newThreadId,
      date: new Date().toISOString(),
      subject: form.subject,
      body: form.body,
      from: "You",
      read: true,
    };
    setMessages((prev) => [...prev, msg]);
    setForm({ subject: "", body: "" });
    setShowModal(false);
    setAlert({
      variant: "success",
      title: "Message Sent",
      message: "Your secure message has been sent to the clinic.",
    });
  }

  function markThreadRead(threadId: number) {
    setActiveThread(threadId);
    setMessages((prev) =>
      prev.map((m) => (m.threadId === threadId ? { ...m, read: true } : m))
    );
  }

  function handleAcknowledge(id: number) {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, acknowledged: true, requiresAck: false } : m
      )
    );
    setAlert({
      variant: "success",
      title: "Acknowledged",
      message: "You have acknowledged this message.",
    });
  }

  return (
    <AdminLayout>
      {/* Patient Header */}
      <div className="max-w-6xl mx-auto mb-4 p-4 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Secure Messaging</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Patient: <span className="font-medium">John Doe</span> • DOB: 01/15/1980 • MRN: 123456
        </p>
      </div>

      <div className="flex flex-col md:flex-row max-w-6xl mx-auto h-[75vh] border rounded-lg overflow-hidden shadow">
        {/* Sidebar threads */}
        <div className="w-full md:w-1/3 border-r dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white">
              Your Conversations
            </h3>
            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              + New
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {getThreads().map((t) => (
              <div
                key={t.id}
                onClick={() => markThreadRead(t.id)}
                className={`p-4 cursor-pointer border-b dark:border-gray-700 flex justify-between ${
                  activeThread === t.id
                    ? "bg-blue-50 dark:bg-gray-700"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-white truncate">
                    {t.subject}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{t.lastBody}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(t.lastDate).toLocaleString()}
                  </p>
                </div>
                {t.unread && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full h-fit">
                    New
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Conversation */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
          {activeThread ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages
                  .filter((m) => m.threadId === activeThread)
                  .map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-md px-4 py-2 rounded-lg shadow text-sm ${
                        m.from === "You"
                          ? "ml-auto bg-blue-600 text-white"
                          : "mr-auto bg-gray-200 dark:bg-gray-700 dark:text-white"
                      }`}
                    >
                      <p className="font-semibold mb-1">{m.from}</p>
                      <p>{m.body}</p>

                      {/* attachments */}
                      {m.attachments && m.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {m.attachments.map((a, idx) => (
                            <a
                              key={idx}
                              href="#"
                              className="block text-xs text-blue-200 underline"
                            >
                              📎 {a}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* acknowledgment */}
                      {m.requiresAck && !m.acknowledged && (
                        <button
                          onClick={() => handleAcknowledge(m.id)}
                          className="mt-2 px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                        >
                          Acknowledge
                        </button>
                      )}
                      {m.acknowledged && (
                        <p className="mt-2 text-xs text-green-400 font-semibold">
                          ✔ Acknowledged
                        </p>
                      )}

                      <p className="text-[11px] opacity-70 mt-1">
                        {new Date(m.date).toLocaleString()}
                      </p>
                    </div>
                  ))}
              </div>

              {/* Reply box */}
              <div className="p-3 border-t dark:border-gray-700 flex flex-col space-y-2 bg-white dark:bg-gray-800">
                <textarea
                  placeholder="Type your reply..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white"
                  rows={2}
                />
                <div className="flex items-center justify-between">
                  <input
                    type="file"
                    multiple
                    onChange={(e) =>
                      setAttachments(Array.from(e.target.files || []))
                    }
                    className="text-xs"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to view secure messages
            </div>
          )}
        </div>
      </div>

      {/* alerts */}
      {alert && (
        <div className="max-w-6xl mx-auto mt-4">
          <Alert variant={alert.variant} title={alert.title} message={alert.message} />
        </div>
      )}

      {/* new thread modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              New Secure Message
            </h2>
            <form className="space-y-3" onSubmit={handleNewThread}>
              <div>
                <label className="block text-sm mb-1">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  className="w-full border rounded px-2 py-1 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Message</label>
                <textarea
                  name="body"
                  value={form.body}
                  onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
                  className="w-full border rounded px-2 py-1 text-sm"
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1 text-sm rounded bg-gray-300 dark:bg-gray-600 dark:text-white hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Send Securely
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
