"use client";
import React, { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from "recharts";

interface ServiceRevenueDatum {
  id: string;
  name: string;
  revenue: number;
}

// Muted, harmonious color palette
const COLORS = [
  "#60a5fa", // blue-400
  "#34d399", // emerald-400
  "#fbbf24", // amber-400
  "#a78bfa", // purple-400
  "#f87171", // red-400
  "#38bdf8", // sky-400
  "#f472b6", // pink-400
  "#facc15", // yellow-400
  "#818cf8", // indigo-400
  "#6ee7b7", // green-300
  "#fcd34d", // yellow-300
  "#c4b5fd", // purple-300
];

// Group small slices as 'Other' if too many
function groupServices(data: ServiceRevenueDatum[], maxSlices = 8) {
  if (data.length <= maxSlices) return data;
  const sorted = [...data].sort((a, b) => b.revenue - a.revenue);
  const top = sorted.slice(0, maxSlices - 1);
  const rest = sorted.slice(maxSlices - 1);
  const otherRevenue = rest.reduce((sum, s) => sum + s.revenue, 0);
  return [
    ...top,
    { id: "other", name: "Other", revenue: otherRevenue },
  ];
}

// Custom tooltip positioned to the right of the chart
const CustomTooltip = ({ active, payload, label, totalRevenue }: any) => {
  if (active && payload && payload.length) {
    const percent = totalRevenue ? (payload[0].value / totalRevenue) * 100 : 0;
    const completedPay = payload[0].payload.completedPay;
    return (
      <div className="rounded-lg shadow-md px-3 py-2 bg-white/90 border border-gray-200 text-xs text-gray-700" style={{ minWidth: 120 }}>
        <div className="font-semibold text-sm mb-1">{payload[0].name}</div>
        <div>Revenue: <span className="font-bold text-[#10b981]">${payload[0].value.toLocaleString()}</span></div>
        <div>Percent: <span className="font-semibold">{percent.toFixed(1)}%</span></div>
        {typeof completedPay === 'number' && (
          <div>Completed Pay: <span className="font-semibold text-blue-600">${completedPay.toLocaleString()}</span></div>
        )}
      </div>
    );
  }
  return null;
};

// Custom label outside the donut with leader line
const renderCustomizedLabel = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, outerRadius, percent } = props;
  const radius = outerRadius + 18;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.07) return null;
  return (
    <g>
      {/* Leader line */}
      <polyline
        points={`${cx + outerRadius * Math.cos(-midAngle * RADIAN)},${cy + outerRadius * Math.sin(-midAngle * RADIAN)} ${x},${y}`}
        stroke="#cbd5e1"
        strokeWidth={1.5}
        fill="none"
      />
      <text x={x} y={y} fill="#334155" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={13} fontWeight={500}>
        {(percent * 100).toFixed(0)}%
      </text>
    </g>
  );
};

// Custom active slice with 3D effect
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const {
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 6) * cos;
  const sy = cy + (outerRadius + 6) * sin;
  const mx = cx + (outerRadius + 18) * cos;
  const my = cy + (outerRadius + 18) * sin;
  return (
    <g>
      {/* 3D shadow */}
      <Sector
        cx={cx}
        cy={cy + 4}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill="#e0e7ef"
        opacity={0.5}
      />
      {/* Main slice */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
        style={{ filter: 'drop-shadow(0 2px 8px #0001)' }}
      />
      {/* Leader line and label */}
      {percent > 0.07 && (
        <>
          <polyline points={`${sx},${sy} ${mx},${my}`} stroke="#cbd5e1" strokeWidth={1.5} fill="none" />
          <text x={mx} y={my} fill="#334155" textAnchor={mx > cx ? "start" : "end"} dominantBaseline="central" fontSize={13} fontWeight={600}>
            {(percent * 100).toFixed(0)}%
          </text>
        </>
      )}
    </g>
  );
};

export default function DoctorServiceRevenuePieChart({ serviceRevenue }: { serviceRevenue: ServiceRevenueDatum[] }) {
  // Group and color
  const groupedData = useMemo(() => groupServices(serviceRevenue, 8), [serviceRevenue]);
  const totalRevenue = groupedData.reduce((sum, s) => sum + s.revenue, 0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // For legend click highlight
  const handleLegendClick = (idx: number) => setActiveIndex(idx === activeIndex ? null : idx);

  if (!serviceRevenue || serviceRevenue.length === 0) {
    return (
      <div className="relative bg-white/80 dark:bg-[#1e293b]/90 rounded-2xl shadow-lg p-6 border border-[#10b981]/10 dark:border-[#10b981]/20 backdrop-blur-xl overflow-hidden">
        <h2 className="text-xl font-bold mb-2 text-[#2563eb] dark:text-[#5eead4] flex items-center gap-2 z-10 relative">
          Revenue by Service
          <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#10b981] to-[#2563eb] animate-pulse"></span>
        </h2>
        <p className="text-sm text-gray-500 mb-4 z-10 relative">No service revenue data available</p>
      </div>
    );
  }

  return (
    <div className="relative bg-white/80 dark:bg-[#1e293b]/90 rounded-2xl shadow-lg p-6 border border-[#10b981]/10 dark:border-[#10b981]/20 backdrop-blur-xl overflow-hidden">
      {/* Central total revenue badge */}
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none select-none">
        <span className="text-xs font-semibold text-[#2563eb] dark:text-[#5eead4] tracking-widest uppercase mb-1 drop-shadow">Total Revenue</span>
        <span className="text-2xl md:text-3xl font-extrabold text-[#10b981] dark:text-[#5eead4] drop-shadow-lg">${totalRevenue.toLocaleString()}</span>
      </div>
      {/* Donut PieChart with 3D effect and offset tooltip */}
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={groupedData}
            dataKey="revenue"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={2}
            isAnimationActive={true}
            animationDuration={900}
            label={renderCustomizedLabel}
            labelLine={false}
            activeIndex={activeIndex ?? undefined}
            activeShape={renderActiveShape}
            onMouseEnter={(_, idx) => setActiveIndex(idx)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {groupedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="#fff"
                strokeWidth={2}
                style={{ cursor: 'pointer', transition: 'filter 0.2s' }}
              />
            ))}
          </Pie>
          <Tooltip
            content={<CustomTooltip totalRevenue={totalRevenue} />}
            position={{ y: 60, x: 320 }} // Offset tooltip to the right
            wrapperStyle={{ zIndex: 50 }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Compact, always-visible legend below the chart */}
      <div className="mt-6 z-10 relative grid grid-cols-1 sm:grid-cols-2 gap-2">
        {groupedData.map((entry, i) => (
          <button
            key={entry.id}
            className={`flex items-center gap-2 min-w-[90px] rounded px-2 py-1 transition-colors ${activeIndex === i ? 'bg-[#e0f2fe] dark:bg-[#164e63]' : ''}`}
            style={{ outline: 'none', border: 'none' }}
            onClick={() => handleLegendClick(i)}
            tabIndex={0}
          >
            <span className="inline-block w-4 h-4 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{entry.name}</span>
            <span className="text-xs text-gray-500">${entry.revenue.toLocaleString()}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 