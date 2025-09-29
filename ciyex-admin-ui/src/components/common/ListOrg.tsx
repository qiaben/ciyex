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
  active?: boolean;
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

export default function OrganizationsTable() {
  const [orgs, setOrgs] = useState<Org[]>([]);

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Org | null>(null);
  const [viewing, setViewing] = useState<Org | null>(null);
  const [form, setForm] = useState<Org | null>(null);

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
        if (data.data) {
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

  const handleView = (org: Org) => {
    setViewing(org);
    setEditing(null);
    setForm(null);
    setShowModal(true);
  };

  const handleEdit = (org: Org) => {
    setEditing(org);
    setViewing(null);
    setForm({ ...org });
    setShowModal(true);
  };

  const handleToggleActive = (id: number) => {
    setOrgs((prev) =>
      prev.map((o) => (o.id === id ? { ...o, active: !o.active } : o))
    );
  };

  const saveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setOrgs((prev) => prev.map((o) => (o.id === form.id ? form : o)));
    setShowModal(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Organizations Table</h2>
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
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
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
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
                  <button
                    onClick={() => handleToggleActive(org.id)}
                    className={`px-3 py-1 rounded font-medium ${
                      org.active
                        ? "text-green-700 bg-green-100 hover:bg-green-200"
                        : "text-red-700 bg-red-100 hover:bg-red-200"
                    }`}
                  >
                    {org.active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-6 py-4 flex space-x-2">
                  <button
                    onClick={() => handleView(org)}
                    className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(org)}
                    className="px-3 py-1 text-xs font-medium text-green-600 bg-green-100 rounded hover:bg-green-200"
                  >
                    Edit
                  </button>
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

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        {viewing && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Organization Details</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium">Name</dt>
                <dd>{viewing.orgName}</dd>
              </div>
              <div>
                <dt className="font-medium">Address</dt>
                <dd>{viewing.address}</dd>
              </div>
              <div>
                <dt className="font-medium">City</dt>
                <dd>{viewing.city}</dd>
              </div>
              <div>
                <dt className="font-medium">State</dt>
                <dd>{viewing.state}</dd>
              </div>
              <div>
                <dt className="font-medium">Postal Code</dt>
                <dd>{viewing.postalCode || "—"}</dd>
              </div>
              <div>
                <dt className="font-medium">Country</dt>
                <dd>{viewing.country}</dd>
              </div>
              <div>
                <dt className="font-medium">FHIR ID</dt>
                <dd>{viewing.fhirId || "NA"}</dd>
              </div>
            </dl>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {editing && form && (
          <form onSubmit={saveChanges} className="space-y-3">
            <h3 className="text-lg font-semibold mb-4">Edit Organization</h3>
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                value={form.orgName}
                onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Address</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">City</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">State</label>
              <input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
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
