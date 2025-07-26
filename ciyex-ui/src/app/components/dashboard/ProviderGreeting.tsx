"use client";

export default function ProviderGreeting() {
    return (
        <div style={{ marginBottom: "12px" }}>
            <div style={{ fontWeight: 600, fontSize: "14px", color: "#" +
                    "000000" }}>
                PROVIDER / DOCTOR
            </div>

            <div
                style={{
                    backgroundColor: "#dcedc8",
                    color: "#1a1a1a",
                    borderRadius: "16px",
                    padding: "24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div>
                    <h2 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
                        Good Morning, DOCTOR
                    </h2>
                    <p style={{ marginTop: "8px", fontSize: "14px" }}>
                        Here's your dashboard. Wishing you a productive day!
                    </p>
                </div>
                <button
                    style={{
                        background: "white",
                        color: "#388e3c",
                        border: "1px solid #388e3c",
                        borderRadius: "8px",
                        padding: "10px 20px",
                        fontWeight: 500,
                        cursor: "pointer",
                    }}
                >
                    View Profile
                </button>
            </div>
        </div>
    );
}
