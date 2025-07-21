"use client";

import { useUserRole } from "@/app/hooks/useUserRole";
import RoleDashboard from "@/app/components/dashboard/role/RoleDashboard";

export default function DashboardPage() {
    const role = useUserRole();

    if (role === null) {
        return <div>Loading...</div>;
    }

    return <RoleDashboard role={role} />;
}
