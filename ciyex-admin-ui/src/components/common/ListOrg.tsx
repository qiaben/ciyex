"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Alert from "../ui/alert/Alert";

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

// ------------------ Status Chip ------------------
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
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

// ------------------ Toggle Button ------------------
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
      className={[
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isActive
          ? "bg-green-500 hover:bg-green-600"
          : "bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-700 dark:hover:bg-neutral-600",
      ].join(" ")}
    >
      <span
        className={[
          "pointer-events-none",
          "inline-flex h-5 w-5 translate-x-0 items-center justify-center rounded-full bg-white shadow ring-1 ring-black/5 transition-transform",
          isActive ? "translate-x-5" : "translate-x-1",
        ].join(" ")}
      >
        {isActive ? "✔" : "✖"}
      </span>
    </button>
  );
}

export default function OrganizationsTable() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Org | null>(null);
  const [form, setForm] = useState<Org | null>(null);
  const [pendingToggle, setPendingToggle] = useState<Record<number, boolean>>(
    {}
  );
  const [alertData, setAlertData] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    const facilityId = localStorage.getItem("facilityId") || "1";
    const role = localStorage.getItem("role") || "SUPER_ADMIN";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-facility-id": facilityId,
      "x-role": role,
    };

    // Only include Authorization header when a token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  };

  // Load organizations
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orgs`, {
      headers: getHeaders(),
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
      .catch((err) => {
        console.error("Failed to load organizations:", err);
        setAlertData({ variant: "error", title: "Load Error", message: "Failed to load organizations." });
      });
  }, []);

  // Auto-dismiss alerts after 4s
  useEffect(() => {
    if (alertData) {
      const t = setTimeout(() => setAlertData(null), 4000);
      return () => clearTimeout(t);
    }
  }, [alertData]);

  // Toggle status
  const toggleStatus = (org: Org) => {
    if (pendingToggle[org.id]) return;
    const nextStatus = org.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setOrgs((prev) =>
      prev.map((o) => (o.id === org.id ? { ...o, status: nextStatus } : o))
    );
    setPendingToggle((p) => ({ ...p, [org.id]: true }));

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orgs/${org.id}/status`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status: nextStatus }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update status");
        return res.json();
      })
      .then((data) => {
        if (data?.data) {
          setOrgs((prev) => prev.map((o) => (o.id === org.id ? data.data : o)));
        } else {
          // keep optimistic change
          setOrgs((prev) => prev.map((o) => (o.id === org.id ? { ...o, status: nextStatus } : o)));
        }
        setAlertData({ variant: "success", title: "Status Updated", message: `${org.orgName} is now ${nextStatus}` });
      })
      .catch((err) => {
        console.error("Failed to toggle status:", err);
        setOrgs((prev) =>
          prev.map((o) => (o.id === org.id ? { ...o, status: org.status } : o))
        );
        setAlertData({ variant: "error", title: "Update Failed", message: "Unable to update status." });
      })
      .finally(() => setPendingToggle((p) => ({ ...p, [org.id]: false })));
  };

  // Edit handler
  const handleEdit = (org: Org) => {
    setEditing(org);
    setForm({ ...org });
    setShowModal(true);
  };

  // Save updates
 const saveChanges = (e: React.FormEvent) => {
   e.preventDefault();
   if (!form) return;

   // optimistic update
   setOrgs((prev) => prev.map((o) => (o.id === form.id ? form : o)));
   setShowModal(false);

   fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orgs/${form.id}`, {
     method: "PUT",
     headers: getHeaders(),
     body: JSON.stringify(form),
   })
     .then((res) => {
       if (!res.ok) throw new Error("Failed to update organization");
       return res.json();
     })
     .then((data) => {
      // If server returns updated entity in `data`, use it; otherwise keep optimistic value
      if (data?.data) {
        setOrgs((prev) => prev.map((o) => (o.id === form.id ? data.data : o)));
      } else {
        // ensure state reflects saved form (optimistic already applied above)
        setOrgs((prev) => prev.map((o) => (o.id === form.id ? form : o)));
      }
      setAlertData({ variant: "success", title: "Saved", message: "Organization updated." });
     })
     .catch((err) => {
       console.error("Failed to save organization:", err);
       // rollback if needed
       setOrgs((prev) =>
         prev.map((o) => (o.id === form.id ? editing! : o))
       );
      setAlertData({ variant: "error", title: "Save Failed", message: "Unable to save organization." });
     });
 };


  return (
    <div className="p-6">
      {alertData && (
        <div className="mb-4">
          <Alert variant={alertData.variant} title={alertData.title} message={alertData.message} />
        </div>
      )}
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
                  onChange={(e) =>
                    setForm({ ...form, postalCode: e.target.value })
                  }
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
