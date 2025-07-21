import SuperAdminDashboard from "./SuperAdminDashboard";
import AdminDashboard from "./AdminDashboard";
import DoctorDashboard from "./DoctorDashboard";
import PatientDashboard from "./PatientDashboard";
import NurseDashboard from "./NurseDashboard";
import ReceptionistDashboard from "./ReceptionistDashboard";

export default function RoleDashboard({ role }: { role: string | null }) {
    switch (role) {
        case "SUPER_ADMIN":
            return <SuperAdminDashboard />;
        case "ADMIN":
            return <AdminDashboard />;
        case "DOCTOR":
            return <DoctorDashboard />;
        case "PATIENT":
            return <PatientDashboard />;
        case "NURSE":
            return <NurseDashboard />;
        case "RECEPTIONIST":
            return <ReceptionistDashboard />;
        default:
            return <div className="text-lg text-gray-600 p-8">Unknown or no role selected.</div>;
    }
}
