import React, { useState } from "react";
import { PatientIntakeForm } from "./patient-intake-form";
import { BookAppointment } from "./book-appointment";
import { Doctor, Patient } from "@prisma/client";

export const MultiStepAppointmentBooking = ({ patient, doctors }: { patient: Patient, doctors: Doctor[] }) => {
  const [step, setStep] = useState(1);
  const [intakeData, setIntakeData] = useState<any>(null);

  const handleIntakeNext = (data: any) => {
    setIntakeData(data);
    setStep(2);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white/90 rounded-2xl shadow-2xl border border-emerald-100 p-0 sm:p-4 animate-fadeInUp">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 py-4">
        <div className={`flex items-center gap-2 ${step === 1 ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-emerald-400 bg-white">1</span>
          <span>Patient Intake</span>
        </div>
        <span className="w-8 h-0.5 bg-emerald-100 rounded-full" />
        <div className={`flex items-center gap-2 ${step === 2 ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-emerald-400 bg-white">2</span>
          <span>Book Appointment</span>
        </div>
      </div>
      {/* Step Content */}
      {step === 1 && <PatientIntakeForm onNext={handleIntakeNext} />}
      {step === 2 && <BookAppointment data={patient} doctors={doctors} />}
    </div>
  );
}; 