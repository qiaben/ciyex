'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import Link from 'next/link';

// If you already use lucide-react, uncomment this import and icons below
// import { Stethoscope, ClipboardList, FileText, Activity, CheckCircle2 } from "lucide-react";

type Params = { patientId: string; encounterId: string };

// Match generated PageProps in your build: params is a Promise
type Props = { params: Promise<Params> };

type SectionKey =
    | 'cc' | 'hpi' | 'ros' | 'pmh' | 'fh' | 'sh' | 'pe'
    | 'assessment' | 'plan' | 'providerNote' | 'procedure'
    | 'billing' | 'signoff' | 'signature' | 'finalizedAt'
    | 'assignedProviders' | 'feeSchedule';

export default function EncounterPage({ params }: Props) {
    // Resolve promised params in a client component (unconditional hook usage)
    const [ids, setIds] = useState<Params | null>(null);
    useEffect(() => {
        let ok = true;
        Promise.resolve(params).then((p) => ok && setIds(p));
        return () => {
            ok = false;
        };
    }, [params]);

    // Hooks must be called unconditionally
    const sections = useMemo(
        () =>
            ([
                { key: 'cc', label: 'Chief Complaint (CC)' },
                { key: 'hpi', label: 'History of Present Illness (HPI)' },
                { key: 'ros', label: 'Review of Systems (ROS)' },
                { key: 'pmh', label: 'Past Medical History (PMH)' },
                { key: 'fh', label: 'Family History (FH)' },
                { key: 'sh', label: 'Social History (SH)' },
                { key: 'pe', label: 'Physical Examination' },
                { key: 'assessment', label: 'Assessment' },
                { key: 'plan', label: 'Plan' },
                { key: 'providerNote', label: 'Provider Note' },
                { key: 'procedure', label: 'Procedure / Orders' },
                { key: 'billing', label: 'Billing & Coding' },
                { key: 'signoff', label: 'Sign-off / Finalization' },
                { key: 'signature', label: 'Provider Signature' },
                { key: 'finalizedAt', label: 'Date/Time Finalized' },
                { key: 'assignedProviders', label: 'Assigned Provider(s)' },
                { key: 'feeSchedule', label: 'Fee Schedule' },
            ] as { key: SectionKey; label: string }[]),
        []
    );

    const [active, setActive] = useState<SectionKey>('cc');

    // For sticky tab shadow on scroll
    const headerRef = useRef<HTMLDivElement>(null);
    const [elevated, setElevated] = useState(false);
    useEffect(() => {
        const onScroll = () => {
            const top = headerRef.current?.getBoundingClientRect().top ?? 0;
            setElevated(top <= 0);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Safely derive ids even before they resolve
    const patientId = ids?.patientId ?? '';
    const encounterId = ids?.encounterId ?? '';
    const loading = !ids;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/* Top bar / breadcrumb */}
            <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
                <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-2 text-sm">
                    <Link
                        href="/dashboard"
                        className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                    >
                        Dashboard
                    </Link>
                    <span className="text-neutral-400">/</span>
                    <Link
                        href={patientId ? `/patients/${patientId}` : '#'}
                        className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white pointer-events-auto"
                    >
                        {patientId ? `Patient ${patientId}` : 'Patient …'}
                    </Link>
                    <span className="text-neutral-400">/</span>
                    <span className="font-medium text-neutral-900 dark:text-white">
            {encounterId ? `Encounter ${encounterId}` : 'Encounter …'}
          </span>

                    <div className="ml-auto flex items-center gap-2">
                        <button
                            className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm"
                            onClick={() => alert('Saved draft')}
                            disabled={loading}
                        >
                            Save Draft
                        </button>
                        <button
                            className="px-3 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 text-sm"
                            onClick={() => alert('Finalized')}
                            disabled={loading}
                        >
                            Finalize
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div
                    ref={headerRef}
                    className={[
                        'border-t border-neutral-200 dark:border-neutral-800 overflow-x-auto',
                        elevated ? 'shadow-sm' : 'shadow-none',
                    ].join(' ')}
                >
                    <div className="mx-auto max-w-7xl px-2">
                        <nav className="flex gap-1 py-2">
                            {sections.map((s) => (
                                <button
                                    key={s.key}
                                    onClick={() => setActive(s.key)}
                                    className={[
                                        'whitespace-nowrap rounded-xl px-3 py-1.5 text-sm transition',
                                        active === s.key
                                            ? 'bg-neutral-900 text-white dark:bg:white dark:text-neutral-900'
                                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                                    ].join(' ')}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-7xl px-4 py-6">
                {loading ? (
                    <div className="text-sm text-neutral-500">Loading encounter…</div>
                ) : (
                    <Card title={sectionLabel(sections, active)}>
                        {renderSection(active)}
                    </Card>
                )}
            </div>
        </div>
    );
}

function Card({
                  title,
                  children,
              }: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {title}
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Fill out the fields below. All changes are saved when you click “Save
                    Draft”.
                </p>
            </div>
            {children}
        </div>
    );
}

function sectionLabel(
    list: { key: SectionKey; label: string }[],
    key: SectionKey
) {
    return list.find((s) => s.key === key)?.label ?? '';
}

/* ---- Section Renderers (simple, editable stubs) ---- */

function Input({
                   label,
                   placeholder,
                   as = 'input',
                   rows = 5,
               }: {
    label: string;
    placeholder?: string;
    as?: 'input' | 'textarea';
    rows?: number;
}) {
    const Base =
        as === 'textarea'
            ? (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
                <textarea rows={rows} {...props} />
            )
            : (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} />;

    return (
        <label className="grid gap-1">
      <span className="text-sm text-neutral-700 dark:text-neutral-300">
        {label}
      </span>
            <Base
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-400/40"
                placeholder={placeholder}
            />
        </label>
    );
}

function TwoCol({ children }: { children: React.ReactNode }) {
    return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function renderSection(key: SectionKey) {
    switch (key) {
        case 'cc':
            return (
                <TwoCol>
                    <Input label="Chief Complaint" placeholder="e.g., tooth pain" />
                    <Input label="Onset" placeholder="e.g., 3 days ago" />
                    <Input label="Severity" placeholder="e.g., 7/10" />
                    <Input label="Associated Symptoms" placeholder="e.g., fever, swelling" />
                </TwoCol>
            );
        case 'hpi':
            return (
                <Input
                    label="History of Present Illness"
                    as="textarea"
                    rows={10}
                    placeholder="Narrative description of symptom progression, modifiers, treatments tried, etc."
                />
            );
        case 'ros':
            return (
                <Input
                    label="Review of Systems"
                    as="textarea"
                    rows={10}
                    placeholder="Denies fever/chills… Endorses… System-by-system review."
                />
            );
        case 'pmh':
            return (
                <TwoCol>
                    <Input label="Past Medical History" as="textarea" rows={6} />
                    <Input label="Medications" as="textarea" rows={6} />
                    <Input label="Allergies" as="textarea" rows={6} />
                    <Input label="Surgeries" as="textarea" rows={6} />
                </TwoCol>
            );
        case 'fh':
            return (
                <Input
                    label="Family History"
                    as="textarea"
                    rows={8}
                    placeholder="Relevant familial conditions (e.g., DM, HTN)…"
                />
            );
        case 'sh':
            return (
                <TwoCol>
                    <Input label="Occupation" placeholder="e.g., teacher" />
                    <Input label="Tobacco/Alcohol/Drugs" placeholder="Use, frequency, duration" />
                    <Input label="Living Situation" placeholder="e.g., with family" />
                    <Input label="Other Social Factors" placeholder="Diet, exercise, etc." />
                </TwoCol>
            );
        case 'pe':
            return (
                <TwoCol>
                    <Input label="Vitals" placeholder="BP, HR, RR, Temp, SpO2" />
                    <Input label="General" placeholder="NAD, alert & oriented…" />
                    <Input label="HEENT/Oral" as="textarea" rows={6} />
                    <Input label="Other Systems" as="textarea" rows={6} />
                </TwoCol>
            );
        case 'assessment':
            return (
                <Input
                    label="Assessment"
                    as="textarea"
                    rows={8}
                    placeholder="Primary and differential diagnoses, ICD codes if desired."
                />
            );
        case 'plan':
            return (
                <Input
                    label="Plan"
                    as="textarea"
                    rows={8}
                    placeholder="Treatment plan, medications, labs, imaging, referrals, patient education."
                />
            );
        case 'providerNote':
            return (
                <Input
                    label="Provider Note"
                    as="textarea"
                    rows={10}
                    placeholder="Free-text provider narrative."
                />
            );
        case 'procedure':
            return (
                <TwoCol>
                    <Input label="Procedure / Order" placeholder="e.g., D4341 – SRP" />
                    <Input label="Details" as="textarea" rows={6} />
                </TwoCol>
            );
        case 'billing':
            return (
                <TwoCol>
                    <Input label="CPT/HCPCS/ADA Codes" placeholder="List codes" />
                    <Input label="Modifiers & Units" placeholder="e.g., -59, 2 units" />
                    <Input label="Diagnosis (ICD)" placeholder="e.g., K02.9" />
                    <Input label="Notes" as="textarea" rows={6} />
                </TwoCol>
            );
        case 'signoff':
            return (
                <TwoCol>
                    <Input label="Ready to Finalize?" placeholder="Yes / No / Pending" />
                    <Input label="Comments" as="textarea" rows={6} />
                </TwoCol>
            );
        case 'signature':
            return (
                <TwoCol>
                    <Input label="Provider Name" placeholder="e.g., Dr. Smith" />
                    <Input label="Digital Signature" placeholder="Type name to sign" />
                </TwoCol>
            );
        case 'finalizedAt':
            return (
                <TwoCol>
                    <Input label="Finalized Date" placeholder="YYYY-MM-DD" />
                    <Input label="Finalized Time" placeholder="HH:mm" />
                </TwoCol>
            );
        case 'assignedProviders':
            return (
                <TwoCol>
                    <Input label="Primary Provider" placeholder="e.g., NPI / Name" />
                    <Input label="Assist / Scribe" placeholder="Name(s)" />
                </TwoCol>
            );
        case 'feeSchedule':
            return (
                <TwoCol>
                    <Input label="Fee Schedule Name" placeholder="e.g., Standard 2025" />
                    <Input label="Overrides / Discounts" as="textarea" rows={6} />
                </TwoCol>
            );
        default:
            return null;
    }
}
