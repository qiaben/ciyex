import { auth } from "@clerk/nextjs/server";
import { getPatientFullDataById } from "@/utils/services/patient";
import { format } from "date-fns";
import { Calendar, User, CheckCircle, AlertCircle } from "lucide-react";

interface MedicalHistoryWrapperProps {
  patientId: string;
}

export const MedicalHistoryWrapper = async ({ patientId }: MedicalHistoryWrapperProps) => {
  const { userId } = await auth();
  const result = await getPatientFullDataById(patientId);
  if (!result.success) {
    return <div className="text-destructive">Error loading medical history.</div>;
  }
  const { data } = result as { success: true; data: any };

  return (
    <div className="bg-card rounded-2xl border border-border shadow p-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Medical History</h2>
      </div>
      <div className="grid gap-4">
        {data?.appointments?.length > 0 ? (
          data?.appointments?.map((appointment: any, index: number) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-muted/60 border border-border shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium text-foreground">
                    Appointment on {format(new Date(appointment.appointment_date), "MMMM dd, yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.notes || "No notes available"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 min-w-[120px]">
                <span className="flex items-center gap-1 text-sm font-medium text-primary">
                  {appointment.status === "Completed" ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-yellow-500" />}
                  {appointment.status || "Completed"}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="w-4 h-4" />
                  {appointment.doctor_name || "Dr. Smith"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-muted-foreground text-lg font-semibold">No medical history found.</span>
          </div>
        )}
      </div>
    </div>
  );
}; 