"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function RecentPatients() {
    return (
        <motion.div
            className="bg-white dark:bg-neutral-900 p-5 rounded-xl shadow"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
        >
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Patients</h3>
                <Link
                    href="/doctor/patients"
                    className="text-sm text-blue-600 hover:underline hover:text-blue-800 transition"
                >
                    View All →
                </Link>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No appointment yet</p>
        </motion.div>
    );
}
