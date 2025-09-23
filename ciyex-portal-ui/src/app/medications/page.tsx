"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/app/(admin)/layout";
import Alert from "@/components/ui/alert/Alert";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import Button from "@/components/ui/button/Button";
type Medication = {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  status: "Active" | "Discontinued";
};

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Medication>>({
    name: "",
    dosage: "",
    frequency: "",
    startDate: "",
    endDate: "",
    status: "Active",
  });
  const [alert, setAlert] = useState<{ variant: "success" | "error"; title: string; message: string } | null>(null);

  // Auto-dismiss alerts
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Load medications from backend
  useEffect(() => {
    loadMedications();
  }, []);

  async function loadMedications() {
    try {
      const res = await fetchWithAuth("/api/portal/medications");
      const data = await res.json();
      setMedications(data.data || []);
    } catch {
      setAlert({ variant: "error", title: "Error", message: "Failed to load medications." });
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const newMed: Medication = {
        id: Date.now(),
        name: form.name || "",
        dosage: form.dosage || "",
        frequency: form.frequency || "",
        startDate: form.startDate || "",
        endDate: form.endDate || undefined,
        status: (form.status as "Active" | "Discontinued") || "Active",
      };

      const res = await fetchWithAuth("/api/portal/medications", {
        method: "POST",
        body: JSON.stringify(newMed),
      });

      if (!res.ok) throw new Error();

      setMedications((prev) => [...prev, newMed]);
      setForm({ name: "", dosage: "", frequency: "", startDate: "", endDate: "", status: "Active" });
      setShowModal(false);
      setAlert({ variant: "success", title: "Medication Added", message: "The medication has been added successfully." });
    } catch {
      setAlert({ variant: "error", title: "Error", message: "Could not save medication." });
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Medications</h1>
          <Button onClick={() => setShowModal(true)}>+ Add Medication</Button>
        </div>

        {/* alerts */}
        {alert && <Alert variant={alert.variant} title={alert.title} message={alert.message} />}

        {/* table */}
        <div className="overflow-x-auto border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Dosage</th>
                <th className="px-4 py-2">Frequency</th>
                <th className="px-4 py-2">Start Date</th>
                <th className="px-4 py-2">End Date</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {medications.map((m) => (
                <tr key={m.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2">{m.name}</td>
                  <td className="px-4 py-2">{m.dosage}</td>
                  <td className="px-4 py-2">{m.frequency}</td>
                  <td className="px-4 py-2">{m.startDate}</td>
                  <td className="px-4 py-2">{m.endDate ? m.endDate : "-"}</td>
                  <td
                    className={`px-4 py-2 font-medium ${
                      m.status === "Active" ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {m.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md space-y-4 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Add Medication</h2>
              <form className="space-y-3" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Dosage</label>
                  <input
                    type="text"
                    name="dosage"
                    value={form.dosage || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 text-sm"
                    placeholder="e.g., 10 mg"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Frequency</label>
                  <input
                    type="text"
                    name="frequency"
                    value={form.frequency || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 text-sm"
                    placeholder="e.g., Once daily"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-2 pt-3">
                  <Button variant="outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button>Save</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
