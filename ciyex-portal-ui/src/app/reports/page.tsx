"use client";

import { useState } from "react";
import AdminLayout from "@/app/(admin)/layout";
import Alert from "@/components/ui/alert/Alert";

type Report = {
  id: number;
  title: string;
  type: "Visit Summary" | "Lab Report" | "Invoice" | "Other";
  date: string;
  fileUrl: string;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      title: "Visit Summary - Sep 2025",
      type: "Visit Summary",
      date: "2025-09-05",
      fileUrl: "/files/visit-summary-sep2025.pdf",
    },
    {
      id: 2,
      title: "CBC Lab Report",
      type: "Lab Report",
      date: "2025-09-10",
      fileUrl: "/files/cbc-lab-report.pdf",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", type: "Other" });

  const [alert, setAlert] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const newReport: Report = {
        id: Date.now(),
        title: form.title,
        type: form.type as Report["type"],
        date: new Date().toISOString().split("T")[0],
        fileUrl: "#", // placeholder
      };
      setReports((prev) => [newReport, ...prev]);
      setForm({ title: "", type: "Other" });
      setShowModal(false);
      setAlert({
        variant: "success",
        title: "Report Requested",
        message: "Your report has been added successfully.",
      });
    } catch {
      setAlert({
        variant: "error",
        title: "Error",
        message: "Could not request report.",
      });
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            Reports
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            + Request Report
          </button>
        </div>

        {/* alerts */}
        {alert && (
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
          />
        )}

        {/* table */}
        <div className="overflow-x-auto border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr
                  key={r.id}
                  className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-2">{r.title}</td>
                  <td className="px-4 py-2">{r.type}</td>
                  <td className="px-4 py-2">{r.date}</td>
                  <td className="px-4 py-2 space-x-2">
                    <a
                      href={r.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      View
                    </a>
                    <a
                      href={r.fileUrl}
                      download
                      className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* request modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md space-y-4 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Request Report
              </h2>
              <form className="space-y-3" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm mb-1">Report Title</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Type</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Visit Summary">Visit Summary</option>
                    <option value="Lab Report">Lab Report</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Other">Other</option>
                  </select>
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
                    Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
