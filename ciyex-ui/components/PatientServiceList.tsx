import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { 
  Video, 
  MapPin, 
  Star, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Search,
  Filter,
  MapPinIcon,
  Building,
  UserRound
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';

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

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } }
};

type PatientServiceListProps = {
  serviceType: 'virtual' | 'inPerson';
  onBook?: (
    doctorId?: string,
    doctorName?: string,
    serviceName?: string,
    serviceId?: number,
    services?: any[],
    type?: string,
    mode?: string
  ) => void;
};

// Define properly typed motion components
const MotionDiv = motion.div as React.ComponentType<HTMLMotionProps<'div'> & { className?: string }>;
const MotionH3 = motion.h3 as React.ComponentType<HTMLMotionProps<'h3'> & { className?: string }>;

const PatientServiceList: React.FC<PatientServiceListProps> = ({ serviceType, onBook }) => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState<{[key: number]: boolean}>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [selectedInsurance, setSelectedInsurance] = useState<string | null>(null);
  const [serviceDisplayMode, setServiceDisplayMode] = useState<'list' | 'grid'>('list');
  const [inPersonViewMode, setInPersonViewMode] = useState<'services' | 'doctors'>('doctors');
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    setHasMounted(true);
    setLoading(true);
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setServices(data.data);
        }
        setLoading(false);
      });
  }, []);

  // Filter by type
  const filteredServices = services.filter(service =>
    service.mode === (serviceType === 'virtual' ? 'virtual' : 'inperson')
  );

  // Only render loading state until data is fetched and component is mounted
  if (!hasMounted || loading) {
    return <div className="p-8 text-center text-gray-500">Loading services...</div>;
  }
  if (!filteredServices.length) {
    return <div className="p-8 text-center text-gray-500">No services found.</div>;
  }

  const handleServiceClick = (serviceId: number) => {
    setSelectedServiceId(serviceId === selectedServiceId ? null : serviceId);
  };
  
  const handleDoctorSelect = (doctorId: string | null) => {
    setSelectedDoctorId(doctorId);
    
    // Reset service selection when changing doctors
    setSelectedServiceId(null);
  };
  
  const toggleDetails = (serviceId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setDetailsExpanded(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };
  
  const handleBookNow = (serviceId: number) => {
    setSelectedServiceId(serviceId);
    const service = services.find(s => s.id === serviceId);
    const doctorId = service?.doctor_id || service?.doctorId?.toString();
    const doctorName = service?.providerName || service?.doctorName || service?.name;
    const serviceName = service?.service_name;
    const type = service?.type || 'regular';
    const mode = service?.mode || (serviceType === 'virtual' ? 'virtual' : 'inperson');

    if (!doctorId) {
      toast({
        title: "Error",
        description: "Could not find doctor information. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (onBook) onBook(doctorId, doctorName, serviceName, serviceId, services, type, mode);
  };

  const getSelectedService = () => {
    return services.find(service => service.id === selectedServiceId);
  };

  const getDoctorById = (id: string) => {
    return services.find(service => service.doctorId?.toString() === id);
  };
  
  // Get services by doctor id
  const getServicesByDoctorId = (doctorId: string) => {
    return services.filter(service => service.doctorId?.toString() === doctorId);
  };
  
  // Calculate how many services a doctor offers
  const getServiceCountByDoctor = (doctorId: number) => {
    return services.filter(service => service.doctorId === doctorId).length;
  };
  
  // Function to handle booking from doctor card
  const handleBookDoctorService = (doctor: any) => {
    const id = doctor.providerName || doctor.doctorName || doctor.name;
    setSelectedDoctorId(id);
    if (serviceType === 'inPerson') {
      setInPersonViewMode('services');
    }
  };

  // Render functions
  const renderDoctorInitials = (name?: string) => {
    if (!name) return 'DR';
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  // Group filteredServices by doctor for doctor cards
  const getUniqueDoctorsWithServices = () => {
    const doctorMap = new Map();
    filteredServices.forEach(service => {
      const id = (service.doctorId ? service.doctorId.toString() : (service.providerName || service.doctorName || service.name));
      if (!id) return;
      if (!doctorMap.has(id)) {
        doctorMap.set(id, { doctor: service, services: [service] });
      } else {
        doctorMap.get(id).services.push(service);
      }
    });
    return Array.from(doctorMap.values());
  };
    
  // Update renderDoctorCard to accept doctor and services
  const renderDoctorCard = (doctorObj: { doctor: any, services: any[] }) => {
    const { doctor, services } = doctorObj;
    const serviceCount = services.length;
    const initials = renderDoctorInitials(doctor.providerName || doctor.doctorName || doctor.name);
    // Working days logic
    const allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const availableDays = Array.isArray(doctor.availability) ? doctor.availability.map((a: any) => a.day) : [];
    const isAllWeek = allDays.every(day => availableDays.includes(day));
    return (
      <Card className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 p-0">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {doctor.avatarUrl ? (
              <img
                src={doctor.avatarUrl}
                alt={doctor.providerName || doctor.doctorName || doctor.name}
                className="w-20 h-20 rounded-full object-cover shadow"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#e0f2fe] to-[#f0fdf4] flex items-center justify-center shadow">
                <span className="text-[#10b981] font-bold text-2xl">
                  {initials}
                </span>
              </div>
            )}
          </div>
          {/* Info */}
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  Dr. {doctor.providerName || doctor.doctorName || doctor.name}
                </h2>
                {services[0]?.doctor?.specialization && (
                  <span className="inline-block bg-[#10b981]/10 text-[#10b981] font-semibold text-xs px-3 py-1 rounded-full mb-2">
                    {services[0]?.doctor?.specialization}
                  </span>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className={`text-sm font-medium ${doctor.rating ? 'text-gray-700' : 'text-gray-400'}`}>
                    {doctor.rating ? `${doctor.rating}/5` : 'No rating'}
                  </span>
                </div>
                {/* Creative working days display */}
                <div className="flex items-center gap-2 mb-2 mt-2">
                  <Calendar className="h-4 w-4 text-[#10b981]" />
                  {isAllWeek ? (
                    <span className="bg-[#10b981] text-white font-semibold px-3 py-1 rounded-full text-xs shadow">All week</span>
                  ) : availableDays.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1">
                      {allDays.map(day => (
                        <span
                          key={day}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium shadow-sm ${availableDays.includes(day) ? 'bg-[#10b981]/90 text-white' : 'bg-gray-100 text-gray-400 line-through'}`}
                        >
                          {day.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </div>
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <MapPin className="h-4 w-4 mr-2 text-[#10b981]" />
                  <span>{doctor.address || ''}{doctor.city ? `, ${doctor.city}` : ''}{doctor.state ? `, ${doctor.state}` : ''}{doctor.zipCode ? ` ${doctor.zipCode}` : ''}</span>
                </div>
              </div>
              <div className="flex flex-col items-end mt-4 md:mt-0">
                <Button
                  size="lg"
                  className="bg-[#10b981] hover:bg-[#0e9e6e] text-white font-bold  px-4 py-2 shadow-lg text-base transition-all duration-200 rounded-full"
                  onClick={() => handleBookDoctorService(doctor)}
                >
                  Book Appointment
                </Button>
                <span className="mt-2 text-xs text-gray-500">
                  {serviceCount} {serviceCount === 1 ? 'service' : 'services'} available
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };
  
  const renderServiceList = () => {
    const filteredByDoctor = filteredServices.filter(service =>
      selectedDoctorId
        ? (
            service.providerName === selectedDoctorId ||
            service.doctorName === selectedDoctorId ||
            service.name === selectedDoctorId ||
            service.doctorId?.toString() === selectedDoctorId
          )
        : true
    );
    if (filteredByDoctor.length === 0) {
      return <div className="p-8 text-center text-gray-500">No services found for the selected doctor.</div>;
    }
    return (
      <div className="space-y-4">
        {filteredByDoctor.map((service) => (
          <MotionDiv 
            key={service.id}
            variants={item}
            layoutId={`service-${service.id}`}
          >
            <div 
              onClick={() => handleServiceClick(service.id)}
              className={`cursor-pointer border rounded-lg overflow-hidden transition-all bg-white dark:bg-gray-900/80 dark:border-gray-700 ${
                selectedServiceId === service.id 
                  ? 'border-healthcare-primary bg-healthcare-primary/5 dark:bg-emerald-900/30 shadow-md' 
                  : 'border-gray-200 hover:border-healthcare-primary/50 dark:hover:border-emerald-500/40'
              }`}
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-1">
                      {service.mode === 'virtual' ? (
                        <Video size={16} className="text-blue-500 mr-2" />
                      ) : (
                        <MapPin size={16} className="text-green-500 mr-2" />
                      )}
                      <h4 className="font-medium text-lg text-gray-900 dark:text-gray-100">{service.service_name}</h4>
                      {service.mode === 'virtual' && (
                        <Badge variant="outline" className="ml-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                          Virtual
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{service.description}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center mr-4">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-healthcare-primary/70" />
                        <span className="capitalize">{service.category?.replace('-', ' ')}</span>
                      </div>
                      <div className="ml-4">
                        <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                          {service.providerName ? `Dr. ${service.providerName}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="font-bold text-xl text-healthcare-primary dark:text-emerald-400">${service.price}</span>
                    {service.insurance && service.insurance.length > 0 && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1">
                            Insurance accepted
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">
                          <div className="text-xs">
                            <div className="font-medium mb-1">Accepted Insurance:</div>
                            <div className="flex flex-wrap gap-1">
                              {service.insurance.map((ins: any) => (
                                <span 
                                  key={ins.provider}
                                  className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-[10px]"
                                >
                                  {ins.provider}
                                </span>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <Button 
                    size="sm" 
                    className="bg-[#10b981] hover:bg-[#0e9e6e] text-white font-bold rounded-lg shadow-md text-base px-6 py-2 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookNow(service.id);
                    }}
                  >
                    Book Appointment
                  </Button>
                  <button 
                    onClick={(e) => toggleDetails(service.id, e)}
                    className="text-sm text-gray-500 flex items-center hover:text-healthcare-primary"
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
                          <span className="font-medium">Provider:</span> {service.providerName || service.doctorName || service.name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Specialty:</span> {service.doctor?.specialization || 'N/A'}
                            </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-700 font-medium">Accepted Insurance:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.isArray(service.insurance) && service.insurance.length > 0 ? (
                            service.insurance.map((ins: any) => (
                            <span 
                                key={ins.provider}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                            >
                                {ins.provider}
                            </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </MotionDiv>
                )}
              </div>
            </div>
          </MotionDiv>
        ))}
      </div>
    );
  };
  
  // Update renderInPersonContent to use getUniqueDoctorsWithServices
  const renderInPersonContent = () => {
    if (inPersonViewMode === "doctors") {
      const uniqueDoctors = getUniqueDoctorsWithServices();
      return (
        <div className="flex flex-col gap-6">
          {uniqueDoctors.map((doctorObj, index) => (
            <div key={doctorObj.doctor.doctorId || doctorObj.doctor.providerName || `doctor-${index}`}>
              {renderDoctorCard(doctorObj)}
            </div>
          ))}
        </div>
      );
    } else if (inPersonViewMode === "services") {
      // Find the first matching service for the selected doctor
      let doctorService = null;
      if (selectedDoctorId) {
        doctorService = filteredServices.find(service =>
          service.providerName === selectedDoctorId ||
          service.doctorName === selectedDoctorId ||
          service.name === selectedDoctorId ||
          service.doctorId?.toString() === selectedDoctorId
        );
      }
      return (
        <>
          {selectedDoctorId && doctorService && (
            <Card className="mb-6 bg-gradient-to-br from-white to-[#f0fdf4] rounded-xl shadow-md border-0 p-0">
              <div className="flex flex-col md:flex-row items-center md:items-center gap-4 p-4">
                {/* Avatar */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-full md:w-auto">
                  {doctorService.avatarUrl ? (
                    <img
                      src={doctorService.avatarUrl}
                      alt={doctorService.providerName || doctorService.doctorName || doctorService.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#10b981]/20 shadow"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#e0f2fe] to-[#f0fdf4] flex items-center justify-center border-2 border-[#10b981]/20 shadow">
                      <span className="text-[#10b981] font-bold text-lg">
                        {(() => {
                          const names = (doctorService.providerName || doctorService.doctorName || doctorService.name).split(' ');
                          return names[0]?.[0] + (names[1]?.[0] || '');
                        })()}
                      </span>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 w-full flex flex-col gap-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900 tracking-tight mr-2">
                        Dr. {doctorService.providerName || doctorService.doctorName || doctorService.name}
                      </h2>
                      {doctorService?.doctor?.specialization && (
                        <span className="inline-block bg-[#10b981]/10 text-[#10b981] font-semibold text-xs px-2 py-0.5 rounded-full">
                          {doctorService?.doctor?.specialization}
                        </span>
                      )}
                      <div className="flex items-center gap-1 ml-2">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className={`text-xs font-medium ${doctorService.rating ? 'text-gray-700' : 'text-gray-400'}`}>{doctorService.rating ? `${doctorService.rating}/5` : 'No rating'}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="border-[#10b981] text-[#10b981] hover:bg-[#e0f2fe] font-semibold rounded-full px-4 py-1 shadow-sm text-xs h-8"
                      onClick={() => {
                        setInPersonViewMode('doctors');
                        setSelectedDoctorId(null);
                      }}
                    >
                      Back to All Doctors
                    </Button>
                  </div>
                  {/* Available days */}
                  <div className="flex flex-wrap items-center gap-1 mt-1 mb-1">
                    <Calendar className="h-4 w-4 text-[#10b981] mr-1" />
                    <span className="font-semibold text-gray-700 mr-1 text-xs">Available:</span>
                    {(() => {
                      const allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      const availableDays = Array.isArray(doctorService.availability) ? doctorService.availability.map((a: any) => a.day) : [];
                      const isAllWeek = allDays.every(day => availableDays.includes(day));
                      if (isAllWeek) {
                        return <span className="bg-[#10b981] text-white font-semibold px-2 py-0.5 rounded-full text-xs shadow">All week</span>;
                      } else if (availableDays.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-1">
                            {allDays.map(day => (
                              <span
                                key={day}
                                className={`px-2 py-0.5 rounded-full text-xs font-medium shadow-sm transition-all duration-200 ${availableDays.includes(day) ? 'bg-[#10b981]/90 text-white' : 'bg-gray-100 text-gray-400 line-through'}`}
                              >
                                {day.slice(0, 3)}
                              </span>
                            ))}
                          </div>
                        );
                      } else {
                        return <span className="text-gray-400 text-xs">N/A</span>;
                      }
                    })()}
                  </div>
                  {/* Address */}
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <MapPin className="h-4 w-4 mr-1 text-[#10b981]" />
                    <span>{doctorService.address || ''}{doctorService.city ? `, ${doctorService.city}` : ''}{doctorService.state ? `, ${doctorService.state}` : ''}{doctorService.zipCode ? ` ${doctorService.zipCode}` : ''}</span>
                  </div>
                  {/* Bio */}
                  <p className={`mt-1 text-gray-600 text-xs ${!doctorService.bio ? 'italic text-gray-400' : ''}`}>
                    {doctorService.bio || "No bio available."}
                  </p>
                </div>
              </div>
            </Card>
          )}
          <div className="space-y-4 mt-6">
            <MotionH3 
              variants={fadeIn} 
              className="text-xl font-semibold"
            >
              Available Services
            </MotionH3>
            {renderServiceList()}
          </div>
        </>
      );
    }
  };

  return (
    <div className="py-8 px-2 md:px-8 bg-gradient-to-br from-[#f8fafc] to-[#e0f2fe] dark:from-gray-900 dark:to-gray-800 min-h-[80vh]">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar with filters */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sticky top-24 space-y-5">
            <div>
              <h3 className="font-medium text-lg mb-3 dark:text-gray-100">Find {serviceType === 'virtual' ? 'Virtual' : 'In-Person'} Services</h3>
              
              <div className="relative mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input 
                  placeholder="Search services or doctors..." 
                  className="pl-8 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {serviceType === 'inPerson' && (
              <div className="space-y-1">
                <label className="text-sm font-medium">View Mode</label>
                <div className="grid grid-cols-2 gap-1">
                  <Button 
                    variant={inPersonViewMode === 'doctors' ? 'default' : 'outline'}
                    size="sm"
                    className={
                      inPersonViewMode === 'doctors'
                        ? 'bg-[#10b981] text-white border-[#10b981] shadow'
                        : 'border-[#10b981] text-[#10b981] hover:bg-[#e0f2fe]'
                    }
                    onClick={() => setInPersonViewMode('doctors')}
                  >
                    <UserRound className="h-4 w-4 mr-1" />
                    Doctors
                  </Button>
                  <Button 
                    variant={inPersonViewMode === 'services' ? 'default' : 'outline'}
                    size="sm"
                    className={
                      inPersonViewMode === 'services'
                        ? 'bg-[#10b981] text-white border-[#10b981] shadow'
                        : 'border-[#10b981] text-[#10b981] hover:bg-[#e0f2fe]'
                    }
                    onClick={() => setInPersonViewMode('services')}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Services
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-sm font-medium">Service Category</label>
              <Select value={selectedCategory || 'all'} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  {['all', ...new Set(services.map(service => service.category).filter(Boolean))].map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.replace(/-/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium">Select Doctor</label>
              {(() => {
                const uniqueDoctorsMap = new Map();
                filteredServices.forEach(service => {
                  const id = service.providerName || service.doctorName || service.name;
                  const name = service.providerName || service.doctorName || service.name || 'Unknown';
                  if (id && name && !uniqueDoctorsMap.has(id)) {
                    uniqueDoctorsMap.set(id, { id, name });
                  }
                });
                const uniqueDoctors = Array.from(uniqueDoctorsMap.values());
                return (
                  <Select value={selectedDoctorId ?? 'all'} onValueChange={(value) => handleDoctorSelect(value === 'all' ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All doctors</SelectItem>
                      {uniqueDoctors.map(doctor => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                );
              })()}
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium">Insurance</label>
              <Select value={selectedInsurance || 'all'} onValueChange={(value) => setSelectedInsurance(value === 'all' ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All insurances" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any insurance</SelectItem>
                  {['Blue Cross Blue Shield', 'Aetna', 'Cigna', 'UnitedHealthcare', 'Medicare', 'Medicaid'].map(ins => (
                    <SelectItem key={ins} value={ins}>
                      {ins}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-grow space-y-6">
          <MotionDiv 
            initial="hidden"
            animate="show"
            variants={container}
          >
            <MotionDiv variants={item} className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {serviceType === 'virtual' 
                  ? 'Virtual Healthcare Services' 
                  : 'In-Person Healthcare Services'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {serviceType === 'virtual'
                  ? 'Connect with healthcare professionals from the comfort of your home'
                  : 'Find and schedule in-person appointments with local healthcare providers'}
              </p>
            </MotionDiv>
            
            {/* Conditional rendering for virtual vs in-person */}
            <AnimatePresence mode="wait">
              {serviceType === 'virtual' ? (
                <MotionDiv
                  key="virtual"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {selectedDoctorId && (
                    <MotionDiv 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="mb-6"
                    >
                      {/* ... keep existing code (selected doctor display) */}
                    </MotionDiv>
                  )}
                  
                  <MotionDiv variants={item} className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700">Available Virtual Services</h3>
                  </MotionDiv>
                  
                  {/* Render service list for virtual */}
                  {renderServiceList()}
                </MotionDiv>
              ) : (
                <MotionDiv
                  key="inPerson"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {renderInPersonContent()}
                </MotionDiv>
              )}
            </AnimatePresence>
          </MotionDiv>
        </div>
      </div>
    </div>
  );
};

export default PatientServiceList;
