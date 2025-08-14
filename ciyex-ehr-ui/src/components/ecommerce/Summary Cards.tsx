"use client";
import React, { useEffect, useState } from "react"; 
import Link from "next/link"; 
import Badge from "../ui/badge/Badge"; 
// Commented out lucide-react imports
// import { ArrowDownIcon, ArrowUpIcon } from "@/icons"; 
// import { Users, CalendarDays, Stethoscope, DollarSign } from "lucide-react"; 
import { fetchWithAuth } from "@/utils/fetchWithAuth"; 

export const SummaryCards = () => {
    const [patientCount, setPatientCount] = useState<number | null>(null);

    useEffect(() => {
        const getPatientCount = async () => {
            try {
                const res = await fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/patients/count`
                );

                // Check if response is ok
                if (!res.ok) {
                    throw new Error('Failed to fetch data');
                }

                const result = await res.json();
                console.log("📊 Patient count response:", result);

                if (result.success) {
                    setPatientCount(result.data);
                } else {
                    console.error("❌ Failed to fetch patient count:", result.message);
                }
            } catch (err) {
                console.error("❌ Error fetching patient count:", err);
            }
        };

        getPatientCount();
    }, []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Commented out MetricCard with icons */}
            <MetricCard
                icon={<div className="w-6 h-6 bg-gray-200 rounded-full" />} // Placeholder icon
                label="Patients"
                value={patientCount !== null ? String(patientCount) : "Loading..."} // fallback text
                badgeColor="success"
                badgeText="11.01%" // You can update this dynamically later
                badgeIcon={<div className="w-3 h-3 bg-green-400 rounded-full" />} // Placeholder badge icon
                href="/patients"
            />

            <MetricCard
                icon={<div className="w-6 h-6 bg-gray-200 rounded-full" />} // Placeholder icon
                label="Appointments"
                value="0"
                badgeColor="error"
                badgeText="9.05%"
                badgeIcon={<div className="w-3 h-3 bg-red-400 rounded-full" />} // Placeholder badge icon
                href="/appointments"
            />

            <MetricCard
                icon={<div className="w-6 h-6 bg-gray-200 rounded-full" />} // Placeholder icon
                label="Consultations"
                value="0"
                badgeColor="success"
                badgeText="2.3%"
                badgeIcon={<div className="w-3 h-3 bg-green-400 rounded-full" />} // Placeholder badge icon
                href="/consultations"
            />

            <MetricCard
                icon={<div className="w-6 h-6 bg-gray-200 rounded-full" />} // Placeholder icon
                label="Revenue"
                value="0"
                badgeColor="success"
                badgeText="6.75%"
                badgeIcon={<div className="w-3 h-3 bg-green-400 rounded-full" />} // Placeholder badge icon
                href="/revenue"
            />
        </div>
    );
};

interface MetricCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    badgeColor: "success" | "error";
    badgeText: string;
    badgeIcon: React.ReactNode;
    href: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
    icon,
    label,
    value,
    badgeColor,
    badgeText,
    badgeIcon,
    href,
}) => {
    return (
        <Link href={href}>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03] md:p-6 cursor-pointer">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    {icon}
                </div>

                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {label}
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {value}
                        </h4>
                    </div>
                    <Badge color={badgeColor}>
                        {badgeIcon}
                        {badgeText}
                    </Badge>
                </div>
            </div>
        </Link>
    );
};
