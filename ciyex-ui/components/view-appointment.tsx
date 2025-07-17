import { getAppointmentById } from "@/utils/services/appointment";
import React from "react";
import { getCurrentUserFromToken } from "@/app/utils/auth";
import { checkRole } from "@/utils/roles"; // Import the updated checkRole
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

    // Check if the user is an Admin using the updated checkRole function
    const isAdmin = await checkRole("ADMIN"); // Now checkRole only takes the role

    return (
        <ViewAppointmentClient
            data={data}
            userId={userId}
            isAdmin={isAdmin} // Directly use the result from checkRole
            buttonClassName={buttonClassName}
        />
    );
}
