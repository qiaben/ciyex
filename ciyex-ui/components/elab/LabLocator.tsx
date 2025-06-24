import React, { useState } from 'react';
import { MapPin, Navigation, Map, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';

type LabLocation = {
  id: string;
  name: string;
  address: string;
  distance: number; // in kilometers
  services: string[];
  hours: string;
  phone: string;
};

const mockLabLocations: LabLocation[] = [
  {
    id: '1',
    name: 'Downtown Medical Lab',
    address: '123 Main Street, Downtown',
    distance: 1.2,
    services: ['Blood Tests', 'Urine Analysis', 'COVID Tests', 'Allergy Tests'],
    hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-2PM',
    phone: '(555) 123-4567',
  },
  {
    id: '2',
    name: 'Westside Diagnostic Center',
    address: '456 West Blvd, Westside',
    distance: 2.8,
    services: ['Blood Tests', 'X-Rays', 'MRI', 'CT Scan'],
    hours: 'Mon-Fri: 7AM-8PM, Sat-Sun: 8AM-4PM',
    phone: '(555) 987-6543',
  },
  {
    id: '3',
    name: 'Northgate Clinical Laboratory',
    address: '789 North Ave, Northgate',
    distance: 3.5,
    services: ['Blood Tests', 'Health Checkups', 'Genetic Testing', 'Hormonal Assays'],
    hours: 'Mon-Fri: 8AM-7PM, Sat: 9AM-3PM',
    phone: '(555) 456-7890',
  },
  {
    id: '4',
    name: 'Eastside Medical Collection Center',
    address: '101 East Road, Eastside',
    distance: 4.1,
    services: ['Blood Tests', 'Urine Analysis', 'Drug Screening'],
    hours: 'Mon-Fri: 9AM-5PM',
    phone: '(555) 234-5678',
  },
];

export const LabLocator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [locations, setLocations] = useState<LabLocation[]>(mockLabLocations);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const { toast } = useToast();

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && !userLocation) {
      // Mock getting user's location when opening
      setTimeout(() => {
        setUserLocation('Current Location');
        toast({
          title: "Location detected",
          description: "We've found your current location.",
        });
      }, 500);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate search with delay
    toast({
      title: "Searching labs",
      description: `Finding labs near ${searchQuery}...`,
    });
    
    // Mock delay for search
    setTimeout(() => {
      // Just reuse the same locations for demo
      setLocations([...mockLabLocations].sort(() => Math.random() - 0.5));
      toast({
        title: "Labs found",
        description: `Found ${mockLabLocations.length} labs near ${searchQuery}.`,
      });
    }, 1000);
  };
  
  const handleScheduleVisit = (id: string) => {
    const lab = locations.find(loc => loc.id === id);
    toast({
      title: "Visit Scheduled",
      description: `Your visit to ${lab?.name} has been scheduled.`,
    });
  };

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative z-10">
      <Button
        variant="outline"
        onClick={handleToggle}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-700"
      >
        <MapPin className="h-4 w-4" />
        <span>Find a Lab</span>
      </Button>

      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 ${isOpen ? 'block' : 'hidden'}`}
        onClick={handleToggle}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={isOpen ? { opacity: 1 } : { opacity: 0 }}
        />
      </div>

      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '80vh' }}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={isOpen ? { y: 0 } : { y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="mx-auto w-12 h-1 bg-gray-300 rounded-full mb-4" />
            <h2 className="text-xl font-semibold text-center mb-4">Find a Lab Near You</h2>
            
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Enter your location or postal code"
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                className="ml-2 absolute right-1 top-1"
                size="sm"
              >
                Search
              </Button>
            </form>
            
            {userLocation && (
              <div className="flex items-center gap-2 mt-4 text-sm text-blue-600">
                <Navigation className="h-4 w-4" />
                <span>Using: {userLocation}</span>
              </div>
            )}
          </div>
          
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 150px)' }}>
            {filteredLocations.map((location) => (
              <div
                key={location.id}
                className="p-4 border-b border-gray-100 hover:bg-blue-50 transition-colors"
                onClick={() => setActiveLocation(activeLocation === location.id ? null : location.id)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{location.name}</h3>
                      <p className="text-sm text-gray-600">{location.address}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-blue-500" />
                        <span className="text-xs text-blue-600">{location.distance} km away</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs border-blue-300 text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleScheduleVisit(location.id);
                      }}
                    >
                      Schedule
                    </Button>
                  </div>
                  
                  {activeLocation === location.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-sm">
                          <div className="mb-2">
                            <span className="font-medium text-gray-700">Services:</span> 
                            <div className="flex flex-wrap gap-1 mt-1">
                              {location.services.map(service => (
                                <span key={service} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                  {service}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="mb-2">
                            <span className="font-medium text-gray-700">Hours:</span> 
                            <span className="text-gray-600 ml-2">{location.hours}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Phone:</span>
                            <span className="text-gray-600 ml-2">{location.phone}</span>
                          </div>
                          <div className="mt-3">
                            <Button 
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleScheduleVisit(location.id);
                              }}
                            >
                              Schedule a Visit
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LabLocator;
