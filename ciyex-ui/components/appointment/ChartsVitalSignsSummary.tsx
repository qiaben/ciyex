import { Heart, Thermometer, Activity } from "lucide-react";
import React from "react";

interface ChartsVitalSignsSummaryProps {
  temperature: string;
  bloodPressure: string;
  heartRate: string;
  weight: string;
  height: string;
  oxygenSat: string;
  bmi: string;
}

export const ChartsVitalSignsSummary: React.FC<ChartsVitalSignsSummaryProps> = ({
  temperature,
  bloodPressure,
  heartRate,
  weight,
  height,
  oxygenSat,
  bmi,
}) => {
  const vitalSigns = [
    {
      name: "Blood Pressure",
      value: bloodPressure,
      unit: "mmHg",
      icon: Activity,
      bgColor: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30",
      iconColor: "text-red-600 dark:text-red-400",
      status: "Normal",
      statusColor: "bg-emerald-500/90 text-white dark:bg-emerald-600",
      borderColor: "border-red-200/60 dark:border-red-700/40",
    },
    {
      name: "Heart Rate",
      value: heartRate,
      unit: "bpm",
      icon: Heart,
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      status: "Normal",
      statusColor: "bg-emerald-500/90 text-white dark:bg-emerald-600",
      borderColor: "border-emerald-200/60 dark:border-emerald-700/40",
    },
    {
      name: "Temperature",
      value: temperature,
      unit: "",
      icon: Thermometer,
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      status: "Normal",
      statusColor: "bg-emerald-500/90 text-white dark:bg-emerald-600",
      borderColor: "border-blue-200/60 dark:border-blue-700/40",
    },
    {
      name: "Oxygen Sat",
      value: oxygenSat,
      unit: "",
      icon: Activity,
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      status: "Normal",
      statusColor: "bg-emerald-500/90 text-white dark:bg-emerald-600",
      borderColor: "border-purple-200/60 dark:border-purple-700/40",
    },
    {
      name: "Weight",
      value: weight,
      unit: "",
      icon: Activity,
      bgColor: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      status: "Normal",
      statusColor: "bg-emerald-500/90 text-white dark:bg-emerald-600",
      borderColor: "border-amber-200/60 dark:border-amber-700/40",
    },
    {
      name: "Height",
      value: height,
      unit: "",
      icon: Activity,
      bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      status: "Normal",
      statusColor: "bg-emerald-500/90 text-white dark:bg-emerald-600",
      borderColor: "border-indigo-200/60 dark:border-indigo-700/40",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6 mb-8">
      {vitalSigns.map((vital, index) => {
        const Icon = vital.icon;
        return (
          <div
            key={vital.name}
            className={`group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border ${vital.borderColor} p-4 lg:p-6 shadow-lg hover:shadow-2xl transition-all duration-700 ease-out hover:scale-[1.03] hover:-translate-y-1 animate-fade-in`}
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
          >
            <div className={`absolute inset-0 ${vital.bgColor} opacity-40 dark:opacity-60 transition-opacity duration-500 group-hover:opacity-60 dark:group-hover:opacity-80`}></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-slate-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${vital.bgColor} transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-xl`}>
                  <Icon size={20} className={`${vital.iconColor} transition-colors duration-300`} />
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${vital.statusColor} transform transition-all duration-300 group-hover:scale-105 shadow-sm group-hover:shadow-md`}>
                  {vital.status}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium transition-colors duration-300">{vital.name}</p>
                <p className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-all duration-300 group-hover:text-slate-900 dark:group-hover:text-white">{vital.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">{vital.unit}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}; 