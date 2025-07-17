"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Video, Calendar, Sparkles, Heart, Shield, Stethoscope, ChevronRight, Trophy, BadgeCheck, Plus, Activity } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import MovingBar from './MovingBar';
import AnimatedPinDemo from '@/components/3d-pin-demo';
import { getCurrentUserFromToken } from "@/app/utils/auth"; // <-- Custom JWT util

// Create motion button component
const MotionButton = motion(Button);

const HeroSection: React.FC = () => {
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [showRoleButtons, setShowRoleButtons] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | null>(null);

  // JWT session state
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | 'admin' | string>("patient");

  // Fetch JWT user session on mount
  useEffect(() => {
    async function fetchSession() {
      const user = await getCurrentUserFromToken();
      if (user && user.userId) {
        setIsSignedIn(true);
        // Try role: prefer the first or 'patient'
        let role = "patient";
        if (user.roles && user.roles.length > 0) {
          role = (user.roles[0] || "patient").toLowerCase();
        }
        setUserRole(role as any);
      } else {
        setIsSignedIn(false);
      }
    }
    fetchSession();
  }, []);

  // Handle Get Started click
  const handleGetStarted = () => {
    setShowRoleButtons(true);
  };

  // Handle role selection
  const handleRoleSelect = (role: 'patient' | 'doctor') => {
    setSelectedRole(role);
    setIsLoading(true);
    setTimeout(() => {
      if (role === 'patient') {
        window.location.href = '/sign-up?role=patient';
      } else {
        window.location.href = '/sign-up?role=doctor';
      }
    }, 2000);
  };

  // Handle dashboard navigation for signed-in users
  const handleDashboard = () => {
    window.location.href = `/${userRole}`;
  };

  // (Particle background and animation logic unchanged)
  useEffect(() => {
    const animatedElements = document.querySelectorAll('.reveal');
    animatedElements.forEach(el => {
      el.classList.add('active');
    });

    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const resizeCanvas = () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const particles: Particle[] = [];
        const particleCount = 30;

        class Particle {
          x: number; y: number; radius: number; color: string; speedX: number; speedY: number; opacity: number;
          constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.radius = Math.random() * 5 + 1;
            this.color = `hsl(142, ${Math.random() * 50 + 50}%, ${Math.random() * 40 + 40}%)`;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
          }
          update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x + this.radius > canvas.width || this.x - this.radius < 0) this.speedX = -this.speedX;
            if (this.y + this.radius > canvas.height || this.y - this.radius < 0) this.speedY = -this.speedY;
          }
          draw() {
            if (!ctx) return;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color.replace(')', `, ${this.opacity})`);
            ctx.fill();
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
          }
        }
        for (let i = 0; i < particleCount; i++) particles.push(new Particle());
        function connectParticles() {
          if (!ctx) return;
          for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < 150) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(46, 125, 50, ${0.1 * (1 - distance / 150)})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
              }
            }
          }
        }
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          particles.forEach(particle => { particle.update(); particle.draw(); });
          connectParticles();
          animationRef.current = requestAnimationFrame(animate);
        };
        animate();
        return () => {
          window.removeEventListener('resize', resizeCanvas);
          if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
      }
    }
  }, []);

  return (
      <section id="hero" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0"
            style={{ background: 'linear-gradient(to bottom, rgba(46, 125, 50, 0.1), rgba(0, 0, 0, 0))' }}
        />

        {/* Moving Bar */}
        <div className="absolute top-0 left-0 right-0 z-10 mt-28">
          <MovingBar />
        </div>

        {/* Loading Screen */}
        <AnimatePresence>
          {isLoading && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center"
              >
                <div className="text-center">
                  <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className="mb-6"
                  >
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                      <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
                      />
                    </div>
                  </motion.div>
                  <motion.h2
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2"
                  >
                    Setting up your {selectedRole} account...
                  </motion.h2>
                  <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-gray-600 dark:text-gray-400"
                  >
                    Please wait while we prepare your registration form
                  </motion.p>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* Hero content */}
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center relative z-10 mt-20">
          <div className="w-full lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 reveal scroll-animation-1 relative inline-block">
            <span className="absolute -left-8 -top-6 text-primary/30 dark:text-primary/20 animate-pulse-soft">
              <Sparkles className="h-6 w-6" />
            </span>
              Your Health. <span className="gradient-text relative">
              Our Priority.
              <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 3C50 0.5 150 0.5 200 3" stroke="url(#paint0_linear)" strokeWidth="5" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="paint0_linear" x1="0" y1="3" x2="200" y2="3" gradientUnits="userSpaceOnUse">
                    <stop stopColor="hsl(var(--primary))" stopOpacity="0" />
                    <stop offset="0.5" stopColor="hsl(var(--primary))" />
                    <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
              <span className="absolute -right-8 -bottom-4 text-accent/30 dark:text-accent/20 animate-bounce-gentle">
              <Sparkles className="h-6 w-6" />
            </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0 reveal scroll-animation-2 relative">
              Connect with top doctors, book appointments, and get the care you deserve — all in one secure platform.
              <span className="absolute -right-4 bottom-0 animate-pulse-soft text-primary/30 dark:text-primary/20" style={{ animationDelay: '1.5s' }}>
              <Sparkles className="h-5 w-5" />
            </span>
            </p>
            <div className="flex justify-center lg:justify-start gap-3 reveal scroll-animation-3">
              <AnimatePresence mode="wait">
                {isSignedIn ? (
                    <MotionButton
                        size="lg"
                        className="gradient-bg group button-3d"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDashboard}
                        key="dashboard"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                  <span className="flex items-center">
                    Welcome
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                    </MotionButton>
                ) : showRoleButtons ? (
                    <>
                      <MotionButton
                          size="lg"
                          className="gradient-bg group button-3d"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRoleSelect('patient')}
                          key="patient"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                      >
                    <span className="flex items-center">
                      Patient
                      <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                      </MotionButton>
                      <MotionButton
                          size="lg"
                          className="gradient-bg group button-3d"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRoleSelect('doctor')}
                          key="doctor"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                      >
                    <span className="flex items-center">
                      Doctor
                      <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                      </MotionButton>
                    </>
                ) : (
                    <MotionButton
                        size="lg"
                        className="gradient-bg group button-3d"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleGetStarted}
                        key="get-started"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                  <span className="flex items-center">
                    Get Started
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                    </MotionButton>
                )}
              </AnimatePresence>
            </div>
            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4 reveal scroll-animation-3" style={{ transitionDelay: '0.7s' }}>
              <div className="bg-white/30 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 animate-fade-in">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">HIPAA Compliant</span>
              </div>
              <div className="bg-white/30 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Top Rated Doctors</span>
              </div>
              <div className="bg-white/30 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Heart className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">24/7 Support</span>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex justify-center">
            <AnimatePresence mode="wait">
              {/* 3D Pin Demo Component */}
              <AnimatedPinDemo />
            </AnimatePresence>
          </div>
        </div>
        {/* Floating medical symbols with enhanced animations */}
        <div className="absolute bottom-10 left-10 w-32 h-32 opacity-20 animate-spin-slow rounded-full border border-primary dark:border-primary/40 z-10"></div>
        <div className="absolute top-20 right-20 w-24 h-24 opacity-10 animate-spin-slow rounded-full border-2 border-accent dark:border-accent/40 z-10" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
      </section>
  );
};

export default HeroSection;

// Example placeholder definition
const HealthGame = () => {
    return <div>Health Game Coming Soon...</div>;
};

export { HealthGame };

