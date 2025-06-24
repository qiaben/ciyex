
import { Stethoscope, Calendar, User, Plus } from "lucide-react";

export const Diagnosis = () => {
  const diagnoses = [
    {
      id: 1,
      diagnosis: "Diet",
      symptoms: "brufen",
      notes: "dodod",
      doctor: "Harshit Shobhane",
      specialty: "Endocrinology",
      date: "30/5/2025",
      status: "Recent"
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-6 lg:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <Stethoscope className="text-emerald-500 dark:text-emerald-400" size={24} />
            <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100">Diagnosis & Medical Records</h2>
          </div>
          <button className="bg-emerald-100 dark:bg-emerald-900/50 hover:bg-emerald-200 dark:hover:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-lg font-medium transition-all duration-300 border border-emerald-200 dark:border-emerald-700 flex items-center gap-2 w-full sm:w-auto justify-center">
            <Plus size={16} />
            Add Diagnosis
          </button>
        </div>

        <div className="space-y-4">
          {diagnoses.map((item) => (
            <div key={item.id} className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 sm:p-6 border border-emerald-200/60 dark:border-emerald-700/60 hover:border-emerald-300/80 dark:hover:border-emerald-600/80 transition-all duration-300 hover:shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 dark:bg-emerald-900/50 rounded-lg p-2">
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">#{item.id}</span>
                  </div>
                  <div>
                    <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-medium">
                      {item.status}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-slate-800 dark:text-slate-200 font-medium">{item.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Diagnosis</label>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold text-lg">{item.diagnosis}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Symptoms</label>
                    <p className="text-slate-700 dark:text-slate-300">{item.symptoms}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Additional Notes</label>
                    <p className="text-slate-700 dark:text-slate-300">{item.notes}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="text-blue-500 dark:text-blue-400" size={20} />
                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Doctor</label>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">{item.doctor}</p>
                      <p className="text-blue-600 dark:text-blue-400 text-sm">{item.specialty}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-end gap-3">
                <button className="bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900/70 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-blue-200 dark:border-blue-700">
                  View Details
                </button>
                <button className="bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 dark:hover:bg-purple-900/70 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-purple-200 dark:border-purple-700">
                  Edit Record
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
