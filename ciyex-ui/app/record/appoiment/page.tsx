import React from "react";

export default function AppointmentConfirmation() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0f2fe]">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#10b981]">Booking Done!</h1>
      <p className="text-lg text-gray-700 mb-6">Your appointment has been successfully booked.</p>
      <a href="/" className="px-6 py-3 bg-[#10b981] text-white rounded-full font-semibold shadow hover:bg-[#0e9e6e] transition">Go to Home</a>
    </div>
  );
} 