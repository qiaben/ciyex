"use client";
import React, { useEffect, useState } from "react";
import {
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

/* ------------ Types ------------ */
type ApiResponse<T> = { success: boolean; message: string; data: T };

type CardDetails = {
    id?: number;
    brand?: string;
    last4?: string;
    expMonth?: number;
    expYear?: number;
    stripePaymentMethodId?: string;
    gpsCustomerVaultId?: string;
    isDefault?: boolean;
    paymentProcessor: "stripe" | "gps";
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

/* ------------ Stripe Card Form ------------ */
const StripeCardForm = ({
                            onSaved,
                            onCancel,
                        }: {
    onSaved: () => void;
    onCancel: () => void;
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    async function handleSaveCard() {
        if (!stripe || !elements) return;
        const cardNumberElement = elements.getElement(CardNumberElement);
        if (!cardNumberElement) return;

        const { paymentMethod, error } = await stripe.createPaymentMethod({
            type: "card",
            card: cardNumberElement,
            billing_details: { name: `${firstName} ${lastName}` },
        });

        if (error) {
            window.dispatchEvent(new CustomEvent("ciyex:toast", { detail: { message: error.message || "Failed to add card", type: "error" } }));
            return;
        }

        const res = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/cards/billing/tokenize`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-org-id": "1" },
                body: JSON.stringify({
                    firstName,
                    lastName,
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
            window.dispatchEvent(new CustomEvent("ciyex:toast", { detail: { message: "Card added to your payment methods", type: "success" } }));
            onSaved();
        } else {
            window.dispatchEvent(new CustomEvent("ciyex:toast", { detail: { message: json?.message || "Failed to save card", type: "error" } }));
        }
    }

    return (
        <div className="space-y-3">
            <input
                className="w-full p-2 border rounded"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
            />
            <input
                className="w-full p-2 border rounded"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
            />
            <CardNumberElement className="p-3 border rounded w-full" />
            <CardExpiryElement className="p-3 border rounded w-full" />
            <CardCvcElement className="p-3 border rounded w-full" />
            <div className="flex justify-end gap-2 mt-3">
                <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-300">
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
const GpsCardForm = ({
                         onSaved,
                         onCancel,
                     }: {
    onSaved: () => void;
    onCancel: () => void;
}) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expMonth, setExpMonth] = useState("");
    const [expYear, setExpYear] = useState("");
    const [cvv, setCvv] = useState("");

    async function handleSaveCard() {
        if (!firstName || !lastName || !cardNumber || !expMonth || !expYear || !cvv) {
            window.dispatchEvent(new CustomEvent("ciyex:toast", { detail: { message: "Please fill in all required fields", type: "error" } }));
            return;
        }

        const brand = cardNumber.startsWith("4")
            ? "visa"
            : cardNumber.startsWith("5")
                ? "mastercard"
                : "other";
        const last4 = cardNumber.replace(/\s/g, "").slice(-4);

        const cardData = {
            firstName,
            lastName,
            brand,
            last4,
            expMonth: parseInt(expMonth),
            expYear: parseInt(expYear),
            userId: 1,
        };

        const res = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/gps/cards/billing/tokenize`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-org-id": "1" },
                body: JSON.stringify(cardData),
            }
        );

        const json = await safeJson<CardDetails>(res);
        if (json?.success) {
            window.dispatchEvent(new CustomEvent("ciyex:toast", { detail: { message: "Card added to your payment methods", type: "success" } }));
            onSaved();
        } else {
            window.dispatchEvent(new CustomEvent("ciyex:toast", { detail: { message: json?.message || "Failed to save card", type: "error" } }));
        }
    }

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <input
                    className="w-full p-2 border rounded"
                    placeholder="First Name *"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                    className="w-full p-2 border rounded"
                    placeholder="Last Name *"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
            </div>
            <input
                className="w-full p-2 border rounded"
                placeholder="Card Number *"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
            />
            <div className="grid grid-cols-3 gap-3">
                <input
                    className="w-full p-2 border rounded"
                    placeholder="MM"
                    value={expMonth}
                    onChange={(e) => setExpMonth(e.target.value)}
                />
                <input
                    className="w-full p-2 border rounded"
                    placeholder="YYYY"
                    value={expYear}
                    onChange={(e) => setExpYear(e.target.value)}
                />
                <input
                    className="w-full p-2 border rounded"
                    placeholder="CVV"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                />
            </div>
            <div className="flex justify-end gap-2 mt-3">
                <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-300">
                    Cancel
                </button>
                <button
                    onClick={handleSaveCard}
                    className="px-4 py-2 rounded bg-green-600 text-white"
                >
                    Save GPS Card
                </button>
            </div>
        </div>
    );
};

/* ------------ Cards Page ------------ */
const CardsPage = () => {
    const [cards, setCards] = useState<CardDetails[]>([]);
    const [showStripeForm, setShowStripeForm] = useState(false);
    const [showGpsForm, setShowGpsForm] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    async function loadCards() {
        const orgId = localStorage.getItem("orgId") || "1";

        const stripeRes = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/cards`,
            { headers: { "x-org-id": orgId } }
        );
        const gpsRes = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/gps/cards`,
            { headers: { "x-org-id": orgId } }
        );

        const stripeJson = await safeJson<CardDetails[]>(stripeRes);
        const gpsJson = await safeJson<CardDetails[]>(gpsRes);

        const allCards: CardDetails[] = [
            ...(stripeJson?.data?.map((c) => ({ ...c, paymentProcessor: "stripe" as const })) || []),
            ...(gpsJson?.data?.map((c) => ({ ...c, paymentProcessor: "gps" as const })) || []),
        ];

        // ✅ Sort default cards first
        allCards.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

        setCards(allCards);
    }

    useEffect(() => {
        loadCards();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header with Add Card Dropdown */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Payment Methods</h2>
                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        + Add Card
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white shadow rounded border z-50">
                            <button
                                onClick={() => {
                                    setShowStripeForm(true);
                                    setDropdownOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                                Stripe Card
                            </button>
                            <button
                                onClick={() => {
                                    setShowGpsForm(true);
                                    setDropdownOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                                GPS Card
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <table className="table-auto w-full border bg-white text-sm">
                <thead className="bg-gray-100">
                <tr>
                    <th className="px-4 py-2">Card Type</th>
                    <th className="px-4 py-2">Last 4</th>
                    <th className="px-4 py-2">Expiry</th>
                    <th className="px-4 py-2">Processor</th>
                    <th className="px-4 py-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                {cards.length ? (
                    cards.map((c) => (
                        <tr key={`${c.paymentProcessor}-${c.id}`} className="border-t">
                            <td className="px-4 py-2">{c.brand ?? "-"}</td>
                            <td className="px-4 py-2">{c.last4 ?? "-"}</td>
                            <td className="px-4 py-2">
                                {c.expMonth}/{c.expYear}
                            </td>
                            <td className="px-4 py-2">
                                {c.paymentProcessor.toUpperCase()}
                            </td>
                            <td className="px-4 py-2">
                                <button
                                    onClick={async () => {
                                        if (!confirm("Delete this card? This action cannot be undone.")) return;
                                        try {
                                            const orgId = localStorage.getItem("orgId") || "1";
                                            const base =
                                                c.paymentProcessor === "stripe"
                                                    ? `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/cards`
                                                    : `${process.env.NEXT_PUBLIC_API_URL}/api/gps/cards`;
                                            const res = await fetchWithAuth(`${base}/${c.id}`, {
                                                method: "DELETE",
                                                headers: { "x-org-id": orgId },
                                            });
                                            const json = await safeJson<any>(res);
                                                                    if (json?.success) {
                                                                            window.dispatchEvent(new CustomEvent("ciyex:toast", { detail: { message: "Card deleted", type: "success" } }));
                                                                            await loadCards();
                                                                        } else {
                                                                            window.dispatchEvent(new CustomEvent("ciyex:toast", { detail: { message: json?.message || "Failed to delete card", type: "error" } }));
                                                                        }
                                        } catch (err) {
                                            console.error("Failed to delete card", err);
                                            window.dispatchEvent(new CustomEvent("ciyex:toast", { detail: { message: "Failed to delete card", type: "error" } }));
                                        }
                                    }}
                                    className="px-2 py-1 rounded bg-red-100 text-sm text-red-800"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="text-center py-4 text-gray-500">
                            No saved cards
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            {/* Stripe Modal */}
            {showStripeForm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
                    <div className="w-full max-w-lg bg-white p-6 rounded shadow relative">
                        <button
                            onClick={() => setShowStripeForm(false)}
                            className="absolute top-3 right-3 text-gray-500"
                        >
                            ✕
                        </button>
                        <h2 className="text-lg font-semibold mb-4">Add Stripe Card</h2>
                        <StripeCardForm
                            onSaved={() => {
                                setShowStripeForm(false);
                                loadCards();
                            }}
                            onCancel={() => setShowStripeForm(false)}
                        />
                    </div>
                </div>
            )}

            {/* GPS Modal */}
            {showGpsForm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
                    <div className="w-full max-w-lg bg-white p-6 rounded shadow relative">
                        <button
                            onClick={() => setShowGpsForm(false)}
                            className="absolute top-3 right-3 text-gray-500"
                        >
                            ✕
                        </button>
                        <h2 className="text-lg font-semibold mb-4">Add GPS Card</h2>
                        <GpsCardForm
                            onSaved={() => {
                                setShowGpsForm(false);
                                loadCards();
                            }}
                            onCancel={() => setShowGpsForm(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CardsPage;
