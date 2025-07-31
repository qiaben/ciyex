"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditPatientPage() {
    const { id } = useParams();
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        birthDate: "",
    });
    const [loading, setLoading] = useState(true);

    // Fetch existing patient
    useEffect(() => {
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
                const patient = json.data;

                setForm({
                    name: patient.name || "",
                    birthDate: patient.birthDate || "",
                });
            } catch (error) {
                console.error("Failed to fetch patient:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPatient();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:8080/api/patient/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                    "X-Org-Id": localStorage.getItem("orgId") || "1",
                    "X-Facility-Id": localStorage.getItem("facilityId") || "1",
                    "X-Role": localStorage.getItem("role") || "provider",
                },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                alert("Patient updated successfully");
                router.push("/dashboard/patients");
            } else {
                const error = await res.json();
                alert("Update failed: " + error.message);
            }
        } catch (err) {
            console.error("Update error:", err);
        }
    };

    if (loading) return <div className="p-6 text-white">Loading...</div>;

    return (
        <div className="p-6 text-white max-w-xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Edit Patient</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold mb-1">Full Name</label>
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded border bg-white text-black"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Birth Date</label>
                    <input
                        name="birthDate"
                        value={form.birthDate}
                        onChange={handleChange}
                        type="date"
                        className="w-full px-3 py-2 rounded border bg-white text-black"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow"
                >
                    Save
                </button>
            </form>
        </div>
    );
}
