import { getAppointmentById } from "@/utils/services/appointment";
import React from "react";
import { getCurrentUserFromToken } from "@/app/utils/auth";
import { checkRole } from "@/utils/roles";
import { ViewAppointmentClient } from "./ViewAppointmentClient";

interface ViewAppointmentProps {
    id: string | undefined;
    buttonClassName?: string;
}

export async function ViewAppointment({ id, buttonClassName }: ViewAppointmentProps) {
    const { data } = await getAppointmentById(Number(id!));

    const user = await getCurrentUserFromToken();

    const userId = user?.userId ? String(user.userId) : "";

    // Ensure roles is a string array
    const roles: string[] = Array.isArray(user?.roles) ? user.roles : [];

    // Ensure isAdmin is always boolean
    const isAdmin = checkRole("ADMIN", roles);

    return (
        <ViewAppointmentClient
            data={data}
            userId={userId}
            isAdmin={!!isAdmin} // ensure strict boolean
            buttonClassName={buttonClassName}
        />
    );
}
