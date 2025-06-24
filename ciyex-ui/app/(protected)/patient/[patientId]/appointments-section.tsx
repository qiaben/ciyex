"use client";

import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ViewAppointmentClient } from "../../../../components/view-appointment-client";
import { format } from "date-fns";

interface AppointmentsSectionProps {
  patientId: string;
}

// Helper to combine date and time
const getAppointmentDateTime = (dateStr: string, timeStr: string): Date | null => {
  if (!dateStr || !timeStr) return null;
  // Combine into ISO string
  const isoString = `${dateStr}T${timeStr.length === 5 ? timeStr + ':00' : timeStr}`;
  return new Date(isoString);
};

export default function AppointmentsSection({ patientId }: AppointmentsSectionProps) {
  const { user } = useUser();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isPatient = user?.id === patientId;

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`/api/appointments?patientId=${patientId}`);
        const data = await response.json();
        if (data.success) {
          setAppointments(data.data);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [patientId]);

  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.split(" ");
    return parts.map((n) => n[0]).join("").toUpperCase();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : appointments.length > 0 ? (
          <>
            <div className="space-y-4">
              {appointments.slice(0, 5).map((appointment) => {
                const doctor = appointment.doctor || {};
                const isCompleted = appointment.status === "COMPLETED";
                const appointmentDateTime = getAppointmentDateTime(appointment.appointment_date, appointment.time);
                return (
                  <div
                    key={appointment.id}
                    className={`rounded-xl border p-4 flex items-center gap-4 ${isCompleted ? "bg-green-50" : "bg-blue-50"}`}
                  >
                    {/* Profile Pic or Initials */}
                    {doctor.img ? (
                      <img src={doctor.img} alt={doctor.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-200 flex items-center justify-center text-xl font-bold text-emerald-800">
                        {getInitials(doctor.name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-lg truncate">Dr. {doctor.name}</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${
                          appointment.status === "SCHEDULED"
                            ? "bg-blue-100 text-blue-700"
                            : appointment.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {appointment.status.charAt(0) + appointment.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <div className="text-sm text-emerald-700 truncate">{doctor.specialty || "General"}</div>
                      <div className="text-gray-600 truncate">{appointment.reason}</div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span>📅 {appointment.appointment_date ? format(new Date(appointment.appointment_date), 'PPP') : '-'}</span>
                        <span>⏰ {appointmentDateTime && !isNaN(appointmentDateTime.getTime())
                          ? format(appointmentDateTime, 'p')
                          : '-'}</span>
                      </div>
                    </div>
                    <div className="ml-auto flex flex-col gap-2">
                      {isPatient && appointment.status === "SCHEDULED" && (
                        <></>
                      )}
                      {((isPatient && appointment.status === "COMPLETED") || !isPatient) && (
                        <ViewAppointmentClient id={appointment.id} buttonClassName="font-semibold" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {isPatient && appointments.length > 5 && (
              <div className="flex justify-center mt-4">
                <Button onClick={() => window.location.href = "/record/appointments"} variant="outline" className="font-semibold">
                  View More
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No appointments found
          </div>
        )}
      </CardContent>
    </Card>
  );
} 