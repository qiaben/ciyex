"use client";
import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from "recharts";

export interface RevenueDatum {
  month: string;
  revenue: number;
  bookings: number;
}

export default function DoctorRevenueChart({ revenueData }: { revenueData: RevenueDatum[] }) {
  console.log('Revenue Data:', revenueData); // Debug log

  if (!revenueData || revenueData.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-lg p-6 border border-[#10b981]/10 dark:border-[#10b981]/20">
        <h2 className="text-xl font-bold mb-2 text-[#2563eb] dark:text-[#5eead4] flex items-center gap-2">
          Revenue Overview
          <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#10b981] to-[#2563eb] animate-pulse"></span>
        </h2>
        <p className="text-sm text-gray-500 mb-4">No revenue data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-lg p-6 border border-[#10b981]/10 dark:border-[#10b981]/20">
      <h2 className="text-xl font-bold mb-2 text-[#2563eb] dark:text-[#5eead4] flex items-center gap-2">
        Revenue Overview
        <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#10b981] to-[#2563eb] animate-pulse"></span>
      </h2>
      <p className="text-sm text-gray-500 mb-4">Your monthly revenue and bookings for the year</p>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={revenueData} margin={{ top: 10, right: 40, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ef" />
          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={v => `$${v}`}/>
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#2563eb', fontSize: 12 }} tickFormatter={v => `${v}`}/>
          <Tooltip 
            contentStyle={{ 
              background: '#fff', 
              borderRadius: 8, 
              border: '1px solid #e0e7ef',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            formatter={(value: any, name: string) => name === 'revenue' ? [`$${value}`, 'Revenue'] : [value, 'Bookings']} 
          />
          <Area 
            yAxisId="left" 
            type="monotone" 
            dataKey="revenue" 
            stroke="#10b981" 
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
            strokeWidth={3} 
            dot={{ r: 5, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} 
            activeDot={{ r: 8, fill: '#10b981', stroke: '#2563eb', strokeWidth: 2 }} 
            name="Revenue" 
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="bookings" 
            stroke="#2563eb" 
            strokeWidth={3} 
            dot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} 
            activeDot={{ r: 8, fill: '#2563eb', stroke: '#10b981', strokeWidth: 2 }} 
            name="Bookings" 
          />
        </AreaChart>
      </ResponsiveContainer>
      {/* <div className="flex justify-end mt-2"> */}
        {/* <span className="text-xs text-gray-400 italic">* Data is for demonstration</span> */}
      </div>
    // </div>
  );
} 