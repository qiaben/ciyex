import { Diagnosis, Doctor } from "@prisma/client";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { FileText } from "lucide-react";

interface ExtendedMedicalRecord extends Diagnosis {
  doctor: Doctor;
}
export const MedicalHistoryCard = ({
  record,
  index,
}: {
  record: ExtendedMedicalRecord;
  index: number;
}) => {
  return (
    <Card className="bg-card rounded-2xl shadow border border-border p-6">
      <div className="space-y-6 pt-2">
        <div className="flex gap-x-6 justify-between items-center mb-2">
          <div>
            <span className="text-xs text-muted-foreground">Appointment ID</span>
            <p className="text-xl font-bold text-foreground"># {record.id}</p>
          </div>
          {index === 0 && (
            <div className="px-4 h-8 flex items-center bg-primary/10 rounded-full font-semibold text-primary border border-primary">
              <span>Recent</span>
            </div>
          )}
          <div>
            <span className="text-xs text-muted-foreground">Date</span>
            <p className="text-xl font-medium text-foreground">
              {record.created_at.toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Diagnosis Details</h3>
        </div>
        <Separator />
        <div>
          <span className="text-xs text-muted-foreground">Diagnosis</span>
          <p className="text-lg text-foreground font-semibold">{record.diagnosis}</p>
        </div>
        <Separator />
        <div>
          <span className="text-xs text-muted-foreground">Symptoms</span>
          <p className="text-lg text-foreground">{record.symptoms}</p>
        </div>
        <Separator />
        <div>
          <span className="text-xs text-muted-foreground">Additional Note</span>
          <p className="text-lg text-foreground">{record.notes}</p>
        </div>
        <Separator />
        <div>
          <span className="text-xs text-muted-foreground">Doctor</span>
          <div>
            <p className="text-lg text-foreground font-semibold">
              {record.doctor.name}
            </p>
            <span className="text-sm text-muted-foreground">{record.doctor.specialization}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};