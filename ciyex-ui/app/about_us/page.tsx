"use client"
import React, { useEffect } from 'react';
import Navbar from "../../components/navbar/Navbar";
import FooterSection from "../../components/sections/FooterSection";
import ScrollToTop from "../../components/ScrollToTop";
import ScrollAnimator from "../../components/ScrollAnimator";
import { motion, type MotionProps } from 'framer-motion';
import { Button } from "../../components/ui/button";
import Link from 'next/link';
import { Award, Users, Clock, HeartPulse, ChevronRight, Building, MapPin, Heart, Calendar, Stethoscope, Shield } from 'lucide-react';

type AnimatedDivProps = MotionProps & {
  className?: string;
  children?: React.ReactNode;
};

const AnimatedDiv = motion.div as React.FC<AnimatedDivProps>;

const AboutUs = () => {
  useEffect(() => {
    // Update page title
    document.title = 'About OurTopClinic - Our Story and Mission';
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedDiv 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
                About <span className="gradient-text">OurTopClinic</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Transforming healthcare through innovation, compassion, and excellence since 2023.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium">Patient-Centered Care</span>
                <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium">Innovation</span>
                <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium">Compassion</span>
                <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium">Excellence</span>
              </div>
            </AnimatedDiv>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 border border-primary/20 rounded-full opacity-20 animate-ping-slow"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 border border-primary/20 rounded-full opacity-30 animate-ping-slow" style={{ animationDuration: '15s', animationDelay: '2s' }}></div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-24 md:py-32 bg-white dark:bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedDiv
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="w-full h-full flex items-center justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl transform rotate-3"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <img
                    src="/about_us.png"
                    alt="Compassionate care at OurTopClinic"
                    className="object-cover w-full h-[500px] transform transition duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            </AnimatedDiv>
            
            <AnimatedDiv
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Our Story
                </h2>
                <div className="h-1 w-20 bg-gradient-to-r from-primary to-accent rounded-full"></div>
              </div>
              <div className="space-y-6">
                <motion.p 
                  className="text-gray-600 dark:text-gray-300 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Founded in 2023 by a group of passionate healthcare providers, OurTopClinic was born out of frustration with the broken, impersonal, and often inaccessible healthcare system. As clinicians who have worked on the front lines, we witnessed firsthand how patients were often left behind by bureaucracy, long wait times, and insurance hurdles. We knew there had to be a better way — so we built one.
                </motion.p>
                <motion.p 
                  className="text-gray-600 dark:text-gray-300 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  At OurTopClinic, we are on a mission to transform the way care is delivered. We believe in putting patients first, not paperwork. Our platform was designed to be intuitive, flexible, and personal — whether you are seeking a quick telehealth consultation, long-term wellness care, or support managing chronic conditions, we are here when and how you need us.
                </motion.p>
              </div>
            </AnimatedDiv>
          </div>
        </div>
      </section>
      
      {/* Our Mission Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedDiv
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-16">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Our Mission & Vision
                </h2>
                <div className="h-1 w-20 bg-gradient-to-r from-primary to-accent rounded-full mx-auto"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl transform -rotate-1"></div>
                <div className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm">
                  <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
                  <p className="text-xl text-gray-700 dark:text-gray-200 leading-relaxed">
                    "Connecting you to care that puts you first."
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl transform rotate-1"></div>
                <div className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm">
                  <h3 className="text-2xl font-semibold mb-4">Our Vision</h3>
                  <p className="text-xl text-gray-700 dark:text-gray-200 leading-relaxed">
                    "Making patient-first care the global standard."
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.p 
              className="text-gray-600 dark:text-gray-300 mb-16 text-center max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Unlike most platforms, OurTopClinic is created and led by healthcare professionals who understand what truly matters — compassionate, timely, and personalized care.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: "Provider-Led",
                  description: "Every decision is made with clinical insight and patient outcomes in mind — not just profit margins.",
                  icon: <Stethoscope className="text-primary h-6 w-6" />
                },
                {
                  title: "Accessible Care for All",
                  description: "No insurance? No problem. Our affordable pricing ensures care is within reach.",
                  icon: <Heart className="text-primary h-6 w-6" />
                },
                {
                  title: "Direct Access to Experts",
                  description: "Connect directly with licensed, vetted professionals who care — not bots or outsourced call centers.",
                  icon: <Users className="text-primary h-6 w-6" />
                },
                {
                  title: "Convenient & Simple",
                  description: "From online visits to medication delivery, we simplify healthcare without compromising quality.",
                  icon: <Clock className="text-primary h-6 w-6" />
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * index }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl transform transition-transform duration-500 group-hover:scale-105"></div>
                  <div className="relative bg-white dark:bg-gray-800 p-8 rounded-xl">
                    <div className="flex items-start gap-6">
                      <div className="bg-primary/5 rounded-lg p-3 transition-colors duration-500 group-hover:bg-primary/10">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold mb-3">{item.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedDiv>
        </div>
      </section>
      
      {/* Why Trust Us Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedDiv
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-16">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Why Trust Us
                </h2>
                <div className="h-1 w-20 bg-gradient-to-r from-primary to-accent rounded-full mx-auto"></div>
              </div>
            </div>
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl transform rotate-1"></div>
              <div className="relative bg-white dark:bg-gray-800 p-12 rounded-2xl">
                <div className="space-y-6">
                  <motion.p 
                    className="text-gray-600 dark:text-gray-300 leading-relaxed"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Trust is earned — and we are committed to earning yours every step of the way. OurTopClinic is built on a foundation of clinical integrity, transparency, and accountability. We do not just meet industry standards — we set our own, higher ones.
                  </motion.p>
                  <motion.p 
                    className="text-gray-600 dark:text-gray-300 leading-relaxed"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    We are here because we care. We are not backed by corporations or investors looking for quick returns. We are backed by real providers who saw a need, stepped up, and are now reshaping healthcare with heart.
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </AnimatedDiv>
        </div>
      </section>
      
      {/* Our Values Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <AnimatedDiv
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Core Values</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                These principles guide every decision we make and every interaction we have.
              </p>
            </AnimatedDiv>
          </div>
          
          <AnimatedDiv 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <AnimatedDiv 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover-lift"
              variants={fadeInUp}
            >
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Heart className="text-primary h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Compassion</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We treat each patient with empathy, dignity and respect, recognizing the human aspect of healthcare.
              </p>
            </AnimatedDiv>
            
            <AnimatedDiv 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover-lift"
              variants={fadeInUp}
            >
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Award className="text-primary h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Excellence</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We strive for the highest standards in clinical care, service, and every aspect of our operations.
              </p>
            </AnimatedDiv>
            
            <AnimatedDiv 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover-lift"
              variants={fadeInUp}
            >
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="text-primary h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Integrity</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We uphold honesty, transparency, and ethical behavior in all our interactions and decisions.
              </p>
            </AnimatedDiv>
            
            <AnimatedDiv 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover-lift"
              variants={fadeInUp}
            >
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Stethoscope className="text-primary h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Innovation</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We embrace new ideas, technologies, and approaches to continuously improve healthcare delivery.
              </p>
            </AnimatedDiv>
          </AnimatedDiv>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <AnimatedDiv
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Ready to Experience Better Healthcare?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of patients who have transformed their healthcare experience with OurTopClinic.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" variant="outline" className="group">
                <Link href="/">
                  Back to Home
                  <ChevronRight className="ml-2 h-7 w-7 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" className="gradient-bg group button-3d">
                <Link href="/sign-up">
                  Get Started Today
                  <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </AnimatedDiv>
        </div>
      </section>
      
      <FooterSection />
      <ScrollToTop />
      <ScrollAnimator />
    </div>
  );
};

export default AboutUs;
