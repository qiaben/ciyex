"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import AdminLayout from "@/app/(admin)/layout";
import Alert from "../ui/alert/Alert";

// ------------------ Types ------------------
export type Template = {
  id?: number | string; // backend likely Long; keep union for safety
  locations: string; // logical grouping (formerly "classpath")
  practiceType: string;
};

// ------------------ Utils ------------------
const classIf = (cond: boolean, yes: string, no = "") => (cond ? yes : no);

async function safeJson<T = unknown>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function authHeaders(extra?: Record<string, string>) {
  const token = localStorage.getItem("token");
  const orgId = localStorage.getItem("orgId") || "1";
  const facilityId = localStorage.getItem("facilityId") || "1";
  const role = localStorage.getItem("role") || "SUPER_ADMIN";
  return {
    Authorization: `Bearer ${token}`,
    "x-org-id": orgId,
    "x-facility-id": facilityId,
    "x-role": role,
    Accept: "application/json",
    ...(extra || {}),
  } as HeadersInit;
}

// ------------------ Portal Modal ------------------
function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

// ------------------ Main Component ------------------
export default function Templates() {
  const [rows, setRows] = useState<Template[]>([]);
  const [query, setQuery] = useState("");
  const [locationsFilter, setLocationsFilter] = useState("All Locations");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [sortKey, setSortKey] = useState<keyof Template>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Modal + form state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState<Template>({ id: undefined, locations: "", practiceType: "" });
  const [error, setError] = useState<string>("");

  // UX states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | string | null>(null);
  const [alertData, setAlertData] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_URL, []);

  // Pagination
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Load data (server-side pagination)
  const loadPage = React.useCallback(async (p = page, s = size) => {
    setLoading(true);
    try {
      const url = `${apiBase}/api/admin/templates?page=${p}&size=${s}`;
      const res = await fetch(url, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Load failed (${res.status})`);
      const json = (await safeJson(res)) as unknown;

      // total count is supplied in header when paginated
      const totalHeader = res.headers.get("X-Total-Count");
      const total = totalHeader ? parseInt(totalHeader, 10) : undefined;
      if (typeof total === "number" && !isNaN(total)) setTotalCount(total);

      // Narrow the unknown JSON safely
      if (Array.isArray(json)) {
        setRows(json as Template[]);
      } else if (json && typeof json === "object") {
        const asRecord = json as Record<string, unknown>;
        const maybeData = asRecord["data"];
        if (Array.isArray(maybeData)) setRows(maybeData as Template[]);
        else setRows([]);
      } else {
        setRows([]);
      }
    } catch (e) {
      console.error("Failed to load templates:", e);
      setAlertData({ variant: "error", title: "Load Error", message: "Failed to load templates." });
      setRows([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [apiBase, page, size]);

  useEffect(() => {
    // guard for apiBase absence
    if (!apiBase) return;
    // call loadPage for current page/size
    void loadPage(page, size);
    // no cleanup required
  }, [apiBase, loadPage, page, size]);

  // Auto-dismiss alerts after 4s
  useEffect(() => {
    if (alertData) {
      const t = setTimeout(() => setAlertData(null), 4000);
      return () => clearTimeout(t);
    }
  }, [alertData]);

  // Derived lists (from current page rows)
  const allLocations = useMemo(
    () => Array.from(new Set(rows.map((r) => r.locations))).sort(),
    [rows]
  );
  const allTypes = useMemo(
    () => Array.from(new Set(rows.map((r) => r.practiceType))).sort(),
    [rows]
  );

  // When using server-side pagination rows represents the current page content.
  // We still allow client-side query/filter for filtering within the page, but
  // the primary pagination counts come from totalCount returned by server.
  const filtered = useMemo(() => {
    let list = [...rows];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((r) =>
        [String(r.id ?? ""), r.locations, r.practiceType]
          .join("\u0000")
          .toLowerCase()
          .includes(q)
      );
    }

    if (locationsFilter !== "All Locations") list = list.filter((r) => r.locations === locationsFilter);
    if (typeFilter !== "All Types") list = list.filter((r) => r.practiceType === typeFilter);

    list.sort((a, b) => {
      const A = String(a[sortKey] ?? "").toLowerCase();
      const B = String(b[sortKey] ?? "").toLowerCase();
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [rows, query, locationsFilter, typeFilter, sortKey, sortDir]);

  const total = totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const pageData = filtered; // server already returned only current page rows

  // If totalCount or size changes, ensure current page is within bounds
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalCount, size, totalPages, page]);

  // Actions
  const openCreate = () => {
    setEditing(null);
    setForm({ id: undefined, locations: "", practiceType: "" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (t: Template) => {
    setEditing(t);
    setForm({ ...t });
    setError("");
    setShowModal(true);
  };

  const remove = async (id?: number | string) => {
    if (id == null) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${apiBase}/api/admin/templates/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
  if (!res.ok) throw new Error(`Delete failed (${res.status})`);
  // refresh current page from server to keep pagination consistent
  await loadPage(page, size);
  setAlertData({ variant: "success", title: "Deleted", message: "Template deleted." });
    } catch (e) {
      console.error("Failed to delete template:", e);
      setAlertData({ variant: "error", title: "Delete Failed", message: "Unable to delete template." });
    } finally {
      setDeletingId(null);
    }
  };

  const validate = (draft: Template) => {
    if (!draft.locations?.trim()) return "Locations is required";
    if (!draft.practiceType?.trim()) return "Practice type is required";
    return "";
  };

  const upsert = async (e: React.FormEvent) => {
    e.preventDefault();
    const draft: Template = {
      ...form,
      locations: form.locations.trim(),
      practiceType: form.practiceType.trim(),
    };
    const msg = validate(draft);
    if (msg) return setError(msg);

    setSaving(true);
    try {
      const isEdit = Boolean(editing?.id ?? draft.id);
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit
        ? `${apiBase}/api/admin/templates/${editing?.id ?? draft.id}`
        : `${apiBase}/api/admin/templates`;

      const res = await fetch(url, {
        method,
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error(`${isEdit ? "Update" : "Create"} failed (${res.status})`);

      // Refresh the current page — server assigns IDs and pagination must stay consistent
      await loadPage(page, size);
      if (isEdit) {
        setAlertData({ variant: "success", title: "Updated", message: "Template updated." });
      } else {
        setAlertData({ variant: "success", title: "Created", message: "Template created." });
      }

      setShowModal(false);
    } catch (e) {
      console.error("Failed to save template:", e);
      setAlertData({ variant: "error", title: "Save Failed", message: "Unable to save template." });
    } finally {
      setSaving(false);
    }
  };

  const toggleSort = (key: keyof Template) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-neutral-900 dark:text-neutral-100">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Alert */}
          {alertData && (
            <div className="mb-4">
              <Alert variant={alertData.variant} title={alertData.title} message={alertData.message} />
            </div>
          )}
          {/* Header */}
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                Manage reusable templates with ID, locations and practice type.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={openCreate}
                className="inline-flex items-center rounded-2xl border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                + New Template
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Search</label>
              <input
                value={query}
                onChange={(e) => {
                  setPage(1);
                  setQuery(e.target.value);
                }}
                placeholder="Search by id, locations or type"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-white dark:focus:ring-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Locations</label>
              <select
                value={locationsFilter}
                onChange={(e) => {
                  setPage(1);
                  setLocationsFilter(e.target.value);
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-white dark:focus:ring-white"
              >
                <option>All Locations</option>
                {allLocations.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Practice Type</label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setPage(1);
                  setTypeFilter(e.target.value);
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-white dark:focus:ring-white"
              >
                <option>All Types</option>
                {allTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Page Size</label>
              <select
                value={size}
                onChange={(e) => {
                  setPage(1);
                  setSize(Number(e.target.value));
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-white dark:focus:ring-white"
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading / Error */}
          {loading && (
            <div className="mb-3 rounded-xl border border-dashed p-4 text-sm text-gray-500 dark:border-neutral-700 dark:text-neutral-400">
              Loading templates…
            </div>
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-800">
              <thead className="bg-gray-50/70 dark:bg-neutral-900/50">
                <tr>
                  {[
                    { key: "id", label: "Template ID" },
                    { key: "locations", label: "Locations" },
                    { key: "practiceType", label: "Practice Type" },
                    { key: "actions", label: "Actions" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-neutral-400"
                    >
                      {col.key !== "actions" ? (
                        <button
                          onClick={() => toggleSort(col.key as keyof Template)}
                          className="flex items-center gap-1 hover:underline"
                        >
                          {col.label}
                          <span className="text-[10px] opacity-60">
                            {sortKey === (col.key as keyof Template) ? (sortDir === "asc" ? "▲" : "▼") : ""}
                          </span>
                        </button>
                      ) : (
                        col.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                {pageData.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-neutral-400">
                      No templates found.
                    </td>
                  </tr>
                )}
                {pageData.map((t) => (
                  <tr key={String(t.id)} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">{String(t.id ?? "")}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">{t.locations}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">{t.practiceType}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(t)}
                          className="rounded-xl border border-gray-300 px-3 py-1 text-xs font-medium transition hover:bg-gray-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(t.id ?? null)}
                          disabled={deletingId === t.id}
                          className={
                            "rounded-xl border px-3 py-1 text-xs font-medium transition " +
                            classIf(
                              deletingId === t.id,
                              "cursor-wait border-red-200 text-red-300 dark:border-red-900/40 dark:text-red-800",
                              "border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800/60 dark:hover:bg-red-900/30"
                            )
                          }
                        >
                          {deletingId === t.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="text-sm text-gray-600 dark:text-neutral-400">
              Showing <span className="font-medium">{pageData.length}</span> of {" "}
              <span className="font-medium">{total}</span> templates
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={
                  "rounded-xl border px-3 py-1 text-sm " +
                  classIf(
                    page <= 1,
                    "cursor-not-allowed border-gray-200 text-gray-300 dark:border-neutral-800 dark:text-neutral-700",
                    "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  )
                }
              >
                Prev
              </button>
              <span className="text-sm">
                Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className={
                  "rounded-xl border px-3 py-1 text-sm " +
                  classIf(
                    page >= totalPages,
                    "cursor-not-allowed border-gray-200 text-gray-300 dark:border-neutral-800 dark:text-neutral-700",
                    "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  )
                }
              >
                Next
              </button>
            </div>
          </div>

          {/* Modal (Portal) */}
          <Modal open={showModal} onClose={() => setShowModal(false)}>
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-lg font-semibold">{editing ? "Edit Template" : "New Template"}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800/60 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={upsert} className="space-y-3">
              {/* ID is optional; backend will assign if absent. Show only when editing. */}
              {editing && (
                <div>
                  <label className="mb-1 block text-sm font-medium">Template ID</label>
                  <input
                    value={String(form.id ?? "")}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    disabled
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-white dark:focus:ring-white"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium">Locations</label>
                <input
                  value={form.locations}
                  onChange={(e) => setForm({ ...form, locations: e.target.value })}
                  placeholder="e.g., IntakeForms"
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-white dark:focus:ring-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Practice Type</label>
                <select
                  value={form.practiceType}
                  onChange={(e) => setForm({ ...form, practiceType: e.target.value })}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-white dark:focus:ring-white"
                >
                  <option value="">Select…</option>
                  <option>Medical</option>
                  <option>Dental</option>
                  <option>Vision</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={
                    "rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition " +
                    (saving
                      ? "cursor-wait bg-gray-400 dark:bg-neutral-700"
                      : "bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200")
                  }
                >
                  {saving ? (editing ? "Saving…" : "Creating…") : editing ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </Modal>

          {/* In-app Delete Confirmation Modal (replaces window.confirm) */}
          {confirmDeleteId != null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900">Delete Template</h3>
                <p className="mt-2 text-sm text-gray-600">Are you sure you want to delete this template?</p>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      // call existing remove() and close modal
                      const id = confirmDeleteId as string | number;
                      setConfirmDeleteId(null);
                      await remove(id);
                    }}
                    className="rounded-md bg-rose-600 px-4 py-2 text-white hover:bg-rose-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
