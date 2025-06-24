
import { FileText, Calendar, User } from "lucide-react";

export const MedicalHistory = () => {
  const historyItems = [
    {
      id: 1,
      date: "Fri May 30, 2025, 4:15:30 PM",
      doctor: "Harshit Shobhane",
      diagnosis: "I Found",
      labTest: "No lab test",
      status: "recent"
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-6 lg:p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <FileText className="text-emerald-500 dark:text-emerald-400" size={24} />
          <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100">Medical History</h2>
        </div>

        <div className="space-y-4">
          {historyItems.map((item) => (
            <div key={item.id} className="bg-gradient-to-r from-emerald-50/50 to-blue-50/50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl p-4 sm:p-6 border border-emerald-200/60 dark:border-emerald-700/60 hover:border-emerald-300/80 dark:hover:border-emerald-600/80 transition-all duration-300 hover:shadow-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-start lg:items-center">
                <div className="text-center lg:text-left">
                  <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">No</label>
                  <p className="text-slate-800 dark:text-slate-200 font-bold text-lg">{item.id}</p>
                </div>
                
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Date & Time</label>
                  <p className="text-slate-800 dark:text-slate-200 font-medium text-sm">{item.date}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="text-blue-500 dark:text-blue-400" size={16} />
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Doctor</label>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">{item.doctor}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Diagnosis</label>
                  <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full text-sm font-medium inline-block mt-1">
                    {item.diagnosis}
                  </span>
                </div>
                
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Lab Test</label>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{item.labTest}</p>
                </div>
                
                <div className="text-left lg:text-right">
                  <button className="bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900/70 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 border border-blue-200 dark:border-blue-700">
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state for additional history */}
        <div className="mt-6 sm:mt-8 text-center py-8 sm:py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <FileText className="text-slate-400 dark:text-slate-500 mx-auto mb-4" size={48} />
          <p className="text-slate-600 dark:text-slate-400 mb-4">No additional medical history found</p>
          <button className="bg-emerald-100 dark:bg-emerald-900/50 hover:bg-emerald-200 dark:hover:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-lg font-medium transition-all duration-300 border border-emerald-200 dark:border-emerald-700">
            Add Medical Record
          </button>
        </div>
      </div>
    </div>
  );
};
