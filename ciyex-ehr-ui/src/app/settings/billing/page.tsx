"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/app/(admin)/layout";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import SubscriptionsPage from "./Subscriptions";
import InvoicesPage from "./InvoicesPage";
import CardsPage from "./card";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

/* ------------ Stripe ------------ */
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PK ||
    "pk_test_51S5UPvJSxIy1fnkK6dpKKhcedyuGTeD6IyZE4UtJ02MCHGyR28wFoCO9397j2JF31WGYLMLCH7cokGRkRDcugN2500tQtAXCJV"
);

/* ------------ Types ------------ */
type ApiResponse<T> = { success: boolean; message: string; data: T };

type BillingHistory = {
  id: number;
  externalId?: string;
  createdAt: string;
  amount: number;
  status: string;
  invoiceUrl?: string;
  receiptUrl?: string;
};

/* ------------ Helpers ------------ */
async function safeJson<T>(res: Response): Promise<ApiResponse<T> | null> {
  try {
    const text = await res.text();
    return text ? (JSON.parse(text) as ApiResponse<T>) : null;
  } catch {
    return null;
  }
}

const formatDate = (value?: string) => {
  if (!value) return "-";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "-" : d.toLocaleString();
};

const getStatusBadge = (status?: string) => {
  if (!status) return <span className="text-gray-500">-</span>;
  const base = "px-2 py-1 rounded text-xs font-semibold";
  switch (status.toUpperCase()) {
    case "PAID":
    case "SUCCEEDED":
      return (
        <span className={`${base} bg-green-100 text-green-700`}>{status}</span>
      );
    case "FAILED":
      return (
        <span className={`${base} bg-red-100 text-red-700`}>{status}</span>
      );
    case "UNPAID":
      return (
        <span className={`${base} bg-yellow-100 text-yellow-700`}>
          {status}
        </span>
      );
    case "ARCHIVED":
      return (
        <span className={`${base} bg-gray-200 text-gray-600`}>{status}</span>
      );
    default:
      return (
        <span className={`${base} bg-blue-100 text-blue-700`}>{status}</span>
      );
  }
};

/* ------------ Toast ------------ */
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => (
  <div
    className={`flex items-center justify-between p-3 mb-2 rounded shadow-lg text-white ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    }`}
  >
    <span>{message}</span>
    <button onClick={onClose} className="ml-4 text-white font-bold">
      ✕
    </button>
  </div>
);

const BillingPage = () => {
  const [currentTab, setCurrentTab] = useState<
    "subscriptions" | "invoices" | "history" | "cards"
  >("subscriptions");

  const [history, setHistory] = useState<BillingHistory[]>([]);
  const [toasts, setToasts] = useState<
    { id: number; message: string; type: "success" | "error" }[]
  >([]);

  function showToast(message: string, type: "success" | "error") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }

  useEffect(() => {
    if (currentTab === "history") {
      loadHistory();
    }
  }, [currentTab]);

  async function loadHistory() {
    try {
      const orgId = localStorage.getItem("orgId") || "1";
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invoice-bills/history`,
        { headers: { "X-Org-Id": orgId } }
      );
      const json = await safeJson<BillingHistory[]>(res);
      if (json?.success) setHistory(json.data);
    } catch (e) {
      console.error("Failed to load billing history", e);
      showToast("Failed to load billing history", "error");
    }
  }

  async function archiveHistory(id: number) {
    try {
      const orgId = localStorage.getItem("orgId") || "1";
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invoice-bills/${id}/archive`,
        { method: "PUT", headers: { "X-Org-Id": orgId } }
      );
      await loadHistory();
      showToast("History archived", "success");
    } catch {
      showToast("Failed to archive history", "error");
    }
  }

  async function unarchiveHistory(id: number) {
    try {
      const orgId = localStorage.getItem("orgId") || "1";
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invoice-bills/${id}/unarchive`,
        { method: "PUT", headers: { "X-Org-Id": orgId } }
      );
      await loadHistory();
      showToast("History unarchived", "success");
    } catch {
      showToast("Failed to unarchive history", "error");
    }
  }

  async function deleteHistory(id: number) {
    try {
      const orgId = localStorage.getItem("orgId") || "1";
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invoice-bills/${id}`,
        { method: "DELETE", headers: { "X-Org-Id": orgId } }
      );
      await loadHistory();
      showToast("History deleted", "success");
    } catch {
      showToast("Failed to delete history", "error");
    }
  }

  return (
    <AdminLayout>
      {/* Header Tabs */}
      <div className="flex justify-between items-center p-4 border-b bg-white">
        <div className="flex items-center gap-2">
          {(["subscriptions", "invoices", "history", "cards"] as const).map(
            (t) => (
              <button
                key={t}
                onClick={() => setCurrentTab(t)}
                className={`px-3 py-1.5 rounded text-sm ${
                  currentTab === t
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {t === "subscriptions"
                  ? "Subscriptions"
                  : t === "invoices"
                  ? "Invoices"
                  : t === "history"
                  ? "Billing History"
                  : "Cards"}
              </button>
            )
          )}
        </div>
      </div>

      <div className="p-6">
        {currentTab === "subscriptions" && <SubscriptionsPage />}
        {currentTab === "invoices" && <InvoicesPage />}
        {currentTab === "cards" && (
          <Elements stripe={stripePromise}>
            <CardsPage />
          </Elements>
        )}

        {currentTab === "history" && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Billing History</h2>
            <table className="table-auto w-full text-sm border rounded bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">No.</th>
                  <th className="px-4 py-2">Invoice #</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Invoice</th>
                  <th className="px-4 py-2">Receipt</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.length ? (
                  history.map((h, idx) => (
                    <tr key={h.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{idx + 1}</td>
                      <td className="px-4 py-2">{h.externalId ?? "N/A"}</td>
                      <td className="px-4 py-2">{formatDate(h.createdAt)}</td>
                      <td className="px-4 py-2">${h.amount.toFixed(2)}</td>
                      <td className="px-4 py-2">{getStatusBadge(h.status)}</td>
                      <td className="px-4 py-2">
                        {h.invoiceUrl ? (
                          <a
                            href={h.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {h.receiptUrl ? (
                          <a
                            href={h.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-2 space-x-3">
                        {h.status === "ARCHIVED" ? (
                          <button
                            onClick={() => unarchiveHistory(h.id)}
                            className="text-green-600 hover:underline"
                          >
                            Unarchive
                          </button>
                        ) : (
                          <button
                            onClick={() => archiveHistory(h.id)}
                            className="text-yellow-600 hover:underline"
                          >
                            Archive
                          </button>
                        )}
                        <button
                          onClick={() => deleteHistory(h.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-500">
                      No billing records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </div>

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 space-y-2 z-[100000]">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            onClose={() =>
              setToasts((prev) => prev.filter((x) => x.id !== t.id))
            }
          />
        ))}
      </div>
    </AdminLayout>
  );
};

export default BillingPage;
