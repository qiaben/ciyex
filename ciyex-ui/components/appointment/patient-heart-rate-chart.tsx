"use client";

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Heart } from "lucide-react";

interface HeartRateChartProps {
  data: { label: string; value1: number; }[]; // Adjusted prop type based on typical HR data structure
}

export const PatientHeartRateChart = ({ data }: HeartRateChartProps) => {
  return (
    <div className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl 
                   border border-slate-200/60 dark:border-slate-700/60 
                   p-6 lg:p-8 shadow-xl hover:shadow-2xl 
                   transition-all duration-700 hover:scale-[1.02] 
                   animate-fade-in overflow-hidden relative">
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-pink-50/30 
                     dark:from-red-900/10 dark:to-pink-900/10 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 
                         dark:from-red-900/40 dark:to-red-800/40 
                         transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
            <Heart className="text-red-600 dark:text-red-400 transition-colors duration-300" size={24} />
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100 
                       transition-colors duration-300">
            Heart Rate Trend
          </h3>
        </div>
        
        <div className="h-64 lg:h-80 relative">
          {/* Chart Container with Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 
                         dark:from-red-400/10 dark:to-pink-400/10 
                         rounded-2xl opacity-0 group-hover:opacity-100 
                         transition-opacity duration-700 blur-sm"></div>
          
          <ResponsiveContainer width="100" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="heartRateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05}/>
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
                className="text-slate-600 dark:text-slate-400" // Changed dataKey from time to label
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
                dataKey="value1" // Changed dataKey from rate to value1
                stroke="#ef4444" 
                strokeWidth={3}
                fill="url(#heartRateGradient)"
                dot={{ fill: '#ef4444', strokeWidth: 3, r: 5, filter: 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))' }}
                activeDot={{ 
                  r: 8, 
                  stroke: '#ef4444', 
                  strokeWidth: 3, 
                  fill: '#ffffff',
                  filter: 'drop-shadow(0 4px 8px rgba(239, 68, 68, 0.4))'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}; 