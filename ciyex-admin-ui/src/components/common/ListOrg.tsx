"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Org = {
  id: number;
  orgName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  fhirId?: string | null;
  status: "ACTIVE" | "INACTIVE";
};

// ------------------ Modal ------------------
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
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

// ------------------ Status Chip (refined) ------------------
function StatusIcon({ status }: { status: "ACTIVE" | "INACTIVE" }) {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        isActive
          ? "bg-green-50 text-green-700 ring-1 ring-green-200"
          : "bg-red-50 text-red-700 ring-1 ring-red-200",
      ].join(" ")}
      aria-label={`Status: ${isActive ? "Active" : "Inactive"}`}
      title={isActive ? "Active" : "Inactive"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        {isActive ? (
          // Dot-in-circle (subtle "on")
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 6a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />
        ) : (
          // Hollow ring (subtle "off")
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16A8 8 0 0 1 12 4Z" />
        )}
      </svg>
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

// ------------------ Toggle Button (refined UI) ------------------
function ToggleStatusButton({
  status,
  onToggle,
  disabled,
}: {
  status: "ACTIVE" | "INACTIVE";
  onToggle: () => void;
  disabled?: boolean;
}) {
  const isActive = status === "ACTIVE";

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={isActive}
      aria-label={isActive ? "Set Inactive" : "Set Active"}
      title={isActive ? "Set Inactive" : "Set Active"}
      className={[
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/50 dark:focus-visible:ring-white/40",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isActive
          ? "bg-green-500 hover:bg-green-600"
          : "bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-700 dark:hover:bg-neutral-600",
      ].join(" ")}
    >
      {/* Track gloss (subtle) */}
      <span
        className={[
          "pointer-events-none absolute inset-0 rounded-full",
          "bg-white/10 mix-blend-overlay",
        ].join(" ")}
      />

      {/* Thumb */}
      <span
        className={[
          "pointer-events-none",
          "inline-flex h-5 w-5 translate-x-0 items-center justify-center rounded-full bg-white shadow ring-1 ring-black/5 transition-transform",
          isActive ? "translate-x-5" : "translate-x-1",
        ].join(" ")}
      >
        {/* Icon inside thumb */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {isActive ? (
            // Check (clean, rounded)
            <path d="M5 13l4 4L19 7" />
          ) : (
            // X (balanced diagonals)
            <>
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </>
          )}
        </svg>
      </span>
    </button>
  );
}

export default function OrganizationsTable() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Org | null>(null);
  const [form, setForm] = useState<Org | null>(null);
  const [pendingToggle, setPendingToggle] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    const orgId = localStorage.getItem("orgId") || "1";
    const facilityId = localStorage.getItem("facilityId") || "1";
    const role = localStorage.getItem("role") || "SUPER_ADMIN";

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orgs`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-org-id": orgId,
        "x-facility-id": facilityId,
        "x-role": role,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.data) {
          if (Array.isArray(data.data)) {
            setOrgs(data.data);
          } else if (data.data.content) {
            setOrgs(data.data.content);
          }
        } else if (Array.isArray(data)) {
          setOrgs(data);
        }
      })
      .catch((err) => console.error("Failed to load organizations:", err));
  }, []);

  const handleEdit = (org: Org) => {
    setEditing(org);
    setForm({ ...org });
    setShowModal(true);
  };

  const toggleStatus = (org: Org) => {
    if (pendingToggle[org.id]) return; // prevent concurrent

    const nextStatus = org.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    // optimistic update
    setOrgs((prev) => prev.map((o) => (o.id === org.id ? { ...o, status: nextStatus } : o)));
    setPendingToggle((p) => ({ ...p, [org.id]: true }));

    const token = localStorage.getItem("token");
    const orgId = localStorage.getItem("orgId") || "1";
    const facilityId = localStorage.getItem("facilityId") || "1";
    const role = localStorage.getItem("role") || "SUPER_ADMIN";

   fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orgs/${org.id}/status`, {
     method: "PUT",
     headers: {
       Authorization: `Bearer ${token}`,
       "Content-Type": "application/json",
       "x-org-id": String(org.id),   // ✅ use the org you’re updating
       "x-facility-id": facilityId,
       "x-role": role,
     },
     body: JSON.stringify({ status: nextStatus }),
   })

      .then((res) => {
        if (!res.ok) throw new Error("Failed to update status");
        return res.json();
      })
      .then((data) => {
        // assume backend returns updated org or at least success
        setOrgs((prev) => prev.map((o) => (o.id === org.id && data?.data ? data.data : o)));
      })
      .catch((err) => {
        console.error("Failed to toggle status:", err);
        // rollback
        setOrgs((prev) => prev.map((o) => (o.id === org.id ? { ...o, status: org.status } : o)));
      })
      .finally(() => setPendingToggle((p) => ({ ...p, [org.id]: false })));
  };

  const saveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // optimistic update
    setOrgs((prev) => prev.map((o) => (o.id === form.id ? form : o)));
    setShowModal(false);

    // persist to backend
    const token = localStorage.getItem("token");
    const orgId = localStorage.getItem("orgId") || "1";
    const facilityId = localStorage.getItem("facilityId") || "1";
    const role = localStorage.getItem("role") || "SUPER_ADMIN";

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orgs/${form.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-org-id": orgId,
        "x-facility-id": facilityId,
        "x-role": role,
      },
      body: JSON.stringify(form),
    }).catch((err) => {
      console.error("Failed to save organization:", err);
      // optional: refetch or rollback
    });
  };

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold">Organizations Table</h2>

      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="min-w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">NAME</th>
              <th className="px-6 py-3">ADDRESS</th>
              <th className="px-6 py-3">CITY</th>
              <th className="px-6 py-3">STATE</th>
              <th className="px-6 py-3">POSTAL CODE</th>
              <th className="px-6 py-3">COUNTRY</th>
              <th className="px-6 py-3">FHIR ID</th>
              <th className="px-6 py-3">STATUS</th>
              <th className="px-6 py-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org) => (
              <tr
                key={org.id}
                className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <td className="px-6 py-4">{org.id}</td>
                <td className="px-6 py-4">{org.orgName}</td>
                <td className="px-6 py-4">{org.address}</td>
                <td className="px-6 py-4">{org.city}</td>
                <td className="px-6 py-4">{org.state}</td>
                <td className="px-6 py-4">{org.postalCode || "—"}</td>
                <td className="px-6 py-4">{org.country}</td>
                <td className="px-6 py-4">{org.fhirId || "NA"}</td>
                <td className="px-6 py-4">
                  <StatusIcon status={org.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <ToggleStatusButton
                      status={org.status}
                      onToggle={() => toggleStatus(org)}
                      disabled={!!pendingToggle[org.id]}
                    />
                    <button
                      onClick={() => handleEdit(org)}
                      className="rounded-xl bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {orgs.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="px-6 py-4 text-center text-gray-400 dark:text-gray-500"
                >
                  No organizations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        {editing && form && (
          <form onSubmit={saveChanges} className="space-y-3">
            <h3 className="mb-4 text-lg font-semibold">Edit Organization</h3>

            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                value={form.orgName}
                onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Address</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">City</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">State</label>
                <input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">Postal Code</label>
                <input
                  value={form.postalCode ?? ""}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Country</label>
                <input
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>

            {/* Status is read-only here per your request (no toggle) */}
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <div className="inline-block">
                <StatusIcon status={form.status} />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
