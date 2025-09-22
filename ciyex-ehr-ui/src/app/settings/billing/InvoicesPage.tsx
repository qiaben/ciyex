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
};

async function safeJson<T>(res: Response): Promise<ApiResponse<T> | null> {
    try {
        const text = await res.text();
        return text ? (JSON.parse(text) as ApiResponse<T>) : null;
    } catch {
        return null;
    }
}

const formatDate = (d?: string) => {
    if (!d) return "-";
    const date = new Date(d);
    return date.toLocaleDateString();
};

const InvoicesPage = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);

    async function loadInvoices() {
        const res = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/invoice-bills`,
            {
                headers: { "x-org-id": "1" }, // TODO: replace with real orgId
            }
        );
        const json = await safeJson<Invoice[]>(res);
        if (json?.success) {
            // only show UNPAID invoices here
            setInvoices(json.data.filter((i) => i.status === "UNPAID"));
        }
    }

    async function payInvoice(id: number) {
        setLoading(true);
        try {
            const res = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/invoice-bills/${id}/pay`,
                {
                    method: "PUT",
                    headers: { "x-org-id": "1" },
                }
            );
            const json = await safeJson<Invoice>(res);
            if (json?.success) {
                alert("Invoice paid successfully!");
                await loadInvoices();
            } else {
                alert(json?.message || "Payment failed");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadInvoices();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Pending Invoices</h1>
            <table className="table-auto w-full text-sm border rounded bg-white">
                <thead className="bg-gray-100">
                <tr>
                    <th className="px-4 py-2">Invoice #</th>
                    <th className="px-4 py-2">Customer</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Due Date</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Created</th>
                    <th className="px-4 py-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                {invoices.length ? (
                    invoices.map((inv) => (
                        <tr key={inv.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-2">{inv.externalId}</td>
                            <td className="px-4 py-2">
                                {inv.userId ? `User ${inv.userId}` : `Org ${inv.orgId}`}
                            </td>
                            <td className="px-4 py-2">${inv.amount.toFixed(2)}</td>
                            <td className="px-4 py-2">{formatDate(inv.dueDate)}</td>
                            <td className="px-4 py-2">{inv.status}</td>
                            <td className="px-4 py-2">{formatDate(inv.createdAt)}</td>
                            <td className="px-4 py-2 space-x-2">
                                <button
                                    disabled={loading}
                                    onClick={() => payInvoice(inv.id)}
                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    {loading ? "Processing..." : "Pay Now"}
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={7} className="text-center py-6 text-gray-500">
                            No pending invoices 🎉
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default InvoicesPage;
