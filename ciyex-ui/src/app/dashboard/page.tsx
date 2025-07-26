"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboard from "@/components/dashboard/role/RoleDashboard";

export default function DashboardPage() {
    const [role, setRole] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("role");
        if (!token || !userRole) {
            router.replace("/sign-in");
        } else {
            setRole(userRole);
        }
    }, [router]);

    if (role === null) {
        return <div className="p-6 text-lg">Loading dashboard...</div>;
    }

    return <RoleDashboard role={role} />;
}
