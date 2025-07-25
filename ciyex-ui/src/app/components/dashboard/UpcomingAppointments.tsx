"use client";

import { CalendarDays } from "lucide-react";

export default function UpcomingAppointments() {
    // TODO: Replace with real data check
    const hasFutureAppointments = false;

    return (
        <div className="bg-neutral-900 text-white rounded-xl p-6 min-h-[200px] flex flex-col justify-center items-center shadow">
            <CalendarDays className="w-10 h-10 text-blue-500 mb-4" />
            <p className="text-center text-gray-400 font-medium text-md">
                {hasFutureAppointments ? "You have upcoming appointments." : "No appointments for 2025"}
            </p>
        </div>
    );
}
