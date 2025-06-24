import { Patient } from "@prisma/client";
import { Card } from "../ui/card";
import Image from "next/image";
import { calculateAge } from "@/utils";
import { Calendar, Home, Info, Mail, Phone, Users, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) => (
  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/60 w-full">
    <span className="text-primary">{icon}</span>
    <div>
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="text-base text-foreground break-all">{value || <span className='italic text-muted-foreground flex items-center gap-1'><AlertCircle className='w-4 h-4' />Not provided</span>}</div>
    </div>
  </div>
);

export const PatientDetailsCard = ({ data }: { data: Patient }) => {
  return (
    <Card className="bg-card rounded-2xl shadow border border-border p-6 flex flex-col items-center">
      <div className="relative w-24 h-24 mb-4">
        <Image
          src={data.img || "/user.jpg"}
          alt={data?.first_name}
          fill
          className="rounded-full border-4 border-primary/30 shadow"
        />
      </div>
      <h2 className="text-xl font-bold text-foreground text-center mb-1">
        {data?.first_name} {data?.last_name}
      </h2>
      <div className="flex gap-2 mb-4">
        <span className="px-3 py-1 rounded-full bg-muted text-xs font-semibold text-primary flex items-center gap-1">
          <Users className="w-4 h-4" /> {data.gender}
        </span>
        <span className="px-3 py-1 rounded-full bg-muted text-xs font-semibold text-primary flex items-center gap-1">
          <Calendar className="w-4 h-4" /> {calculateAge(data.date_of_birth)} yrs
        </span>
      </div>
      <div className="w-full grid grid-cols-1 gap-3 mt-2">
        <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={data.email} />
        <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={data.phone} />
        <InfoRow icon={<Home className="w-4 h-4" />} label="Address" value={data.address} />
        <InfoRow icon={<Info className="w-4 h-4" />} label="Physician" value={"Dr Codewave, MBBS, FCPS"} />
        <InfoRow icon={<Info className="w-4 h-4" />} label="Active Conditions" value={data.medical_conditions} />
        <InfoRow icon={<Info className="w-4 h-4" />} label="Allergies" value={data.allergies} />
      </div>
    </Card>
  );
};