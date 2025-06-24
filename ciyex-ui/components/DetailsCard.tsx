import { getPatientFullDataById } from "@/utils/services/patient";
import { format } from "date-fns";
import { Users, Calendar, Phone, Droplet, MapPin, User } from "lucide-react";

const SmallCard = ({ label, value }: { label: string; value: string }) => (
  <div className="w-full md:w-1/3">
    <span className="text-sm text-gray-500">{label}</span>
    <p className="text-sm md:text-base capitalize">{value}</p>
  </div>
);

export const DetailsCard = async ({ id }: { id: string }) => {
  const result = await getPatientFullDataById(id);
  if (!result.success) {
    return <div>Error loading details.</div>;
  }
  const { data } = result as { success: true; data: any };
  const infoItems = [
    { label: "Gender", value: data?.gender?.toLowerCase(), icon: <Users className="w-4 h-4 text-primary" /> },
    { label: "Date of Birth", value: format(data?.date_of_birth!, "yyyy-MM-dd"), icon: <Calendar className="w-4 h-4 text-primary" /> },
    { label: "Phone", value: data?.phone, icon: <Phone className="w-4 h-4 text-primary" /> },
    { label: "Blood Group", value: data?.blood_group, icon: <Droplet className="w-4 h-4 text-primary" /> },
    { label: "Address", value: data?.address, icon: <MapPin className="w-4 h-4 text-primary" /> },
    { label: "Contact Person", value: data?.emergency_contact_name, icon: <User className="w-4 h-4 text-primary" /> },
    { label: "Emergency Contact", value: data?.emergency_contact_number, icon: <Phone className="w-4 h-4 text-primary" /> },
    { label: "Last Visit", value: data?.lastVisit ? format(data?.lastVisit!, "yyyy-MM-dd") : "No last visit", icon: <Calendar className="w-4 h-4 text-primary" /> },
  ];
  return (
    <div className="bg-white rounded-xl p-6 w-full lg:w-[70%] border-none space-y-6">
      <div className="flex flex-col md:flex-row md:flex-wrap md:items-center xl:justify-between gap-y-4 md:gap-x-0">
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {item.icon}
            <span className="text-sm text-gray-500">{item.label}</span>
            <p className="text-sm md:text-base capitalize">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}; 