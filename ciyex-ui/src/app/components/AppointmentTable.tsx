"use client";
import { useEffect, useState } from "react";

interface Appointment {
    id: string;
    status: string;
    description?: string;
    start: string;
    end: string;
    patientRef?: string;
    practitionerRef?: string;
}

export default function AppointmentTable() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchAppointments() {
            try {
                const res = await fetch("/api/appointment/list");
                if (!res.ok) throw new Error("Failed to fetch appointments");
                const bundle = await res.json();

                const parsed = bundle.entry?.map((entry: any) => {
                    const appt = entry.resource;
                    return {
                        id: appt.id,
                        status: appt.status,
                        description: appt.description,
                        start: appt.start,
                        end: appt.end,
                        patientRef: appt.participant?.find((p: any) =>
                            p.actor.reference?.startsWith("Patient/")
                        )?.actor.reference,
                        practitionerRef: appt.participant?.find((p: any) =>
                            p.actor.reference?.startsWith("Practitioner/")
                        )?.actor.reference,
                    };
                }) || [];

                setAppointments(parsed);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchAppointments();
    }, []);

    if (loading) return <p>Loading appointments...</p>;
    if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

    return (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
            <thead style={{ backgroundColor: "#f4f4f5" }}>
            <tr>
                <th style={cellStyle}>ID</th>
                <th style={cellStyle}>Status</th>
                <th style={cellStyle}>Description</th>
                <th style={cellStyle}>Start</th>
                <th style={cellStyle}>End</th>
                <th style={cellStyle}>Patient</th>
                <th style={cellStyle}>Practitioner</th>
            </tr>
            </thead>
            <tbody>
            {appointments.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={cellStyle}>{a.id}</td>
                    <td style={cellStyle}>{a.status}</td>
                    <td style={cellStyle}>{a.description || "—"}</td>
                    <td style={cellStyle}>{new Date(a.start).toLocaleString()}</td>
                    <td style={cellStyle}>{new Date(a.end).toLocaleString()}</td>
                    <td style={cellStyle}>{a.patientRef}</td>
                    <td style={cellStyle}>{a.practitionerRef}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}

const cellStyle: React.CSSProperties = {
    padding: "12px",
    textAlign: "left",
    fontSize: "14px",
};
