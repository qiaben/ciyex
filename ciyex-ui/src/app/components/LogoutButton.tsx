"use client";
import React from "react";

export default function LogoutButton() {
    const handleLogout = () => {
        localStorage.removeItem('token'); // ONLY removes JWT/token
        window.location.href = '/sign-in'; // or use router.push('/sign-in')
    };
    return (
        <button onClick={handleLogout} className="text-red-600 font-semibold">
            Log Out
        </button>
    );
}
