import { NewPatient } from "@/components/new-patient";
import { getPatientById } from "@/utils/services/patient";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const Registration = async () => {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    return <div>Please sign in to continue</div>;
  }

  // Check if user already has a doctor role
  const userRole = sessionClaims?.metadata?.role;
  if (userRole === 'doctor') {
    redirect('/doctor');
  }

  const { data } = await getPatientById(userId);
  
  return (
    <div className="w-full h-full flex justify-center">
      <div className="max-w-6xl w-full relative pb-10">
        <NewPatient data={data} type={!data ? "create" : "update"} />
      </div>
    </div>
  );
};

export default Registration;