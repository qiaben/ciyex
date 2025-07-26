"use client";

import { useEffect, useState } from "react";

export default function AppointmentListPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAppointments() {
            try {
                const res = await fetch("http://localhost:8080/api/appointment/list", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                        "X-Org-Id": localStorage.getItem("orgId") || "1",
                        "X-Facility-Id": localStorage.getItem("facilityId") || "1",
                        "X-Role": localStorage.getItem("role") || "provider",
                    },
                });

                if (!res.ok) {
                    const text = await res.text();
                    console.error("Backend error:", text);
                    setError("Failed to fetch appointments");
                    return;
                }

                const json = await res.json();
                const parsed = json.entry?.map((entry: any) => entry.resource) || [];
                setAppointments(parsed);
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Error loading appointments");
            } finally {
                setLoading(false);
            }
        }

        fetchAppointments();
    }, []);

    return (
        <div
            style={{
                padding: "32px",
                backgroundColor: "#0c0c0c",
                color: "#eaeaea",
                minHeight: "100vh",
                fontFamily: "Segoe UI, sans-serif",
            }}
        >
            <h1
                style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    marginBottom: 24,
                    color: "#ffffff",
                }}
            >
                Appointment List
            </h1>

            {loading ? (
                <p>Loading appointments...</p>
            ) : error ? (
                <p style={{ color: "tomato" }}>{error}</p>
            ) : (
                <div
                    style={{
                        borderRadius: 12,
                        overflow: "hidden",
                        border: "1px solid #333",
                        boxShadow: "0 0 12px rgba(0,0,0,0.2)",
                    }}
                >
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                        <tr
                            style={{
                                background: "linear-gradient(to right, #3a3f51, #2a2d38)",
                                color: "#fff",
                            }}
                        >
                            <th style={th}>ID</th>
                            <th style={th}>Status</th>
                            <th style={th}>Start</th>
                            <th style={th}>End</th>
                            <th style={th}>Patient</th>
                            <th style={th}>Practitioner</th>
                        </tr>
                        </thead>
                        <tbody>
                        {appointments.length === 0 ? (
                            <tr>
                                <td style={td} colSpan={6}>
                                    No appointments found.
                                </td>
                            </tr>
                        ) : (
                            appointments.map((a, idx) => (
                                <tr
                                    key={a.id}
                                    style={{
                                        backgroundColor: idx % 2 === 0 ? "#181818" : "#1e1e1e",
                                        transition: "background 0.3s",
                                    }}
                                >
                                    <td style={td}>{a.id}</td>
                                    <td style={{ ...td, color: statusColor(a.status) }}>
                                        {a.status}
                                    </td>
                                    <td style={td}>{formatDate(a.start)}</td>
                                    <td style={td}>{formatDate(a.end)}</td>
                                    <td style={td}>
                                        {a.participant?.find((p: any) =>
                                            p.actor?.reference?.startsWith("Patient/")
                                        )?.actor?.reference || "—"}
                                    </td>
                                    <td style={td}>
                                        {a.participant?.find((p: any) =>
                                            p.actor?.reference?.startsWith("Practitioner/")
                                        )?.actor?.reference || "—"}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

const th: React.CSSProperties = {
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: 600,
    fontSize: "15px",
    borderBottom: "1px solid #444",
};

const td: React.CSSProperties = {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#f1f1f1",
    borderBottom: "1px solid #333",
};

function formatDate(dateString?: string): string {
    if (!dateString) return "—";
    try {
        return new Date(dateString).toLocaleString();
    } catch {
        return "Invalid date";
    }
}

function statusColor(status?: string) {
    switch (status) {
        case "booked":
        case "arrived":
            return "#22c55e"; // green
        case "cancelled":
        case "noshow":
            return "#ef4444"; // red
        case "proposed":
        default:
            return "#facc15"; // yellow
    }
}
