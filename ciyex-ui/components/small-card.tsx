import { cn } from "@/lib/utils";
import React from "react";

interface SmallCardProps {
  label: string;
  value: string;
  className?: string;
  icon?: React.ReactNode;
}

export const SmallCard = ({ label, value, className = "", icon }: SmallCardProps) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm ${className}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
      {icon}
    </div>
  </div>
);