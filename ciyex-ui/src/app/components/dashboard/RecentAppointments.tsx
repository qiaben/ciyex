"use client";

import Link from "next/link";

// @ts-ignore
export default function RecentAppointments() {
    const appointments: any[] = [];

    return (
        <div
            className="rounded-xl shadow transition-transform duration-500 hover:scale-[1.02]"
            style={{ backgroundColor: "#e4d9ed", padding: "20px" }}
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Recent Appointments</h3>
                <Link href="/doctor/appointments" className="text-sm text-blue-600 hover:underline">
                    View All →
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-300 text-gray-700 rounded">
                    <tr>
                        <th className="py-2 px-4">Info</th>
                        <th className="py-2 px-4">Date</th>
                        <th className="py-2 px-4">Time</th>
                        <th className="py-2 px-4">Doctor</th>
                        <th className="py-2 px-4">Status</th>
                        <th className="py-2 px-4">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {appointments.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="py-4 px-4 text-center text-gray-600">
                                No Data Found
                            </td>
                        </tr>
                    ) : (
                        appointments.map((appt, i) => (
                            <tr key={i} className="border-b border-gray-300">
                                <td className="py-2 px-4">{appt.info}</td>
                                <td className="py-2 px-4">{appt.date}</td>
                                <td className="py-2 px-4">{appt.time}</td>
                                <td className="py-2 px-4">{appt.doctor}</td>
                                <td className="py-2 px-4">{appt.status}</td>
                                <td className="py-2 px-4">View</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
