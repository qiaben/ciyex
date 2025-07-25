"use client";

import { motion } from "framer-motion";

export default function RevenueByService() {
    return (
        <motion.div
            className="bg-white dark:bg-neutral-900 p-5 rounded-xl shadow"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
        >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Revenue by Service <span className="text-blue-400 animate-pulse">•</span>
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">No service revenue data available</p>
        </motion.div>
    );
}
