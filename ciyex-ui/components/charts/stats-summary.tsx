"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";
import { Users, Calendar, CheckCircle2 } from "lucide-react";
import { formatNumber } from "@/utils";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export const StatSummary = ({ data, total }: { data: any; total: number }) => {
  // Only two bars: Appointments and Consultation
  const dataInfo = [
    {
      name: "Appointments",
      count: data?.PENDING + data?.SCHEDULED || 0,
      fill: "#1a1a1a",
    },
    { name: "Consultation", count: data?.COMPLETED || 0, fill: "#2563eb" },
  ];

  const appointment = dataInfo[0].count;
  const consultation = dataInfo[1].count;

  return (
    <Card className="w-full max-w-full min-w-[340px] border-none shadow-lg bg-gradient-to-br from-white to-gray-50/50 flex flex-col justify-between items-center py-4 px-6">
      <CardHeader className="py-0 pb-2 w-full">
        <div className="flex justify-between items-center w-full">
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Statistics Overview
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">Appointment and consultation summary</p>
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{ background: 'white', borderRadius: '9999px', padding: '0.5rem', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.04)' }}
          >
            <Users className="w-5 h-5 text-gray-600" />
          </motion.div>
        </div>
      </CardHeader>

      <CardContent className="py-1 flex flex-col items-center w-full flex-1 justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-row items-center justify-between w-full h-full -mt-12 sm:-mt-16 gap-2 sm:gap-4 px-2 sm:px-0"
        >
          {/* Appointments stats (left) */}
          <div className="flex flex-col items-center flex-1 min-w-0 sm:min-w-[90px] flex-shrink-1">
            <span className="text-2xl font-bold text-gray-900 flex items-center gap-1">
              <Calendar className="w-5 h-5 text-[#1a1a1a]" />
              {formatNumber(appointment)}
            </span>
            <span className="text-xs text-gray-600 mt-1">Appointments</span>
            <span className="text-xs text-gray-500">{(appointment + consultation > 0 ? ((appointment / (appointment + consultation)) * 100).toFixed(0) : 0)}%</span>
          </div>
          {/* Graph (center) */}
          <div className="flex flex-col items-center">
            <motion.div
              variants={itemVariants}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                height: '180px',
                position: 'relative',
                top: '-2rem',
                marginTop: 0
              }}
              className="flex flex-col items-center min-w-[125px] w-full max-w-[205px] sm:max-w-[250px] flex-shrink-0"
            >
              <ResponsiveContainer width="115%" height="115%">
                <RadialBarChart
                  cx="50%"
                  cy="100%"
                  innerRadius="60%"
                  outerRadius="100%"
                  barSize={35}
                  data={dataInfo}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    background
                    dataKey="count"
                    cornerRadius={30}
                    label={false}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </motion.div>
            {/* Total number and label below the graph */}
            <div className="flex flex-col items-center -mt-8 mb-2">
              <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {formatNumber(appointment + consultation)}
              </p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
          {/* Consultation stats (right) */}
          <div className="flex flex-col items-center flex-1 min-w-0 sm:min-w-[90px] flex-shrink-1">
            <span className="text-2xl font-bold text-[#2563eb] flex items-center gap-1">
              <CheckCircle2 className="w-5 h-5 text-[#2563eb]" />
              {formatNumber(consultation)}
            </span>
            <span className="text-xs text-gray-600 mt-1">Consultation</span>
            <span className="text-xs text-gray-500">{(appointment + consultation > 0 ? ((consultation / (appointment + consultation)) * 100).toFixed(0) : 0)}%</span>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};