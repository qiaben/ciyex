"use client";

import { AppointmentsChartProps } from "@/types/data-types";
import React, { useEffect, useRef } from "react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO, isValid, startOfYear, endOfYear, getMonth } from "date-fns";

interface DataProps {
  data: AppointmentsChartProps;
}

export const AppointmentChart = ({ data }: DataProps) => {
  const chartRef = useRef<any>(null);

  // Calculate the date range for the entire year
  const today = new Date();
  const startDate = startOfYear(today);
  const endDate = endOfYear(today);

  // Initialize monthly data structure
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    name: format(new Date(today.getFullYear(), i, 1), 'MMM'),
    appointment: 0,
    completed: 0,
    date: format(new Date(today.getFullYear(), i, 1), 'yyyy-MM-dd')
  }));

  // Process the data to count appointments by month
  (data || []).forEach(item => {
    try {
      if (!item.date) return;
      const itemDate = parseISO(item.date);
      if (!isValid(itemDate) || itemDate < startDate || itemDate > endDate) return;
      
      const monthIndex = getMonth(itemDate);
      monthlyData[monthIndex].appointment += item.appointment;
      monthlyData[monthIndex].completed += item.completed;
    } catch (error) {
      console.error('Error processing appointment data:', error);
    }
  });

  // If no data is available, show a message
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 h-full flex items-center justify-center shadow-sm border border-gray-100">
        <p className="text-gray-500 font-medium">No appointment data available</p>
      </div>
    );
  }

  // If all months have zero appointments, show a message
  const hasAppointments = monthlyData.some(month => month.appointment > 0 || month.completed > 0);
  if (!hasAppointments) {
    return (
      <div className="bg-white rounded-xl p-6 h-full flex items-center justify-center shadow-sm border border-gray-100">
        <p className="text-gray-500 font-medium">No appointments for {format(today, 'yyyy')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 h-full shadow-sm border border-gray-100 flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Appointment Overview</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Monthly appointment statistics</p>
        </div>
        <div className="text-xs sm:text-sm font-medium text-gray-600 bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full mt-2 sm:mt-0">
          {format(today, 'yyyy')}
        </div>
      </div>

      <div className="overflow-x-auto flex-1 -mx-4 sm:-mx-6" ref={chartRef}>
        <div className="min-w-[300px] w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="appointmentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="#f0f0f0" 
                opacity={0.5}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 500 }}
                tickLine={false}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                axisLine={false} 
                tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 500 }} 
                tickLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{ 
                  borderRadius: "8px", 
                  border: "1px solid #f0f0f0",
                  backgroundColor: "white",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  padding: "8px",
                  fontSize: "12px"
                }}
                labelStyle={{ 
                  color: "#374151",
                  fontWeight: 600,
                  marginBottom: "4px",
                  fontSize: "12px"
                }}
                itemStyle={{ 
                  color: "#6b7280",
                  padding: "2px 0",
                  fontSize: "12px"
                }}
              />
              <Legend
                align="center"
                verticalAlign="top"
                wrapperStyle={{
                  paddingTop: "0",
                  paddingBottom: "10px",
                  fontSize: "12px",
                  fontWeight: 500
                }}
                iconType="circle"
                iconSize={6}
              />
              <Line
                type="monotone"
                dataKey="appointment"
                name="Total Appointments"
                stroke="#1a1a1a"
                strokeWidth={2}
                dot={{ r: 3, fill: "#1a1a1a", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "#1a1a1a", strokeWidth: 2 }}
                fill="url(#appointmentGradient)"
              />
              <Line
                type="monotone"
                dataKey="completed"
                name="Completed"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3, fill: "#2563eb", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "#2563eb", strokeWidth: 2 }}
                fill="url(#completedGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};