import { Diagnosis, LabTest, MedicalRecords, Patient } from "@prisma/client";
import { BriefcaseBusiness, FileText, AlertCircle } from "lucide-react";
import React from "react";
import { Table } from "./tables/table";
import { ProfileImage } from "./profile-image";
import { formatDateTime } from "@/utils";
import { ViewAction } from "./action-options";
import { MedicalHistoryDialog } from "./medical-history-dialog";

// Update the Diagnosis type to include doctor
type DiagnosisWithDoctor = Diagnosis & { doctor?: { name?: string } };

export interface ExtendedMedicalHistory extends MedicalRecords {
  patient?: Patient;
  diagnosis: DiagnosisWithDoctor[];
  lab_test: LabTest[];
  index?: number;
}

interface DataProps {
  data: ExtendedMedicalHistory[];
  isShowProfile?: boolean;
}

export const MedicalHistory = ({ data, isShowProfile }: DataProps) => {
  const columns = [
    { header: "No", key: "no" },
    { header: "Info", key: "name", className: isShowProfile ? "table-cell" : "hidden" },
    { header: "Date & Time", key: "medical_date", className: "" },
    { header: "Doctor", key: "doctor", className: "hidden xl:table-cell" },
    { header: "Diagnosis", key: "diagnosis", className: "hidden md:table-cell" },
    { header: "Lab Test", key: "lab_test", className: "hidden 2xl:table-cell" },
    { header: "Action", key: "action" },
  ];

  const renderRow = (item: ExtendedMedicalHistory) => (
    <tr key={item.id} className="border-b border-border even:bg-muted/50 text-sm hover:bg-muted/70">
      <td className="py-4 px-3 font-mono align-middle">{item?.id}</td>
      {isShowProfile && (
        <td className="flex items-center gap-2 2xl:gap-4 py-4 px-3 align-middle">
          <ProfileImage
            url={item?.patient?.img!}
            name={item?.patient?.first_name + " " + item?.patient?.last_name}
          />
          <div>
            <h3 className="font-semibold text-foreground">{item?.patient?.first_name + " " + item?.patient?.last_name}</h3>
            <span className="text-xs capitalize hidden md:flex text-muted-foreground">{item?.patient?.gender.toLowerCase()}</span>
          </div>
        </td>
      )}
      <td className="text-muted-foreground py-4 px-3 align-middle">{formatDateTime(item?.created_at.toString())}</td>
      <td className="hidden items-center py-4 px-3 xl:table-cell text-foreground align-middle">{item?.diagnosis?.[0]?.doctor?.name || item?.doctor_id}</td>
      <td className="hidden lg:table-cell py-4 px-3 align-middle">
        {item?.diagnosis?.length === 0 ? (
          <span className="text-sm italic text-muted-foreground flex items-center gap-1"><AlertCircle className="w-4 h-4" /> No diagnosis</span>
        ) : (
          <MedicalHistoryDialog
            id={item?.appointment_id}
            patientId={item?.patient_id}
            doctor_id={item?.doctor_id}
            label={<span>{item?.diagnosis?.length} Found</span>}
          />
        )}
      </td>
      <td className="hidden 2xl:table-cell py-4 px-3 align-middle">
        {item?.lab_test?.length === 0 ? (
          <span className="text-sm italic text-muted-foreground flex items-center gap-1"><AlertCircle className="w-4 h-4" /> No lab test</span>
        ) : (
          <div className="flex gap-x-2 items-center text-lg">
            {item?.lab_test?.length}
            <span className="text-sm">Found</span>
          </div>
        )}
      </td>
      <td className="py-4 px-3 align-middle text-right">
        <ViewAction href={`/record/appointments/${item?.appointment_id}`} />
      </td>
    </tr>
  );

  return (
    <div className="w-full">
      <Table columns={columns} renderRow={renderRow} data={data} />
      {data?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
          <span className="text-muted-foreground text-lg font-semibold">No medical history found.</span>
        </div>
      )}
    </div>
  );
};