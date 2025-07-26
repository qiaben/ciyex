"use client";

import { Users, CalendarDays, Stethoscope, DollarSign } from "lucide-react";
import { CSSProperties } from "react";
import Link from "next/link";

interface SummaryCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
    background: string;
    href?: string;
}

function SummaryCard({
                         title,
                         value,
                         description,
                         icon,
                         background,
                         href,
                     }: SummaryCardProps) {
    const cardStyle: CSSProperties = {
        backgroundColor: background,
        color: "#000",
        borderRadius: "16px",
        padding: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "300px",
        height: "160px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        transition: "transform 0.6s ease",
        transformStyle: "preserve-3d",
        cursor: href ? "pointer" : "default",
    };

    const cardContent = (
        <div
            style={cardStyle}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "rotateY(180deg)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "rotateY(0deg)";
            }}
        >
            <div>
                <div style={{ fontWeight: "bold", fontSize: "18px" }}>{title}</div>
                <div style={{ fontSize: "32px", fontWeight: 700, margin: "6px 0" }}>{value}</div>
                <div style={{ fontSize: "14px", color: "#444" }}>{description}</div>
            </div>
            <div style={{ fontSize: "32px" }}>{icon}</div>
        </div>
    );

    return href ? <Link href={href}>{cardContent}</Link> : cardContent;
}

export default function SummaryCards() {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "24px",
                justifyContent: "start",
                alignItems: "start",
            }}
        >
            <SummaryCard
                title="Patients"
                value="2"
                description="Total patients"
                icon={<Users color="#3b82f6" />}
                background="#e0efff"
                href="/doctor/patients"
            />
            <SummaryCard
                title="Appointments"
                value="0"
                description="Successful appointments"
                icon={<CalendarDays color="#facc15" />}
                background="#fff9cc"
                href="/doctor/appointments" // ✅ Updated to match your folder
            />
            <SummaryCard
                title="Consultation"
                value="0"
                description="Total consultation"
                icon={<Stethoscope color="#10b981" />}
                background="#e8fff0"
                href="/doctor/consultations"
            />
            <SummaryCard
                title="Revenue"
                value="$0.00"
                description="0 services"
                icon={<DollarSign color="#fb923c" />}
                background="#fff0db"
                href="/doctor/revenue"
            />
        </div>
    );
}
