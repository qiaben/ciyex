import React, { useState, useEffect, useRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Shield, Users, Clock, Award } from 'lucide-react';

interface CounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

const Counter = ({ end, duration = 2, suffix = "", prefix = "" }: CounterProps) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef(0);
  
  useEffect(() => {
    let animationFrameId: number;
    startTimeRef.current = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTimeRef.current) / (duration * 1000), 1);
      const currentCount = Math.floor(progress * end);
      
      if (countRef.current !== currentCount) {
        countRef.current = currentCount;
        setCount(currentCount);
      }
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [end, duration]);
  
  return (
    <div className="text-4xl font-bold">{prefix}{count}{suffix}</div>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  suffix?: string;
  delay?: number;
}

const StatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  suffix = "", 
  delay = 0 
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      style={{
        backgroundColor: 'var(--background)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}
    >
      <div className="mb-4 p-3 bg-primary/10 rounded-full">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <Counter end={value} suffix={suffix} />
      <p className="mt-2 text-gray-600 dark:text-gray-300">{label}</p>
    </motion.div>
  );
};

const StatsSection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-transparent via-secondary/30 to-transparent">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Trusted by Thousands</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            OurTopClinic has helped thousands of patients connect with quality healthcare providers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard 
            icon={Users} 
            value={15643} 
            label="Patients Helped" 
            suffix="+" 
            delay={0.1}
          />
          <StatCard 
            icon={Shield} 
            value={98} 
            label="Satisfaction Rate" 
            suffix="%" 
            delay={0.2}
          />
          <StatCard 
            icon={Clock} 
            value={24} 
            label="Hours Support" 
            delay={0.3}
          />
          <StatCard 
            icon={Award} 
            value={156} 
            label="Expert Doctors" 
            delay={0.4}
          />
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
