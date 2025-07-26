"use client";

import { CalendarDays } from "lucide-react";

export default function UpcomingAppointments() {
    const hasFutureAppointments = false;

    return (
        <div
            className="rounded-xl shadow transition-transform duration-500 hover:scale-[1.02]"
            style={{
                backgroundColor: "#e0f7ff",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "200px",
                color: "#1e293b",
            }}
        >
            <CalendarDays className="w-10 h-10 text-blue-600 mb-4" />
            <p className="text-center font-medium text-md">
                {hasFutureAppointments
                    ? "You have upcoming appointments."
                    : "No appointments for 2025"}
            </p>
        </div>
    );
}
