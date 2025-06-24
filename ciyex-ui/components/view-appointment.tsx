import { getAppointmentById } from "@/utils/services/appointment";
import React from "react";
import { NumberDomain } from "recharts/types/util/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { calculateAge, formatDateTime } from "@/utils";
import { ProfileImage } from "./profile-image";
import { Calendar, Phone } from "lucide-react";
import { format } from "date-fns";
import { AppointmentStatusIndicator } from "./appointment-status-indicator";
import { checkRole } from "@/utils/roles";
import { auth } from "@clerk/nextjs/server";
import { AppointmentAction } from "./appointment-action";
import { ViewAppointmentClient } from "./ViewAppointmentClient";

export async function ViewAppointment({ id, buttonClassName }: { id: string | undefined, buttonClassName?: string }) {
  const { data } = await getAppointmentById(Number(id!));
  const { userId } = await auth();
  const isAdmin = await checkRole("ADMIN");

  return (
    <ViewAppointmentClient
      data={data}
      userId={userId ?? ""}
      isAdmin={isAdmin}
      buttonClassName={buttonClassName}
    />
  );
}