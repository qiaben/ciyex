"use client";

import { CalendarDays, UserCheck, Users } from "lucide-react";

export default function StatisticsOverview() {
    return (
        <div
            style={{
                background: "linear-gradient(to bottom right, #f9fbfd, #eef3f9)",
                borderRadius: "16px",
                padding: "24px",
                width: "100%",
                maxWidth: "400px",
                color: "#5e1717",
                boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
            }}
        >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>
                        Statistics Overview
                    </h3>
                    <p style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
                        Appointment and consultation summary
                    </p>
                </div>
                <div
                    style={{
                        background: "#ffffff",
                        padding: "8px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Users size={18} color="#1976d2" />
                </div>
            </div>

            {/* Stats Row */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    marginTop: "24px",
                }}
            >
                {/* Appointments */}
                <div style={{ textAlign: "center" }}>
                    <div
                        style={{
                            background: "#ffffff",
                            borderRadius: "12px",
                            padding: "8px",
                            display: "inline-block",
                        }}
                    >
                        <CalendarDays size={20} color="#0288d1" />
                    </div>
                    <p style={{ fontWeight: "bold", fontSize: "18px", color: "#0288d1", margin: "4px 0" }}>0</p>
                    <p style={{ fontSize: "13px", color: "#555" }}>Appointments</p>
                    <p style={{ fontSize: "12px", color: "#aaa" }}>0%</p>
                </div>

                {/* Donut-like ring for total */}
                <div style={{ textAlign: "center", position: "relative", marginTop: "-12px" }}>
                    <div
                        style={{
                            width: "80px",
                            height: "40px",
                            borderTop: "6px solid #cfd8dc",
                            borderLeft: "6px solid transparent",
                            borderRight: "6px solid transparent",
                            borderBottom: "none",
                            borderRadius: "80px 80px 0 0",
                            margin: "0 auto",
                        }}
                    />
                    <div style={{ fontWeight: "bold", fontSize: "20px", marginTop: "8px" }}>0</div>
                    <div style={{ fontSize: "13px", color: "#666" }}>Total</div>
                </div>

                {/* Consultations */}
                <div style={{ textAlign: "center" }}>
                    <div
                        style={{
                            background: "#ffffff",
                            borderRadius: "12px",
                            padding: "8px",
                            display: "inline-block",
                        }}
                    >
                        <UserCheck size={20} color="#673ab7" />
                    </div>
                    <p style={{ fontWeight: "bold", fontSize: "18px", color: "#673ab7", margin: "4px 0" }}>0</p>
                    <p style={{ fontSize: "13px", color: "#555" }}>Consultation</p>
                    <p style={{ fontSize: "12px", color: "#aaa" }}>0%</p>
                </div>
            </div>
        </div>
    );
}
