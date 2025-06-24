"use client"

import React, { useEffect } from 'react';
import Navbar from '@/components/navbar/Navbar';
import HeroSection from '@/components/sections/HeroSection1';
import FeaturesSection from '@/components/sections/FeaturesSection';
import BrandShowcase from '@/components/sections/BrandShowcase';
import ProviderShowcase from '@/components/sections/ProviderShowcase';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import CtaSection from '@/components/sections/CtaSection';
import FooterSection from '@/components/sections/FooterSection';
import ScrollToTop from '@/components/ScrollToTop';
import ScrollAnimator from '@/components/ScrollAnimator';
import { useIsMobile, useBreakpoint } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight, ChevronDown, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Sparkles } from 'lucide-react';
import { HealthGame } from '@/components/sections/HeroSection1';

const FloatingButton = () => (
  <div className="fixed bottom-6 right-6 z-40">
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
    >
      <Button
        size="lg"
        className="rounded-full shadow-lg hover:shadow-xl"
        onClick={() => window.location.href = '/sign-up'}
      >
        Get Started
      </Button>
    </motion.div>
  </div>
);

const containerVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.3,
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

const AnimatedContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-8">
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={containerVariants}
    >
      {children}
    </motion.div>
  </div>
);

const AnimatedDivider = () => (
  <div className="relative w-full h-12 flex items-end justify-center overflow-hidden">
    <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path
        d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
        fill="url(#gradient)"
        opacity="0.7"
      />
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

const Index = () => {
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();
  
  useEffect(() => {
    // Update page title
    document.title = 'OurTopClinic - Healthcare Made Simple';
  }, []);

  // Animation for page elements
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    },
    exit: { opacity: 0 }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <Navbar />
        <HeroSection />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
         <FeaturesSection />
        </motion.div>
        <ProviderShowcase />
        
        {/* Blog preview section */}
        <section className="section-padding">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 text-gray-900 dark:text-gray-100">
                Health <span className="gradient-text dark:bg-gradient-to-r dark:from-emerald-400 dark:to-teal-400 dark:text-transparent dark:bg-clip-text">Knowledge Hub</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
                Stay informed with the latest articles and research on health topics that matter to you.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-14">
              {/* Sleep Disorders Article */}
              <div className="group">
                <div className="bg-white border border-primary/10 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative h-44 w-full overflow-hidden rounded-t-2xl">
                    <img
                      src="https://images.unsplash.com/photo-1511295742362-92c96b1cf484?auto=format&fit=crop&w=600&q=80"
                      alt="Sleep Disorders"
                      className="object-cover w-full h-full"
                    />
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full shadow">
                      Mental Health
                    </span>
                  </div>
                  <div className="p-5 flex flex-col h-full">
                    <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-emerald-700 transition">
                      Sleep Disorders, Insomnia, and Where to Get Help: What You Need to Know
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1">
                      Comprehensive guide to understanding sleep disorders, identifying insomnia symptoms, and finding professional help for better sleep.
                    </p>
                    <a
                      href="https://ourtopclinic.net/blogs/sleep-disorders-insomnia-and-where-to-get-help-what-you-need-to-know/"
                      className="text-emerald-700 hover:underline text-sm font-medium flex items-center mt-auto"
                    >
                      Read more <ChevronRight className="ml-1 h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Virtual Doctor Visits Article */}
              <div className="group">
                <div className="bg-white border border-primary/10 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative h-44 w-full overflow-hidden rounded-t-2xl">
                    <img
                      src="https://media.istockphoto.com/id/1389444871/photo/shot-of-an-unrecognisable-psychologist-sitting-and-using-a-laptop-for-an-online-consultation.jpg?s=612x612&w=0&k=20&c=PmQEgAWeZuxecOeKs8OtD0G-mESODBD1sMEpQtJW63A="
                      alt="Virtual Doctor"
                      className="object-cover w-full h-full"
                    />
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full shadow">
                      General Health
                    </span>
                  </div>
                  <div className="p-5 flex flex-col h-full">
                    <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-emerald-700 transition">
                      Virtual Doctor Visits: How Online Consultations Work
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1">
                      Learn everything about telehealth appointments, from scheduling to what to expect during your virtual medical consultation.
                    </p>
                    <a
                      href="https://ourtopclinic.net/blogs/virtual-doctor-visits-how-online-consultations-work/"
                      className="text-emerald-700 hover:underline text-sm font-medium flex items-center mt-auto"
                    >
                      Read more <ChevronRight className="ml-1 h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Women's Health Article */}
              <div className="group">
                <div className="bg-white border border-primary/10 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative h-44 w-full overflow-hidden rounded-t-2xl">
                    <img
                      src="https://assets.weforum.org/article/image/wjgZ8CcJLdkdhawWWh2g1jwXpdw1mTietuninUIl14M.jpg"
                      alt="Women's Health"
                      className="object-cover w-full h-full"
                    />
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full shadow">
                      Women's Health
                    </span>
                  </div>
                  <div className="p-5 flex flex-col h-full">
                    <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-emerald-700 transition">
                      Women's Health Check-Up Guide: Essential Screenings & Tests
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1">
                      Comprehensive overview of important health screenings and tests every woman should consider at different life stages.
                    </p>
                    <a
                      href="https://ourtopclinic.net/blogs/womens-health-check-up-guide-essential-screenings-tests/"
                      className="text-emerald-700 hover:underline text-sm font-medium flex items-center mt-auto"
                    >
                      Read more <ChevronRight className="ml-1 h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <a
                href="/blog"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition group"
              >
                View All Articles
                <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </section>
        
        {/* Testimonials and Health IQ Challenge side by side */}
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8 my-16">
          <div className="flex-1">
            <TestimonialsSection />
          </div>
          <div className="w-full lg:w-96 flex-shrink-0 mt-32">
            <HealthGame />
          </div>
        </div>
        <CtaSection />
        <FooterSection />
        <ScrollToTop />
        <ScrollAnimator />
        <FloatingButton />
      </motion.div>
    </div>
  );
};

export default Index;
