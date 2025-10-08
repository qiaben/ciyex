"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/app/(admin)/layout";
import Alert from "@/components/ui/alert/Alert";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import Button from "@/components/ui//button/Button";

type Invoice = {
  id: number;
  patient: string;
  amount: number;
  balance: number;
  status: "Open" | "Closed" | "Pending";
  createdDate: string | string[] | number[];
};

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Invoice>>({
    patient: "",
    amount: 0,
    balance: 0,
    status: "Open",
    createdDate: "",
  });
  const [alert, setAlert] = useState<{ variant: "success" | "error"; title: string; message: string } | null>(null);

  // Auto-dismiss alerts
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Load invoices from backend
  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      const res = await fetchWithAuth("/api/portal/billing");
      const data = await res.json();
      setInvoices(data.data || []);
    } catch {
      setAlert({ variant: "error", title: "Error", message: "Failed to load invoices." });
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "amount" || name === "balance" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const newInvoice: Invoice = {
        id: Date.now(),
        patient: form.patient || "",
        amount: form.amount || 0,
        balance: form.balance || 0,
        status: (form.status as "Open" | "Closed" | "Pending") || "Open",
        createdDate: form.createdDate || new Date().toISOString().split("T")[0],
      };

      // Save to backend
      const res = await fetchWithAuth("/api/portal/billing", {
        method: "POST",
        body: JSON.stringify(newInvoice),
      });

      if (!res.ok) throw new Error();

      setInvoices((prev) => [...prev, newInvoice]);
      setForm({ patient: "", amount: 0, balance: 0, status: "Open", createdDate: "" });
      setShowModal(false);
      setAlert({ variant: "success", title: "Invoice Created", message: "The invoice has been added to billing records." });
    } catch {
      setAlert({ variant: "error", title: "Error", message: "Could not save invoice." });
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Billing & Invoices</h1>
          <Button onClick={() => setShowModal(true)}>+ Create Invoice</Button>
        </div>

        {/* alerts */}
        {alert && <Alert variant={alert.variant} title={alert.title} message={alert.message} />}

        {/* table */}
        <div className="overflow-x-auto border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="px-4 py-2">Invoice #</th>
                <th className="px-4 py-2">Patient</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Balance</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2">{inv.id}</td>
                  <td className="px-4 py-2">{inv.patient}</td>
                  <td className="px-4 py-2">${inv.amount.toFixed(2)}</td>
                  <td className="px-4 py-2">${inv.balance.toFixed(2)}</td>
                  <td
                    className={`px-4 py-2 font-medium ${
                      inv.status === "Open"
                        ? "text-green-600"
                        : inv.status === "Closed"
                        ? "text-gray-500"
                        : "text-yellow-600"
                    }`}
                  >
                    {inv.status}
                  </td>
                  <td className="px-4 py-2">{
                    // Normalize a few possible formats we receive from backend: 
                    // - date-only string (yyyy-MM-dd)
                    // - full ISO datetime (yyyy-MM-ddTHH:mm:ss...)
                    // - array from some serializers [yyyy,MM,dd,...]
                    (() => {
                      const val = inv.createdDate as string | string[] | number[];
                      try {
                        if (Array.isArray(val)) {
                          // try to interpret [yyyy,MM,dd,...]
                          const [y, m, d] = val;
                          if (y && m && d) return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                          return String(val);
                        }
                        if (typeof val === "string") {
                          // if ISO datetime, split at 'T'
                          if (val.includes("T")) return val.split("T")[0];
                          // if already date-only
                          return val;
                        }
                        return String(val ?? "");
                      } catch {
                        return String(inv.createdDate ?? "");
                      }
                    })()
                  }</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md space-y-4 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Create Invoice</h2>
              <form className="space-y-3" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm mb-1">Patient</label>
                  <input
                    type="text"
                    name="patient"
                    value={form.patient || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount || 0}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Balance</label>
                  <input
                    type="number"
                    name="balance"
                    value={form.balance || 0}
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
                    <option value="Open">Open</option>
                    <option value="Pending">Pending</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Date</label>
                  <input
                    type="date"
                    name="createdDate"
                    value={
                      Array.isArray(form.createdDate)
                        ? (() => {
                            const [y, m, d] = form.createdDate;
                            if (y && m && d) return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                            return "";
                          })()
                        : typeof form.createdDate === "string"
                        ? form.createdDate
                        : ""
                    }
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
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
