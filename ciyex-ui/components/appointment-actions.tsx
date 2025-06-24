import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface ActionsProps {
  userId: string;
  status: string;
  patientId: string;
  doctorId: string;
  appointmentId: number;
  buttonClassName?: string;
}

export const AppointmentActionOptions = async ({
  appointmentId,
  buttonClassName,
}: ActionsProps) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className={
              buttonClassName ||
              "rounded-full p-0 w-9 h-9 flex items-center justify-center border border-primary/60 bg-background shadow-sm transition-all duration-200 hover:bg-primary/90 hover:text-white hover:scale-105 focus:ring-2 focus:ring-primary/30"
            }
            asChild
            aria-label="View Full Details"
          >
            <Link href={`appointments/${appointmentId}`}>
              <Plus size={22} strokeWidth={2.2} className="transition-all duration-200" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-sm font-medium bg-background/95 border border-primary/20 shadow-lg rounded-xl px-3 py-1">
          View Full Details
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};