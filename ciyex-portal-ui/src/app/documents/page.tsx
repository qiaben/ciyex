"use client";

import { useState } from "react";
import AdminLayout from "@/app/(admin)/layout";
import Alert from "@/components/ui/alert/Alert";

type Document = {
  id: number;
  title: string;
  category: "Clinical" | "Lab" | "Imaging" | "Insurance" | "Other";
  uploadedDate: string;
  uploadedBy: string;
  fileUrl: string;
  status: "Available" | "Pending" | "Reviewed";
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      title: "Chest X-Ray Report",
      category: "Imaging",
      uploadedDate: "2025-09-05",
      uploadedBy: "Radiology Dept.",
      fileUrl: "/files/chest-xray.pdf",
      status: "Available",
    },
    {
      id: 2,
      title: "Insurance Card",
      category: "Insurance",
      uploadedDate: "2025-08-20",
      uploadedBy: "Patient",
      fileUrl: "/files/insurance-card.pdf",
      status: "Reviewed",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<{
    title: string;
    category: Document["category"];
    file?: File | null;
  }>({
    title: "",
    category: "Other",
    file: null,
  });

  const [alert, setAlert] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "file" && files) {
      setForm((prev) => ({ ...prev, file: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const newDoc: Document = {
        id: Date.now(),
        title: form.title,
        category: form.category,
        uploadedDate: new Date().toISOString().split("T")[0],
        uploadedBy: "You",
        fileUrl: "#", // in real app: URL.createObjectURL(form.file!)
        status: "Pending",
      };
      setDocuments((prev) => [newDoc, ...prev]);
      setForm({ title: "", category: "Other", file: null });
      setShowModal(false);
      setAlert({
        variant: "success",
        title: "Uploaded",
        message: "Your document has been uploaded successfully.",
      });
    } catch {
      setAlert({
        variant: "error",
        title: "Error",
        message: "Could not upload document.",
      });
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            Documents
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            + Upload Document
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
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Uploaded By</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-2">{doc.title}</td>
                  <td className="px-4 py-2">{doc.category}</td>
                  <td className="px-4 py-2">{doc.uploadedBy}</td>
                  <td className="px-4 py-2">{doc.uploadedDate}</td>
                  <td
                    className={`px-4 py-2 font-medium ${
                      doc.status === "Available"
                        ? "text-green-600"
                        : doc.status === "Pending"
                        ? "text-yellow-600"
                        : "text-gray-500"
                    }`}
                  >
                    {doc.status}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      View
                    </a>
                    <a
                      href={doc.fileUrl}
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

        {/* upload modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md space-y-4 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Upload Document
              </h2>
              <form className="space-y-3" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm mb-1">Title</label>
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
                  <label className="block text-sm mb-1">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Clinical">Clinical</option>
                    <option value="Lab">Lab</option>
                    <option value="Imaging">Imaging</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">File</label>
                  <input
                    type="file"
                    name="file"
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 text-sm"
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
                    Upload
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
