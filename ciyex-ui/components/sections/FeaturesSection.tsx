import React, { useEffect, useRef } from 'react';
import { 
  UserPlus, 
  Calendar, 
  Video, 
  CreditCard, 
  Pill, 
  TestTube, 
  Sparkles,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: <UserPlus className="h-7 w-7 text-white relative z-10" />,
    title: "Account Creation",
    description: "Create your profile as a patient or healthcare provider in just a few minutes.",
    step: 1,
  },
  {
    icon: <Calendar className="h-7 w-7 text-white relative z-10" />,
    title: "Appointment Booking",
    description: "Book, manage, and receive confirmations for all your medical appointments.",
    step: 2,
  },
  {
    icon: <CreditCard className="h-7 w-7 text-white relative z-10" />,
    title: "Secure Payments",
    description: "Pay for consultations and services through our encrypted payment system.",
    step: 3,
  },
  {
    icon: <Video className="h-7 w-7 text-white relative z-10" />,
    title: "Video Consultations",
    description: "Connect with doctors through high-quality, secure video calls.",
    step: 4,
  },
  {
    icon: <Pill className="h-7 w-7 text-white relative z-10" />,
    title: "Medication Orders",
    description: "Enjoy doorstep delivery of prescriptions through select pharmacy partners.",
    step: 5,
    comingSoon: true,
  },
  {
    icon: <TestTube className="h-7 w-7 text-white relative z-10" />,
    title: "Lab Test Booking",
    description: "Schedule lab tests and access results directly through the platform.",
    step: 6,
  },
];

const FeatureBentoCard = ({ icon, title, description, step, comingSoon, active }: any) => (
  <div
    className={cn(
      "relative group flex flex-col justify-between p-6 rounded-3xl shadow-xl border border-white/20 dark:border-gray-800 bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl transition-all duration-500 overflow-hidden",
      active ? "scale-105 z-10 ring-2 ring-primary/40" : "opacity-60 blur-[1px] hover:opacity-100 hover:blur-0 hover:scale-105",
      comingSoon && "bento-shimmer"
    )}
    style={{ minHeight: 200 }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-accent shadow-lg relative">
        {icon}
      </div>
      <span className="ml-2 text-lg font-bold text-primary/80 dark:text-primary-300">Step {step}</span>
    </div>
    <div>
      <h3 className="text-xl font-bold mb-1 dark:text-white flex items-center">
        {title}
        {comingSoon && (
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-accent to-primary text-white animate-pulse font-semibold">Coming Soon</span>
        )}
      </h3>
      <p className="text-gray-700 dark:text-gray-300 text-base">{description}</p>
    </div>
    {comingSoon && (
      <div className="absolute inset-0 pointer-events-none bento-shimmer-effect" />
    )}
  </div>
);

const FeaturesSection: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState(1);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Step animation
  useEffect(() => {
    let step = 1;
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= features.length) return 1;
        return prev + 1;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="features"
      className="section-padding relative overflow-hidden min-h-[100vh] flex items-center justify-center"
      ref={sectionRef}
    >
      {/* 3D Animated Background removed */}
      {/* <div className="absolute inset-0 z-0">
        <ThreeBackground />
      </div> */}
      {/* Fallback CSS gradient if JS is disabled */}
      <noscript>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
      </noscript>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center mb-12">
          <div className="inline-block relative mb-3">
            <Sparkles className="h-6 w-6 text-primary absolute -top-3 -left-3 animate-pulse-soft" />
            <span className="px-4 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground rounded-full text-sm font-medium">
              Your Healthcare Journey
            </span>
            <Sparkles className="h-6 w-6 text-accent absolute -bottom-3 -right-3 animate-pulse-soft" style={{ animationDelay: '1s' }} />
          </div>
          <h2 className="section-title text-center dark:text-white">
            Step-by-Step <span className="gradient-text">Care</span>
          </h2>
          <p className="section-description text-center dark:text-gray-300 max-w-2xl">
            Experience a seamless, modern healthcare journey. Each step is designed for your convenience and security.
          </p>
        </div>
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 bento-grid">
          {/* Custom bento layout: 1-2-1-2 */}
          <div className="md:col-span-2 lg:col-span-2 row-span-1">
            <FeatureBentoCard {...features[0]} active={activeStep === 1} />
          </div>
          <div className="md:col-span-2 lg:col-span-2 row-span-1">
            <FeatureBentoCard {...features[1]} active={activeStep === 2} />
          </div>
          <div className="md:col-span-2 lg:col-span-2 row-span-1">
            <FeatureBentoCard {...features[2]} active={activeStep === 3} />
          </div>
          <div className="md:col-span-2 lg:col-span-2 row-span-1">
            <FeatureBentoCard {...features[3]} active={activeStep === 4} />
          </div>
          <div className="md:col-span-2 lg:col-span-2 row-span-1">
            <FeatureBentoCard {...features[4]} active={activeStep === 5} />
          </div>
          <div className="md:col-span-2 lg:col-span-2 row-span-1">
            <FeatureBentoCard {...features[5]} active={activeStep === 6} />
          </div>
        </div>
        {/* Progress bar */}
        <div className="flex items-center justify-center mt-10">
          {features.map((f, idx) => (
            <div
              key={f.title}
              className={cn(
                "h-2 w-8 mx-1 rounded-full transition-all duration-500",
                activeStep === idx + 1 ? "bg-primary/80 w-12" : "bg-gray-300 dark:bg-gray-700"
              )}
            />
          ))}
        </div>
      </div>
      {/* Shimmer effect for coming soon */}
      <style jsx>{`
        .bento-shimmer-effect {
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
};

export default FeaturesSection;
