import { AvailableDoctorProps } from "@/types/data-types";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Card } from "./ui/card";
import { ProfileImage } from "./profile-image";
import { cn } from "@/lib/utils";

const DAYS_OF_WEEK = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

const getToday = () => {
  const today = new Date().getDay();
  return DAYS_OF_WEEK[today] || DAYS_OF_WEEK[0];
};

const todayDay = getToday();

interface Days {
  day: string;
  start_time: string;
  close_time: string;
}

interface DataProps {
  data: AvailableDoctorProps;
  isAdmin?: boolean;
}

export const availableDays = ({ data }: { data: Days[] }) => {
  const isTodayWorkingDay = data?.find(
    (dayObj) => dayObj?.day?.toLowerCase() === todayDay
  );

  return isTodayWorkingDay
    ? `${isTodayWorkingDay?.start_time} - ${isTodayWorkingDay?.close_time}`
    : "Not Available";
};

export const AvailableDoctors = ({ data, isAdmin = false }: DataProps) => {
  return (
    <Card className="w-full max-w-full min-w-[340px] rounded-2xl shadow-lg bg-white dark:bg-gradient-to-br dark:from-[#e5e7eb] dark:to-[#a3a3a3] flex flex-col justify-between items-center py-4 px-6">
      <div className="flex justify-between items-center w-full mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Doctors</h1>
          <p className="text-sm text-gray-600 mt-1">Currently available medical professionals</p>
        </div>
        {isAdmin && (
          <Button
            asChild
            variant="outline"
            disabled={data?.length === 0}
            className="
              disabled:cursor-not-allowed disabled:text-gray-400
              border-white dark:border-[#38bdf8]
              text-gray-900 dark:text-white
              bg-white dark:bg-[#2563eb]
              hover:bg-[#f3f4f6] dark:hover:bg-[#3b82f6]
              hover:text-gray-900 dark:hover:text-white
              font-semibold text-sm shadow-sm transition-colors
            "
          >
            <Link href="/record/doctors/list">View all</Link>
          </Button>
        )}
      </div>
      <div className="w-full space-y-5 md:space-y-0 md:gap-6 flex flex-col md:flex-row md:flex-wrap">
        {data?.map((doc, id) => (
          <Link 
            key={id}
            href={`/record/doctors/${doc.id}`}
            className="block w-full md:w-[300px] xl:w-full"
          >
            <Card
              className={`border-none w-full min-h-28 p-4 flex gap-4 bg-white/80 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer group`}
            >
              <ProfileImage
                url={doc?.img}
                name={doc?.name}
                className={`md:flex min-w-14 min-h-14 md:min-w-16 md:min-h-16 bg-opacity-80 dark:bg-opacity-90 border-2 border-black dark:border-white dark:bg-black`}
                textClassName="text-2xl font-semibold text-gray-900 dark:text-white"
                bgColor={doc?.colorCode!}
              />
              <div className="flex-1">
                <h2 className="font-semibold text-lg md:text-xl text-gray-900 group-hover:text-blue-600 transition-colors">{doc?.name}</h2>
                <p className="text-base capitalize text-gray-700">  
                  {doc?.specialization}
                </p>
                <p className="text-sm flex items-center text-gray-500">
                    <span className="hidden lg:flex">Available Time: </span>
                  {availableDays({ data: doc?.working_days })}
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className="
                  border-gray-300 dark:border-gray-600
                  text-gray-700 dark:text-gray-300
                  bg-white dark:bg-gray-800
                  group-hover:bg-gray-50 dark:group-hover:bg-gray-700
                  group-hover:text-gray-900 dark:group-hover:text-white
                  font-medium text-sm shadow-sm transition-colors
                  px-3 py-1 rounded border
                ">
                  View
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </Card>
  );
};