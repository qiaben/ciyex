// app/(protected)/doctor/[id]/page.tsx

import { auth } from "@clerk/nextjs/server";
import { getDoctorById } from "@/utils/services/doctor";

interface ParamsProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const MyDoctorProfilePage = async (props: ParamsProps) => {
  const params = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const { userId } = await auth();
  const { id } = params;
  const cat = searchParams?.cat;

  // If id is "self", use the logged-in user's ID
  const actualDoctorId = id === "self" ? userId! : id;

  const doctorRes = await getDoctorById(actualDoctorId);
  const doctor = doctorRes?.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800">Doctor Profile</h1>
          {doctor ? (
            <>
              <p className="text-gray-800 mt-2 font-semibold text-lg">{doctor.name}</p>
              <p className="text-gray-600 mt-1">Specialization: {doctor.specialization}</p>
              <p className="text-gray-600 mt-1">Doctor ID: {doctor.id}</p>
              {cat && <p className="text-gray-600 mt-1">Category: {cat}</p>}
            </>
          ) : (
            <p className="text-gray-600 mt-2">Doctor not found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDoctorProfilePage;
