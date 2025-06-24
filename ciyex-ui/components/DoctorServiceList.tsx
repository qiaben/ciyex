import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, HTMLMotionProps, AnimatePresence } from 'framer-motion';
import { 
  Edit, 
  Trash2, 
  Clock, 
  Calendar, 
  Video, 
  MapPin, 
  MoreVertical, 
  Eye,
  Search,
  Filter,
  ChevronDown,
  CheckCircle,
  ChevronUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define motion components with proper types
const MotionDiv = motion.div as React.ComponentType<HTMLMotionProps<"div"> & { className?: string }>;
const MotionButton = motion.button as React.ComponentType<HTMLMotionProps<"button"> & { 
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}>;
const MotionSpan = motion.span as React.ComponentType<HTMLMotionProps<"span"> & { className?: string }>;

// Define animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
} as const;

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
} as const;

const expandVariants = {
  hidden: { 
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  show: { 
    height: "auto",
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
} as const;

type DoctorServiceListProps = {
  onEditService: (service: any) => void;
  services: any[];
  loading?: boolean;
  onServiceSaved?: () => void;
};

const DoctorServiceList: React.FC<DoctorServiceListProps> = ({ onEditService, services, loading, onServiceSaved }) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);
  const [expandedServiceId, setExpandedServiceId] = useState<number | null>(null);

  // Debug log for services data
  useEffect(() => {
    console.log('Services data:', services);
  }, [services]);

  // Helper function to get insurance data
  const getInsuranceData = (service: any) => {
    if (service.insurance && Array.isArray(service.insurance)) {
      return service.insurance.map((ins: any) => ins.provider);
    }
    return [];
  };

  // Apply filters to services
  const filteredServices = services.filter(service => {
    // Search by name or description
    if (searchQuery && !service.service_name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !service.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Filter by status (if you have a status field)
    if (statusFilter && service.status !== statusFilter) {
      return false;
    }
    // Filter by type (online/in-person) if you have isOnline
    if (typeFilter === 'online' && !service.isOnline) {
      return false;
    }
    if (typeFilter === 'in-person' && service.isOnline) {
      return false;
    }
    return true;
  });

  const handleDeleteClick = (id: number) => {
    setServiceToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (serviceToDelete) {
      try {
        const response = await fetch('/api/services', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: serviceToDelete }),
        });
        if (!response.ok) throw new Error('Failed to delete service');
      toast({
        title: "Service Deleted",
        description: "The service has been permanently deleted.",
      });
        if (onServiceSaved) onServiceSaved();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Could not delete service.',
          variant: 'destructive',
        });
      }
    }
    setShowDeleteDialog(false);
    setServiceToDelete(null);
  };

  const toggleServiceStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const response = await fetch('/api/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update status');
    toast({
      title: `Service ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
      description: `The service is now ${newStatus}.`,
      variant: newStatus === 'active' ? 'default' : 'destructive',
    });
      if (onServiceSaved) onServiceSaved();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not update service status.',
        variant: 'destructive',
      });
    }
  };

  // Show loading and empty states
  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading services...</div>;
  }
  if (!services.length) {
    return <div className="p-8 text-center text-gray-500">No services found.</div>;
  }

  return (
    <div className="space-y-6">
      <MotionDiv 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 justify-between items-start"
      >
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search services..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <MotionDiv 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-2 w-full sm:w-auto"
        >
          <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? null : value)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter || 'all'} onValueChange={(value) => setTypeFilter(value === 'all' ? null : value)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Service Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="online">Virtual</SelectItem>
              <SelectItem value="in-person">In-Person</SelectItem>
            </SelectContent>
          </Select>
        </MotionDiv>
      </MotionDiv>
      
      <MotionDiv 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="border rounded-lg overflow-hidden bg-white shadow-sm"
      >
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="font-medium">Your Services ({filteredServices.length})</h3>
          {filteredServices.length !== services.length && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter(null);
                setTypeFilter(null);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
        
        {filteredServices.length === 0 ? (
          <MotionDiv 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="p-8 text-center"
          >
            <div className="mb-3 flex justify-center">
              <Search className="text-gray-400 h-10 w-10" />
            </div>
            <h4 className="text-lg font-medium">No services found</h4>
            <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
          </MotionDiv>
        ) : (
          <MotionDiv 
            initial="hidden"
            animate="show"
            variants={container}
            className="divide-y divide-gray-100"
          >
            {filteredServices.map(service => (
              <MotionDiv 
                key={service.id}
                variants={item}
                className="group hover:bg-gray-50/50 transition-colors duration-200"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex-grow cursor-pointer" 
                      onClick={() => setExpandedServiceId(expandedServiceId === service.id ? null : service.id)}
                    >
                      <MotionDiv 
                        className="flex items-center gap-2 mb-1"
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <h4 className="font-medium text-gray-900">{service.service_name}</h4>
                        <Badge 
                          variant={service.status === 'active' ? 'default' : 'outline'} 
                          className={`${service.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''} transition-colors duration-200`}
                        >
                          {service.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                        {service.mode === 'virtual' ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Video className="h-3 w-3 mr-1" />
                            Virtual
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <MapPin className="h-3 w-3 mr-1" />
                            In-Person
                          </Badge>
                        )}
                        <MotionButton 
                          className="ml-2 p-1 rounded hover:bg-gray-100"
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); setExpandedServiceId(expandedServiceId === service.id ? null : service.id); }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {expandedServiceId === service.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </MotionButton>
                      </MotionDiv>
                      <p className="text-sm text-gray-500">{service.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium text-healthcare-primary">${service.price}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Insurance:</span>
                          {getInsuranceData(service).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {getInsuranceData(service).slice(0, 2).map((insurance: string) => (
                                <Badge key={insurance} variant="secondary" className="text-xs">
                                  {insurance}
                                </Badge>
                              ))}
                              {getInsuranceData(service).length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{getInsuranceData(service).length - 2} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <AnimatePresence>
                        {expandedServiceId === service.id && (
                          <MotionDiv 
                            variants={expandVariants}
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            className="mt-4"
                          >
                            <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
                              <div>
                                <span className="font-semibold">Full Description:</span>
                                <p className="mt-1 text-gray-600">{service.description}</p>
                              </div>
                              <div>
                                <span className="font-semibold">Category:</span>
                                <p className="mt-1 text-gray-600">{service.category || 'General'}</p>
                              </div>
                              {service.mode === 'inperson' && (
                                <div>
                                  <span className="font-semibold">Location:</span>
                                  <div className="mt-1 text-gray-600 space-y-1">
                                    <p>{service.hospitalName}</p>
                                    <p>{service.address}</p>
                                    <p>{service.city}, {service.state} {service.zipCode}</p>
                                  </div>
                                </div>
                              )}
                              <div>
                                <span className="font-semibold">Insurance Accepted:</span>
                                {getInsuranceData(service).length > 0 && (
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    {getInsuranceData(service).map((insurance: string) => (
                                      <div key={insurance} className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-gray-600">{insurance}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="font-semibold">Available Days & Times:</span>
                                <p className="mt-1 text-gray-600">
                                  {service.availability && service.availability.length > 0
                                    ? service.availability
                                        .map((a: any) => `${a.day} (${a.from}–${a.to})`)
                                        .join(', ')
                                    : 'No days set'}
                                </p>
                              </div>
                            </div>
                          </MotionDiv>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="flex-shrink-0 flex gap-2">
                      <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-healthcare-primary border-healthcare-primary hover:bg-healthcare-primary/10"
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEditService(service); }}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      </MotionDiv>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button size="sm" variant="ghost" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </MotionDiv>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleServiceStatus(service.id, service.status)}>
                            {service.status === 'active' ? (
                              <>
                                <Eye className="h-4 w-4 mr-2 text-gray-600" />
                                <span>Mark as inactive</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                <span>Activate service</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600" 
                            onClick={() => handleDeleteClick(service.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            <span>Delete service</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </MotionDiv>
            ))}
          </MotionDiv>
        )}
      </MotionDiv>
      
      <AnimatePresence>
        {showDeleteDialog && (
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to delete this service?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the service 
                    and remove it from our servers. Any scheduled appointments will need to be canceled separately.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={confirmDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete Service
                  </AlertDialogAction>
                </AlertDialogFooter>
              </MotionDiv>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorServiceList;
