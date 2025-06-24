
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Heart, Thermometer, Activity } from "lucide-react";

export const VitalSigns = () => {
  const bloodPressureData = [
    { time: "00:00", systolic: 120, diastolic: 80 },
    { time: "06:00", systolic: 118, diastolic: 78 },
    { time: "12:00", systolic: 125, diastolic: 82 },
    { time: "18:00", systolic: 122, diastolic: 79 },
    { time: "24:00", systolic: 120, diastolic: 80 },
  ];

  const heartRateData = [
    { time: "00:00", rate: 72 },
    { time: "06:00", rate: 68 },
    { time: "12:00", rate: 75 },
    { time: "18:00", rate: 73 },
    { time: "24:00", rate: 70 },
  ];

  const vitalSigns = [
    {
      name: "Blood Pressure",
      value: "120/80",
      unit: "mmHg",
      icon: Activity,
      bgColor: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30",
      iconColor: "text-red-600 dark:text-red-400",
      status: "Normal",
      statusColor: "bg-emerald-500/90 text-white dark:bg-emerald-600",
      borderColor: "border-red-200/60 dark:border-red-700/40",
    },
    {
      name: "Heart Rate",
      value: "75",
      unit: "bpm",
      icon: Heart,
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      status: "Normal",
      statusColor: "bg-emerald-500/90 text-white dark:bg-emerald-600",
      borderColor: "border-emerald-200/60 dark:border-emerald-700/40",
    },
    {
      name: "Temperature",
      value: "98.6°F",
      unit: "",
      icon: Thermometer,
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      status: "Normal",
      statusColor: "bg-emerald-500/90 text-white dark:bg-emerald-600",
      borderColor: "border-blue-200/60 dark:border-blue-700/40",
    },
    {
      name: "Oxygen Sat",
      value: "98%",
      unit: "",
      icon: Activity,
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      status: "Normal",
      statusColor: "bg-emerald-500/90 text-white dark:bg-emerald-600",
      borderColor: "border-purple-200/60 dark:border-purple-700/40",
    },
    {
      name: "Weight",
      value: "75 kg",
      unit: "",
      icon: Activity,
      bgColor: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      status: "Normal",
      statusColor: "bg-emerald-500/90 text-white dark:bg-emerald-600",
      borderColor: "border-amber-200/60 dark:border-amber-700/40",
    },
    {
      name: "Height",
      value: "170 cm",
      unit: "",
      icon: Activity,
      bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      status: "Normal",
      statusColor: "bg-emerald-500/90 text-white dark:bg-emerald-600",
      borderColor: "border-indigo-200/60 dark:border-indigo-700/40",
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Vital Signs Cards with Advanced Animations */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
        {vitalSigns.map((vital, index) => {
          const Icon = vital.icon;
          return (
            <div
              key={vital.name}
              className={`
                group relative overflow-hidden
                bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl 
                rounded-2xl border ${vital.borderColor}
                p-4 lg:p-6 shadow-lg hover:shadow-2xl 
                transition-all duration-700 ease-out
                hover:scale-[1.03] hover:-translate-y-1
                animate-fade-in
              `}
              style={{ 
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              {/* Animated Background Gradient */}
              <div className={`
                absolute inset-0 ${vital.bgColor} opacity-40 dark:opacity-60
                transition-opacity duration-500 group-hover:opacity-60 dark:group-hover:opacity-80
              `}></div>
              
              {/* Floating Animation Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-slate-600/10 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-700 
                            animate-pulse"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`
                    p-3 rounded-xl ${vital.bgColor} 
                    transform transition-transform duration-500 
                    group-hover:scale-110 group-hover:rotate-3
                    shadow-lg group-hover:shadow-xl
                  `}>
                    <Icon size={20} className={`${vital.iconColor} transition-colors duration-300`} />
                  </div>
                  <span className={`
                    text-xs font-semibold px-3 py-1.5 rounded-full ${vital.statusColor}
                    transform transition-all duration-300 group-hover:scale-105
                    shadow-sm group-hover:shadow-md
                  `}>
                    {vital.status}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium transition-colors duration-300">
                    {vital.name}
                  </p>
                  <p className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100 
                              tracking-tight transition-all duration-300 group-hover:text-slate-900 dark:group-hover:text-white">
                    {vital.value}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
                    {vital.unit}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Charts with Creative Animations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Heart Rate Chart */}
        <div className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl 
                       border border-slate-200/60 dark:border-slate-700/60 
                       p-6 lg:p-8 shadow-xl hover:shadow-2xl 
                       transition-all duration-700 hover:scale-[1.02] 
                       animate-fade-in overflow-hidden relative">
          
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-pink-50/30 
                         dark:from-red-900/10 dark:to-pink-900/10 
                         opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 
                             dark:from-red-900/40 dark:to-red-800/40 
                             transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <Heart className="text-red-600 dark:text-red-400 transition-colors duration-300" size={24} />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100 
                           transition-colors duration-300">
                Heart Rate Trend
              </h3>
            </div>
            
            <div className="h-64 lg:h-80 relative">
              {/* Chart Container with Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 
                             dark:from-red-400/10 dark:to-pink-400/10 
                             rounded-2xl opacity-0 group-hover:opacity-100 
                             transition-opacity duration-700 blur-sm"></div>
              
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={heartRateData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="heartRateGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="currentColor" 
                    className="text-slate-200 dark:text-slate-700" 
                    opacity={0.3}
                  />
                  <XAxis 
                    dataKey="time" 
                    stroke="currentColor" 
                    className="text-slate-600 dark:text-slate-400"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="currentColor" 
                    className="text-slate-600 dark:text-slate-400"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                      backdropFilter: 'blur(20px)',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    fill="url(#heartRateGradient)"
                    dot={{ fill: '#ef4444', strokeWidth: 3, r: 5, filter: 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))' }}
                    activeDot={{ 
                      r: 8, 
                      stroke: '#ef4444', 
                      strokeWidth: 3, 
                      fill: '#ffffff',
                      filter: 'drop-shadow(0 4px 8px rgba(239, 68, 68, 0.4))'
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Blood Pressure Chart */}
        <div className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl 
                       border border-slate-200/60 dark:border-slate-700/60 
                       p-6 lg:p-8 shadow-xl hover:shadow-2xl 
                       transition-all duration-700 hover:scale-[1.02] 
                       animate-fade-in overflow-hidden relative">
          
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 
                         dark:from-blue-900/10 dark:to-indigo-900/10 
                         opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 
                             dark:from-blue-900/40 dark:to-blue-800/40 
                             transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <Activity className="text-blue-600 dark:text-blue-400 transition-colors duration-300" size={24} />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100 
                           transition-colors duration-300">
                Blood Pressure
              </h3>
            </div>
            
            <div className="h-64 lg:h-80 relative">
              {/* Chart Container with Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 
                             dark:from-blue-400/10 dark:to-indigo-400/10 
                             rounded-2xl opacity-0 group-hover:opacity-100 
                             transition-opacity duration-700 blur-sm"></div>
              
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bloodPressureData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="systolicGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="diastolicGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="currentColor" 
                    className="text-slate-200 dark:text-slate-700" 
                    opacity={0.3}
                  />
                  <XAxis 
                    dataKey="time" 
                    stroke="currentColor" 
                    className="text-slate-600 dark:text-slate-400"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="currentColor" 
                    className="text-slate-600 dark:text-slate-400"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                      backdropFilter: 'blur(20px)',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="systolic" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Systolic"
                    fill="url(#systolicGradient)"
                    dot={{ fill: '#3b82f6', strokeWidth: 3, r: 5 }}
                    activeDot={{ 
                      r: 8, 
                      stroke: '#3b82f6', 
                      strokeWidth: 3, 
                      fill: '#ffffff',
                      filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.4))'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="diastolic" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Diastolic"
                    fill="url(#diastolicGradient)"
                    dot={{ fill: '#10b981', strokeWidth: 3, r: 5 }}
                    activeDot={{ 
                      r: 8, 
                      stroke: '#10b981', 
                      strokeWidth: 3, 
                      fill: '#ffffff',
                      filter: 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.4))'
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Additional Metrics */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl 
                     border border-slate-200/60 dark:border-slate-700/60 
                     p-6 lg:p-8 shadow-xl hover:shadow-2xl 
                     transition-all duration-700 animate-fade-in">
        <h3 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 lg:mb-8">
          Recent Measurements
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-100 
                         dark:from-blue-900/20 dark:to-indigo-900/30 
                         rounded-2xl border border-blue-200/60 dark:border-blue-700/40 
                         hover:shadow-lg transition-all duration-500 hover:scale-105">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold mb-3 
                         transition-colors duration-300">BMI</p>
            <p className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-1 
                         transition-colors duration-300">24.7</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 transition-colors duration-300">
              Normal Range
            </p>
          </div>
          
          <div className="group p-6 bg-gradient-to-br from-emerald-50 to-green-100 
                         dark:from-emerald-900/20 dark:to-green-900/30 
                         rounded-2xl border border-emerald-200/60 dark:border-emerald-700/40 
                         hover:shadow-lg transition-all duration-500 hover:scale-105">
            <p className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold mb-3 
                         transition-colors duration-300">Last Checkup</p>
            <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-200 mb-1 
                         transition-colors duration-300">May 30</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 transition-colors duration-300">
              2025
            </p>
          </div>
          
          <div className="group p-6 bg-gradient-to-br from-purple-50 to-violet-100 
                         dark:from-purple-900/20 dark:to-violet-900/30 
                         rounded-2xl border border-purple-200/60 dark:border-purple-700/40 
                         hover:shadow-lg transition-all duration-500 hover:scale-105 
                         sm:col-span-2 lg:col-span-1">
            <p className="text-sm text-purple-700 dark:text-purple-300 font-semibold mb-3 
                         transition-colors duration-300">Next Appointment</p>
            <p className="text-3xl font-bold text-purple-800 dark:text-purple-200 mb-1 
                         transition-colors duration-300">Jun 15</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 transition-colors duration-300">
              2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
