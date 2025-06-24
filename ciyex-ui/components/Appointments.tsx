
import { Calendar, Clock, Plus, Activity } from "lucide-react";

export const Appointments = () => {
  const appointments = [
    {
      id: 1,
      date: "Jul 10, 2025",
      time: "11:00 AM",
      status: "Scheduled",
      notes: "Regular checkup"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl 
                     border border-slate-200/60 dark:border-slate-700/60 p-6 lg:p-8 
                     shadow-xl hover:shadow-2xl transition-all duration-700">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 
                           dark:from-blue-900/40 dark:to-blue-800/40">
              <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">
              Appointment Information
            </h2>
          </div>
          <button className="bg-blue-500/20 hover:bg-blue-500/30 dark:bg-blue-500/30 dark:hover:bg-blue-500/40 
                           text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200
                           px-6 py-3 rounded-xl font-semibold transition-all duration-300 
                           border border-blue-300/50 dark:border-blue-500/30 
                           hover:border-blue-400/70 dark:hover:border-blue-400/50
                           flex items-center gap-2 hover:scale-105 shadow-lg hover:shadow-xl">
            <Plus size={18} />
            Schedule New
          </button>
        </div>

        <div className="space-y-6">
          {appointments.map((appointment) => (
            <div key={appointment.id} 
                 className="bg-gradient-to-r from-slate-50 to-slate-100/50 
                           dark:from-slate-800/50 dark:to-slate-700/30 
                           rounded-2xl p-6 lg:p-8 
                           border border-slate-300/40 dark:border-slate-600/30 
                           hover:border-slate-400/60 dark:hover:border-slate-500/50 
                           transition-all duration-500 hover:shadow-xl 
                           hover:scale-[1.02] group">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-center">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 
                                   uppercase tracking-wider font-semibold">
                    Appointment #
                  </label>
                  <p className="text-slate-800 dark:text-slate-100 font-bold text-lg mt-1 
                               transition-colors duration-300 group-hover:text-slate-900 dark:group-hover:text-white">
                    #{appointment.id}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/40">
                    <Calendar className="text-emerald-600 dark:text-emerald-400" size={18} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 
                                     uppercase tracking-wider font-semibold">
                      Date
                    </label>
                    <p className="text-slate-800 dark:text-slate-100 font-bold mt-1 
                                 transition-colors duration-300 group-hover:text-slate-900 dark:group-hover:text-white">
                      {appointment.date}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100/80 dark:bg-blue-900/40">
                    <Clock className="text-blue-600 dark:text-blue-400" size={18} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 
                                     uppercase tracking-wider font-semibold">
                      Time
                    </label>
                    <p className="text-slate-800 dark:text-slate-100 font-bold mt-1 
                                 transition-colors duration-300 group-hover:text-slate-900 dark:group-hover:text-white">
                      {appointment.time}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="bg-emerald-500/90 dark:bg-emerald-500/80 
                                 text-white dark:text-emerald-50 
                                 px-4 py-2 rounded-full text-sm font-bold 
                                 border border-emerald-400/50 dark:border-emerald-500/30
                                 shadow-lg hover:shadow-xl transition-all duration-300
                                 hover:scale-105">
                    {appointment.status}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-300/50 dark:border-slate-600/30">
                <label className="text-xs text-slate-500 dark:text-slate-400 
                                 uppercase tracking-wider font-semibold">
                  Additional Notes
                </label>
                <p className="text-slate-700 dark:text-slate-300 mt-2 font-medium 
                             transition-colors duration-300 group-hover:text-slate-800 dark:group-hover:text-slate-200">
                  {appointment.notes}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Vital Signs Section */}
        <div className="mt-12 pt-8 border-t border-slate-300/50 dark:border-slate-600/30">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 
                             dark:from-purple-900/40 dark:to-purple-800/40">
                <Activity className="text-purple-600 dark:text-purple-400" size={22} />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100">
                Vital Signs
              </h3>
            </div>
            <button className="bg-purple-500/20 hover:bg-purple-500/30 dark:bg-purple-500/30 dark:hover:bg-purple-500/40 
                             text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200
                             px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 
                             border border-purple-300/50 dark:border-purple-500/30 
                             hover:border-purple-400/70 dark:hover:border-purple-400/50
                             hover:scale-105 shadow-lg hover:shadow-xl">
              + Add Vital Signs
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30 
                           rounded-2xl p-6 border border-red-200/60 dark:border-red-700/40 
                           hover:border-red-300/80 dark:hover:border-red-600/60 
                           transition-all duration-500 hover:shadow-xl hover:scale-105">
              <p className="text-sm text-red-700 dark:text-red-300 uppercase tracking-wide font-semibold mb-2">
                Body Temperature
              </p>
              <p className="text-3xl font-bold text-red-800 dark:text-red-200 transition-colors duration-300">
                98.6°F
              </p>
            </div>
            
            <div className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 
                           rounded-2xl p-6 border border-blue-200/60 dark:border-blue-700/40 
                           hover:border-blue-300/80 dark:hover:border-blue-600/60 
                           transition-all duration-500 hover:shadow-xl hover:scale-105">
              <p className="text-sm text-blue-700 dark:text-blue-300 uppercase tracking-wide font-semibold mb-2">
                Blood Pressure
              </p>
              <p className="text-3xl font-bold text-blue-800 dark:text-blue-200 transition-colors duration-300">
                120/80 mmHg
              </p>
            </div>
            
            <div className="group bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/30 
                           rounded-2xl p-6 border border-emerald-200/60 dark:border-emerald-700/40 
                           hover:border-emerald-300/80 dark:hover:border-emerald-600/60 
                           transition-all duration-500 hover:shadow-xl hover:scale-105">
              <p className="text-sm text-emerald-700 dark:text-emerald-300 uppercase tracking-wide font-semibold mb-2">
                Heart Rate
              </p>
              <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-200 transition-colors duration-300">
                75 bpm
              </p>
            </div>
            
            <div className="group bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/30 
                           rounded-2xl p-6 border border-amber-200/60 dark:border-amber-700/40 
                           hover:border-amber-300/80 dark:hover:border-amber-600/60 
                           transition-all duration-500 hover:shadow-xl hover:scale-105">
              <p className="text-sm text-amber-700 dark:text-amber-300 uppercase tracking-wide font-semibold mb-2">
                Weight
              </p>
              <p className="text-3xl font-bold text-amber-800 dark:text-amber-200 transition-colors duration-300">
                75 kg
              </p>
            </div>
            
            <div className="group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 
                           rounded-2xl p-6 border border-purple-200/60 dark:border-purple-700/40 
                           hover:border-purple-300/80 dark:hover:border-purple-600/60 
                           transition-all duration-500 hover:shadow-xl hover:scale-105">
              <p className="text-sm text-purple-700 dark:text-purple-300 uppercase tracking-wide font-semibold mb-2">
                Height
              </p>
              <p className="text-3xl font-bold text-purple-800 dark:text-purple-200 transition-colors duration-300">
                170 cm
              </p>
            </div>
            
            <div className="group bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/30 
                           rounded-2xl p-6 border border-indigo-200/60 dark:border-indigo-700/40 
                           hover:border-indigo-300/80 dark:hover:border-indigo-600/60 
                           transition-all duration-500 hover:shadow-xl hover:scale-105">
              <p className="text-sm text-indigo-700 dark:text-indigo-300 uppercase tracking-wide font-semibold mb-2">
                BMI
              </p>
              <p className="text-3xl font-bold text-indigo-800 dark:text-indigo-200 transition-colors duration-300">
                25.95 
                <span className="text-amber-600 dark:text-amber-400 text-base font-medium ml-2">
                  Overweight
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
