'use client';

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";

export function HeroSection() {
  const { isSignedIn, user } = useUser();
  const role = user?.publicMetadata?.role as string || 'patient';

  const getDashboardLink = () => {
    switch (role.toLowerCase()) {
      case 'admin':
        return '/admin';
      case 'doctor':
        return '/doctor';
      case 'patient':
        return '/patient';
      default:
        return '/patient';
    }
  };

  return (
    <section className="w-full py-16 bg-emerald-600 text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Your Health, Our Priority
            </h1>
            <p className="text-xl text-emerald-100 mb-8">
              Experience healthcare reimagined with our digital platform. Connect with expert doctors, get prescriptions, and manage your health - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {isSignedIn ? (
                <Link href={getDashboardLink()}>
                  <Button className="w-full sm:w-auto bg-white text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                    Go to {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/sign-up">
                    <Button className="w-full sm:w-auto bg-white text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                      Book Appointment Now
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white/10 hover:border-white/80 transition-all duration-300"
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
            <div className="mt-8 flex items-center gap-2 text-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
              <span>Trusted by 10,000+ patients</span>
            </div>
          </motion.div>
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ display: 'block' }}
            >
              <div className="aspect-square relative rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80"
                  alt="Doctor consultation"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-sm font-medium">Professional Healthcare</p>
                  <p className="text-xs text-emerald-100">Expert doctors available 24/7</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white text-emerald-600 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ display: 'block' }}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Verified Doctors</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
} 