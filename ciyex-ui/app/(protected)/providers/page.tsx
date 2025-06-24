"use client";
import React, { useState, useEffect } from 'react';
import { motion, HTMLMotionProps, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PatientServiceList from '@/components/PatientServiceList';
import PatientIntakeForm from '@/components/PatientIntakeForm';
import PaymentProcess from '@/components/PaymentProcess';
import { VideoIcon, MapPinIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';
import db from '@/lib/db';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8 } }
};

type MotionDivProps = HTMLMotionProps<"div"> & {
  className?: string;
};

const MotionDiv = motion.div as React.ComponentType<MotionDivProps>;

const PatientServiceBooking = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams?.get('type') === 'inPerson' ? 'inPerson' : 'virtual';
  const [bookingStep, setBookingStep] = useState<'services' | 'intake' | 'payment'>('services');
  const [serviceType, setServiceType] = useState<'virtual' | 'inPerson'>(initialType);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceBooked, setServiceBooked] = useState(false);
  const [intakeCompleted, setIntakeCompleted] = useState(false);
  const [selectedDoctorName, setSelectedDoctorName] = useState<string | undefined>(undefined);
  const [selectedServiceName, setSelectedServiceName] = useState<string | undefined>(undefined);
  const [selectedServiceId, setSelectedServiceId] = useState<number | undefined>(undefined);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>(undefined);
  const [selectedServiceType, setSelectedServiceType] = useState<string | undefined>(undefined);
  const [selectedServiceMode, setSelectedServiceMode] = useState<string | undefined>(undefined);
  const [doctorsList, setDoctorsList] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [intakeData, setIntakeData] = useState<any | null>(null);
  const [serviceAvailability, setServiceAvailability] = useState<Array<{ day: string; from: string; to: string }>>([]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    const handleBookingStepChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.step) {
        setBookingStep(customEvent.detail.step);
      }
    };
    document.addEventListener('bookingStepChange', handleBookingStepChange);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('bookingStepChange', handleBookingStepChange);
    };
  }, []);

  // Fetch service availability when service is selected
  useEffect(() => {
    const fetchServiceAvailability = async () => {
      if (selectedServiceId) {
        try {
          console.log('Fetching availability for service:', selectedServiceId);
          const response = await fetch(`/api/services/${selectedServiceId}`);
          const data = await response.json();
          console.log('Service availability data:', data);
          if (data.success && data.data.availability) {
            setServiceAvailability(data.data.availability);
            console.log('Set availability:', data.data.availability);
          }
        } catch (error) {
          console.error('Error fetching service availability:', error);
        }
      }
    };

    fetchServiceAvailability();
  }, [selectedServiceId]);

  const handleServiceTypeChange = (type: 'virtual' | 'inPerson') => {
    setServiceType(type);
    setBookingStep('services');
    router.replace(`?type=${type}`);
    // Reset booking state when changing service type
    setServiceBooked(false);
    setIntakeCompleted(false);
  };

  // Helper to extract doctors list from services
  const handleServicesLoaded = (services: any[]) => {
    // Extract unique doctors from services
    const doctorMap = new Map();
    services.forEach(service => {
      if (service.doctorId && service.providerName) {
        doctorMap.set(service.doctorId.toString(), { id: service.doctorId.toString(), name: service.providerName });
      }
    });
    setDoctorsList(Array.from(doctorMap.values()));
  };

  console.log('selectedService', selectedService, 'selectedDate', selectedDate, 'selectedTime', selectedTime, 'bookingStep', bookingStep);
  console.log("selectedService for PaymentProcess", selectedService);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8fafc] to-[#e0f2fe] dark:from-gray-900 dark:to-gray-800 relative">
      <main className="flex-grow container mx-auto px-2 md:px-8 py-8">
        <AnimatePresence>
          {isLoading ? (
            <MotionDiv key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center min-h-[60vh]">
              <MotionDiv animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 rounded-full border-4 border-[#10b981] border-t-transparent mx-auto" />
            </MotionDiv>
          ) : (
            <>
              <MotionDiv initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, type: "spring" }} className="mb-6">
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#1e293b] dark:text-gray-100 mb-3 text-center tracking-tight">
                  <span className="text-[#10b981] dark:text-emerald-400 drop-shadow-md">Book</span> Healthcare Services
                </h1>
                <p className="text-[#64748b] dark:text-gray-300 text-center max-w-2xl mx-auto text-lg font-medium">
                  Browse and book appointments with top healthcare professionals for virtual or in-person visits
                </p>
                {/* Only show the toggle if on the 'services' step */}
                {bookingStep === 'services' && (
                  <div className="flex justify-center mt-6">
                    <button
                      type="button"
                      onClick={() => handleServiceTypeChange('virtual')}
                      className={`px-8 py-3 text-base font-semibold rounded-l-xl transition-all duration-300 ${
                        serviceType === 'virtual' 
                          ? 'bg-[#10b981] dark:bg-emerald-500 text-white shadow-lg scale-105' 
                          : 'bg-white dark:bg-gray-800 text-[#10b981] dark:text-emerald-400 border border-[#10b981] dark:border-emerald-500'
                      }`}
                    >
                      <span className="flex items-center">
                        <VideoIcon className="w-5 h-5 mr-2" />
                        Virtual Services
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleServiceTypeChange('inPerson')}
                      className={`px-8 py-3 text-base font-semibold rounded-r-xl transition-all duration-300 ${
                        serviceType === 'inPerson' 
                          ? 'bg-[#10b981] dark:bg-emerald-500 text-white shadow-lg scale-105' 
                          : 'bg-white dark:bg-gray-800 text-[#10b981] dark:text-emerald-400 border border-[#10b981] dark:border-emerald-500 -ml-px'
                      }`}
                    >
                      <span className="flex items-center">
                        <MapPinIcon className="w-5 h-5 mr-2" />
                        In-Person Services
                      </span>
                    </button>
                  </div>
                )}
              </MotionDiv>
              <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, type: "spring" }} className="max-w-5xl mx-auto">
                <MotionDiv variants={item} className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-[#10b981]/10 dark:border-emerald-500/20">
                  <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-800/90 px-2 md:px-8 pt-6 pb-2 rounded-t-3xl shadow-md">
                    <div className="w-full flex items-center justify-between bg-[#f4fdfa] dark:bg-gray-700/50 rounded-full border border-[#10b981]/30 dark:border-emerald-500/30 shadow-sm p-1 mb-6 overflow-x-auto">
                      <button
                        className={`flex-1 py-3 px-6 rounded-full font-bold text-base transition-all duration-300
                          ${bookingStep === 'services'
                            ? 'bg-[#10b981] dark:bg-emerald-500 text-white shadow'
                            : 'bg-transparent text-[#10b981] dark:text-emerald-400 hover:bg-[#e0f2fe] dark:hover:bg-gray-600'}
                          ${bookingStep !== 'services' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => {
                          if (bookingStep === 'services') {
                            setBookingStep('services');
                          } else {
                            alert('You cannot go back from this step.');
                          }
                        }}
                        disabled={bookingStep !== 'services'}
                      >
                        Select Service
                      </button>
                      <button
                        className={`flex-1 py-3 px-6 rounded-full font-bold text-base transition-all duration-300
                          ${bookingStep === 'intake'
                            ? 'bg-[#10b981] dark:bg-emerald-500 text-white shadow'
                            : 'bg-transparent text-[#10b981] dark:text-emerald-400 hover:bg-[#e0f2fe] dark:hover:bg-gray-600'}
                          ${!serviceBooked || bookingStep === 'services' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => {
                          if (serviceBooked && bookingStep !== 'services') {
                            setBookingStep('intake');
                          } else {
                            alert('Please book an appointment first.');
                          }
                        }}
                        disabled={!serviceBooked || bookingStep === 'services'}
                      >
                        Patient Intake
                      </button>
                      <button
                        className={`flex-1 py-3 px-6 rounded-full font-bold text-base transition-all duration-300
                          ${bookingStep === 'payment'
                            ? 'bg-[#10b981] dark:bg-emerald-500 text-white shadow'
                            : 'bg-transparent text-[#10b981] dark:text-emerald-400 hover:bg-[#e0f2fe] dark:hover:bg-gray-600'}
                          ${!intakeCompleted || bookingStep === 'services' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => {
                          if (intakeCompleted && bookingStep !== 'services') {
                            setBookingStep('payment');
                          } else {
                            alert('Please complete the intake form first.');
                          }
                        }}
                        disabled={!intakeCompleted || bookingStep === 'services'}
                      >
                        Payment
                      </button>
                    </div>
                  </div>
                  <div className="p-0 md:p-6 min-h-[500px] bg-gradient-to-br from-white to-[#f0fdf4] dark:from-gray-800 dark:to-gray-900">
                    {bookingStep === 'services' && (
                      <PatientServiceList
                        key={serviceType}
                        serviceType={serviceType}
                        onBook={(doctorId?: string, doctorName?: string, serviceName?: string, serviceId?: number, services?: any[], type?: string, mode?: string) => {
                          if (services && serviceId) {
                            const foundService = services.find(s => s.id === serviceId);
                            setSelectedService(foundService);
                          }
                          setServiceBooked(true);
                          setSelectedDoctorId(doctorId);
                          setSelectedDoctorName(doctorName);
                          setSelectedServiceName(serviceName);
                          setSelectedServiceId(serviceId);
                          setSelectedServiceType(type);
                          setSelectedServiceMode(mode);
                          if (services) handleServicesLoaded(services);
                          setBookingStep('intake');
                        }}
                      />
                    )}
                    {bookingStep === 'intake' && (
                      <PatientIntakeForm
                        onComplete={(formData: any) => {
                          setIntakeCompleted(true);
                          setSelectedDate(formData.appointment_date);
                          setSelectedTime(formData.time);
                          setIntakeData(formData);
                        }}
                        doctorName={selectedDoctorName}
                        serviceName={selectedServiceName}
                        doctorsList={doctorsList}
                        selectedServiceId={selectedServiceId}
                        doctorId={selectedDoctorId}
                        type={selectedServiceType}
                        mode={selectedServiceMode}
                        availability={serviceAvailability}
                      />
                    )}
                    {bookingStep === 'payment' && selectedService && selectedDate && selectedTime && (
                      (() => {
                        // Ensure price is a valid number
                        let price = Number(selectedService.price);
                        if (isNaN(price) || price <= 0) {
                          return (
                            <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center max-w-xl mx-auto mt-8">
                              <h2 className="text-xl font-bold mb-2">Service Price Error</h2>
                              <p>The selected service does not have a valid price. Please go back and select a different service or contact support.</p>
                            </div>
                          );
                        }
                        return (
                          <PaymentProcess
                            intakeData={intakeData}
                            onPaymentSuccess={() => {/* handle payment success */}}
                            serviceDetails={{
                              name: selectedService.service_name || selectedService.name || selectedService.title || "Service",
                              provider: selectedService.providerName,
                              date: selectedDate,
                              time: selectedTime,
                              price: price,
                              tax: 0,
                              total: price
                            }}
                          />
                        );
                      })()
                    )}
                  </div>
                </MotionDiv>
              </MotionDiv>
            </>
          )}
        </AnimatePresence>
      </main>
      <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#10b981]/30 via-[#e0f2fe]/40 to-transparent" />
    </div>
  );
};

export default PatientServiceBooking;
