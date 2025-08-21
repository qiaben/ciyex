"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import AdminLayout from "@/app/(admin)/layout";

interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    ssn: string;
    dateOfBirth: string;
    status: "Active" | "Pending" | "Inactive";
}

export default function PatientDashboardPage() {
    const params = useParams();
    const id = params?.id ?? "";
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("Patient ID is missing.");
            setLoading(false);
            return;
        }

        const fetchPatientDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${id}`);
                const result = await res.json();
                if (result.success) {
                    setPatient(result.data);
                } else {
                    setError(result.message || "Failed to fetch patient details.");
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError("An error occurred while fetching patient details.");
            } finally {
                setLoading(false);
            }
        };

        fetchPatientDetails();
    }, [id]);

    if (loading) return <div className="p-6">Loading patient data...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!patient) return <div className="p-6">No patient data found.</div>;

    // Safely format SSN
    const formatSSN = (ssn?: string) => {
        if (!ssn) return "Not available";
        if (ssn.length < 4) return ssn; // If SSN is too short, show as-is
        return `•••-••-${ssn.slice(-4)}`;
    };

    // Safely format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return "Not available";
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString; // Return raw string if date parsing fails
        }
    };

    return (
        <AdminLayout>
            <div className="p-6 bg-[#f9fafb]">
                <h1 className="text-2xl font-bold mb-6">Patient Dashboard</h1>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold border-b pb-2">Personal Information</h2>
                            <div>
                                <p className="text-sm text-gray-500">Full Name</p>
                                <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{patient.email || "Not available"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone Number</p>
                                <p className="font-medium">{patient.phoneNumber || "Not available"}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold border-b pb-2">Additional Details</h2>
                            <div>
                                <p className="text-sm text-gray-500">Date of Birth</p>
                                <p className="font-medium">{formatDate(patient.dateOfBirth)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">SSN</p>
                                <p className="font-medium">{formatSSN(patient.ssn)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    patient.status === "Active" ? "bg-green-100 text-green-800" :
                                        patient.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                            "bg-red-100 text-red-800"
                                }`}>
                                    {patient.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}