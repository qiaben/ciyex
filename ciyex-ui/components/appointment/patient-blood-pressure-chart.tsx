"use client";

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Activity } from "lucide-react";

interface BloodPressureChartProps {
  data: { label: string; value1: number; value2: number; }[]; // Adjusted prop type based on typical BP data structure
}

export const PatientBloodPressureChart = ({ data }: BloodPressureChartProps) => {
  // Remove hardcoded data
  // const bloodPressureData = [
  //   { time: "00:00", systolic: 120, diastolic: 80 },
  //   { time: "06:00", systolic: 118, diastolic: 78 },
  //   { time: "12:00", systolic: 125, diastolic: 82 },
  //   { time: "18:00", systolic: 122, diastolic: 79 },
  //   { time: "24:00", systolic: 120, diastolic: 80 },
  // ];

  return (
    <div className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl 
                   border border-slate-200/60 dark:border-slate-700/60 
                   p-6 lg:p-8 shadow-xl hover:shadow-2xl 
                   transition-all duration-700 hover:scale-[1.02] 
                   animate-fade-in overflow-hidden relative">
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 
                     dark:from-blue-900/10 dark:to-indigo-900/10 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 
                         dark:from-blue-900/40 dark:to-blue-800/40 
                         transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
            <Activity className="text-blue-600 dark:text-blue-400 transition-colors duration-300" size={24} />
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100 
                       transition-colors duration-300">
            Blood Pressure
          </h3>
        </div>
        
        <div className="h-64 lg:h-80 relative">
          {/* Chart Container with Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 
                         dark:from-blue-400/10 dark:to-indigo-400/10 
                         rounded-2xl opacity-0 group-hover:opacity-100 
                         transition-opacity duration-700 blur-sm"></div>
          
          <ResponsiveContainer width="100" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="systolicGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="diastolicGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="currentColor" 
                className="text-slate-200 dark:text-slate-700" 
                opacity={0.3}
              />
              <XAxis 
                dataKey="label" 
                stroke="currentColor" 
                className="text-slate-600 dark:text-slate-400"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="currentColor" 
                className="text-slate-600 dark:text-slate-400"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(20px)',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value1" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Systolic"
                fill="url(#systolicGradient)"
                dot={{ fill: '#3b82f6', strokeWidth: 3, r: 5 }}
                activeDot={{ 
                  r: 8, 
                  stroke: '#3b82f6', 
                  strokeWidth: 3, 
                  fill: '#ffffff',
                  filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.4))'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value2" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Diastolic"
                fill="url(#diastolicGradient)"
                dot={{ fill: '#10b981', strokeWidth: 3, r: 5 }}
                activeDot={{ 
                  r: 8, 
                  stroke: '#10b981', 
                  strokeWidth: 3, 
                  fill: '#ffffff',
                  filter: 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.4))'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}; 