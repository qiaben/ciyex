import { auth } from "@clerk/nextjs/server";
import { getPatientFullDataById } from "@/utils/services/patient";

interface PatientRatingWrapperProps {
  id: string;
}

export const PatientRatingWrapper = async ({ id }: PatientRatingWrapperProps) => {
  const { userId } = await auth();
  const result = await getPatientFullDataById(id);
  if (!result.success) {
    return null;
  }
  const { data } = result as { success: true; data: any };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Patient Rating</h2>
      <div className="flex items-center justify-between">
        <div className="text-center">
          <p className="text-3xl font-bold text-purple-600">4.8</p>
          <span className="text-sm text-gray-600">Average Rating</span>
        </div>
        <div className="h-12 w-px bg-gray-200"></div>
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">{data.totalAppointments || 0}</p>
          <span className="text-sm text-gray-600">Total Appointments</span>
        </div>
      </div>
    </div>
  );
}; 