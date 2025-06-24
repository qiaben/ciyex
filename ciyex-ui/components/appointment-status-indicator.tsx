import { cn } from "@/lib/utils";
import { AppointmentStatus } from "@prisma/client";
import { CheckCircle, Clock, XCircle, CalendarCheck } from "lucide-react";

const status_styles = {
  PENDING: {
    bg: "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700",
    icon: <Clock className="w-4 h-4 mr-1 text-yellow-500" />,
  },
  SCHEDULED: {
    bg: "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700",
    icon: <CalendarCheck className="w-4 h-4 mr-1 text-emerald-500" />,
  },
  CANCELLED: {
    bg: "bg-gradient-to-r from-red-100 to-red-200 text-red-700",
    icon: <XCircle className="w-4 h-4 mr-1 text-red-500" />,
  },
  COMPLETED: {
    bg: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700",
    icon: <CheckCircle className="w-4 h-4 mr-1 text-blue-500" />,
  },
};

export const AppointmentStatusIndicator = ({
  status,
}: {
  status: AppointmentStatus;
}) => {
  const style = status_styles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full font-semibold text-xs lg:text-sm shadow-sm transition-all duration-200 border border-white/60",
        style.bg
      )}
      aria-label={status}
    >
      {style.icon}
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
};