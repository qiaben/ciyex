"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Stethoscope, Video, CheckCircle2, ArrowRight } from 'lucide-react';

const services = [
  {
    icon: Stethoscope,
    title: "Lab Orders",
    description: "Quick and easy lab test ordering from trusted providers",
    image: "/test.jpg"
  },
  {
    icon: Video,
    title: "Video Consultations",
    description: "Connect with healthcare providers from the comfort of your home",
    image: "/video3.jpg"
  },
];

const features = [
  "Easy Service Management",
  "Secure Patient Data",
  "24/7 Support",
  "Real-time Updates",
  "Automated Scheduling",
  "Integrated Payments"
];

const ProviderShowcase = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-accent/5 dark:bg-accent/10 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <div className="min-h-[80vh] flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex-1 text-center lg:text-left"
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground text-sm font-medium mb-6"
            >
              Healthcare Services
            </motion.span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Transforming <span className="gradient-text">Healthcare</span> Experience
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg sm:text-xl md:text-2xl mb-8 max-w-2xl mx-auto lg:mx-0">
              Experience seamless healthcare services with our integrated platform, connecting you to trusted providers and advanced medical solutions.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center lg:justify-start gap-4"
            >
              {features.slice(0, 3).map((feature, index) => (
                <motion.div
                  key={feature}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/40 backdrop-blur-md border border-gray-100 dark:border-gray-700 shadow-lg"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Simple Image */}
          <div className="relative w-full lg:w-[600px] h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]">
            <Image
              src="/landing.png"
              alt="Healthcare Provider"
              fill
              className="object-contain transition-all duration-300 dark:brightness-110"
              quality={100}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProviderShowcase; 