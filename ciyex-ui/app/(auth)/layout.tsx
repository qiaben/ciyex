import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="w-full md:w-1/2 h-full flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
      <div className="hidden md:flex w-1/2 h-full relative">
        <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer"></div>
          
          <div className="absolute top-0 w-full h-full bg-black/30 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-6">
              <h1 className="text-4xl 2xl:text-6xl font-bold text-white tracking-tight">
                Our Top Clinic
              </h1>
              <div className="h-1 w-20 bg-emerald-400 mx-auto rounded-full"></div>
              <p className="text-emerald-100 text-lg mt-4 max-w-md leading-relaxed">
                Your Health, Our Priority. Experience world-class healthcare with our expert medical professionals.
              </p>
              <div className="flex items-center justify-center space-x-4 mt-8">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-100 text-sm">24/7 Care</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-100 text-sm">Expert Doctors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-100 text-sm">Modern Facility</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;