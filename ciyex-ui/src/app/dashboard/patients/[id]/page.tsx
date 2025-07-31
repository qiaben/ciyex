// File: src/app/dashboard/patients/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PatientDetailPage() {
    const { id } = useParams();
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchPatient = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/patient/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                        "X-Org-Id": localStorage.getItem("orgId") || "1",
                        "X-Facility-Id": localStorage.getItem("facilityId") || "1",
                        "X-Role": localStorage.getItem("role") || "provider",
                    },
                });

                const json = await res.json();
                setPatient(json.data);
            } catch (err) {
                console.error("Error loading patient", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPatient();
    }, [id]);

    if (loading) return <div className="p-8 text-white">Loading...</div>;

    if (!patient) return <div className="p-8 text-red-500">Patient not found.</div>;

    return (
        <div className="p-8 text-white">
            <h1 className="text-3xl font-bold mb-4">Patient Detail</h1>
            <p><strong>Name:</strong> {patient.name}</p>
            <p><strong>Gender:</strong> {patient.gender}</p>
            <p><strong>Date of Birth:</strong> {patient.birthDate}</p>
            <p><strong>ID:</strong> {patient.id}</p>
        </div>
    );
}
