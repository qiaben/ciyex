"use client";

import Link from "next/link";

export default function RecentAppointments() {
    // TODO: Replace with fetched data
    const appointments: any[] = [];

    return (
        <div className="bg-neutral-900 text-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Recent Appointments</h3>
                <Link href="/doctor/appointments" className="text-sm text-blue-500 hover:underline">
                    View All →
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-800 text-gray-300">
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
                            <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                                No Data Found
                            </td>
                        </tr>
                    ) : (
                        appointments.map((appt, i) => (
                            <tr key={i} className="border-b border-neutral-800">
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
