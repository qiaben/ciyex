import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Calendar, Video, Star, MapPin, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import DoctorCard from '@/components/DoctorCard';
import { Badge } from '@/components/ui/badge';

// Mock doctors data
const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Family Medicine",
    avatarUrl: "/lovable-uploads/8c3b9e58-6953-49cb-a450-3cc945bbbc60.png",
    rating: 4.8,
    languages: ["English", "Spanish"],
    location: "Florida",
    availableTime: "09:00 - 17:00"
  },
  {
    id: 2,
    name: "Dr. Robert Lee",
    specialty: "Emergency Medicine",
    rating: 4.7,
    languages: ["English", "Mandarin"],
    location: "Oregon",
    availableTime: "08:30 - 16:30"
  },
  {
    id: 3,
    name: "Dr. Emily Chen",
    specialty: "Internal Medicine",
    rating: 4.9,
    languages: ["English", "French", "Cantonese"],
    location: "Washington",
    availableTime: "10:00 - 18:00"
  },
  {
    id: 4,
    name: "Naurah Gaspard, FNP-BC",
    specialty: "Family Medicine",
    avatarUrl: "/lovable-uploads/8c3b9e58-6953-49cb-a450-3cc945bbbc60.png",
    rating: 4.9,
    languages: ["English", "Creole", "French"],
    location: "Florida, Oregon, Washington",
    availableTime: "09:00 - 17:00"
  }
];

// Mock services data
const availableServices = [
  {
    id: 1,
    name: 'Annual Physical Examination',
    description: 'Comprehensive yearly check-up to assess your overall health',
    duration: 45,
    price: 120,
    doctorId: 1,
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Family Medicine',
    category: 'primary care',
    insuranceAccepted: ['Blue Cross Blue Shield', 'Aetna', 'Medicare'],
    isOnline: false,
  },
  {
    id: 2,
    name: 'Urgent Care Consultation',
    description: 'For non-emergency medical issues requiring prompt attention',
    duration: 30,
    price: 95,
    doctorId: 2,
    doctorName: 'Dr. Robert Lee',
    specialty: 'Emergency Medicine',
    category: 'urgent care',
    insuranceAccepted: ['Blue Cross Blue Shield', 'Cigna', 'UnitedHealthcare'],
    isOnline: false,
  },
  {
    id: 3,
    name: 'Specialist Referral',
    description: 'Consultation for referral to specialized medical care',
    duration: 30,
    price: 85,
    doctorId: 3,
    doctorName: 'Dr. Emily Chen',
    specialty: 'Internal Medicine',
    category: 'specialist consultation',
    insuranceAccepted: ['Aetna', 'Medicare', 'Medicaid'],
    isOnline: true,
  },
  {
    id: 4,
    name: 'Online COVID-19 visit',
    description: 'Virtual consultation for COVID-19 symptoms and guidance',
    duration: 30,
    price: 75,
    doctorId: 4,
    doctorName: 'Naurah Gaspard, FNP-BC',
    specialty: 'Family Medicine',
    category: 'telehealth',
    insuranceAccepted: ['Blue Cross Blue Shield', 'Aetna', 'Medicare'],
    isOnline: true,
  },
  {
    id: 5,
    name: 'Online STD management consult',
    description: 'Confidential consultation for STD management',
    duration: 30,
    price: 80,
    doctorId: 4,
    doctorName: 'Naurah Gaspard, FNP-BC',
    specialty: 'Family Medicine',
    category: 'telehealth',
    insuranceAccepted: ['Blue Cross Blue Shield', 'Aetna', 'Cigna'],
    isOnline: true,
  },
  {
    id: 6,
    name: 'Online UTI visit',
    description: 'Virtual consultation for urinary tract infection symptoms',
    duration: 20,
    price: 80,
    doctorId: 4,
    doctorName: 'Naurah Gaspard, FNP-BC',
    specialty: 'Family Medicine',
    category: 'telehealth',
    insuranceAccepted: ['Blue Cross Blue Shield', 'Aetna', 'Medicare'],
    isOnline: true,
  },
  {
    id: 7,
    name: 'Online chronic disease consult',
    description: 'Follow-up care for chronic conditions',
    duration: 40,
    price: 90,
    doctorId: 4,
    doctorName: 'Naurah Gaspard, FNP-BC',
    specialty: 'Family Medicine',
    category: 'telehealth',
    insuranceAccepted: ['Blue Cross Blue Shield', 'Aetna', 'Medicare'],
    isOnline: true,
  },
  {
    id: 8,
    name: 'Online diabetes consult',
    description: 'Specialized consultation for diabetes management',
    duration: 40,
    price: 90,
    doctorId: 4,
    doctorName: 'Naurah Gaspard, FNP-BC',
    specialty: 'Family Medicine',
    category: 'telehealth',
    insuranceAccepted: ['Blue Cross Blue Shield', 'Aetna', 'Medicare'],
    isOnline: true,
  },
  {
    id: 9,
    name: 'Online prescription refill visit',
    description: 'Quick consultation for prescription refill requests',
    duration: 15,
    price: 70,
    doctorId: 4,
    doctorName: 'Naurah Gaspard, FNP-BC',
    specialty: 'Family Medicine',
    category: 'telehealth',
    insuranceAccepted: ['Blue Cross Blue Shield', 'Aetna', 'Medicare'],
    isOnline: true,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { y: 10, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } }
};

type MotionDivProps = HTMLMotionProps<"div"> & {
  className?: string;
};

const MotionDiv = motion.div as React.ComponentType<MotionDivProps>;

const PatientServiceBooking = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [showBookingButton, setShowBookingButton] = useState(false);
  const [viewMode, setViewMode] = useState<'doctors' | 'services'>('doctors');
  const [detailsExpanded, setDetailsExpanded] = useState<{[key: number]: boolean}>({});
  
  const categoryList = ['all', ...new Set(availableServices.map(service => service.category))];
  
  const filteredServices = selectedCategory && selectedCategory !== 'all'
    ? availableServices.filter(service => service.category === selectedCategory)
    : availableServices;
    
  const doctorServices = selectedDoctorId 
    ? availableServices.filter(service => service.doctorId === selectedDoctorId)
    : [];
  
  const handleServiceClick = (serviceId: number) => {
    setSelectedServiceId(serviceId === selectedServiceId ? null : serviceId);
    setShowBookingButton(serviceId !== selectedServiceId);
  };
  
  const handleDoctorSelect = (doctorId: number) => {
    setSelectedDoctorId(doctorId);
    setViewMode('services');
    
    // Reset service selection when changing doctors
    setSelectedServiceId(null);
    setShowBookingButton(false);
  };
  
  const toggleDetails = (serviceId: number) => {
    setDetailsExpanded(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };
  
  const backToDoctors = () => {
    setViewMode('doctors');
    setSelectedDoctorId(null);
  };
  
  const handleBookNow = () => {
    toast({
      title: "Booking Process Started",
      description: "Let's complete your appointment details",
    });
    
    // Navigate to intake form tab
    const event = new CustomEvent('bookingStepChange', { detail: { step: 'intake' } });
    document.dispatchEvent(event);
  };

  useEffect(() => {
    const handleBookingStepChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.step) {
        // This would be handled by the parent component
        console.log('Change booking step to:', customEvent.detail.step);
      }
    };
    
    document.addEventListener('bookingStepChange', handleBookingStepChange);
    return () => {
      document.removeEventListener('bookingStepChange', handleBookingStepChange);
    };
  }, []);

  const getSelectedService = () => {
    return availableServices.find(service => service.id === selectedServiceId);
  };

  const getSelectedDoctor = () => {
    return doctors.find(doctor => doctor.id === selectedDoctorId);
  };

  return (
    <div className="py-6 px-4 md:px-8 bg-gradient-to-br from-[#f8fafc] to-[#e0f2fe]">
      {viewMode === 'doctors' ? (
        <MotionDiv 
          initial="hidden"
          animate="show"
          variants={container}
          className="space-y-6"
        >
          <MotionDiv variants={item} className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Find a Healthcare Provider</h2>
            <p className="text-gray-600">Select a provider to view their available services</p>
          </MotionDiv>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <MotionDiv key={doctor.id} variants={item}>
                <Card 
                  className={`healthcare-card cursor-pointer transition-all hover:shadow-md hover:border-healthcare-primary/50`}
                  onClick={() => handleDoctorSelect(doctor.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      {doctor.avatarUrl ? (
                        <img 
                          src={doctor.avatarUrl} 
                          alt={doctor.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-healthcare-secondary flex items-center justify-center">
                          <span className="text-healthcare-primary font-bold text-lg">
                            {doctor.name.split(' ')[0][0] + doctor.name.split(' ')[1][0]}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">{doctor.name}</h3>
                        <p className="text-sm text-gray-500">{doctor.specialty}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-2" />
                        <span>{doctor.rating}/5 rating</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-healthcare-primary mr-2" />
                        <span>{doctor.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-healthcare-primary mr-2" />
                        <span>Available: {doctor.availableTime}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-1">
                      {doctor.languages.map(lang => (
                        <Badge key={lang} variant="outline" className="bg-healthcare-secondary/20 text-healthcare-primary">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button 
                      className="w-full mt-4 bg-healthcare-primary hover:bg-healthcare-primary/90"
                    >
                      View Services
                    </Button>
                  </CardContent>
                </Card>
              </MotionDiv>
            ))}
          </div>
        </MotionDiv>
      ) : (
        <MotionDiv 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6 flex items-start justify-between">
            <Button 
              variant="outline" 
              className="mb-4"
              onClick={backToDoctors}
            >
              ← Back to All Providers
            </Button>
          </div>
          
          {selectedDoctorId && (
            <div className="mb-8">
              {getSelectedDoctor() && (
                <MotionDiv 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row gap-6 items-center md:items-start"
                >
                  <div className="flex-shrink-0">
                    {getSelectedDoctor()?.avatarUrl ? (
                      <img 
                        src={getSelectedDoctor()?.avatarUrl} 
                        alt={getSelectedDoctor()?.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-healthcare-secondary flex items-center justify-center">
                        <span className="text-healthcare-primary font-bold text-2xl">
                          {getSelectedDoctor()?.name?.split(' ')[0]?.[0]}{getSelectedDoctor()?.name?.split(' ')[1]?.[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow text-center md:text-left">
                    <h2 className="text-2xl font-bold text-gray-800">{getSelectedDoctor()?.name}</h2>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 mb-3">
                      <Badge className="bg-healthcare-secondary/50 text-healthcare-primary font-medium">
                        {getSelectedDoctor()?.specialty}
                      </Badge>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="ml-1 text-sm text-gray-600">{getSelectedDoctor()?.rating}/5</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {getSelectedDoctor()?.languages.map(lang => (
                        <span key={lang} className="text-sm text-gray-600 border border-gray-200 rounded-full px-3 py-1">
                          {lang}
                        </span>
                      ))}
                    </div>
                    
                    <p className="mt-4 text-gray-600">
                      <span className="font-medium">Licensed to practice in:</span> {getSelectedDoctor()?.location}
                    </p>
                  </div>
                </MotionDiv>
              )}
            </div>
          )}
          
          <MotionDiv 
            initial="hidden"
            animate="show"
            variants={container}
          >
            <MotionDiv variants={item} className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">Available Services</h2>
              <p className="text-sm text-gray-600">Select a service to schedule an appointment</p>
            </MotionDiv>
            
            <MotionDiv variants={item}>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-6 w-full overflow-auto flex flex-nowrap rounded-xl bg-gray-100/70 p-1">
                  {categoryList.map((category) => (
                    <TabsTrigger 
                      key={category} 
                      value={category}
                      onClick={() => setSelectedCategory(category)}
                      className="capitalize data-[state=active]:bg-healthcare-primary data-[state=active]:text-white data-[state=active]:shadow-md whitespace-nowrap flex-1"
                    >
                      {category.replace('-', ' ')}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <TabsContent value={selectedCategory || 'all'} className="space-y-4">
                  {doctorServices.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gray-50 rounded-lg p-8">
                        <h3 className="text-lg font-medium text-gray-700">No services available</h3>
                        <p className="text-gray-500 mt-2">This provider has not published any services yet.</p>
                      </div>
                    </div>
                  ) : (
                    doctorServices.map((service) => (
                      <MotionDiv 
                        key={service.id}
                        variants={item}
                        layoutId={`service-${service.id}`}
                      >
                        <div 
                          onClick={() => handleServiceClick(service.id)}
                          className={`cursor-pointer border rounded-lg overflow-hidden transition-all ${
                            selectedServiceId === service.id 
                              ? 'border-healthcare-primary bg-healthcare-primary/5 shadow-md' 
                              : 'border-gray-200 hover:border-healthcare-primary/50'
                          }`}
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center mb-1">
                                  {service.isOnline && (
                                    <Video size={16} className="text-blue-500 mr-2" />
                                  )}
                                  <h4 className="font-medium text-lg">{service.name}</h4>
                                </div>
                                <p className="text-gray-600 text-sm">{service.description}</p>
                              </div>
                              <div className="text-right flex flex-col items-end">
                                <span className="font-bold text-xl text-healthcare-primary">${service.price}</span>
                                <p className="text-xs text-gray-500 flex items-center">
                                  <Clock className="inline-block h-3 w-3 mr-1" />
                                  {service.duration} min
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex justify-end mt-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDetails(service.id);
                                }}
                                className="text-sm text-healthcare-primary flex items-center hover:underline"
                              >
                                {detailsExpanded[service.id] ? (
                                  <>
                                    Hide details
                                    <ChevronUp className="ml-1 h-4 w-4" />
                                  </>
                                ) : (
                                  <>
                                    View details
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                  </>
                                )}
                              </button>
                            </div>
                            
                            {(detailsExpanded[service.id] || selectedServiceId === service.id) && (
                              <MotionDiv 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-3 pt-3 border-t border-dashed border-gray-200"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <p className="text-sm text-gray-700">
                                      <span className="font-medium">Provider:</span> {service.doctorName}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                      <span className="font-medium">Specialty:</span> {service.specialty}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-700 font-medium">Accepted Insurance:</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {service.insuranceAccepted.map(insurance => (
                                        <span 
                                          key={insurance}
                                          className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                                        >
                                          {insurance}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </MotionDiv>
                            )}
                          </div>
                          
                          {selectedServiceId === service.id && (
                            <div className="bg-healthcare-primary/10 p-4 flex items-center justify-between">
                              <div className="text-sm">
                                <span className="font-medium">Selected Service:</span> {service.name}
                              </div>
                              <Button 
                                onClick={handleBookNow}
                                className="bg-healthcare-primary hover:bg-healthcare-primary/90"
                              >
                                Continue Booking
                              </Button>
                            </div>
                          )}
                        </div>
                      </MotionDiv>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </MotionDiv>
          </MotionDiv>
        </MotionDiv>
      )}
    </div>
  );
};

export default PatientServiceBooking;
