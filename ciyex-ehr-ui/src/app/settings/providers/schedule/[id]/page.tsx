"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/app/(admin)/layout";
import Button from "@/components/ui/button/Button";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

type Provider = {
    id: number;
    npi: string | null;
    identification: { firstName: string | null; lastName: string | null } | null;
    professionalDetails: { specialty: string | null; providerType: string | null } | null;
};

type Freq = "DAILY" | "WEEKLY" | "MONTHLY";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseTimeToDate(base: Date, time: string) {
    const [hh, mm] = time.split(":").map((v) => parseInt(v || "0", 10));
    const d = new Date(base);
    d.setHours(hh, mm, 0, 0);
    return d;
}
function addDays(d: Date, n: number) {
    const t = new Date(d);
    t.setDate(t.getDate() + n);
    return t;
}
function addMonths(d: Date, n: number) {
    const t = new Date(d);
    const day = t.getDate();
    t.setMonth(t.getMonth() + n);
    if (t.getDate() < day) t.setDate(0);
    return t;
}

const Page = () => {
    const { id } = useParams();
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const [provider, setProvider] = useState<Provider | null>(null);
    const [otherProviders, setOtherProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);

    // recurrence state
    const [freq, setFreq] = useState<Freq>("WEEKLY");
    const [interval, setInterval] = useState<number>(1);
    const todayISO = new Date().toISOString().split("T")[0];
    const [startDate, setStartDate] = useState<string>(todayISO);
    const [endDate, setEndDate] = useState<string>("");
    const [maxOccurrences, setMaxOccurrences] = useState<number>(10);
    const [weeklyDays, setWeeklyDays] = useState<boolean[]>([false, true, true, true, true, true, false]); // Mon–Fri
    const [startTime, setStartTime] = useState<string>("09:00");
    const [endTime, setEndTime] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [useClientLocation, setUseClientLocation] = useState(false);


    // substitute provider
    const [substituteProviderId, setSubstituteProviderId] = useState<number | null>(null);

    // Fetch provider & other providers
    useEffect(() => {
        (async () => {
            try {
                const [resProvider, resOthers] = await Promise.all([
                    fetchWithAuth(`${apiUrl}/api/providers/${id}`, { method: "GET" }),
                    fetchWithAuth(`${apiUrl}/api/providers?status=ACTIVE`, { method: "GET" }),
                ]);

                if (resProvider.ok) {
                    const data = await resProvider.json();
                    setProvider(data?.data ?? null);
                }

                if (resOthers.ok) {
                    const data = await resOthers.json();
                    setOtherProviders(data.data.filter((p: Provider) => p.id !== Number(id)));
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [apiUrl, id]);

    // Preview calculation
    const preview = useMemo(() => {
        try {
            const out: { start: Date; end: Date }[] = [];
            if (!startDate) return out;

            const start = parseTimeToDate(new Date(startDate), startTime);
            const endLimit = endDate ? new Date(endDate) : null;

            let cursor = new Date(start);

            if (freq === "DAILY") {
                while (out.length < maxOccurrences) {
                    if (!endLimit || cursor <= addDays(endLimit, 1)) {
                        const s = new Date(cursor);
                        const e = parseTimeToDate(s, endTime);   // ✅ use endTime instead of durationMin
                        if (e > s) {
                            out.push({ start: s, end: e });
                        }
                        cursor = addDays(cursor, interval);
                    } else break;
                }
            } else if (freq === "WEEKLY") {
                let guard = 0;
                while (out.length < maxOccurrences && guard < 10000) {
                    guard++;
                    for (let dow = 0; dow < 7 && out.length < maxOccurrences; dow++) {
                        const d = addDays(cursor, dow);
                        if (weeklyDays[d.getDay()]) {
                            const s = parseTimeToDate(d, startTime);
                            const e = parseTimeToDate(d, endTime);  // ✅
                            if ((!endLimit || s <= addDays(endLimit, 1)) && e > s) {
                                out.push({ start: s, end: e });
                            }
                        }
                    }
                    cursor = addDays(cursor, 7 * interval);
                    if (endLimit && cursor > addDays(endLimit, 1)) break;
                }
            } else {
                const targetDay = new Date(startDate).getDate();
                let monthCursor = new Date(start);
                let guard = 0;
                while (out.length < maxOccurrences && guard < 1000) {
                    guard++;
                    if (!endLimit || monthCursor <= addDays(endLimit, 1)) {
                        const s = parseTimeToDate(monthCursor, startTime);
                        const e = parseTimeToDate(monthCursor, endTime); // ✅
                        out.push({ start: s, end: e });
                        monthCursor = addMonths(monthCursor, interval);
                        const fix = new Date(monthCursor);
                        fix.setDate(
                            Math.min(targetDay, new Date(fix.getFullYear(), fix.getMonth() + 1, 0).getDate())
                        );
                        monthCursor = fix;
                    } else break;
                }
            }

            return out.slice(0, maxOccurrences);
        } catch {
            return [];
        }
    }, [startDate, endDate, startTime, endTime, freq, interval, maxOccurrences, weeklyDays]);

    const formatRange = (s: Date, e: Date) => {
        const fmt = new Intl.DateTimeFormat("en-US", {
            weekday: "short",
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,   //  force 24-hour format
        });
        const tOnly = new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,   //  force 24-hour clock
        });
        return `${fmt.format(s)} – ${tOnly.format(e)}`;
    };

    const fullName = provider
        ? `${provider.identification?.firstName ?? ""} ${provider.identification?.lastName ?? ""}`.trim()
        : "";

    return (
        <AdminLayout>
            <div className="container mx-auto p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900">Provider Schedule</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {loading
                                ? "Loading provider…"
                                : fullName
                                    ? `${fullName} • ${provider?.professionalDetails?.specialty ?? ""}`
                                    : "—"}
                        </p>
                    </div>
                    <Button variant="primary" onClick={() => router.back()}>
                        Back
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left: Form */}
                    <div className="lg:col-span-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-medium text-gray-900">Recurrence</h2>

                        {/* Frequency */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Frequency</label>
                            <div className="mt-2 flex gap-2">
                                {(["DAILY", "WEEKLY", "MONTHLY"] as Freq[]).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFreq(f)}
                                        className={[
                                            "rounded-full border px-3 py-1.5 text-sm",
                                            freq === f
                                                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                                : "border-gray-300 text-gray-700",
                                        ].join(" ")}
                                        aria-pressed={freq === f}
                                    >
                                        {f.charAt(0) + f.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Interval */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Every</label>
                            <div className="mt-2 flex items-center gap-2">
                                <input
                                    type="number"
                                    min={1}
                                    value={interval}
                                    onChange={(e) => setInterval(Math.max(1, Number(e.target.value || 1)))}
                                    className="h-10 w-20 rounded-lg border border-gray-300 px-3 text-sm"
                                />
                                <span className="text-sm text-gray-600">
                  {freq === "DAILY" ? "day(s)" : freq === "WEEKLY" ? "week(s)" : "month(s)"}
                </span>
                            </div>
                        </div>

                        {/* Weekly day picker */}
                        {freq === "WEEKLY" && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700">Repeat On</label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {dayNames.map((d, idx) => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() =>
                                                setWeeklyDays((prev) => {
                                                    const c = [...prev];
                                                    c[idx] = !c[idx];
                                                    return c;
                                                })
                                            }
                                            className={[
                                                "w-10 rounded-full border px-0 py-1.5 text-sm",
                                                weeklyDays[idx]
                                                    ? "border-indigo-600 bg-indigo-600 text-white"
                                                    : "border-gray-300 text-gray-700",
                                            ].join(" ")}
                                            aria-pressed={weeklyDays[idx]}
                                        >
                                            {d[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Dates */}
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Date (optional)</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                                />
                            </div>
                        </div>

                        {/* Time + Duration + Location */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Time</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Location</label>
                                <div className="mt-2 flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={useClientLocation ? "Client" : location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        disabled={useClientLocation}
                                        className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                                        placeholder="e.g., Clinic A, Room 12"
                                    />
                                    <label className="flex items-center gap-1 text-sm text-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={useClientLocation}
                                            onChange={(e) => setUseClientLocation(e.target.checked)}
                                        />
                                        Use client
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Substitute Provider */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Substitute Provider (if on leave)</label>
                            <select
                                value={substituteProviderId ?? ""}
                                onChange={(e) => setSubstituteProviderId(Number(e.target.value) || null)}
                                className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                            >
                                <option value="">-- None --</option>
                                {otherProviders.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {`${p.identification?.firstName ?? ""} ${p.identification?.lastName ?? ""}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Occurrence cap */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Max Occurrences (preview & save)</label>
                            <input
                                type="number"
                                min={1}
                                value={maxOccurrences}
                                onChange={(e) => setMaxOccurrences(Math.max(1, Number(e.target.value || 1)))}
                                className="mt-2 h-10 w-32 rounded-lg border border-gray-300 px-3 text-sm"
                            />
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex justify-end gap-2">
                            <Button variant="primary" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    const payload = {
                                        providerId: Number(id),
                                        substituteProviderId,
                                        freq,
                                        interval,
                                        startDate,
                                        endDate: endDate || null,
                                        startTime,
                                        endTime,  //   instead of durationMin
                                        weeklyDays,
                                        maxOccurrences,
                                        location,
                                    };
                                    console.log("SAVE_SCHEDULE", payload);
                                    alert("Schedule saved (mock). Check console for payload.");
                                }}
                            >
                                Save Schedule
                            </Button>
                        </div>
                    </div>

                    {/* Right: Preview */}
                    <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-medium text-gray-900">Preview</h2>
                        <p className="text-sm text-gray-500 mt-1">Next {Math.min(preview.length, 10)} occurrence(s)</p>

                        <div className="mt-4 space-y-2">
                            {preview.length === 0 ? (
                                <div className="text-sm text-gray-500">No occurrences with the current settings.</div>
                            ) : (
                                preview.slice(0, 10).map((o, i) => (
                                    <div
                                        key={i}
                                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 flex items-center justify-between"
                                    >
                                        <span>{formatRange(o.start, o.end)}</span>
                                        <span className="text-xs text-gray-500">
  {`${startTime} – ${endTime}`}
</span>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-6 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                            The preview uses your browser’s local time. Location is stored as text only.
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Page;
