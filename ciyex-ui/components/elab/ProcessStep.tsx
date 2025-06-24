
import React from 'react';
import { cn } from "@/lib/utils";

interface ProcessStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  stepNumber: number;
  className?: string;
}

const ProcessStep: React.FC<ProcessStepProps> = ({
  icon,
  title,
  description,
  stepNumber,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center p-6 rounded-xl border shadow-md transition-all duration-300", className)}>
      <div className="relative mb-5">
        <div className="rounded-full bg-white p-4 shadow-md">
          {icon}
        </div>
        <div className="absolute -top-2 -right-2 bg-elab-medical-blue text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-lg">
          {stepNumber}
        </div>
      </div>
      <h3 className="text-lg font-bold mb-2 text-center">{title}</h3>
      <p className="text-gray-600 text-center text-sm">{description}</p>
    </div>
  );
};

export default ProcessStep;
