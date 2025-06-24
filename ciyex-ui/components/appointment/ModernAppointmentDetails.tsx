import { Calendar, Clock } from "lucide-react";
import React from "react";

interface ModernAppointmentDetailsProps {
  id: number | string;
  date: string;
  time: string;
  status: string;
  notes?: string;
}

export const ModernAppointmentDetails: React.FC<ModernAppointmentDetailsProps> = ({
  id,
  date,
  time,
  status,
  notes,
}) => {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-700/60 p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-700">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40">
          <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">
          Appointment Information
        </h2>
      </div>
      <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/30 rounded-2xl p-6 lg:p-8 border border-slate-300/40 dark:border-slate-600/30 hover:border-slate-400/60 dark:hover:border-slate-500/50 transition-all duration-500 hover:shadow-xl hover:scale-[1.02] group">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-center">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              Appointment #
            </label>
            <p className="text-slate-800 dark:text-slate-100 font-bold text-lg mt-1 transition-colors duration-300 group-hover:text-slate-900 dark:group-hover:text-white">
              #{id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/40">
              <Calendar className="text-emerald-600 dark:text-emerald-400" size={18} />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                Date
              </label>
              <p className="text-slate-800 dark:text-slate-100 font-bold mt-1 transition-colors duration-300 group-hover:text-slate-900 dark:group-hover:text-white">
                {date}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100/80 dark:bg-blue-900/40">
              <Clock className="text-blue-600 dark:text-blue-400" size={18} />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                Time
              </label>
              <p className="text-slate-800 dark:text-slate-100 font-bold mt-1 transition-colors duration-300 group-hover:text-slate-900 dark:group-hover:text-white">
                {time}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="bg-emerald-500/90 dark:bg-emerald-500/80 text-white dark:text-emerald-50 px-4 py-2 rounded-full text-sm font-bold border border-emerald-400/50 dark:border-emerald-500/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              {status}
            </span>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-300/50 dark:border-slate-600/30">
          <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
            Additional Notes
          </label>
          <p className="text-slate-700 dark:text-slate-300 mt-2 font-medium transition-colors duration-300 group-hover:text-slate-800 dark:group-hover:text-slate-200">
            {notes || <span className="italic text-slate-400">No notes</span>}
          </p>
        </div>
      </div>
    </div>
  );
}; 