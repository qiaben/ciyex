"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/app/(admin)/layout";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import SubscriptionsPage from "./Subscriptions";
import InvoicesPage from "./InvoicesPage";

import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";

/* ------------ Types ------------ */
type ApiResponse<T> = { success: boolean; message: string; data: T };

type BillingHistory = {
    id: number;
    createdAt: string;
    amount: number;
    status: string;
    invoiceNumber?: string;   // ✅ NEW
    paidAt?: string;          // ✅ NEW
    invoiceUrl?: string;
    receiptUrl?: string;
};

type CardDetails = {
    id?: number;
    brand?: string;
    last4?: string;
    expMonth?: number;
    expYear?: number;
    stripePaymentMethodId?: string;
    gpsCustomerVaultId?: string;
    isDefault?: boolean;
    paymentProcessor?: "stripe" | "gps";
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
        case "SUCCEEDED":
        case "SUCCESS":
            return <span className={`${base} bg-green-100 text-green-700`}>{status}</span>;
        case "FAILED":
            return <span className={`${base} bg-red-100 text-red-700`}>{status}</span>;
        case "PENDING":
            return <span className={`${base} bg-yellow-100 text-yellow-700`}>{status}</span>;
        case "ARCHIVED":
            return <span className={`${base} bg-gray-200 text-gray-600`}>{status}</span>;
        default:
            return <span className={`${base} bg-blue-100 text-blue-700`}>{status}</span>;
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
/* ------------ Card Form ------------ */
const CardForm = ({
                      onSaved,
                      onCancel,
                      showToast,
                  }: {
    onSaved: () => void;
    onCancel: () => void;
    showToast: (m: string, t: "success" | "error") => void;
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");

    async function handleSaveCard() {
        if (!stripe || !elements) return;
        const cardNumberElement = elements.getElement(CardNumberElement);
        if (!cardNumberElement) return;

        const { paymentMethod, error } = await stripe.createPaymentMethod({
            type: "card",
            card: cardNumberElement,
            billing_details: {
                name: `${firstName} ${lastName}`,
                address: { line1: street, city },
            },
        });

        if (error) {
            showToast(error.message ?? "Failed to add card", "error");
            return;
        }

        const res = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/billing/tokenize`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-org-id": "1" },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    street,
                    city,
                    brand: paymentMethod?.card?.brand,
                    last4: paymentMethod?.card?.last4,
                    expMonth: paymentMethod?.card?.exp_month,
                    expYear: paymentMethod?.card?.exp_year,
                    stripePaymentMethodId: paymentMethod?.id,
                    userId: 1,
                    orgId: 1,
                }),
            }
        );

        const json = await safeJson<CardDetails>(res);
        if (json?.success) {
            showToast("Card saved successfully!", "success");
            onSaved();
        } else {
            showToast(
                "Failed to save card: " + (json?.message ?? "Unknown error"),
                "error"
            );
        }
    }

    return (
        <div className="space-y-3">
            <input
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-2 border rounded"
            />
            <input
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-2 border rounded"
            />
            <input
                placeholder="Street Address"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full p-2 border rounded"
            />
            <input
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2 border rounded"
            />

            <CardNumberElement className="p-3 border rounded w-full" />
            <CardExpiryElement className="p-3 border rounded w-full" />
            <CardCvcElement className="p-3 border rounded w-full" />

            <div className="flex justify-end gap-2 mt-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 rounded bg-gray-300 text-gray-700"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSaveCard}
                    className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                    Save Card
                </button>
            </div>
        </div>
    );
};

/* ------------ GPS Card Form ------------ */
const GpsCardFormInline = ({
    onSaved,
    onCancel,
    showToast,
}: {
    onSaved: () => void;
    onCancel: () => void;
    showToast: (message: string, type: "success" | "error") => void;
}) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zip, setZip] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expMonth, setExpMonth] = useState("");
    const [expYear, setExpYear] = useState("");
    const [cvv, setCvv] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSaveCard = async () => {
        if (!firstName || !lastName || !cardNumber || !expMonth || !expYear || !cvv) {
            showToast("Please fill in all required fields", "error");
            return;
        }

        setIsLoading(true);
        
        try {
            // Determine card brand from card number
            const getCardBrand = (cardNumber: string): string => {
                const cleaned = cardNumber.replace(/\s/g, "");
                if (cleaned.startsWith("4")) return "visa";
                if (cleaned.startsWith("5") || cleaned.startsWith("2")) return "mastercard";
                if (cleaned.startsWith("3")) return "amex";
                if (cleaned.startsWith("6")) return "discover";
                return "unknown";
            };

            const brand = getCardBrand(cardNumber);
            const last4 = cardNumber.replace(/\s/g, "").slice(-4);

            // Create GPS billing card
            const cardData = {
                firstName,
                lastName,
                street,
                city,
                state,
                zip,
                brand,
                last4,
                expMonth: parseInt(expMonth),
                expYear: parseInt(expYear),
                userId: 1, // This should come from user context
            };

            const res = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/gps/billing/tokenize`,
                {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json", 
                        "x-org-id": "1" 
                    },
                    body: JSON.stringify(cardData),
                }
            );

            const json = await safeJson(res);
            if (json?.success) {
                showToast("GPS card saved successfully!", "success");
                onSaved();
            } else {
                showToast(
                    "Failed to save GPS card: " + (json?.message ?? "Unknown error"),
                    "error"
                );
            }
        } catch (error) {
            console.error("GPS card save error:", error);
            showToast("Failed to save GPS card", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const handleCardNumberChange = (e: any) => {
        const formatted = formatCardNumber(e.target.value);
        if (formatted.replace(/\s/g, '').length <= 16) {
            setCardNumber(formatted);
        }
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <input
                    placeholder="First Name *"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={isLoading}
                />
                <input
                    placeholder="Last Name *"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={isLoading}
                />
            </div>
            
            <input
                placeholder="Street Address"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full p-2 border rounded"
                disabled={isLoading}
            />
            
            <div className="grid grid-cols-3 gap-3">
                <input
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={isLoading}
                />
                <input
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={isLoading}
                />
                <input
                    placeholder="ZIP Code"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={isLoading}
                />
            </div>

            <input
                placeholder="Card Number *"
                value={cardNumber}
                onChange={handleCardNumberChange}
                className="w-full p-2 border rounded"
                disabled={isLoading}
                maxLength={19} // 16 digits + 3 spaces
            />
            
            <div className="grid grid-cols-3 gap-3">
                <select
                    value={expMonth}
                    onChange={(e) => setExpMonth(e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={isLoading}
                >
                    <option value="">Month *</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month.toString().padStart(2, '0')}>
                            {month.toString().padStart(2, '0')}
                        </option>
                    ))}
                </select>
                
                <select
                    value={expYear}
                    onChange={(e) => setExpYear(e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={isLoading}
                >
                    <option value="">Year *</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                        <option key={year} value={year.toString()}>
                            {year}
                        </option>
                    ))}
                </select>
                
                <input
                    placeholder="CVV *"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full p-2 border rounded"
                    disabled={isLoading}
                    maxLength={4}
                />
            </div>

            <div className="flex justify-end gap-2 mt-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSaveCard}
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    disabled={isLoading}
                >
                    {isLoading ? "Saving..." : "Save GPS Card"}
                </button>
            </div>
        </div>
    );
};

const stripePromise = loadStripe("pk_test_51S5UPvJSxIy1fnkK6dpKKhcedyuGTeD6IyZE4UtJ02MCHGyR28wFoCO9397j2JF31WGYLMLCH7cokGRkRDcugN2500tQtAXCJV");
/* ------------ Billing Page ------------ */
const BillingPage = () => {
    // ✅ extended with "subscriptions"
    const [currentTab, setCurrentTab] = useState<
        "subscriptions" | "invoices" | "history" | "cards"
    >("invoices");

    const [history, setHistory] = useState<BillingHistory[]>([]);
    const [cards, setCards] = useState<CardDetails[]>([]);
    const [showCardForm, setShowCardForm] = useState(false);
    const [showGpsCardForm, setShowGpsCardForm] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

    // Toast state
    const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "error" }[]>([]);
    function showToast(message: string, type: "success" | "error") {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    }

    useEffect(() => {
        loadCards();
        loadHistory();
    }, []);

    async function loadHistory() {
        try {
            const res = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/invoice-bills?status=PAID`,
                { headers: { "x-org-id": "1" } }
            );
            const json = await safeJson<BillingHistory[]>(res);
            if (json?.success) setHistory(json.data);
        } catch (e) {
            console.error("Failed to load billing history", e);
        }
    }


    async function loadCards() {
        try {
            // Load Stripe cards
            const cardRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/cards/1`, {
                headers: { "x-org-id": "1" },
            });
            const cardJson = await safeJson<CardDetails[]>(cardRes);
            let allCards: CardDetails[] = [];
            
            if (cardJson?.success) {
                allCards = cardJson.data.map(card => ({ ...card, paymentProcessor: "stripe" as const }));
            }

            // Load GPS cards
            try {
                const gpsCardRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/gps/billing/cards/user/1`, {
                    headers: { "x-org-id": "1" },
                });
                const gpsCardJson = await safeJson<CardDetails[]>(gpsCardRes);
                if (gpsCardJson?.success) {
                    const gpsCards = gpsCardJson.data.map(card => ({ ...card, paymentProcessor: "gps" as const }));
                    allCards = [...allCards, ...gpsCards];
                }
            } catch (e) {
                console.log("GPS cards not available or not configured");
            }

            setCards(allCards);
        } catch {}
    }

    async function archiveHistory(id: number) {
        await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/history/${id}/archive`, {
            method: "PUT",
            headers: { "x-org-id": "1" },
        });
        await loadHistory();
    }

    async function unarchiveHistory(id: number) {
        await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/history/${id}/unarchive`, {
            method: "PUT",
            headers: { "x-org-id": "1" },
        });
        await loadHistory();
    }

    async function deleteHistory(id: number) {
        await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/history/${id}`, {
            method: "DELETE",
            headers: { "x-org-id": "1" },
        });
        await loadHistory();
    }

    async function deleteCard(id?: number) {
        if (!id) return;
        await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/card/${id}`, {
            method: "DELETE",
            headers: { "x-org-id": "1" },
        });
        showToast("Card deleted", "success");
        await loadCards();
    }

    async function setDefaultCard(id?: number) {
        if (!id) return;
        await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/card/${id}/default`, {
            method: "PUT",
            headers: { "x-org-id": "1" },
        });
        showToast("Default card updated", "success");
        await loadCards();
    }

    async function handleConfirmPayment() {
        const card = cards.find((c) => c.id === selectedCardId);
        if (!card?.stripePaymentMethodId) {
            showToast("Please select a card.", "error");
            return;
        }
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/history/pay`, {
            method: "POST",
            headers: { "x-org-id": "1", "Content-Type": "application/json" },
            body: JSON.stringify({ userId: 1, amount: 50.0, stripePaymentMethodId: card.stripePaymentMethodId }),
        });
        const json = await safeJson<BillingHistory>(res);
        if (json?.success) {
            showToast("Payment succeeded!", "success");
            await loadHistory();
            setShowPayModal(false);
        } else {
            showToast("Payment failed: " + (json?.message ?? "Unknown error"), "error");
        }
    }



    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b bg-white">
                <div className="flex items-center gap-2">
                    {(
                        ["subscriptions", "invoices", "history", "cards"] as const
                    ).map((t) => (
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
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    {currentTab !== "cards" && (
                        <button onClick={() => setShowPayModal(true)} className="px-4 py-2 bg-green-600 text-white rounded">
                            Pay Now
                        </button>
                    )}
                    {currentTab === "cards" && (
                        <>
                            <button onClick={() => setShowCardForm(true)} className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm mr-2">
                                Add Stripe Card
                            </button>
                            <button onClick={() => setShowGpsCardForm(true)} className="px-3 py-1.5 rounded bg-green-600 text-white text-sm">
                                Add GPS Card
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="p-6">
                {currentTab === "subscriptions" && <SubscriptionsPage />}
                {currentTab === "invoices" && <InvoicesPage />}

                {/* Billing History */}
                {currentTab === "history" && (
                    <section>
                        <h2 className="text-lg font-semibold mb-4">Billing History</h2>
                        <table className="table-auto w-full text-sm border rounded bg-white">
                           <thead className="bg-gray-100">
                           <tr>
                               <th className="px-4 py-2">No.</th>
                               <th className="px-4 py-2">Invoice #</th>     {/* ✅ NEW */}
                               <th className="px-4 py-2">Date</th>
                               <th className="px-4 py-2">Paid Date</th>     {/* ✅ NEW */}
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
                                        <td className="px-4 py-2">{formatDate(h.createdAt)}</td>
                                        <td className="px-4 py-2">${h.amount.toFixed(2)}</td>
                                        <td className="px-4 py-2">{getStatusBadge(h.status)}</td>
                                        <td className="px-4 py-2 space-x-2">
                                            <td className="px-4 py-2">{h.invoiceNumber ?? "N/A"}</td>   {/* ✅ NEW */}
                                            <td className="px-4 py-2">{h.paidAt ? formatDate(h.paidAt) : "-"}</td>  {/* ✅ NEW */}

                                            {h.invoiceUrl ? (
                                                <>
                                                    <a href={h.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                                        View
                                                    </a>
                                                    <a href={h.invoiceUrl} download={`invoice-${h.id}.pdf`} className="text-green-600 underline">
                                                        Download
                                                    </a>
                                                </>
                                            ) : (
                                                <span className="text-gray-400">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 space-x-2">
                                            {h.receiptUrl ? (
                                                <>
                                                    <a href={h.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                                        View
                                                    </a>
                                                    <a href={h.receiptUrl} download={`receipt-${h.id}.pdf`} className="text-green-600 underline">
                                                        Download
                                                    </a>
                                                </>
                                            ) : (
                                                <span className="text-gray-400">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 space-x-3">
                                            {h.status === "ARCHIVED" ? (
                                                <button onClick={() => unarchiveHistory(h.id)} className="text-green-600 hover:underline">
                                                    Unarchive
                                                </button>
                                            ) : (
                                                <button onClick={() => archiveHistory(h.id)} className="text-yellow-600 hover:underline">
                                                    Archive
                                                </button>
                                            )}
                                            <button onClick={() => deleteHistory(h.id)} className="text-red-600 hover:underline">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-6 text-gray-500">
                                        No billing records found
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </section>
                )}

                {/* Cards Tab */}
                {currentTab === "cards" && (
                    <section>
                        <table className="table-auto w-full text-sm border rounded bg-white">
                            <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2">Brand</th>
                                <th className="px-4 py-2">Last 4</th>
                                <th className="px-4 py-2">Expiry</th>
                                <th className="px-4 py-2">Default</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {cards.map((c) => (
                                <tr key={c.id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2">{c.brand?.toUpperCase()}</td>
                                    <td className="px-4 py-2">****{c.last4}</td>
                                    <td className="px-4 py-2">
                                        {c.expMonth}/{c.expYear}
                                    </td>
                                    <td className="px-4 py-2">{c.isDefault ? "⭐ Default" : ""}</td>
                                    <td className="px-4 py-2 space-x-3">
                                        {!c.isDefault && (
                                            <button onClick={() => setDefaultCard(c.id)} className="text-blue-600 hover:underline">
                                                Set Default
                                            </button>
                                        )}
                                        <button onClick={() => deleteCard(c.id)} className="text-red-600 hover:underline">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </section>
                )}
            </div>
            {/* Confirm Payment Modal */}
            {showPayModal && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/20 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative">
                        <button
                            onClick={() => setShowPayModal(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>

                        <h2 className="text-lg font-semibold mb-4">Confirm Payment</h2>

                        <label className="block text-sm font-medium mb-2">Select Card</label>
                        <select
                            className="w-full p-2 border rounded mb-4"
                            value={selectedCardId ?? ""}
                            onChange={(e) => setSelectedCardId(Number(e.target.value))}
                        >
                            <option value="">-- Choose a card --</option>
                            {cards.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.brand?.toUpperCase()} ****{c.last4} (exp {c.expMonth}/{c.expYear})
                                    {c.isDefault ? " ⭐" : ""}
                                </option>
                            ))}
                        </select>

                        {/* For now hard-coded 50.00 — can be replaced with invoice.amount */}
                        <p className="text-sm mb-4">
                            <strong>Amount:</strong> $50.00
                        </p>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowPayModal(false)}
                                className="px-4 py-2 rounded bg-gray-300 text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmPayment}
                                className="px-4 py-2 rounded bg-green-600 text-white"
                            >
                                Pay Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Card Modal */}
            {showCardForm && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl relative">
                        <button
                            onClick={() => setShowCardForm(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                        <h2 className="text-lg font-semibold mb-4">Add Card</h2>
                        <Elements stripe={stripePromise}>
                            <CardForm
                                onSaved={() => {
                                    setShowCardForm(false);
                                    loadCards();
                                }}
                                onCancel={() => setShowCardForm(false)}
                                showToast={showToast}
                            />
                        </Elements>
                    </div>
                </div>
            )}

            {/* Add GPS Card Modal */}
            {showGpsCardForm && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl relative">
                        <button
                            onClick={() => setShowGpsCardForm(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                        <h2 className="text-lg font-semibold mb-4">Add GPS Card</h2>
                        <GpsCardFormInline
                            onSaved={() => {
                                setShowGpsCardForm(false);
                                loadCards();
                            }}
                            onCancel={() => setShowGpsCardForm(false)}
                            showToast={showToast}
                        />
                    </div>
                </div>
            )}

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

