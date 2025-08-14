"use client";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
//import { EyeIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import AdminLayout from "@/app/(admin)/layout";

interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    ssn?: string;
    dateOfBirth?: string;
    status: "Active" | "Pending" | "Inactive";
}

export default function PatientListPage() {
    const [data, setData] = useState<Patient[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch patients when the component mounts
    useEffect(() => {
        setIsClient(true);
        const fetchPatients = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch patient data from the backend API
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/patients`);
                const result = await res.json();

                if (result.success && Array.isArray(result.data)) {
                    setData(result.data); // Update state with the fetched data
                } else {
                    setError("Failed to fetch patients. Please try again.");
                    console.error("❌ Failed to fetch patients:", result.message);
                }
            } catch (err) {
                setError("An error occurred while fetching patients.");
                console.error("❌ Error fetching patients:", err);
            } finally {
                setLoading(false);  // Reset loading state
            }
        };

        if (isClient) {
            fetchPatients();  // Trigger the fetch when the component is mounted
        }
    }, [isClient]);

    // Filter the patients based on search and status filter
    const filtered = data.filter((patient) => {
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        const matchesSearch = fullName.includes(search.toLowerCase());
        const matchesStatus = statusFilter ? patient.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    // Handle loading and error states
    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    return (
        <AdminLayout>
            <div className="flex-1 p-6 bg-[#f9fafb] flex justify-center">
                <div className="w-full max-w-7xl">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">Patients</h1>
                        <Link href="/patients/add">
                            <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                                Add New Patient
                            </button>
                        </Link>
                    </div>

                    {/* Filter controls */}
                    <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                        <input
                            type="text"
                            placeholder="Search patients..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border rounded px-3 py-2 w-full sm:w-72 text-sm"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border rounded px-3 py-2 text-sm"
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Pending">Pending</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Patient Table */}
                    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                        <div className="min-w-full">
                            <Table>
                                {/* Table Header */}
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-start text-sm">
                                            Full Name
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-start text-sm">
                                            Home Phone
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-start text-sm">
                                            SSN
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-start text-sm">
                                            Date of Birth
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-start text-sm">
                                            Status
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-start text-sm">
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>

                                {/* Table Body */}
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <td colSpan={6} className="text-center text-gray-400 py-6">
                                                No patients found.
                                            </td>
                                        </TableRow>
                                    ) : (
                                        filtered.map((patient) => (
                                            <TableRow key={patient.id}>
                                                <TableCell className="px-4 py-4 sm:px-5 text-start">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-10 h-10 overflow-hidden rounded-full flex items-center justify-center text-sm font-bold uppercase text-white"
                                                            style={{ backgroundColor: getColorFromName(`${patient.firstName} ${patient.lastName}`) }}
                                                        >
                                                            {getInitials(`${patient.firstName} ${patient.lastName}`)}
                                                        </div>
                                                        <div>
                                                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                                {patient.firstName} {patient.lastName}
                                                            </span>
                                                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                                                {patient.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-4 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    {patient.phoneNumber || "N/A"}
                                                </TableCell>
                                                <TableCell className="px-4 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    {patient.ssn || "N/A"}
                                                </TableCell>
                                                <TableCell className="px-4 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    {patient.dateOfBirth || "N/A"}
                                                </TableCell>
                                                <TableCell className="px-4 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    <Badge
                                                        size="sm"
                                                        color={patient.status === "Active" ? "success" : patient.status === "Pending" ? "warning" : "error"}
                                                    >
                                                        {patient.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-4 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
{/*                                                     <*/div className="flex gap-4">
                                                        <Link href={`/patients/${patient.id}`}>
                                                            <EyeIcon className="w-4 h-4 text-blue-500 cursor-pointer" />
                                                        </Link>
                                                        <Link href={`/patients/${patient.id}/edit`}>
                                                            <PencilIcon className="w-4 h-4 text-green-500 cursor-pointer" />
                                                        </Link>
                                                    </div> */}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

// Helper function to get initials from the full name
function getInitials(name: string) {
    const words = name.trim().split(" ");
    return words.slice(0, 2).map((w) => w[0]).join("");
}

// Helper function to generate color based on name
function getColorFromName(name: string): string {
    const colors = [
        "#10B981", "#6366F1", "#F59E0B", "#EF4444", "#3B82F6",
        "#8B5CF6", "#EC4899", "#22C55E", "#F97316", "#0EA5E9"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash % colors.length)];
}
