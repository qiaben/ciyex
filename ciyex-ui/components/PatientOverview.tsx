import { Patient } from "@prisma/client";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { calculateAge } from "@/utils";

interface Doctor {
  name?: string;
  specialization?: string;
}

export const PatientOverview = ({ data, doctor }: { data: Patient; doctor?: Doctor }) => {
  const dateOfBirth = data.date_of_birth ? new Date(data.date_of_birth) : null;
  
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 hover:shadow-2xl transition-all duration-500">
      <div className="text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-300 dark:to-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 border-4 border-white dark:border-slate-800 shadow-lg hover:scale-105 transition-transform duration-300">
          <User className="text-white dark:text-slate-800" size={24} />
        </div>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          {data.first_name} {data.last_name}
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mt-3">
          <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border border-emerald-200 dark:border-emerald-700">
            {data.gender}
          </span>
          <span className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">
            {dateOfBirth ? calculateAge(dateOfBirth) : "Age not provided"}
          </span>
        </div>
      </div>

      <div className="space-y-4 lg:space-y-5">
        <div className="flex items-center gap-3 sm:gap-4 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200 group">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors duration-200">
            <Mail size={14} className="text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-xs sm:text-sm font-medium truncate">{data.email || "Not provided"}</span>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200 group">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors duration-200">
            <Phone size={14} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-xs sm:text-sm font-medium">{data.phone || "Not provided"}</span>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200 group">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors duration-200">
            <MapPin size={14} className="text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-xs sm:text-sm font-medium">{data.address || "Not provided"}</span>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 lg:pt-6 space-y-4 lg:space-y-5">
        <div>
          <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-medium">Physician</label>
          <p className="text-slate-800 dark:text-slate-200 font-semibold mt-1 text-sm">
            {doctor?.name ? `Dr. ${doctor.name}${doctor.specialization ? ", " + doctor.specialization : ""}` : "Dr Codewave, MBBS, FCPS"}
          </p>
        </div>
        
        <div>
          <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-medium">Active Conditions</label>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 font-medium">
            {data.medical_conditions || "Not provided"}
          </p>
        </div>
        
        <div>
          <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-medium">Allergies</label>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 font-medium">
            {data.allergies || "Not provided"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 lg:pt-6">
        <button className="bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 border border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md hover:scale-[1.02]">
          Lab Test
        </button>
        <button className="bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 border border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:scale-[1.02]">
          Vital Signs
        </button>
      </div>
    </div>
  );
};
