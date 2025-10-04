


"use client";

import React, { useEffect, useMemo, useState } from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

/* =========================================================
   Props / Types
========================================================= */
type Props = {
    patientId: number;
    patientName: string;
};

type InvoiceStatus = "OPEN" | "PARTIALLY_PAID" | "PAID" | "VOID";
type ClaimStatus =
    | "DRAFT"
    | "READY_FOR_SUBMISSION"
    | "SUBMITTED"
    | "IN_PROCESS"
    | "ACCEPTED"
    | "REJECTED"
    | "CLOSED"
    | "VOID";

type PaymentMethod =
    | "CREDIT_CARD"
    | "CHECK"
    | "DEBIT_CARD"
    | "EFT"
    | "CASH"
    | "CARE_CREDIT"
    | "MASTERCARD"
    | "VISA"
    | "DISCOVER"
    | "AMEX";

type InvoiceLine = {
    id: number;
    dos: string;
    code: string;
    treatment: string;
    provider: string;
    charge: number;
    allowed?: number;
    insWriteOff?: number;
    insPortion?: number;
    patientPortion?: number;
};

type Invoice = {
    id: number;
    patientId: number;
    status: InvoiceStatus;
    lines: InvoiceLine[];
    insWO?: number;
    ptBalance?: number;
    insBalance?: number;
    totalCharge?: number;
    insPaid?: number; // new
    ptPaid?: number; // new
};

type Claim = {
    id: number;
    invoiceId: number;
    patientId: number;
    payerName: string | null;
    treatingProviderId?: string | null;
    billingEntity?: string | null;
    type: "Electronic" | "Paper" | null;
    notes?: string | null;
    status: ClaimStatus;
    attachments: number;
    eobAttached: boolean;
    createdOn?: string | null;
};

type InsuranceRemitLine = {
    invoiceLineId: number;
    submitted: number;
    balance: number;
    deductible: number;
    allowed: number;
    insWriteOff: number;
    insPay: number;
    updateAllowed?: boolean;
    updateFlatPortion?: boolean;
    applyWriteoff?: boolean;
};

type PatientPaymentAllocation = {
    invoiceLineId: number;
    amount: number;
};

type AccountCredit = { balance: number };

/* =========================================================
   Small UI helpers (unchanged visuals)
========================================================= */
const currency = (n: number) =>
    (n ?? 0).toLocaleString(undefined, { style: "currency", currency: "USD" });

const Badge: React.FC<{
    tone: "red" | "green" | "amber" | "blue" | "gray" | "purple";
    children: React.ReactNode;
}> = ({ tone, children }) => {
    const map: Record<string, string> = {
        red: "bg-red-100 text-red-700 border-red-200",
        green: "bg-green-100 text-green-700 border-green-200",
        amber: "bg-amber-100 text-amber-800 border-amber-200",
        blue: "bg-blue-100 text-blue-700 border-blue-200",
        gray: "bg-gray-100 text-gray-700 border-gray-200",
        purple: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return (
        <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs ${map[tone]}`}>
      {children}
    </span>
    );
};

const SectionCard: React.FC<{
    title: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
}> = ({ title, actions, children }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            {actions}
        </div>
        {children}
    </div>
);

const SegmentedTabs: React.FC<{
    tabs: { id: string; label: string }[];
    value: string;
    onChange: (id: string) => void;
}> = ({ tabs, value, onChange }) => (
    <div className="sticky top-0 z-20 -mx-1 flex flex-wrap items-center gap-2 border-b bg-white/80 px-1 py-2 backdrop-blur">
        {tabs.map((t) => (
            <button
                key={t.id}
                onClick={() => onChange(t.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium shadow-sm transition ${
                    value === t.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
                {t.label}
            </button>
        ))}
    </div>
);

const RowStat: React.FC<{
    label: string;
    value: string;
    bold?: boolean;
    tone?: "red" | "default";
    hideOnSmall?: boolean;
}> = ({ label, value, bold, tone = "default", hideOnSmall }) => (
    <div className={`${hideOnSmall ? "hidden md:block" : ""}`}>
        <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
        <div className={`${bold ? "font-semibold" : ""} ${tone === "red" ? "text-red-600" : ""}`}>{value}</div>
    </div>
);

const IconBtn: React.FC<React.PropsWithChildren<{ title: string; onClick?: () => void }>> = ({
                                                                                                 children,
                                                                                                 title,
                                                                                                 onClick,
                                                                                             }) => (
    <button
        title={title}
        onClick={onClick}
        className="rounded border border-gray-200 bg-white px-2 py-1 text-sm hover:bg-gray-50"
    >
        {children}
    </button>
);

const styles = `
.btn-primary{border-radius:.375rem;padding:.375rem .75rem;font-size:.875rem;background:#2563eb;color:#fff;transition:filter .15s}
.btn-primary:hover{filter:brightness(.95)}
.btn-light{border:1px solid #e5e7eb;border-radius:.375rem;padding:.375rem .75rem;font-size:.875rem;background:#fff;transition:background .15s}
.btn-light:hover{background:#f8fafc}
.btn-danger{border-radius:.375rem;padding:.375rem .75rem;font-size:.875rem;background:#dc2626;color:#fff}
.input{border:1px solid #e5e7eb;border-radius:.375rem;padding:.375rem .75rem;font-size:.875rem;outline:none}
.input:focus{box-shadow:0 0 0 2px #93c5fd;border-color:#60a5fa}
.label{margin-bottom:.25rem;display:block;font-size:.75rem;font-weight:500;color:#64748b}
`;
const StyleInjector: React.FC = () => (
    <style id="billing-inline-styles-v6" dangerouslySetInnerHTML={{ __html: styles }} />
);

/* =========================================================
   Component
========================================================= */
export default function PatientBilling({ patientId, patientName }: Props) {
    // HARD GUARD: never call backend with an invalid id
    if (!Number.isFinite(Number(patientId))) {
        return (
            <div className="p-6">
                <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-800">
                    Unable to load billing: invalid patient id.
                </div>
            </div>
        );
    }

    const API = `${process.env.NEXT_PUBLIC_API_URL}/api/patient-billing/${patientId}`;

    const [tab, setTab] = useState<"INVOICE" | "CLAIM" | "INS" | "PATIENT">("INVOICE");

    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [claims, setClaims] = useState<Record<number, Claim>>({});
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
    const selectedInvoice =
        invoices.find((x) => x.id === selectedInvoiceId) ?? (invoices.length ? invoices[0] : undefined);
    const selectedClaim = selectedInvoice ? claims[selectedInvoice.id] : undefined;

    const [accountCredit, setAccountCredit] = useState<AccountCredit>({ balance: 0 });

    // Insurance remit state – per selected invoice
    const [remits, setRemits] = useState<InsuranceRemitLine[]>([]);
    useEffect(() => {
        if (!selectedInvoice) return;
        setRemits(
            selectedInvoice.lines.map((l) => ({
                invoiceLineId: l.id,
                submitted: l.charge,
                balance: 0,
                deductible: 0,
                allowed: l.allowed ?? l.charge,
                insWriteOff: 0,
                insPay: l.charge,
            }))
        );
    }, [selectedInvoice?.id]); // eslint-disable-line


    // const [providers, setProviders] = useState<any[]>([]);
    //
    // useEffect(() => {
    //     fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/providers`, {
    //         method: "GET",
    //         headers: { "Content-Type": "application/json" },
    //     })
    //         .then((res) => res.json())
    //         .then((body) => {
    //             if (body?.success && Array.isArray(body.data)) {
    //                 // Normalize to always have {id, name}
    //                 const mapped = body.data.map((p: any) => ({
    //                     id: p.id,
    //                     name: p.name || p.providerName || p.fullName || `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim(),
    //                 }));
    //                 setProviders(mapped);
    //             }
    //         })
    //         .catch(() => setProviders([]));
    // }, []);








    // Patient payment allocations (prefill with remaining patientPortion)
    const [payMethod, setPayMethod] = useState<PaymentMethod>("CREDIT_CARD");
    const [allocs, setAllocs] = useState<PatientPaymentAllocation[]>([]);
    useEffect(() => {
        if (!selectedInvoice) return;
        setAllocs(
            selectedInvoice.lines.map((l) => ({
                invoiceLineId: l.id,
                amount: l.patientPortion ?? 0,
            }))
        );
    }, [selectedInvoice?.id, selectedInvoice?.lines]); // re-run when lines change

    /* -------- Derived ---------- */
    // Outstanding for PATIENT payment = patient balance only
    const patientOwing = useMemo(
        () =>
            selectedInvoice
                ? selectedInvoice.lines.reduce((a, l) => a + (l.patientPortion ?? 0), 0)
                : 0,
        [selectedInvoice]
    );

    const isClosed = useMemo(
        () =>
            selectedInvoice?.status === "PAID" ||
            (((selectedInvoice?.ptBalance ?? 0) + (selectedInvoice?.insBalance ?? 0)) === 0),
        [selectedInvoice?.status, selectedInvoice?.ptBalance, selectedInvoice?.insBalance]
    );

    const outstanding = useMemo(
        () => (isClosed ? 0 : (selectedInvoice?.ptBalance ?? patientOwing)),
        [isClosed, selectedInvoice?.ptBalance, patientOwing]
    );

    const entered = useMemo(() => allocs.reduce((a, r) => a + (r.amount || 0), 0), [allocs]);
    const overpay = Math.max(0, entered - outstanding);

    /* -------- UI modals / popovers ---------- */
    const [transferOpenFor, setTransferOpenFor] = useState<number | null>(null);
    const [showEditLinesFor, setShowEditLinesFor] = useState<number | null>(null);
    const [showAdjustmentFor, setShowAdjustmentFor] = useState<number | null>(null);
    const [showAddProcedure, setShowAddProcedure] = useState(false);
    const [showClaimEditFor, setShowClaimEditFor] = useState<number | null>(null);
    const [showVoidFor, setShowVoidFor] = useState<number | null>(null);
    const [showClaimComposeFor, setShowClaimComposeFor] = useState<number | null>(null);
    const [cheque, setCheque] = useState({ number: "", bankBranch: "" });

    /* =========================================================
       Load data (invoices, credit)
    ========================================================== */
    const mapServerInvoice = (raw: any): Invoice => ({
        id: raw.id,
        patientId: raw.patientId,
        status: raw.status,
        insWO: raw.insWO,
        ptBalance: raw.ptBalance,
        insBalance: raw.insBalance,
        totalCharge: raw.totalCharge,
        insPaid: raw.insPaid ?? 0,
        ptPaid: raw.ptPaid ?? 0,
        lines: (raw.lines || []).map((l: any) => ({
            id: l.id,
            dos: Array.isArray(l.dos)
                ? `${l.dos[0]}-${String(l.dos[1]).padStart(2, "0")}-${String(l.dos[2]).padStart(2, "0")}`
                : l.dos,
            code: l.code,
            treatment: l.treatment,
            provider: l.provider,
            charge: l.charge,
            allowed: l.allowed,
            insWriteOff: l.insWriteOff,
            insPortion: l.insPortion,
            patientPortion: l.patientPortion,
        })),
    });

    const mapServerClaim = (raw: any): Claim => ({
        id: raw.id,
        invoiceId: raw.invoiceId,
        patientId: raw.patientId,
        payerName: raw.payerName ?? null,
        treatingProviderId: raw.treatingProviderId ?? null,
        billingEntity: raw.billingEntity ?? null,
        type: (raw.type as Claim["type"]) ?? null,
        notes: raw.notes ?? null,
        status: raw.status,
        attachments: raw.attachments ?? 0,
        eobAttached: !!raw.eobAttached,
        createdOn: Array.isArray(raw.createdOn)
            ? `${raw.createdOn[0]}-${String(raw.createdOn[1]).padStart(2, "0")}-${String(raw.createdOn[2]).padStart(2, "0")}`
            : raw.createdOn ?? null,
    });

    async function loadAll() {
        // invoices
        const invRes = await fetchWithAuth(`${API}/invoices`);
        const invBody = await invRes.json();
        if (invBody?.success) {
            const invs: Invoice[] = (invBody.data || []).map(mapServerInvoice);
            setInvoices(invs);
            setSelectedInvoiceId((s) => s ?? (invs[0]?.id ?? null));
        }

        // claims (all for patient)
        try {
            const clRes = await fetchWithAuth(`${API}/claims`);
            const clBody = await clRes.json();
            if (clBody?.success && Array.isArray(clBody.data)) {
                const claimMap = (clBody.data as any[]).reduce((acc, raw) => {
                    const c = mapServerClaim(raw);
                    // keep the first seen (assumed latest) claim per invoice
                    if (!acc[c.invoiceId]) acc[c.invoiceId] = c;
                    return acc;
                }, {} as Record<number, Claim>);
                setClaims(claimMap);
            }
        } catch {}

        // account credit
        try {
            const crRes = await fetchWithAuth(`${API}/account-credit`);
            const crBody = await crRes.json();
            if (crBody?.success && crBody.data) setAccountCredit({ balance: crBody.data.balance ?? 0 });
        } catch {
            // ignore if endpoint not available
        }
    }

    useEffect(() => {
        void loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId]);

    /* =========================================================
       Actions → Backend
    ========================================================== */
    async function createInvoiceFromProcedure(p: {
        dos: string;
        code: string;
        treatment: string;
        provider: string;
        rate: number;
    }) {
        const res = await fetchWithAuth(`${API}/invoices`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: p.code,
                description: p.treatment,
                provider: p.provider,
                dos: p.dos,
                rate: p.rate,
            }),
        });
        const body = await res.json();
        if (!body?.success) throw new Error(body?.message || "Failed to create invoice");
        const inv = mapServerInvoice(body.data);
        setInvoices((arr) => [inv, ...arr]);
        setSelectedInvoiceId(inv.id);
    }

    async function reestimateLine(invoiceId: number, lineId: number, newCharge: number) {
        const res = await fetchWithAuth(`${API}/invoices/${invoiceId}/lines/${lineId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newCharge }),
        });
        const body = await res.json();
        if (!body?.success) throw new Error(body?.message || "Failed to update line");
        const inv = mapServerInvoice(body.data);
        setInvoices((prev) => prev.map((i) => (i.id === inv.id ? inv : i)));
    }

    async function promoteClaim(invoiceId: number) {
        const res = await fetchWithAuth(`${API}/invoices/${invoiceId}/claim/promote`, { method: "POST" });
        const body = await res.json();
        if (!body?.success) throw new Error(body?.message || "Failed to promote claim");
        const claim = mapServerClaim(body.data);
        setClaims((m) => ({ ...m, [invoiceId]: claim }));
    }

    async function sendToBatch(invoiceId: number) {
        const res = await fetchWithAuth(`${API}/invoices/${invoiceId}/claim/send-to-batch`, {
            method: "POST",
            headers: { "x-org-id": "1" },
        });
        const body = await res.json();
        if (!body?.success) throw new Error(body?.message || "Failed to move claim to batch");
        const claim = mapServerClaim(body.data);
        setClaims((m) => ({ ...m, [invoiceId]: claim }));
        setShowClaimComposeFor(null);
    }

    async function submitClaim(invoiceId: number) {
        const res = await fetchWithAuth(`${API}/invoices/${invoiceId}/claim/submit`, { method: "POST" });
        const body = await res.json();
        if (!body?.success) throw new Error(body?.message || "Failed to submit claim");
        const claim = mapServerClaim(body.data);
        setClaims((m) => ({ ...m, [invoiceId]: claim }));
    }

    async function closeClaim(invoiceId: number) {
        const res = await fetchWithAuth(`${API}/invoices/${invoiceId}/claim/close`, { method: "POST" });
        const body = await res.json();
        if (!body?.success) throw new Error(body?.message || "Failed to close claim");
        const claim = mapServerClaim(body.data);
        setClaims((m) => ({ ...m, [invoiceId]: claim }));
    }

    async function voidAndRecreateClaim(invoiceId: number) {
        const res = await fetchWithAuth(`${API}/invoices/${invoiceId}/claim/void-recreate`, { method: "POST" });
        const body = await res.json();
        if (!body?.success) throw new Error(body?.message || "Failed to void/recreate claim");
        const claim = mapServerClaim(body.data); // DRAFT
        setClaims((m) => ({ ...m, [invoiceId]: claim }));
        setShowVoidFor(null);
    }

    async function updateClaim(invoiceId: number, payload: Partial<Claim> & Record<string, any>) {
        const res = await fetchWithAuth(`${API}/invoices/${invoiceId}/claim`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const body = await res.json();
        if (!body?.success) throw new Error(body?.message || "Failed to update claim");
        const claim = mapServerClaim(body.data);
        setClaims((m) => ({ ...m, [invoiceId]: claim }));
    }

    async function applyInsurancePayment() {
        if (!selectedInvoice) return;
        const payload = {
            chequeNumber: cheque.number || "000000000",
            bankBranch: cheque.bankBranch || "000",
            lines: remits.map((r) => ({
                invoiceLineId: r.invoiceLineId,
                submitted: r.submitted,
                balance: r.balance,
                deductible: r.deductible,
                allowed: r.allowed,
                insWriteOff: r.insWriteOff,
                insPay: r.insPay,
                updateAllowed: !!r.updateAllowed,
                updateFlatPortion: !!r.updateFlatPortion,
                applyWriteoff: !!r.applyWriteoff,
            })),
        };
        const res = await fetchWithAuth(`${API}/invoices/${selectedInvoice.id}/insurance-payments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const body = await res.json();
        if (!body?.success) throw new Error(body?.message || "Failed to apply insurance payment");
        const inv = mapServerInvoice(body.data);
        setInvoices((list) => list.map((x) => (x.id === inv.id ? inv : x)));

        // Prefill patient allocations with remaining patientPortion and switch to Patient tab
        setAllocs(inv.lines.map((l) => ({ invoiceLineId: l.id, amount: l.patientPortion ?? 0 })));
        setSelectedInvoiceId(inv.id);
        setTab("PATIENT");
    }

    async function applyPatientPayment() {
        if (!selectedInvoice) return;

        const res = await fetchWithAuth(`${API}/invoices/${selectedInvoice.id}/patient-payments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                paymentMethod: payMethod,
                allocations: allocs,
            }),
        });
        const body = await res.json();
        if (!body?.success) throw new Error(body?.message || "Failed to apply patient payment");
        const inv = mapServerInvoice(body.data);
        setInvoices((list) => list.map((x) => (x.id === inv.id ? inv : x)));

        // refresh allocations & credit (in case of overpayment)
        setAllocs(inv.lines.map((l) => ({ invoiceLineId: l.id, amount: l.patientPortion ?? 0 })));
        try {
            const crRes = await fetchWithAuth(`${API}/account-credit`);
            const crBody = await crRes.json();
            if (crBody?.success && crBody.data) setAccountCredit({ balance: crBody.data.balance ?? 0 });
        } catch {}
    }

    async function applyPercentAdjustment(invoiceId: number, percent: number) {
        const res = await fetchWithAuth(`${API}/invoices/${invoiceId}/adjustment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ percent }),
        });
        const body = await res.json();
        if (!body?.success) throw new Error(body?.message || "Failed to adjust invoice");
        const inv = mapServerInvoice(body.data);
        setInvoices((prev) => prev.map((i) => (i.id === inv.id ? inv : i)));
    }

    async function applyAccountCredit(amount: number) {
        const res = await fetchWithAuth(`${API}/account-credit/apply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount }),
        });
        const body = await res.json();
        if (!body?.success) throw new Error(body?.message || "Failed to apply credit");
        setAccountCredit({ balance: body.data?.balance ?? 0 });
    }

    /* =========================================================
       UI
    ========================================================== */
    return (
        <div className="p-6 space-y-6">
            <StyleInjector />

            {/* Top summary cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-xl border p-4">
                    <div className="text-sm text-gray-500">Patient</div>
                    <div className="text-xl font-semibold">{patientName || "Patient"}</div>
                </div>
                <div className="rounded-xl border p-4">
                    <div className="text-sm text-gray-500">Invoices</div>
                    <div className="text-xl font-semibold">{invoices.length}</div>
                </div>
                <div className="rounded-xl border p-4">
                    <div className="text-sm text-gray-500">Claims</div>
                    <div className="text-xl font-semibold">
                        {Object.values(claims).filter(Boolean).length}
                    </div>
                </div>
                <div className="rounded-xl border p-4">
                    <div className="text-sm text-gray-500">Account Credit</div>
                    <div className="text-xl font-semibold">{currency(accountCredit.balance)}</div>
                </div>
            </div>

            {/* Primary actions */}
            <div className="flex flex-wrap items-center gap-2">
                <button className="btn-primary" onClick={() => setShowAddProcedure(true)}>
                    + Add Procedure
                </button>
                <select
                    className="input"
                    value={selectedInvoice?.id ?? ""}
                    onChange={(e) => setSelectedInvoiceId(Number(e.target.value))}
                >
                    {invoices.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                            Select Invoice #{inv.id}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tabs */}
            <SegmentedTabs
                tabs={[
                    { id: "INVOICE", label: "Invoice(s)" },
                    { id: "CLAIM", label: "Claim (selected)" },
                    { id: "INS", label: "Insurance Payment" },
                    { id: "PATIENT", label: "Patient Payment" },
                ]}
                value={tab}
                onChange={(id) => setTab(id as any)}
            />

            {/* ================= INVOICE LIST ================= */}
            {tab === "INVOICE" && (
                <div className="space-y-4">
                    {invoices.map((inv) => {
                        const first = inv.lines[0];
                        const claim = claims[inv.id];

                        // compute effective status from balances to force green when zeroed
                        const effectiveStatus: InvoiceStatus =
                            ((inv.ptBalance ?? 0) + (inv.insBalance ?? 0)) === 0 ? "PAID" : inv.status;

                        const rowTone =
                            effectiveStatus === "OPEN"
                                ? "bg-red-50"
                                : effectiveStatus === "PARTIALLY_PAID"
                                    ? "bg-amber-50"
                                    : "bg-green-50";

                        return (
                            <div key={inv.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                                <div className={`flex items-center gap-4 border-b px-3 py-2 text-sm ${rowTone}`}>
                                    <Badge tone={effectiveStatus === "OPEN" ? "red" : effectiveStatus === "PARTIALLY_PAID" ? "amber" : "green"}>
                                        INVOICE #{inv.id} ({first?.dos ?? "—"})
                                    </Badge>

                                    <div className="ml-2 grid flex-1 grid-cols-4 gap-3 md:grid-cols-6">
                                        <RowStat label="Pt Balance" value={currency(inv.ptBalance ?? 0)} tone="red" />
                                        <RowStat label="Ins Balance" value={currency(inv.insBalance ?? 0)} />
                                        <RowStat
                                            label="Invoice Balance"
                                            value={currency((inv.ptBalance ?? 0) + (inv.insBalance ?? 0))}
                                            bold
                                        />
                                        <RowStat
                                            label="Ins WO"
                                            value={currency(
                                                inv.insWO ??
                                                inv.lines.reduce((a, l) => a + Math.max(0, (l.charge || 0) - (l.allowed || 0)), 0)
                                            )}
                                        />
                                        <RowStat label="Pt Paid" value={currency(inv.ptPaid ?? 0)} hideOnSmall />
                                        <RowStat label="Ins Paid" value={currency(inv.insPaid ?? 0)} hideOnSmall />
                                    </div>

                                    <div className="ml-auto flex items-center gap-2">
                                        <IconBtn title="Print" onClick={() => window.print()}>🖨️</IconBtn>
                                        <IconBtn title="Transfer Outstanding" onClick={() => setTransferOpenFor(inv.id)}>🔁</IconBtn>
                                        <IconBtn title="Edit" onClick={() => setShowEditLinesFor(inv.id)}>✏️</IconBtn>
                                        <IconBtn title="Adjustment" onClick={() => setShowAdjustmentFor(inv.id)}>➖</IconBtn>
                                    </div>
                                </div>

                                {claim && claim.status !== "DRAFT" ? (
                                    <div className="flex items-start gap-3 border-b px-3 py-2 text-sm">
                                        <div className="min-w-[100px] text-gray-500">{claim.createdOn || first?.dos}</div>
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                        <span className="text-gray-600">
                          <b>Claim #{claim.id}</b> to <b>{claim.payerName ?? "—"}</b> :
                        </span>
                                                <Badge tone="amber">
                                                    {claim.status === "IN_PROCESS"
                                                        ? "Claim in process"
                                                        : claim.status.replaceAll("_", " ").toLowerCase()}
                                                </Badge>
                                                <Badge tone="blue">Status Response (A1): Th…</Badge>
                                            </div>
                                        </div>
                                        <div className="ml-auto flex items-center gap-2">
                                            <IconBtn title="Print" onClick={() => window.print()}>🖨️</IconBtn>
                                            <IconBtn title="Edit" onClick={() => setShowClaimEditFor(inv.id)}>✏️</IconBtn>
                                            <IconBtn title="Close Claim" onClick={() => { void closeClaim(inv.id); }}>✅</IconBtn>
                                            <IconBtn title="Attachments" onClick={() => setShowClaimEditFor(inv.id)}>📎</IconBtn>
                                            <IconBtn title="Void & Re-Create" onClick={() => setShowVoidFor(inv.id)}>🗑️</IconBtn>
                                            <IconBtn title="EOB" onClick={() => setShowClaimEditFor(inv.id)}>📄</IconBtn>
                                            <IconBtn title="Submit Claim" onClick={() => { void submitClaim(inv.id); }}>📤</IconBtn>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between border-b px-3 py-2 text-sm">
                                        <div className="text-gray-600">No active claim yet for invoice #{inv.id}.</div>
                                        <div className="flex items-center gap-2">
                                            <button className="btn-light" onClick={() => setShowClaimComposeFor(inv.id)}>
                                                + Add note/narrative
                                            </button>
                                            <button className="btn-primary" onClick={() => { void promoteClaim(inv.id); }}>
                                                Create Claim
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Mini invoice line row */}
                                {first && (
                                    <div className="flex items-start gap-3 px-3 py-2 text-sm">
                                        <div className="min-w-[100px] text-gray-500">{first.dos}</div>
                                        <div className="flex-1">
                      <span className="text-gray-700">
                        Invoice #{inv.id}: [ {first.treatment} ] <b>{currency(first.charge)}</b>
                      </span>
                                        </div>
                                        <div className="ml-auto flex items-center gap-2">
                                            <IconBtn title="Print" onClick={() => window.print()}>🖨️</IconBtn>
                                            <IconBtn title="Edit" onClick={() => setShowEditLinesFor(inv.id)}>✏️</IconBtn>
                                            <IconBtn title="Transfer Outstanding" onClick={() => setTransferOpenFor(inv.id)}>🔁</IconBtn>
                                            <IconBtn title="Adjustment" onClick={() => setShowAdjustmentFor(inv.id)}>➖</IconBtn>
                                        </div>
                                    </div>
                                )}

                                {transferOpenFor === inv.id && (
                                    <div className="relative">
                                        <div className="absolute z-10 ml-3 mt-2 w-64 rounded-md border bg-white p-1 shadow">
                                            <button className="w-full rounded px-3 py-2 text-left hover:bg-gray-50">
                                                Transfer Outstanding To Patient
                                            </button>
                                            <button className="w-full rounded px-3 py-2 text-left hover:bg-gray-50">
                                                Transfer Outstanding To Insurance
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ================= CLAIM TAB ================= */}
            {tab === "CLAIM" && selectedInvoice && selectedClaim && (
                <div className="space-y-4">
                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-3">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            <div>
                                <span className="font-semibold">Claim #{selectedClaim.id}</span> · For{" "}
                                <span className="font-semibold">{patientName}</span> · To{" "}
                                <span className="font-semibold">{selectedClaim.payerName ?? "—"}</span>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                <button className="btn-light" onClick={() => setShowClaimComposeFor(selectedInvoice.id)}>
                                    + Add note/narrative
                                </button>
                                <button className="btn-primary" onClick={() => { void sendToBatch(selectedInvoice.id); }}>
                                    Send to Batch
                                </button>
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-amber-800">
                            This claim will be split into multiple claims unless you specify a treating provider.
                        </div>
                    </div>

                    <SectionCard
                        title={`Claim #${selectedClaim.id}`}
                        actions={
                            <div className="flex gap-2">
                                <button className="btn-light" onClick={() => window.print()}>Print</button>
                                <button className="btn-light" onClick={() => setShowClaimEditFor(selectedInvoice.id)}>Edit</button>
                                <button className="btn-light" onClick={() => { void closeClaim(selectedInvoice.id); }}>
                                    Close Claim
                                </button>
                                <button className="btn-light" title={selectedClaim.attachments ? "" : "No Attachments"}>
                                    Attachments
                                </button>
                                <button className="btn-light">EOB</button>
                                <button className="btn-danger" onClick={() => setShowVoidFor(selectedInvoice.id)}>
                                    Void & Re-Create
                                </button>
                            </div>
                        }
                    >
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <div> Status: <Badge tone="blue">{selectedClaim.status.replaceAll("_", " ").toLowerCase()}</Badge> </div>
                            <div> Type: <Badge tone="gray">{(selectedClaim.type ?? "Electronic").toString().toLowerCase()}</Badge> </div>
                            <div> Attachments: <Badge tone="gray">{String(selectedClaim.attachments)}</Badge> </div>
                            <div> EOB: {selectedClaim.eobAttached ? <Badge tone="green">attached</Badge> : <Badge tone="gray">none</Badge>} </div>
                            <div className="ml-auto">
                                <button className="btn-primary" onClick={() => { void submitClaim(selectedInvoice.id); }}>
                                    Submit Claim
                                </button>
                            </div>
                        </div>
                    </SectionCard>
                </div>
            )}

            {/* ============ INSURANCE PAYMENT ============ */}
            {tab === "INS" && selectedInvoice && (
                <SectionCard
                    title={`Add Payment (Insurance) — Invoice #${selectedInvoice.id}`}
                    actions={
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Cheque #</label>
                            <input
                                className="input"
                                placeholder="e.g., 0037089513"
                                value={cheque.number}
                                onChange={(e) => setCheque((c) => ({ ...c, number: e.target.value }))}
                            />
                            <label className="text-sm text-gray-600">Bank/Branch #</label>
                            <input
                                className="input"
                                placeholder="…"
                                value={cheque.bankBranch}
                                onChange={(e) => setCheque((c) => ({ ...c, bankBranch: e.target.value }))}
                            />
                            <button className="btn-primary" onClick={() => { void applyInsurancePayment(); }}>
                                Apply
                            </button>
                        </div>
                    }
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="text-left">
                            <tr className="border-b">
                                <th className="p-2">Code</th>
                                <th className="p-2">Submitted</th>
                                <th className="p-2">Balance</th>
                                <th className="p-2">Deductible</th>
                                <th className="p-2">Allowed</th>
                                <th className="p-2">Ins WO</th>
                                <th className="p-2">Ins Pay</th>
                                <th className="p-2">Options</th>
                            </tr>
                            </thead>
                            <tbody>
                            {selectedInvoice.lines.map((l, idx) => {
                                const r = remits[idx];
                                return (
                                    <tr key={l.id} className="border-b">
                                        <td className="p-2 font-mono">{l.code}</td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                className="input w-28"
                                                value={r.submitted}
                                                onChange={(e) =>
                                                    setRemits((arr) => arr.map((x, i) => (i === idx ? { ...x, submitted: +e.target.value } : x)))
                                                }
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                className="input w-24"
                                                value={r.balance}
                                                onChange={(e) =>
                                                    setRemits((arr) => arr.map((x, i) => (i === idx ? { ...x, balance: +e.target.value } : x)))
                                                }
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                className="input w-24"
                                                value={r.deductible}
                                                onChange={(e) =>
                                                    setRemits((arr) =>
                                                        arr.map((x, i) => (i === idx ? { ...x, deductible: +e.target.value } : x))
                                                    )
                                                }
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                className="input w-24"
                                                value={r.allowed}
                                                onChange={(e) =>
                                                    setRemits((arr) => arr.map((x, i) => (i === idx ? { ...x, allowed: +e.target.value } : x)))
                                                }
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                className="input w-24"
                                                value={r.insWriteOff}
                                                onChange={(e) =>
                                                    setRemits((arr) =>
                                                        arr.map((x, i) => (i === idx ? { ...x, insWriteOff: +e.target.value } : x))
                                                    )
                                                }
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                className="input w-24"
                                                value={r.insPay}
                                                onChange={(e) =>
                                                    setRemits((arr) => arr.map((x, i) => (i === idx ? { ...x, insPay: +e.target.value } : x)))
                                                }
                                            />
                                        </td>
                                        <td className="p-2">
                                            <div className="flex items-center gap-3 text-xs">
                                                <label className="flex items-center gap-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={r.updateAllowed ?? false}
                                                        onChange={(e) =>
                                                            setRemits((arr) =>
                                                                arr.map((x, i) => (i === idx ? { ...x, updateAllowed: e.target.checked } : x))
                                                            )
                                                        }
                                                    />
                                                    Update allowed fee
                                                </label>
                                                <label className="flex items-center gap-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={r.updateFlatPortion ?? false}
                                                        onChange={(e) =>
                                                            setRemits((arr) =>
                                                                arr.map((x, i) => (i === idx ? { ...x, updateFlatPortion: e.target.checked } : x))
                                                            )
                                                        }
                                                    />
                                                    Update Ins. Flat Portion
                                                </label>
                                                <label className="flex items-center gap-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={r.applyWriteoff ?? false}
                                                        onChange={(e) =>
                                                            setRemits((arr) =>
                                                                arr.map((x, i) => (i === idx ? { ...x, applyWriteoff: e.target.checked } : x))
                                                            )
                                                        }
                                                    />
                                                    Apply write-off
                                                </label>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-3 text-xs text-gray-600">
                        Note: In multiple coverage scenarios, primary write-off may be deferred until final EOB.
                    </div>
                </SectionCard>
            )}

            {/* ============ PATIENT PAYMENT ============ */}
            {tab === "PATIENT" && selectedInvoice && (
                <div className="space-y-4">
                    {outstanding <= 0 && (
                        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-800">
                            There is no outstanding balance on the patient’s account. Please add as a deposit.
                        </div>
                    )}

                    <SectionCard
                        title={`Add Payment (Patient) — Invoice #${selectedInvoice.id}`}
                        actions={
                            <div className="flex items-center gap-2">
                                <select className="input" value={payMethod} onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}>
                                    <option value="CREDIT_CARD">Credit Card</option>
                                    <option value="CHECK">Check</option>
                                    <option value="DEBIT_CARD">Debit Card (debit)</option>
                                    <option value="EFT">EFT</option>
                                    <option value="CASH">Cash</option>
                                    <option value="CARE_CREDIT">Care Credit</option>
                                    <option value="MASTERCARD">Master Card</option>
                                    <option value="VISA">Visa</option>
                                    <option value="DISCOVER">Discover</option>
                                    <option value="AMEX">Amex</option>
                                </select>
                                <button className="btn-primary" onClick={() => { void applyPatientPayment(); }}>
                                    Apply
                                </button>
                            </div>
                        }
                    >
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="text-left">
                                <tr className="border-b">
                                    <th className="p-2">Invoice</th>
                                    <th className="p-2">Line</th>
                                    <th className="p-2">Charge</th>
                                    <th className="p-2">Payment</th>
                                </tr>
                                </thead>
                                <tbody>
                                {selectedInvoice.lines.map((l, idx) => (
                                    <tr key={l.id} className="border-b">
                                        <td className="p-2">#{selectedInvoice.id}</td>
                                        <td className="p-2">
                                            {l.code} — {l.treatment}
                                        </td>
                                        <td className="p-2">{currency(l.charge)}</td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                className="input w-32"
                                                value={allocs[idx]?.amount ?? 0}
                                                onChange={(e) =>
                                                    setAllocs((arr) => arr.map((a, i) => (i === idx ? { ...a, amount: +e.target.value } : a)))
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td className="p-2 font-medium" colSpan={3}>
                                        Overpayment:
                                    </td>
                                    <td className="p-2 font-semibold">{currency(overpay)}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" /> Generate Statement
                            </label>
                            <div className="text-gray-700">
                                Entered: <span className="font-semibold">{currency(entered)}</span> · Outstanding:{" "}
                                <span className="font-semibold">{currency(outstanding)}</span>
                            </div>
                        </div>
                    </SectionCard>

                    <div className="rounded-xl border border-purple-300 bg-purple-50 p-3">
                        <div className="flex items-center justify-between">
                            <div className="text-purple-900">
                                Account Credit: <b>{currency(accountCredit.balance)}</b>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className="btn-light"
                                    onClick={() => {
                                        void applyAccountCredit(Math.min(accountCredit.balance, outstanding));
                                    }}
                                >
                                    Apply to open balance
                                </button>
                                <button className="btn-light" onClick={() => { void applyAccountCredit(0); }}>
                                    Keep as account credit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ======= MODALS ======= */}
            {showEditLinesFor && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
                    <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b px-5 py-3">
                            <h4 className="text-base font-semibold">{`Edit invoice #${showEditLinesFor}`}</h4>
                            <button
                                onClick={() => setShowEditLinesFor(null)}
                                className="rounded p-1 hover:bg-gray-100"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-5 space-y-3">
                            {invoices.find((i) => i.id === showEditLinesFor)?.lines.map((l) => (
                                <div key={l.id} className="flex items-center gap-3">
                                    <div className="w-24 font-mono">{l.code}</div>
                                    <div className="flex-1">{l.treatment}</div>
                                    <div className="w-32">
                                        <input
                                            type="number"
                                            className="input w-full"
                                            defaultValue={l.charge}
                                            onBlur={(e) => {
                                                void reestimateLine(showEditLinesFor, l.id, +e.target.value);
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                            <div className="mt-4 flex justify-end">
                                <button className="btn-primary" onClick={() => setShowEditLinesFor(null)}>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAdjustmentFor && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b px-5 py-3">
                            <h4 className="text-base font-semibold">{`Adjust invoice #${showAdjustmentFor}`}</h4>
                            <button
                                onClick={() => setShowAdjustmentFor(null)}
                                className="rounded p-1 hover:bg-gray-100"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-5 grid gap-3">
                            <div>
                                <label className="text-xs text-gray-600">Type</label>
                                <select className="input w-full">
                                    <option>Un-Collected</option>
                                    <option>Professional Courtesy</option>
                                    <option>Migrated</option>
                                    <option>MembershipPlan</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-600">Percentage (%)</label>
                                <input id="adjp" type="number" className="input w-full" placeholder="e.g., 10" />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    className="btn-primary"
                                    onClick={() => {
                                        const el = document.getElementById("adjp") as HTMLInputElement | null;
                                        const percent = Number(el?.value || "0");
                                        void applyPercentAdjustment(showAdjustmentFor, percent);
                                        setShowAdjustmentFor(null);
                                    }}
                                >
                                    Adjust
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAddProcedure && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
                    <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b px-5 py-3">
                            <h4 className="text-base font-semibold">Add Procedure (creates Invoice)</h4>
                            <button
                                onClick={() => setShowAddProcedure(false)}
                                className="rounded p-1 hover:bg-gray-100"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-5 space-y-5">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div className="md:col-span-2">
                                    <label className="label">Code</label>
                                    <input id="p-code" className="input w-full" placeholder="e.g., D2391" defaultValue="D2391" />
                                </div>
                                <div>
                                    <label className="label">Units</label>
                                    <input id="p-units" className="input w-full" defaultValue={1} type="number" />
                                </div>
                            </div>
                            <div>
                                <label className="label">Rate</label>
                                <input id="p-rate" className="input w-full" placeholder="e.g., 239.00" defaultValue={239} />
                            </div>
                            <div>
                                <label className="label">Description</label>
                                <input id="p-desc" className="input w-full" defaultValue="Composite Resin, 1 surface" />
                            </div>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div>
                                    <label className="label">Date of Service</label>
                                    <input id="p-dos" className="input w-full" placeholder="YYYY-MM-DD" />
                                </div>
                                <div>
                                    <label className="label">Provider</label>
                                    <input id="p-prov" className="input w-full" defaultValue="PROV-01" />
                                    {/*<select id="p-prov" className="input w-full">*/}
                                    {/*    <option value="">-- Select Provider --</option>*/}
                                    {/*    {providers.map((prov) => (*/}
                                    {/*        <option key={prov.id} value={prov.id}>*/}
                                    {/*            {prov.name}*/}
                                    {/*        </option>*/}
                                    {/*    ))}*/}
                                    {/*</select>*/}


                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button className="btn-light" onClick={() => setShowAddProcedure(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={() => {
                                        const code = (document.getElementById("p-code") as HTMLInputElement).value || "D2391";
                                        const rate = Number((document.getElementById("p-rate") as HTMLInputElement).value || "239");
                                        const treatment = (document.getElementById("p-desc") as HTMLInputElement).value || "Procedure";
                                        const dos =
                                            (document.getElementById("p-dos") as HTMLInputElement).value ||
                                            new Date().toISOString().slice(0, 10);
                                       const provider = (document.getElementById("p-prov") as HTMLInputElement).value || "PROV-01";
                                       // const provider = (document.getElementById("p-prov") as HTMLSelectElement).value;

                                        void createInvoiceFromProcedure({ dos, code, treatment, provider, rate });
                                        setShowAddProcedure(false);
                                        setTab("INVOICE");
                                    }}
                                >
                                    Save & Create Invoice
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showClaimComposeFor && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
                    <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b px-5 py-3">
                            <h4 className="text-base font-semibold">Claim notes / narrative</h4>
                            <button
                                onClick={() => setShowClaimComposeFor(null)}
                                className="rounded p-1 hover:bg-gray-100"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-5">
                            {(() => {
                                const c = claims[showClaimComposeFor ?? -1];
                                if (!c) return null;
                                return (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                            <div>
                                                <label className="label">Treating Provider</label>
                                                <input
                                                    className="input w-full"
                                                    defaultValue={c.treatingProviderId ?? ""}
                                                    onBlur={(e) => {
                                                        void updateClaim(c.invoiceId, { treatingProviderId: e.currentTarget.value });
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="label">Billing Entity</label>
                                                <input
                                                    className="input w-full"
                                                    defaultValue={c.billingEntity ?? ""}
                                                    onBlur={(e) => {
                                                        void updateClaim(c.invoiceId, { billingEntity: e.currentTarget.value });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="label">Notes</label>
                                            <textarea
                                                className="input h-28 w-full"
                                                defaultValue={c.notes ?? ""}
                                                onBlur={(e) => {
                                                    void updateClaim(c.invoiceId, { notes: e.currentTarget.value });
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <button className="btn-primary" onClick={() => { void sendToBatch(c.invoiceId); }}>
                                                Send to Batch
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {showClaimEditFor && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
                    <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b px-5 py-3">
                            <h4 className="text-base font-semibold">{`Edit Claim #${claims[showClaimEditFor!]?.id}`}</h4>
                            <button
                                onClick={() => setShowClaimEditFor(null)}
                                className="rounded p-1 hover:bg-gray-100"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                            {[
                                ["attachmentIndicator", "Attachment Indicator (Y/N)"],
                                ["attachmentType", "Attachment Type (e.g., EOB)"],
                                ["attachmentTransmissionCode", "Attachment Transmission Code (EL/Mail/Fax)"],
                                ["claimSubmissionReasonCode", "Claim Submission Reason Code (e.g., 1)"],
                                ["type", "Type (Electronic/Paper)"],
                            ].map(([key, label]) => (
                                <div key={key}>
                                    <label className="label">{label}</label>
                                    <input
                                        className="input w-full"
                                        onBlur={(e) => {
                                            void updateClaim(showClaimEditFor!, { [key]: e.currentTarget.value });
                                        }}
                                    />
                                </div>
                            ))}
                            <div className="md:col-span-2 flex justify-end">
                                <button className="btn-primary" onClick={() => setShowClaimEditFor(null)}>
                                    Edit Claim
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showVoidFor && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b px-5 py-3">
                            <h4 className="text-base font-semibold">Void & Re-Create claim</h4>
                            <button
                                onClick={() => setShowVoidFor(null)}
                                className="rounded p-1 hover:bg-gray-100"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-5 space-y-3">
                            <p className="text-sm">
                                Are you sure you want to void & recreate this claim? This will only void the claim in the system and
                                create a clone without submitting. <b>This can’t be undone!</b>
                            </p>
                            <div className="flex justify-end gap-2">
                                <button className="btn-light" onClick={() => setShowVoidFor(null)}>
                                    Cancel
                                </button>
                                <button className="btn-danger" onClick={() => { void voidAndRecreateClaim(showVoidFor!); }}>
                                    Void & Re-Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
