import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Upload, X, Check, AlertCircle, Info } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createNewAppointment } from '@/app/actions/appointment';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
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

type PatientIntakeFormProps = {
  onComplete: (formData: any) => void;
  doctorName?: string;
  serviceName?: string;
  doctorsList: Array<{ id: string; name: string }>;
  selectedServiceId?: number;
  doctorId?: string;
  type?: string;
  mode?: string;
  availability?: Array<{ day: string; from: string; to: string }>;
};

const PatientIntakeForm: React.FC<PatientIntakeFormProps> = ({ 
  onComplete, 
  doctorName = "Dr. John Doe", 
  serviceName = "General Consultation", 
  doctorsList = [], 
  selectedServiceId, 
  doctorId, 
  type, 
  mode,
  availability = []
}) => {
  const { user } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(null);
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  // Convert time strings to comparable format (supports '09:00' or '17:30')
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Generate time slots based on availability (outputs '09:00', '09:30', etc.)
  const generateTimeSlots = (from: string, to: string) => {
    const slots: string[] = [];
    const startMinutes = timeToMinutes(from);
    const endMinutes = timeToMinutes(to);

    for (let minutes = startMinutes; minutes < endMinutes; minutes += 15) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
    return slots;
  };

  // Check if a date is available
  const isDateAvailable = (date: Date) => {
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    return availability.some(a => a.day === day);
  };

  // Get available time slots for selected date
  const getAvailableTimeSlots = (date: Date) => {
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayAvailability = availability.find(a => a.day === day);
    if (dayAvailability) {
      return generateTimeSlots(dayAvailability.from, dayAvailability.to);
    }
    return [];
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    console.log('Selected date:', date);
    console.log('Current availability:', availability);
    
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    console.log('Day of week:', day);
    
    const isAvailable = availability.some(a => a.day === day);
    console.log('Is available:', isAvailable);
    
    if (isAvailable) {
      setAppointmentDate(date);
      const dayAvailability = availability.find(a => a.day === day);
      if (dayAvailability) {
        const slots = generateTimeSlots(dayAvailability.from, dayAvailability.to);
        console.log('Generated time slots:', slots);
        setAvailableTimeSlots(slots);
      }
      setAppointmentTime(''); // Reset time when date changes
    } else {
      toast.error("This day is not available for appointments");
    }
  };

  const form = useForm({
    defaultValues: {
      chiefComplaint: '',
      allergies: '',
      currentMedications: '',
      pastMedicalConditions: '',
      bloodPressure: '',
      temperature: '',
      pharmacyName: '',
      pharmacyAddress: '',
      pharmacyPhone: '',
      hasInsurance: 'no',
      insuranceId: '',
    },
  });
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!doctorId) {
      toast.error("Doctor information is missing. Please try booking again.");
      setIsSubmitting(false);
      return;
    }

    if (!appointmentDate) {
      toast.error("Please select an appointment date.");
      setIsSubmitting(false);
      return;
    }

    if (!appointmentTime) {
      toast.error("Please select an appointment time.");
      setIsSubmitting(false);
      return;
    }

    try {
      const formValues = form.getValues();
      const formData = {
        ...formValues,
        patient_id: user?.id,
        appointment_date: appointmentDate.toISOString().split('T')[0],
        time: appointmentTime,
        service_id: selectedServiceId,
        doctor_id: doctorId,
        type: type || 'regular',
        mode: mode || 'inperson'
      };

      console.log('Booking data collected:', formData);
      onComplete(formData);
      
      // Trigger navigation to payment tab
      const event = new CustomEvent('bookingStepChange', { detail: { step: 'payment' } });
      document.dispatchEvent(event);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MotionDiv 
      initial="hidden"
      animate="show"
      variants={container}
      className="py-8 px-2 md:px-8 bg-gradient-to-br from-[#f8fafc] to-[#e0f2fe] dark:from-gray-900 dark:to-gray-800 min-h-[80vh]"
    >
      <MotionDiv variants={item} className="mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1e293b] dark:text-gray-100 mb-2 tracking-tight">Patient Intake Form</h2>
        <p className="text-[#64748b] dark:text-gray-300 text-lg">Please provide your medical information to help us serve you better</p>
      </MotionDiv>
      
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Name</span>
            <span className="font-bold text-lg text-[#10b981] dark:text-emerald-400">{user ? `${user.firstName} ${user.lastName}` : "Loading..."}</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Doctor</span>
            <span className="font-bold text-lg text-[#1e293b] dark:text-gray-100">{doctorName}</span>
          </div>
        </div>
        <div className="bg-[#e0f2fe] dark:bg-gray-700 rounded-xl shadow p-4 flex flex-col items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Service</span>
          <span className="font-bold text-lg text-[#1e293b] dark:text-gray-100">{serviceName}</span>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="overflow-hidden dark:bg-gray-800">
            <CardContent className="p-6">
              <MotionDiv variants={item} className="flex items-center mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This information is kept secure and will be used by your healthcare provider to prepare for your visit.
                </p>
              </MotionDiv>
              
              <MotionDiv variants={item} className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-2 mb-4">Reason for Visit</h3>
                <FormField
                  control={form.control}
                  name="chiefComplaint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Chief Complaint</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Briefly describe your current symptoms and reason for visit" 
                          className="resize-none h-24 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </MotionDiv>
              
              <MotionDiv variants={item} className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-2 mb-4">Allergies</h3>
                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        Please list any drug, food, or environmental allergies and reactions
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Example: Penicillin (hives), Peanuts (anaphylaxis), etc." 
                          className="resize-none h-20 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </MotionDiv>
              
              <MotionDiv variants={item} className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-2 mb-4">Medical History</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="currentMedications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Current Medications</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List all current medications and dosages" 
                            className="resize-none h-20 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="pastMedicalConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Past Medical Conditions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List significant past medical conditions" 
                            className="resize-none h-20 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField
                    control={form.control}
                    name="bloodPressure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Last Blood Pressure Reading and Date</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Example: 120/80 on 05/15/2025" 
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Last Temperature Reading and Date</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Example: 98.6°F on 05/15/2025" 
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </MotionDiv>
              
              <MotionDiv variants={item} className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-2 mb-4">Preferred Pharmacy</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="pharmacyName"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel className="text-gray-700 dark:text-gray-300">Pharmacy Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Example: CVS Pharmacy" 
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="pharmacyAddress"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-1">
                        <FormLabel className="text-gray-700 dark:text-gray-300">Pharmacy Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter pharmacy address" 
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="pharmacyPhone"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel className="text-gray-700 dark:text-gray-300">Pharmacy Phone</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Example: (555) 123-4567" 
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </MotionDiv>
              
              <MotionDiv variants={item} className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-2 mb-4">Appointment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Select Appointment Date</FormLabel>
                    <input
                      type="date"
                      className={`w-full mt-2 border dark:border-gray-600 rounded-md p-3 text-base dark:bg-gray-700 dark:text-gray-100 ${
                        appointmentDate && !isDateAvailable(appointmentDate) ? 'border-red-500' : ''
                      }`}
                      value={appointmentDate ? appointmentDate.toISOString().split('T')[0] : ''}
                      onChange={e => {
                        const selectedDate = new Date(e.target.value);
                        handleDateSelect(selectedDate);
                      }}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {appointmentDate && !isDateAvailable(appointmentDate) && (
                      <p className="text-red-500 text-sm mt-1">This day is not available for appointments</p>
                    )}
                    <div className="mt-2 text-sm text-gray-500">
                      Available days: {availability.map(a => a.day).join(', ')}
                    </div>
                  </div>
                  <div>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Select Appointment Time</FormLabel>
                    <select
                      className="w-full mt-2 border dark:border-gray-600 rounded-md p-3 text-base dark:bg-gray-700 dark:text-gray-100"
                      value={appointmentTime}
                      onChange={e => setAppointmentTime(e.target.value)}
                      disabled={!appointmentDate || !isDateAvailable(appointmentDate)}
                    >
                      <option value="">Select time</option>
                      {availableTimeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </MotionDiv>
              
              <MotionDiv 
                variants={item}
                className="mt-8 flex justify-end gap-4"
              >
                <Button 
                  type="button"
                  variant="outline"
                  className="border-red-500 dark:border-red-400 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 font-bold min-w-[140px] py-4 px-8 rounded-xl shadow text-lg transition-all duration-200"
                  onClick={() => {
                    const event = new CustomEvent('bookingStepChange', { detail: { step: 'services' } });
                    document.dispatchEvent(event);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#10b981] dark:bg-emerald-500 hover:bg-[#0e9e6e] dark:hover:bg-emerald-600 text-white font-bold min-w-[180px] py-4 px-8 rounded-xl shadow-lg text-lg transition-all duration-200"
                >
                  Continue to Payment
                </Button>
              </MotionDiv>
            </CardContent>
          </Card>
        </form>
      </Form>
    </MotionDiv>
  );
};

export default PatientIntakeForm;
