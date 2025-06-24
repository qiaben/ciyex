
import React from 'react';
import { cn } from "@/lib/utils";
import { 
  Activity, 
  Heart, 
  Droplets, 
  ShieldAlert, 
  Apple, 
  Microscope
} from "lucide-react";

interface TestCategoryCardProps {
  name: string;
  description: string;
  iconType: string;
  colorClass?: string;
  className?: string;
}

const TestCategoryCard: React.FC<TestCategoryCardProps> = ({
  name,
  description,
  iconType,
  colorClass = "bg-blue-50",
  className
}) => {
  // Render the appropriate icon based on the iconType
  const renderIcon = () => {
    switch (iconType.toLowerCase()) {
      case 'wellness':
        return <Activity className="h-6 w-6 text-blue-600" />;
      case 'heart':
        return <Heart className="h-6 w-6 text-red-600" />;
      case 'hormones':
        return <Droplets className="h-6 w-6 text-purple-600" />;
      case 'std':
        return <ShieldAlert className="h-6 w-6 text-orange-600" />;
      case 'vitamins':
        return <Apple className="h-6 w-6 text-green-600" />;
      case 'specialized':
        return <Microscope className="h-6 w-6 text-teal-600" />;
      default:
        return <Activity className="h-6 w-6 text-blue-600" />;
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col items-start p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer",
        colorClass,
        className
      )}
    >
      <div className="mb-4">
        {renderIcon()}
      </div>
      <h3 className="text-lg font-bold mb-2">{name}</h3>
      <p className="text-gray-700 text-sm">{description}</p>
    </div>
  );
};

export default TestCategoryCard;
