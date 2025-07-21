"use client";

import { useUserRole } from "@/hooks/useUserRole";
import RoleDashboard from "@/components/dashboard/role/RoleDashboard";

export default function DashboardPage() {
    const role = useUserRole();

    if (role === null) {
        return <div>Loading...</div>;
    }

    return <RoleDashboard role={role} />;
}
