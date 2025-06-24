"use client";

import { AppointmentStatus } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useRouter } from "next/navigation";
import { appointmentAction } from "@/app/actions/appointment";
import { Loader2, CheckCircle, Clock, XCircle, CalendarCheck } from "lucide-react";

interface ActionProps {
  id: string | number;
  status: string;
}
export const AppointmentAction = ({ id, status }: ActionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("");
  const router = useRouter();

  const handleAction = async () => {
    try {
      setIsLoading(true);
      const newReason =
        reason ||
        `Appointment has ben ${selected.toLowerCase()} on ${new Date()}`;

      const resp = await appointmentAction(
        id,
        selected as AppointmentStatus,
        newReason
      );

      if (resp.success) {
        toast.success(resp.msg);

        router.refresh();
      } else if (resp.error) {
        toast.error(resp.msg);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-3 bg-white/70 backdrop-blur-md rounded-xl p-4 shadow border border-emerald-100">
        <Button
          variant="outline"
          disabled={status === "PENDING" || isLoading || status === "COMPLETED"}
          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 flex items-center gap-1"
          onClick={() => setSelected("PENDING")}
          title="Mark as Pending"
        >
          <Clock className="w-4 h-4" /> Pending
        </Button>
        <Button
          variant="outline"
          disabled={status === "SCHEDULED" || isLoading || status === "COMPLETED"}
          className="bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center gap-1"
          onClick={() => setSelected("SCHEDULED")}
          title="Approve Appointment"
        >
          <CalendarCheck className="w-4 h-4" /> Approve
        </Button>
        <Button
          variant="outline"
          disabled={status === "COMPLETED" || isLoading}
          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 flex items-center gap-1"
          onClick={() => setSelected("COMPLETED")}
          title="Mark as Completed"
        >
          <CheckCircle className="w-4 h-4" /> Completed
        </Button>
        <Button
          variant="outline"
          disabled={status === "CANCELLED" || isLoading || status === "COMPLETED"}
          className="bg-red-100 hover:bg-red-200 text-red-700 flex items-center gap-1"
          onClick={() => setSelected("CANCELLED")}
          title="Cancel Appointment"
        >
          <XCircle className="w-4 h-4" /> Cancel
        </Button>
      </div>
      {selected === "CANCELLED" && (
          <Textarea
            disabled={isLoading}
            className="mt-4"
          placeholder="Enter reason..."
            onChange={(e) => setReason(e.target.value)}
        />
      )}
      {selected && (
        <div className="flex items-center justify-between mt-6 bg-emerald-50/80 border-l-4 border-emerald-400 p-4 rounded-xl shadow-sm">
          <p className="text-gray-700 font-medium">Are you sure you want to perform this action?</p>
          <Button disabled={isLoading} type="button" onClick={handleAction} className="flex items-center gap-2">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />} Yes
          </Button>
        </div>
      )}
    </div>
  );
};