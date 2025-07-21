"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDashboard from "@/components/dashboard/role/RoleDashboard";

export default function DashboardPage() {
    const [role, setRole] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Try to load role from localStorage
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("role");
        if (!token || !userRole) {
            // If not logged in, redirect to sign-in
            router.replace("/sign-in");
        } else {
            setRole(userRole);
        }
    }, [router]);

    if (role === null) {
        return <div>Loading...</div>;
    }

    return <RoleDashboard role={role} />;
}
