"use client";

import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

/* ------------ Types ------------ */
interface Subscription {
    id: number;
    service: string;
    billingCycle: "Yearly" | "Monthly";
    startDate: string;
    price: number;
}

interface Service {
    id: number;
    name: string;
    defaultPrice: string;
}

type ApiResponse<T> = { success: boolean; message: string; data: T };

/* ------------ Helpers ------------ */
async function safeJson<T>(res: Response): Promise<ApiResponse<T> | null> {
    try {
        const text = await res.text();
        return text ? (JSON.parse(text) as ApiResponse<T>) : null;
    } catch {
        return null;
    }
}

/* ------------ Subscription Form ------------ */
function SubscriptionForm({
                              mode,
                              subscription,
                              onClose,
                              onSaved,
                          }: {
    mode: "add" | "edit";
    subscription?: Subscription;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [service, setService] = useState(subscription?.service || "");
    const [billingCycle, setBillingCycle] = useState<"Yearly" | "Monthly">(
        subscription?.billingCycle || "Yearly"
    );
    const [startDate, setStartDate] = useState(subscription?.startDate || "");
    const [price, setPrice] = useState(subscription?.price || 0);
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [providerCount, setProviderCount] = useState(1);

    // Load services
    useEffect(() => {
        (async () => {
            try {
                const res = await fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/services`
                );
                const json = await safeJson<Service[]>(res);
                if (json?.success) setServices(json.data);
            } catch (err) {
                console.error("Error fetching services:", err);
            }
        })();
    }, []);

    // Load provider count
    useEffect(() => {
        (async () => {
            try {
                const res = await fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/providers/count`
                );
                const json = await safeJson<number>(res);
                if (json?.success) setProviderCount(json.data);
            } catch (err) {
                console.error("Error fetching provider count:", err);
            }
        })();
    }, []);

    // Auto-calculate price for EHR
    useEffect(() => {
        const svc = services.find((s) => s.name === service);
        if (service === "EHR" && svc) {
            const base = parseFloat(svc.defaultPrice || "0");
            setPrice(base * providerCount);
        }
    }, [service, services, providerCount]);

    async function handleSubmit() {
        setLoading(true);
        try {
            const url =
                mode === "add"
                    ? `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions`
                    : `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/${subscription?.id}`;

            const res = await fetchWithAuth(url, {
                method: mode === "add" ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ service, billingCycle, startDate, price }),
            });

            const json = await safeJson<Subscription>(res);
            if (json?.success) {
                onSaved();
                onClose();
            } else {
                alert(json?.message || "Failed to save subscription");
            }
        } catch (err) {
            console.error("Error saving subscription:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>

                <h2 className="text-lg font-semibold mb-4">
                    {mode === "add" ? "Add Subscription" : "Edit Subscription"}
                </h2>

                <div className="space-y-3">
                    {/* Service */}
                    <div>
                        <label className="block text-sm mb-1">Service</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={service}
                            onChange={(e) => setService(e.target.value)}
                        >
                            <option value="">Select Service</option>
                            {services.map((s) => (
                                <option key={s.id} value={s.name}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Billing Cycle */}
                    <div>
                        <label className="block text-sm mb-1">Billing Cycle</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={billingCycle}
                            onChange={(e) =>
                                setBillingCycle(e.target.value as "Yearly" | "Monthly")
                            }
                        >
                            <option value="Yearly">Yearly</option>
                            <option value="Monthly">Monthly</option>
                        </select>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-sm mb-1">Start Date</label>
                        <input
                            type="date"
                            className="w-full p-2 border rounded"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm mb-1">Price ($)</label>
                        <input
                            type="number"
                            className="w-full p-2 border rounded"
                            value={price}
                            disabled={service === "EHR"}
                            onChange={(e) => setPrice(Number(e.target.value))}
                        />
                        {service === "EHR" && (
                            <p className="text-xs text-gray-500 mt-1">
                                Auto: base price × {providerCount} providers = ${price}
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ------------ Subscriptions Page ------------ */
export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Subscription | null>(null);
    const [providerCount, setProviderCount] = useState(1);
    const [services, setServices] = useState<Service[]>([]);

    async function loadSubscriptions() {
        try {
            const res = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions`
            );
            const json = await safeJson<Subscription[]>(res);
            if (json?.success) setSubscriptions(json.data);
        } catch (err) {
            console.error("Error fetching subscriptions:", err);
        }
    }

    useEffect(() => {
        (async () => {
            try {
                const res1 = await fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/providers/count`
                );
                const json1 = await safeJson<number>(res1);
                if (json1?.success) setProviderCount(json1.data);

                const res2 = await fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/services`
                );
                const json2 = await safeJson<Service[]>(res2);
                if (json2?.success) setServices(json2.data);
            } catch (err) {
                console.error("Error loading meta:", err);
            }
            await loadSubscriptions();
        })();
    }, []);

    function getDisplayPrice(sub: Subscription) {
        if (sub.service === "EHR") {
            const svc = services.find((s) => s.name === "EHR");
            const base = svc ? parseFloat(svc.defaultPrice) : 0;
            return `$${base} × ${providerCount} providers = $${sub.price}`;
        }
        return `$${sub.price}`;
    }

    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Subscriptions</h1>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => {
                        setEditing(null);
                        setShowModal(true);
                    }}
                >
                    + Add Subscription
                </button>
            </div>

            {/* Table */}
            <table className="table-auto w-full text-sm border rounded bg-white">
                <thead className="bg-gray-100">
                <tr>
                    <th className="px-4 py-2 text-left">Service</th>
                    <th className="px-4 py-2 text-left">Billing Cycle</th>
                    <th className="px-4 py-2 text-left">Start Date</th>
                    <th className="px-4 py-2 text-left">Price</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                </tr>
                </thead>
                <tbody>
                {subscriptions.length > 0 ? (
                    subscriptions.map((sub) => (
                        <tr key={sub.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-2">{sub.service}</td>
                            <td className="px-4 py-2">{sub.billingCycle}</td>
                            <td className="px-4 py-2">{sub.startDate}</td>
                            <td className="px-4 py-2">{getDisplayPrice(sub)}</td>
                            <td className="px-4 py-2 space-x-2">
                                <button
                                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                    onClick={() => {
                                        setEditing(sub);
                                        setShowModal(true);
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                    onClick={async () => {
                                        await fetchWithAuth(
                                            `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/${sub.id}`,
                                            { method: "DELETE" }
                                        );
                                        loadSubscriptions();
                                    }}
                                >
                                    Cancel
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="text-center py-6 text-gray-500">
                            No subscriptions found
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            {/* Modal */}
            {showModal && (
                <SubscriptionForm
                    mode={editing ? "edit" : "add"}
                    subscription={editing || undefined}
                    onClose={() => setShowModal(false)}
                    onSaved={loadSubscriptions}
                />
            )}
        </div>
    );
}
