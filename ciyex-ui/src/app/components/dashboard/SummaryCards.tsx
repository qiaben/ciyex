"use client";

import Link from "next/link";
import { Users, CalendarDays, Stethoscope, DollarSign } from "lucide-react";
import "./cardFlip.css"; // 🔁 custom CSS below

const cards = [
    {
        title: "Patients",
        value: "0",
        description: "Total patients",
        icon: <Users className="text-blue-600" size={32} />,
        href: "/doctor/patients",
        bg: "bg-blue-100",
    },
    {
        title: "Appointments",
        value: "0",
        description: "Successful appointments",
        icon: <CalendarDays className="text-yellow-500" size={32} />,
        href: "/doctor/appointments",
        bg: "bg-yellow-100",
    },
    {
        title: "Consultation",
        value: "0",
        description: "Total consultation",
        icon: <Stethoscope className="text-green-600" size={32} />,
        href: "/doctor/consultations",
        bg: "bg-green-100",
    },
    {
        title: "Revenue",
        value: "$0.00",
        description: "0 services",
        icon: <DollarSign className="text-orange-500" size={32} />,
        href: "/doctor/revenue",
        bg: "bg-orange-100",
    },
];

export default function SummaryCards() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cards.map((card, index) => (
                <Link href={card.href} key={index}>
                    <div className="flip-card cursor-pointer">
                        <div className={`flip-card-inner ${card.bg}`}>
                            <div className="flip-card-front rounded-xl p-6 shadow-md">
                                <div className="flex justify-between items-center text-lg font-semibold text-gray-800">
                                    <span>{card.title}</span>
                                    <span>{card.icon}</span>
                                </div>
                                <div className="mt-4">
                                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                                    <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                                </div>
                            </div>
                            <div className="flip-card-back rounded-xl p-6 shadow-md text-center flex flex-col justify-center text-gray-800">
                                <p className="text-lg font-semibold">Click to view {card.title.toLowerCase()}</p>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
