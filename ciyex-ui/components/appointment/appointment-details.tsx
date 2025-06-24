import { format } from "date-fns";
import { SmallCard } from "../small-card";
import { Card } from "../ui/card";
import { Calendar, Clock, Hash, StickyNote } from "lucide-react";

interface AppointmentDetailsProps {
  id: number | string;
  patient_id: string;
  appointment_date: Date;
  time: string;
  notes?: string;
}

export const AppointmentDetails = ({
  id,
  patient_id,
  appointment_date,
  time,
  notes,
}: AppointmentDetailsProps) => {
  return (
    <Card className="bg-card rounded-2xl shadow border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <StickyNote className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Appointment Information</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <SmallCard label="Appointment #" value={`# ${id}`} icon={<Hash className="w-4 h-4 text-primary" />} />
        <SmallCard label="Date" value={format(appointment_date, "MMM d, yyyy")}
          icon={<Calendar className="w-4 h-4 text-primary" />} />
        <SmallCard label="Time" value={time} icon={<Clock className="w-4 h-4 text-primary" />} />
      </div>
      <div>
        <span className="text-sm font-medium text-muted-foreground">Additional Notes</span>
        <p className="text-sm text-foreground mt-1">{notes || <span className="italic text-muted-foreground">No notes</span>}</p>
      </div>
    </Card>
  );
};