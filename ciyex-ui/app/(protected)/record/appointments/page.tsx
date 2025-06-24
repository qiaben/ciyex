import { AppointmentActionOptions } from "@/components/appointment-actions";
import { AppointmentStatusIndicator } from "@/components/appointment-status-indicator";
import { ProfileImage } from "@/components/profile-image";
import SearchInput from "@/components/search-input";
import { Table } from "@/components/tables/table";
import { ViewAppointment } from "@/components/view-appointment";
import { checkRole, getRole } from "@/utils/roles";
import { DATA_LIMIT } from "@/utils/seeting";
import { getPatientAppointments } from "@/utils/services/appointment";
import { auth } from "@clerk/nextjs/server";
import { Appointment, Doctor, Patient } from "@prisma/client";
import { format } from "date-fns"; 
import { BriefcaseBusiness } from "lucide-react";
import React from "react";
import { Pagination } from "@/components/pagination";
import { AppointmentContainer } from "@/components/appointment-container";
const columns = [
  {
    header: "Info",
    key: "name",
  },
  {
    header: "Date",
    key: "appointment_date",
    className: "hidden md:table-cell",
  },
  {
    header: "Time",
    key: "time",
    className: "hidden md:table-cell",
  },
  {
    header: "Doctor",
    key: "doctor",
    className: "hidden md:table-cell",
  },
  {
    header: "Mode",
    key: "mode",
    className: "hidden lg:table-cell",
  },
  {
    header: "Status",
    key: "status",
    className: "hidden xl:table-cell",
  },
  {
    header: "Actions",
    key: "action",
  },
];

const Appointments = async (props: {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const userRole = await getRole();
  const { userId } = await auth();
  const isPatient = await checkRole("PATIENT");

  const page = (searchParams?.p || "1") as string;
  const searchQuery = searchParams?.q || "";
  const id = searchParams?.id || undefined;

  let queryId = undefined;

  if (
    userRole == "admin" ||
    (userRole == "doctor" && id)
  ) {
    queryId = id;
  } else if (userRole === "doctor" || userRole === "patient") {
    queryId = userId;
  } 

  const { data, totalPages, totalRecord, currentPage } =
    await getPatientAppointments({
      page,
      search: searchQuery,
      id: queryId!,
    });

  if (!data) return null;

  const renderItem = (item: any, idx: number) => {
    const patient_name = `${item?.patient?.first_name} ${item?.patient?.last_name}`;
    return (
      <tr
        key={item?.id}
        className={`text-sm ${idx % 2 === 0 ? 'bg-card' : 'bg-muted/50'} border-b border-border hover:bg-muted/70 transition`}
      >
        <td className="flex items-center gap-3 py-2 px-4 border-r border-border">
          <ProfileImage
            url={item?.patient?.img!}
            name={patient_name}
            className="size-10"
          />
          <div>
            <div className="font-bold text-foreground uppercase">{patient_name}</div>
            <div className="text-xs text-muted-foreground">{item?.patient?.gender}</div>
          </div>
        </td>
        <td className="text-center font-mono text-muted-foreground border-r border-border">{format(item?.appointment_date, "yyyy-MM-dd")}</td>
        <td className="text-center font-mono text-muted-foreground border-r border-border">{item.time}</td>
        <td className="pl-8 border-r border-border">
          <div className="flex items-center gap-3">
            <ProfileImage
              url={item.doctor?.img!}
              name={item.doctor?.name}
              className="size-10"
            />
            <div>
              <div className="font-semibold uppercase text-foreground">{item.doctor?.name}</div>
              <div className="text-xs text-muted-foreground">{item.doctor?.specialization}</div>
            </div>
          </div>
        </td>
        <td className="text-center border-r border-border">{item.mode && item.mode.toLowerCase() === 'virtual' ? 'Virtual' : 'In Person'}</td>
        <td className="text-center border-r border-border">
          <AppointmentStatusIndicator status={item.status!} />
        </td>
        <td className="px-0 py-2">
          <div className="flex justify-center items-center gap-2">
            <ViewAppointment id={item?.id.toString()} buttonClassName="px-3 py-1 border border-primary text-primary bg-card text-xs font-semibold hover:bg-primary/10 transition rounded-none" />
            <AppointmentActionOptions
              userId={userId!}
              patientId={item?.patient_id}
              doctorId={item?.doctor_id}
              status={item?.status}
              appointmentId={item.id}
              buttonClassName="px-2 py-1 border border-border text-primary bg-card text-xs font-semibold hover:bg-primary/10 transition rounded-none"
            />
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Modern, non-sticky header row */}
      <div className="flex flex-col md:flex-row items-center justify-between px-8 py-4 gap-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary shadow-md">
            <BriefcaseBusiness size={28} />
          </span>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold text-foreground tracking-tight leading-tight">{totalRecord ?? 0}</span>
            <span className="text-muted-foreground text-base font-medium">Total Appointments</span>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <SearchInput />
        </div>
      </div>

      {/* Table section */}
      <div className="flex-1 w-full px-0 py-4">
        <div className="overflow-x-auto px-8">
          <div className="relative border border-border rounded-lg overflow-x-auto shadow-sm">
            <table className="min-w-full bg-card border-separate border-spacing-0">
              <thead className="sticky top-0 z-10 bg-muted border-b border-border shadow-sm">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-4 py-3 text-left font-bold text-muted-foreground text-base uppercase tracking-wide border-b border-border ${col.className || ''}`}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item: any, idx: number) => renderItem(item, idx))}
              </tbody>
            </table>
          </div>
        </div>
        {data?.length > 0 && (
          <div className="mt-6 flex justify-center">
          <Pagination
            totalRecords={totalRecord!}
            currentPage={currentPage!}
            totalPages={totalPages!}
            limit={DATA_LIMIT}
          />
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;