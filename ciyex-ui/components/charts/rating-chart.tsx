"use client";

import React from "react";
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from "recharts";

export const RatingChart = ({
  totalRatings,
  averageRating,
}: {
  totalRatings: number;
  averageRating: number;
}) => {
  const negative = 5 - averageRating;
  const isDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const positiveColor = isDark ? '#22d3ee' : '#22c55e'; // cyan-400 or green-500
  const negativeColor = isDark ? '#f87171' : '#e74c3c'; // red-400 or red-500

  const data = [
    { name: "Positive", value: averageRating, fill: positiveColor },
    { name: "Negative", value: negative, fill: negativeColor },
  ];

  return (
    <div className="bg-white dark:bg-[#1e293b] p-3 sm:p-4 rounded-md h-64 sm:h-80 relative border border-[#10b981]/10 dark:border-[#10b981]/20">
      <div className="flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-semibold text-[#1e293b] dark:text-white">Ratings</h1>
      </div>

      <ResponsiveContainer width={"100%"} height={"100%"}>
        <PieChart>
          <Pie
            dataKey={"value"}
            startAngle={180}
            endAngle={0}
            data={data}
            cx={"50%"}
            cy={"50%"}
            innerRadius={50}
            outerRadius={80}
            fill="#8884d8"
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1e293b] dark:text-white">{averageRating?.toFixed(1)}</h1>
        <p className="text-[10px] sm:text-xs text-[#64748b] dark:text-gray-300">of max ratings</p>
      </div>

      <h2 className="font-medium absolute bottom-12 sm:bottom-16 left-0 right-0 m-auto text-center text-xs sm:text-sm text-[#64748b] dark:text-gray-300">
        Rated by {totalRatings} patients
      </h2>
    </div>
  );
};