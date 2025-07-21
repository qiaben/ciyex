// app/dashboard/page.tsx (or pages/dashboard/index.tsx)
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RoleDashboard from "@/components/dashboard/role/RoleDashboard";
import { useUserRole } from "@/hooks/useUserRole";

export default function DashboardPage() {
    const role = useUserRole();

    if (role === null) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <DashboardLayout>
            <RoleDashboard role={role} />
        </DashboardLayout>
    );
}
