"use client";

export default function RevenueByService() {
    return (
        <div
            style={{
                backgroundColor: "#f3e5f5",
                color: "#1a1a1a",
                padding: "16px",
                borderRadius: "16px",
                minHeight: "100px",
            }}
        >
            <h4 style={{ fontWeight: "bold", fontSize: "14px" }}>
                Revenue by Service <span style={{ color: "#9c27b0" }}>•</span>
            </h4>
            <p style={{ fontSize: "12px", color: "#555", marginTop: "8px" }}>
                No service revenue data available
            </p>
        </div>
    );
}
