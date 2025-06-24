"use client"
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { format, addDays, isSameDay, isValid, subMonths, addMonths } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  ArrowLeft, 
  ArrowRight, 
  Clock,
  Video,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CallTimer from '@/components/video-call/CallTimer';
import { getPatientAppointments } from '@/utils/services/appointment';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import default styles
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

// Define the Appointment type locally (no mock import)
type Appointment = {
  id: string;
  patient_id?: string;
  doctor_id?: string;
  patient_first_name?: string;
  doctor_name?: string;
  avatar?: string;
  appointment_date: Date;
  time?: string;
  durationMinutes: number;
  reason: string;
  status: 'pending' | 'scheduled' | 'cancelled' | 'completed';
  mode?: string;
};

// Helper to combine date and time
function getAppointmentDateTime(appointment: Appointment) {
  if (!appointment.time) return new Date(appointment.appointment_date);
  // Handles 'hh:mm AM/PM' format
  const [timePart, ampm] = appointment.time.split(' ');
  const [hoursStr, minutesStr] = timePart.split(':');
  let hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (ampm?.toUpperCase() === 'PM' && hours < 12) hours += 12;
  if (ampm?.toUpperCase() === 'AM' && hours === 12) hours = 0;
  const date = new Date(appointment.appointment_date);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

const AppointmentSchedule: React.FC = () => {
  const { userId } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [visibleDates, setVisibleDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    if (!userId) return;
    console.log("Current userId:", userId);
    (async () => {
      const res = await fetch(`/api/appointments`);
      const data = await res.json();
      console.log("Fetched appointments:", data);
      if (data && data.success && Array.isArray(data.data)) {
        const realAppointments: Appointment[] = data.data.map((appt: any) => ({
          id: appt.id,
          patient_id: appt.patient_id,
          doctor_id: appt.doctor_id,
          patient_first_name: appt.patient_first_name ?? "",
          doctor_name: appt.doctor?.name ?? "",
          avatar: appt.patient?.img ?? "",
          appointment_date: new Date(appt.appointment_date),
          time: appt.time ?? "",
          durationMinutes: 30,
          reason: appt.type ?? "Consultation",
          status: (appt.status ?? "scheduled").toLowerCase() as Appointment['status'],
          mode: appt.mode ?? "",
        }));
        // Only show appointments for the current patient
        setAppointments(realAppointments.filter(appt => appt.patient_id === userId));
      }
    })();
    // Create array of dates for the week view
    const today = new Date();
    const dates = Array.from({ length: 7 }, (_, i) => addDays(today, i));
    setVisibleDates(dates);
  }, [pathname, userId]);
  
  // Find the next upcoming appointment (scheduled and in the future)
  const nextAppointment = appointments
    .filter(app => {
      const appointmentDate = new Date(app.appointment_date);
      return isValid(appointmentDate) && appointmentDate > new Date() && app.status === 'scheduled';
    })
    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())[0];
  
  // Get appointments for the selected date
  const selectedDateAppointments = appointments
    .filter(app => {
      const appointmentDate = new Date(app.appointment_date);
      return isValid(appointmentDate) && isSameDay(appointmentDate, selectedDate);
    })
    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
    
  // Function to join a video call
  const joinAppointment = (appointment: Appointment) => {
    // window.open('https://doxy.me/ourtopclinic', '_blank');
  };
  
  // Function to navigate between weeks
  const navigateWeek = (direction: 'prev' | 'next') => {
    const firstDate = visibleDates[0];
    const newDates = visibleDates.map(date => 
      addDays(date, direction === 'next' ? 7 : -7)
    );
    setVisibleDates(newDates);
    // Also update selected date
    setSelectedDate(addDays(selectedDate, direction === 'next' ? 7 : -7));
  };
  
  // Function to highlight days with appointments on the calendar
  const isDayWithAppointments = (day: Date) => {
    return appointments.some(appointment => {
      const appointmentDate = new Date(appointment.appointment_date);
      return isValid(appointmentDate) && isSameDay(day, appointmentDate);
    });
  };

  // Safe format function to handle invalid dates
  const safeFormat = (date: Date | null | undefined, formatStr: string): string => {
    if (!date || !isValid(date)) {
      return 'Invalid date';
    }
    return format(date, formatStr);
  };

  const getStatusForDay = (day: Date) => {
    const dayAppointments = appointments.filter(app => isSameDay(new Date(app.appointment_date), day));
    if (dayAppointments.some(app => app.status === 'cancelled')) return 'cancelled';
    if (dayAppointments.some(app => app.status === 'completed')) return 'completed';
    if (dayAppointments.some(app => app.status === 'scheduled')) return 'scheduled';
    if (dayAppointments.some(app => app.status === 'pending')) return 'pending';
    return null;
  };

  // Calculate the date range for the calendar
  const today = new Date();
  const startDate = subMonths(today, 3); // 3 months in the past
  const endDate = addMonths(today, 2); // 2 months in the future

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
          
      </div>
      
      {/* Next appointment alert */}
      {nextAppointment && (
        <Card className="mb-6 border-l-4 border-l-primary">
          <CardContent className="flex justify-between items-center p-4">
            <div>
              <h3 className="text-lg font-semibold">Next Appointment</h3>
              <p className="text-gray-600">
                {nextAppointment.patient_first_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {safeFormat(getAppointmentDateTime(nextAppointment), 'EEEE, MMMM d, yyyy')} at {safeFormat(getAppointmentDateTime(nextAppointment), 'h:mm a')}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <CallTimer 
                durationMinutes={0}
                startTime={null}
                appointmentTime={getAppointmentDateTime(nextAppointment)}
                className="text-base font-medium"
              />
              {/* <Button 
                onClick={() => joinAppointment(nextAppointment)}
                className="flex items-center gap-2"
              >
                <Video className="h-4 w-4" />
                Enter Waiting Room
              </Button> */}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal mb-4"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? safeFormat(selectedDate, 'MMMM yyyy') : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  onChange={(value) => value && setSelectedDate(value as Date)}
                  value={selectedDate}
                  className="!border-none !shadow-xl !rounded-2xl !p-4 bg-white"
                  prevLabel={<ChevronLeft className="h-5 w-5 text-primary" />}
                  nextLabel={<ChevronRight className="h-5 w-5 text-primary" />}
                  minDate={startDate}
                  maxDate={endDate}
                  tileClassName={({ date }) => [
                    "transition-all duration-200 !rounded-lg !text-base",
                    isSameDay(date, selectedDate) && "bg-primary text-white font-bold shadow",
                    isSameDay(date, new Date()) && "ring-2 ring-primary",
                  ].filter(Boolean).join(" ")}
                  tileContent={({ date }) => {
                    const status = getStatusForDay(date);
                    if (!status) return null;
                    let color = "";
                    if (status === "pending") color = "bg-yellow-400";
                    if (status === "completed") color = "bg-green-500";
                    if (status === "scheduled") color = "bg-blue-500";
                    if (status === "cancelled") color = "bg-red-500";
                    return (
                      <div className="flex justify-center mt-1">
                        <div className={`h-2 w-2 rounded-full ${color}`}></div>
                      </div>
                    );
                  }}
                />
              </PopoverContent>
            </Popover>
            
            <div className="mt-6 space-y-2">
              <h3 className="font-medium">Legend</h3>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                <span className="text-sm">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="text-sm">Cancelled</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Week view and appointments */}
        <div className="lg:col-span-3 space-y-6">
          {/* Week navigation */}
          <Card>
            <CardContent className="p-0">
              <div className="flex justify-between items-center p-4 border-b">
                <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Previous Week
                </Button>
                <h3 className="font-medium">
                  {safeFormat(visibleDates[0], 'MMM d')} - {safeFormat(visibleDates[6], 'MMM d, yyyy')}
                </h3>
                <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                  Next Week <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              {/* Week view */}
              <div className="grid grid-cols-7 border-b">
                {visibleDates.map((date, index) => (
                  <div 
                    key={index}
                    className={`p-3 text-center cursor-pointer transition-colors hover:bg-accent ${
                      isSameDay(date, selectedDate) ? 'bg-accent/50' : ''
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <p className="text-xs text-muted-foreground">{safeFormat(date, 'EEE')}</p>
                    <p className={`text-lg ${isSameDay(date, new Date()) ? 'font-bold text-primary' : ''}`}>
                      {safeFormat(date, 'd')}
                    </p>
                    {/* Status indicator for appointments */}
                    {(() => {
                      const dayAppointments = appointments.filter(app => isSameDay(new Date(app.appointment_date), date));
                      let color = "";
                      if (dayAppointments.some(app => app.status === "cancelled")) color = "bg-red-500";
                      else if (dayAppointments.some(app => app.status === "completed")) color = "bg-green-500";
                      else if (dayAppointments.some(app => app.status === "scheduled")) color = "bg-blue-500";
                      else if (dayAppointments.some(app => app.status === "pending")) color = "bg-yellow-400";
                      return color ? (
                        <div className="flex justify-center mt-1">
                          <div className={`h-2 w-2 rounded-full ${color}`}></div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Appointments for selected date */}
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Appointments for {safeFormat(selectedDate, 'EEEE, MMMM d')}
            </h3>
            
            {selectedDateAppointments.length > 0 ? (
              <div className="space-y-3">
                {selectedDateAppointments.map((appointment) => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    onJoin={joinAppointment}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-muted/20">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-lg font-medium">No Appointments</h3>
                  <p className="text-muted-foreground">
                    You don't have any appointments scheduled for this day.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface AppointmentCardProps {
  appointment: Appointment;
  onJoin: (appointment: Appointment) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onJoin }) => {
  const appointmentTime = getAppointmentDateTime(appointment);
  const isPast = isValid(appointmentTime) && appointmentTime < new Date();
  const isUpcoming = !isPast && appointment.status === 'scheduled';
  
  // Safe format function to handle invalid dates
  const safeFormat = (date: Date | null | undefined, formatStr: string): string => {
    if (!date || !isValid(date)) {
      return 'Invalid date';
    }
    return format(date, formatStr);
  };

  return (
    <Card className={`
      overflow-hidden
      ${isUpcoming ? 'border-l-4 border-l-blue-500' : ''}
    `}>
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Time column */}
          <div className="bg-accent/40 p-4 text-center flex flex-col justify-center items-center min-w-[120px]">
            <p className="text-xl font-semibold">{safeFormat(appointmentTime, 'h:mm')}</p>
            <p className="text-sm">{safeFormat(appointmentTime, 'a')}</p>
          </div>
          {/* Details column */}
          <div className="flex-1 p-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{appointment.patient_first_name}</h4>
                <span className="ml-2 text-xs text-muted-foreground">With Dr. {appointment.doctor_name}</span>
                <Badge variant={
                  appointment.status === 'completed' ? 'secondary' :
                  appointment.status === 'cancelled' ? 'destructive' :
                  appointment.status === 'scheduled' ? 'outline' : 'outline'
                } className="text-xs">
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{appointment.reason}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Date: {safeFormat(appointmentTime, 'yyyy-MM-dd')} | Mode: {(appointment.mode || 'N/A').toUpperCase()}
              </p>
            </div>
            {/* Countdown timer for upcoming appointments */}
            {isUpcoming && isValid(appointmentTime) && (
              <div className="flex items-center gap-1 mt-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <CallTimer 
                  durationMinutes={0}
                  startTime={null}
                  appointmentTime={appointmentTime}
                  className="text-xs"
                />
              </div>
            )}
            {/* Action button */}
            <div className="mt-2">
              {appointment.status === 'completed' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                >
                  <Link href={`/record/appointments/${appointment.id}`}>
                  View Summary
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentSchedule;

