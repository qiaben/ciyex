
import React from 'react';
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  icon: React.ReactNode;
  text: string;
  className?: string;
}

const TrustBadge: React.FC<TrustBadgeProps> = ({
  icon,
  text,
  className
}) => {
  return (
    <div className={cn("flex items-center gap-3 p-4 rounded-xl", className)}>
      <div className="bg-blue-50 p-3 rounded-full">
        {icon}
      </div>
      <span className="text-sm md:text-base font-medium">{text}</span>
    </div>
  );
};

export default TrustBadge;
