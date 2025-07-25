"use client";

import { CalendarDays, Stethoscope, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function StatisticsOverview() {
    return (
        <motion.div
            className="bg-white dark:bg-neutral-900 p-5 rounded-xl shadow"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Statistics Overview <span className="text-blue-400">•</span>
                </h3>
                <CheckCircle className="text-gray-400" />
            </div>
            <div className="flex justify-between items-center">
                <div className="text-center">
                    <CalendarDays className="mx-auto text-xl text-gray-500" />
                    <p className="font-bold text-lg">0</p>
                    <p className="text-xs text-gray-400">Appointments</p>
                </div>
                <div className="text-center">
                    <Stethoscope className="mx-auto text-xl text-blue-500" />
                    <p className="font-bold text-lg">0</p>
                    <p className="text-xs text-gray-400">Consultation</p>
                </div>
                <div className="text-center">
                    <p className="font-bold text-xl">0</p>
                    <p className="text-xs text-gray-400">Total</p>
                </div>
            </div>
        </motion.div>
    );
}
