// NOTE: Make sure to install 'react-select' and 'react-icons' with:
// npm install react-select react-icons
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select as ShadSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { Check, MapPin, Video, CheckCircle } from 'lucide-react';
import { FaRegTrashAlt, FaRegCalendarCheck } from 'react-icons/fa';
import Select from 'react-select';

type ServiceType = {
  id?: number;
  name?: string;
  description?: string;
  duration?: string;
  price?: string;
  category?: string;
  insuranceAccepted?: string[];
  insurance_accepted?: string[];
  isOnline?: boolean;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  hospitalName?: string;
  availableDates?: Date[];
  service_name?: string;
  doctor_id?: string;
  availability?: { day: string; from: string; to: string }[];
};

type DoctorServiceCreationProps = {
  editingService?: ServiceType | null;
  onServiceSaved?: () => void;
  onCancel?: () => void;
};

const DoctorServiceCreation: React.FC<DoctorServiceCreationProps> = ({ 
  editingService = null,
  onServiceSaved,
  onCancel
}) => {
  const { toast } = useToast();
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [insuranceAccepted, setInsuranceAccepted] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [dayRanges, setDayRanges] = useState<{ [day: string]: { from: string, to: string } }>({});
  const timeOptions = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  const insuranceOptions = [
    'Blue Cross Blue Shield', 'Aetna', 'Cigna', 'UnitedHealthcare', 'Medicare', 'Medicaid', 'Humana', 'Kaiser Permanente'
  ];
  
  const serviceCategories = [
    'Primary Care', 'Urgent Care', 'Specialist Consultation', 'Follow-up Visit', 'Telemedicine', 
    'Dermatology', 'Cardiology', 'Pediatrics', 'Mental Health', 'Physical Therapy'
  ];

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  useEffect(() => {
    if (editingService) {
      setServiceName(editingService.service_name || editingService.name || '');
      setDescription(editingService.description || '');
      setPrice(
        editingService.price !== undefined
          ? String(editingService.price)
          : ''
      );
      setCategory(editingService.category || '');
      setInsuranceAccepted(editingService.insuranceAccepted || editingService.insurance_accepted || []);
      setIsOnline(
        editingService.isOnline !== undefined
          ? editingService.isOnline
          : true
      );
      setAddress(editingService.address || '');
      setCity(editingService.city || '');
      setState(editingService.state || '');
      setZipCode(editingService.zipCode || '');
      setHospitalName(editingService.hospitalName || '');
      setAvailableDates(editingService.availableDates || []);
      // Map availability to selectedDays and dayRanges
      if (editingService.availability) {
        setSelectedDays(editingService.availability.map((a: any) => a.day));
        const ranges: Record<string, { from: string; to: string }> = {};
        editingService.availability.forEach((a: any) => {
          ranges[a.day] = { from: a.from, to: a.to };
        });
        setDayRanges(ranges);
      } else {
        setSelectedDays([]);
        setDayRanges({});
      }
    }
  }, [editingService]);

  const handleAllInsuranceChange = () => {
    if (insuranceAccepted.length === insuranceOptions.length) {
      setInsuranceAccepted([]);
    } else {
      setInsuranceAccepted([...insuranceOptions]);
    }
  };

  const handleInsuranceChange = (insurance: string) => {
    if (insuranceAccepted.includes(insurance)) {
      setInsuranceAccepted(insuranceAccepted.filter(item => item !== insurance));
    } else {
      setInsuranceAccepted([...insuranceAccepted, insurance]);
    }
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        // Remove day and its range
        const updated = prev.filter(d => d !== day);
        const { [day]: _, ...rest } = dayRanges;
        setDayRanges(rest);
        return updated;
      } else {
        // Add day and set default time
        setDayRanges(prevRanges => ({
          ...prevRanges,
          [day]: { from: '09:00', to: '17:00' }
        }));
        return [...prev, day];
      }
    });
  };
  const handleRangeChange = (day: string, type: 'from' | 'to', value: string) => {
    setDayRanges(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate location data for in-person services
    if (!isOnline && (!address || !city || !state || !zipCode)) {
      toast({
        title: "Location Information Required",
        description: "Please provide complete location details for in-person services.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      const method = editingService ? 'PATCH' : 'POST';
      const body = editingService ? {
        id: editingService.id,
        serviceName,
        description,
        price,
        isOnline,
        address,
        city,
        state,
        zipCode,
        hospitalName,
        selectedDays,
        dayRanges,
        insurance_accepted: insuranceAccepted,
        category,
        mode: isOnline ? 'virtual' : 'inperson',
        status: 'active',
        doctor_id: editingService.doctor_id
      } : {
        serviceName,
        description,
        price,
        isOnline,
        address,
        city,
        state,
        zipCode,
        hospitalName,
        selectedDays,
        dayRanges,
        insurance_accepted: insuranceAccepted,
        category,
        mode: isOnline ? 'virtual' : 'inperson',
        status: 'active'
      };

      console.log('Sending request with body:', body);

      const response = await fetch('/api/services', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create service');
      }
      
      toast({
        title: editingService ? "Service Updated Successfully" : "Service Created Successfully",
        description: `Your service "${serviceName}" has been ${editingService ? 'updated' : 'published'} and is now available for patients to book.`,
        variant: "default",
      });
      
      // Reset form or notify parent
      if (onServiceSaved) {
        onServiceSaved();
      } else {
        // Reset form
        setServiceName('');
        setDescription('');
        setPrice('');
        setCategory('');
        setInsuranceAccepted([]);
        setIsOnline(true);
        setAddress('');
        setCity('');
        setState('');
        setZipCode('');
        setHospitalName('');
        setAvailableDates([]);
        setSelectedDays([]);
        setDayRanges({});
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-t-4 border-t-healthcare-primary">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {editingService ? 'Edit Service Details' : 'Create a New Service'}
          </h3>
          <p className="text-gray-600">Define the services you offer to make them available for patient booking</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isOnline">Service Type</Label>
                <p className="text-sm text-gray-500">Choose whether this service is virtual or in-person</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 ${isOnline ? 'text-healthcare-primary font-medium' : 'text-gray-500'}`}>
                  <Video className="h-4 w-4" />
                  <span>Virtual</span>
                </div>
                <Switch 
                  checked={!isOnline} 
                  onCheckedChange={(checked) => setIsOnline(!checked)} 
                />
                <div className={`flex items-center space-x-1 ${!isOnline ? 'text-healthcare-primary font-medium' : 'text-gray-500'}`}>
                  <MapPin className="h-4 w-4" />
                  <span>In-person</span>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="serviceName">Service Name</Label>
              <Input
                id="serviceName"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. Annual Physical Examination"
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="serviceDescription">Description</Label>
              <Textarea
                id="serviceDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the service you provide"
                className="mt-1 min-h-[100px]"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceCategory">Category</Label>
                <ShadSelect value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </ShadSelect>
              </div>
              <div>
                <Label htmlFor="servicePrice">Price for Self-Pay Patients ($)</Label>
                <Input
                  id="servicePrice"
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 150"
                  className="mt-1"
                  required
                />
              </div>
            </div>
            
            {!isOnline && (
              <div className="border rounded-md p-4 space-y-4">
                <h4 className="font-medium text-gray-800">Location Details</h4>
                
                <div>
                  <Label htmlFor="hospitalName">Clinic/Hospital Name</Label>
                  <Input
                    id="hospitalName"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="e.g. City Medical Center"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 123 Main St"
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Boston"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. MA"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="e.g. 02108"
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            
            <Separator className="my-6" />
            
            <div className="mt-8">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <Label className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle className="text-blue-500" /> Accepted Insurance Plans
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">Select the insurance plans you accept for this service.</p>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:underline font-medium"
                    onClick={() => setInsuranceAccepted([])}
                  >
                    Reset All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4 mt-2">
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-all duration-150 ${insuranceAccepted.length === insuranceOptions.length ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
                    onClick={handleAllInsuranceChange}
                  >
                    All Insurance Plans
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insuranceOptions.map((insurance) => (
                    <div 
                      key={insurance} 
                      className={`flex items-center bg-white border rounded-lg p-3 shadow-sm gap-3 transition-all duration-200 ${
                        insuranceAccepted.includes(insurance) ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        id={`insurance-${insurance}`}
                        checked={insuranceAccepted.includes(insurance)}
                        onChange={() => handleInsuranceChange(insurance)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`insurance-${insurance}`}
                        className="flex-1 text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        {insurance}
                      </label>
                      {insuranceAccepted.includes(insurance) && (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  ))}
                </div>
                {insuranceAccepted.length > 0 && (
                  <div className="mt-4 text-xs text-gray-600">
                    <span className="font-semibold">Selected Plans:</span> {insuranceAccepted.join(', ')}
                  </div>
                )}
              </div>
            </div>
            {/* Available Days & Times Section */}
            <div className="mt-8">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <Label className="text-lg font-semibold flex items-center gap-2">
                      <FaRegCalendarCheck className="text-blue-500" /> Available Days & Times
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">Easily set your weekly schedule for this service.</p>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:underline font-medium"
                    onClick={() => {
                      setSelectedDays([]);
                      setDayRanges({});
                    }}
                  >
                    Reset All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4 mt-2">
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-all duration-150 ${selectedDays.length === daysOfWeek.length ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
                    onClick={() => {
                      if (selectedDays.length === daysOfWeek.length) {
                        setSelectedDays([]);
                        setDayRanges({});
                      } else {
                        setSelectedDays([...daysOfWeek]);
                        const allRanges: Record<string, { from: string, to: string }> = {};
                        daysOfWeek.forEach(day => {
                          allRanges[day] = { from: '09:00', to: '17:00' };
                        });
                        setDayRanges(allRanges);
                      }
                    }}
                  >
                    All
                  </button>
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      type="button"
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition-all duration-150 ${selectedDays.includes(day) ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
                      onClick={() => handleDayToggle(day)}
                    >
                      {day.slice(0,2)}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDays.map(day => (
                    <div key={day} className="flex items-center bg-white border rounded-lg p-3 shadow-sm gap-3">
                      <div className="w-20 font-semibold text-gray-700">{day}</div>
                      <div className="flex items-center gap-2 flex-1">
                        <label className="text-xs">From</label>
                        <div className="w-24">
                          <Select
                            options={timeOptions.map(t => ({ value: t, label: t }))}
                            value={dayRanges[day]?.from ? { value: dayRanges[day]?.from, label: dayRanges[day]?.from } : null}
                            onChange={(opt: { value: string; label: string } | null) => handleRangeChange(day, 'from', opt?.value || '')}
                            isSearchable={false}
                            menuPlacement="auto"
                            classNamePrefix="react-select"
                          />
                        </div>
                        <label className="text-xs">to</label>
                        <div className="w-24">
                          <Select
                            options={timeOptions.map(t => ({ value: t, label: t }))}
                            value={dayRanges[day]?.to ? { value: dayRanges[day]?.to, label: dayRanges[day]?.to } : null}
                            onChange={(opt: { value: string; label: string } | null) => handleRangeChange(day, 'to', opt?.value || '')}
                            isSearchable={false}
                            menuPlacement="auto"
                            classNamePrefix="react-select"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="ml-2 text-gray-400 hover:text-red-500"
                        onClick={() => handleDayToggle(day)}
                        title="Remove day"
                      >
                        <FaRegTrashAlt />
                      </button>
                    </div>
                  ))}
                </div>
                {selectedDays.length > 0 && (
                  <div className="mt-4 text-xs text-gray-600">
                    <span className="font-semibold">Summary:</span> {selectedDays.map(day => `${day.slice(0,2)}: ${dayRanges[day]?.from || '--'}-${dayRanges[day]?.to || '--'}`).join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md px-6 py-2 transition-all duration-300 hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  {editingService ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                editingService ? 'Update Service' : 'Publish Service'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DoctorServiceCreation;
