"use client";

import { motion, MotionProps } from "framer-motion";
import Link from "next/link";
import { ProfileImage } from "../../../components/profile-image";
import { User, Calendar, Phone, Mail } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  gender?: string | null;
  img?: string | null;
  colorCode?: string | null;
}

interface RecentPatientsClientProps {
  patients: Patient[];
  allPatients: Patient[];
}

const MotionDiv = motion.div as React.ForwardRefExoticComponent<MotionProps & React.RefAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>>;

const RecentPatientsClient = ({ patients, allPatients }: RecentPatientsClientProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Card className="w-full max-w-full min-w-[340px] rounded-2xl shadow-lg bg-white dark:bg-gradient-to-br dark:from-[#e5e7eb] dark:to-[#a3a3a3] flex flex-col justify-between items-center py-4 px-6 mb-8">
      <div className="flex justify-between items-center w-full mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Recent Patients</h1>
        <button
          onClick={() => setOpen(true)}
          className="text-sm text-[#2563eb] dark:text-[#38bdf8] hover:text-[#174ea6] dark:hover:text-[#5eead4] transition-colors"
        >
          View All
        </button>
      </div>
      <div className="w-full space-y-5 md:space-y-0 md:gap-6 flex flex-col md:flex-row md:flex-wrap">
        {Array.isArray(patients) && patients.length > 0 ? (
          patients.map((patient) => (
            <MotionDiv
              key={patient.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="border-none w-full md:w-[300px] min-h-28 xl:w-full p-4 flex gap-4 bg-white/80 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
              whileHover={{ scale: 1.02, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            >
              <ProfileImage
                url={patient.img!}
                name={`${patient.first_name} ${patient.last_name}`}
                className="md:flex min-w-14 min-h-14 md:min-w-16 md:min-h-16 bg-opacity-80 dark:bg-opacity-90 border-2 border-black dark:border-white dark:bg-black"
                textClassName="text-2xl font-semibold text-gray-900 dark:text-white"
                bgColor={patient.colorCode!}
              />
              <div>
                <h2 className="font-semibold text-lg md:text-xl text-gray-900">{`${patient.first_name} ${patient.last_name}`}</h2>
                <p className="text-base capitalize text-gray-700">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${patient.gender?.toLowerCase() === 'male'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : patient.gender?.toLowerCase() === 'female'
                      ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                    {patient.gender || 'Other'}
                  </span>
                </p>
              </div>
            </MotionDiv>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8 w-full">No appointment yet</div>
        )}
      </div>

      {/* Modal for all patients */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>All Patients</DialogTitle>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {allPatients.length === 0 ? (
              <div className="text-center text-gray-500">No patients yet</div>
            ) : (
              allPatients.map((patient) => (
                <div key={patient.id} className="flex items-center gap-3">
                  <ProfileImage url={patient.img!} name={`${patient.first_name} ${patient.last_name}`} className="w-10 h-10" />
                  <div>
                    <div className="font-semibold">{patient.first_name} {patient.last_name}</div>
                    <div className="text-xs text-gray-500">{patient.gender}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogClose asChild>
            <button className="mt-4 px-4 py-2 bg-gray-200 rounded">Close</button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RecentPatientsClient; 