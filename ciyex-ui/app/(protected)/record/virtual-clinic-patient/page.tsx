"use client"

import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isSameDay } from 'date-fns';
import 'react-calendar/dist/Calendar.css';

const VirtualClinicPatient = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getStatusForDay = (date: Date) => {
    // TODO: Implement actual status logic
    return null;
  };

  return (
    <div className="p-4">
      <Calendar
        onChange={(value) => value && setSelectedDate(value as Date)}
        value={selectedDate}
        className="!border-none !shadow-xl !rounded-2xl !p-4 bg-white dark:bg-neutral-900 text-black dark:text-white"
        prevLabel={<ChevronLeft className="h-5 w-5 text-primary" />}
        nextLabel={<ChevronRight className="h-5 w-5 text-primary" />}
        tileClassName={({ date }) => [
          "transition-all duration-200 !rounded-lg !text-base",
          isSameDay(date, selectedDate) && "bg-primary text-white font-bold shadow",
          isSameDay(date, new Date()) && "ring-2 ring-primary",
        ].filter(Boolean).join(" ")}
        tileContent={({ date }) => {
          const status = getStatusForDay(date);
          if (!status) return null;
          let color = "";
          if (status === "pending") color = "bg-yellow-400";
          if (status === "completed") color = "bg-green-500";
          if (status === "scheduled") color = "bg-blue-500";
          if (status === "cancelled") color = "bg-red-500";
          return (
            <div className="flex justify-center mt-1">
              <div className={`h-3 w-3 rounded-full ${color} border-2 border-white dark:border-gray-900`}></div>
            </div>
          );
        }}
      />
    </div>
  );
};

export default VirtualClinicPatient; 