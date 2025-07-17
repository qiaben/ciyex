import { NewPatient } from "@/components/new-patient";
import { getPatientById } from "@/utils/services/patient";
import { getCurrentUserFromToken } from "../../../utils/auth";
import { redirect } from "next/navigation";
import React from "react";

const Registration = async () => {
    // Replace Clerk auth with your JWT-based helper
    const user = await getCurrentUserFromToken();

    if (!user?.userId) {  // <- Change here
    return <div>Please sign in to continue</div>;
  }

  // Check if user already has a doctor role
    const userRole = user.roles[0];
  if (userRole === 'doctor') {
    redirect('/doctor');
  }
    const userId = user.userId.toString();

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
