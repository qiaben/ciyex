"use client";

import Link from "next/link";

export default function RecentPatients() {
    return (
        <div
            style={{
                backgroundColor: "#fde7ef", // mild pink
                color: "#1a1a1a",
                padding: "16px",
                borderRadius: "16px",
                minHeight: "100px",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ fontWeight: "bold", fontSize: "14px" }}>Recent Patients</h4>

                {/* Link component for routing */}
                <Link href="/doctor/patients">
                    <span style={{
                        color: "#ec407a",
                        fontSize: "12px",
                        cursor: "pointer",
                        textDecoration: "none"
                    }}>
                        View All
                    </span>
                </Link>
            </div>

            <p style={{ fontSize: "12px", color: "#555", marginTop: "8px" }}>
                No appointment yet
            </p>
        </div>
    );
}
