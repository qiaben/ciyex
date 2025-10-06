"use client";
import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

type ApiResponse<T> = { success: boolean; message: string; data: T };

type Invoice = {
  id: number;
  externalId: string;
  amount: number;
  status: string;
  createdAt: string;
  dueDate?: string;
  orgId?: number;
  userId?: number;
  subscriptionId?: number;
  receiptUrl?: string;
  paidAt?: string;
};

const formatDate = (d?: string) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString();
};

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("UNPAID");

  async function loadInvoices() {
    const orgId = localStorage.getItem("orgId") || "1";
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/invoice-bills`,
      {
        headers: { "X-Org-Id": orgId }, // ✅ correct header
      }
    );

    const text = await res.text();
    console.log("Invoices API raw response:", text);

    try {
      const parsed: ApiResponse<Invoice[]> = text ? JSON.parse(text) : null;
      const invoices =
        parsed?.data && Array.isArray(parsed.data) ? parsed.data : [];
      setInvoices(invoices);
    } catch (e) {
      console.error("Invoice JSON parse error", e);
    }
  }

  async function payInvoice(id: number) {
    setLoadingId(id);
    try {
      const orgId = localStorage.getItem("orgId") || "1";
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invoice-bills/${id}/pay`,
        {
          method: "PUT",
          headers: { "X-Org-Id": orgId },
        }
      );

      const text = await res.text();
      console.log("Pay API raw response:", text);

      const parsed: ApiResponse<Invoice> = text ? JSON.parse(text) : null;
      if (parsed?.success) {
        alert("Invoice paid successfully!");
        await loadInvoices();
      } else {
        alert(parsed?.message || "Payment failed");
      }
    } finally {
      setLoadingId(null);
    }
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices =
    statusFilter === "ALL"
      ? invoices
      : invoices.filter((inv) => inv.status === statusFilter);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Invoices</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="ALL">All</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      <table className="table-auto w-full text-sm border rounded bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Invoice #</th>
            <th className="px-4 py-2">Customer</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Due Date</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Created</th>
            <th className="px-4 py-2">Paid Date</th>
            <th className="px-4 py-2">Receipt</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.length ? (
            filteredInvoices.map((inv) => (
              <tr key={inv.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{inv.externalId}</td>
                <td className="px-4 py-2">
                  {inv.userId ? `User ${inv.userId}` : `Org ${inv.orgId}`}
                </td>
                <td className="px-4 py-2">${inv.amount.toFixed(2)}</td>
                <td className="px-4 py-2">{formatDate(inv.dueDate)}</td>
                <td className="px-4 py-2">{inv.status}</td>
                <td className="px-4 py-2">{formatDate(inv.createdAt)}</td>
                <td className="px-4 py-2">{formatDate(inv.paidAt)}</td>
                <td className="px-4 py-2">
                  {inv.receiptUrl ? (
                    <a
                      href={inv.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Download
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-2 space-x-2">
                  {inv.status !== "PAID" && (
                    <button
                      disabled={loadingId === inv.id}
                      onClick={() => payInvoice(inv.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      {loadingId === inv.id ? "Processing..." : "Pay Now"}
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="text-center py-6 text-gray-500">
                No invoices found 🎉
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoicesPage;
