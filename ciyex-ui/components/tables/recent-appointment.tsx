import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { Table } from "./table";
import { Appointment } from "@/types/data-types";
import { ProfileImage } from "../profile-image";
import { format } from "date-fns";
import { AppointmentStatusIndicator } from "../appointment-status-indicator";
import { ViewAppointmentClient } from "../ViewAppointmentClient";
import { Eye, ArrowUpRight } from "lucide-react";

interface DataProps {
  data: any[];
  isAdmin?: boolean;
  userId?: string;
}
const columns = [
  { header: "Info", key: "name" },
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
    header: "Status",
    key: "status",
    className: "hidden xl:table-cell",
  },
  {
    header: "Actions",
    key: "action",
  },
];
export const RecentAppointments = ({ data, isAdmin = false, userId = "" }: DataProps) => {
  const renderRow = (item: Appointment) => {
    const name = item?.patient?.first_name + " " + item?.patient?.last_name;
    return (
      <tr key={item?.id}>
        <td className="py-4 px-2">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-sm scale-110 z-0" />
          <ProfileImage
            url={item?.patient?.img!}
            name={name}
                className="bg-primary shadow-lg border-2 border-card w-12 h-12 text-lg relative z-10"
            bgColor={item?.patient?.colorCode!}
          />
            </div>
          <div>
              <h3 className="text-base font-bold uppercase text-gray-900 dark:text-gray-100 tracking-tight">{name}</h3>
              <span className="text-xs capitalize text-gray-500 dark:text-gray-300 font-medium">{item?.patient?.gender?.toLowerCase()}</span>
            </div>
          </div>
        </td>

        <td className="hidden md:table-cell font-medium text-muted-foreground px-2 align-middle">{format(item?.appointment_date, "yyyy-MM-dd")}</td>
        <td className="hidden md:table-cell font-medium text-muted-foreground px-2 align-middle">{item?.time}</td>
        <td className="hidden md:table-cell py-2 px-2 align-middle">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-sm scale-110 z-0" />
            <ProfileImage
              url={item?.doctor?.img!}
              name={item?.doctor?.name}
                className="bg-accent shadow-md border-2 border-card w-12 h-12 text-lg relative z-10"
              bgColor={item?.doctor?.colorCode!}
                textClassName="text-foreground font-bold"
            />
            </div>
            <div className="border-l-2 border-border pl-3">
              <h3 className="font-bold uppercase text-foreground text-base">{item?.doctor?.name}</h3>
              <span className="text-xs capitalize text-muted-foreground font-medium">{item?.doctor?.specialization}</span>
            </div>
          </div>
        </td>

        <td className="hidden xl:table-cell">
          <AppointmentStatusIndicator status={item?.status} />
        </td>

        <td className="px-2 align-middle">
          <div className="flex items-center gap-x-2 h-9">
            <ViewAppointmentClient data={item} userId={userId} isAdmin={isAdmin} />
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="relative bg-white dark:bg-gradient-to-br dark:from-[#e5e7eb] dark:to-[#a3a3a3] backdrop-blur-xl rounded-2xl shadow-xl border border-border p-6 overflow-hidden">
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#2563eb] to-[#38bdf8] rounded-t-2xl z-10" />
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Recent Appointments</h1>
        </div>
        <Button asChild variant="outline" className="flex items-center gap-2 border-[#2563eb] dark:border-[#38bdf8] text-[#2563eb] dark:text-white bg-white dark:bg-[#2563eb] hover:bg-[#f3f4f6] dark:hover:bg-[#3b82f6] font-semibold">
          <Link href="/record/appointments">
            View All <ArrowUpRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
    </div>
  );
};