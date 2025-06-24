
import React, { useState } from 'react';
import { format, isSameDay, isToday, isWithinInterval, addDays, isValid } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as CalendarIcon, ChevronDown, Clock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CallTimer from '@/components/video-call/CallTimer';

interface Appointment {
  id: string;
  patientId?: string;
  doctorId?: string;
  patientName?: string;
  doctorName?: string;
  avatar?: string;
  date: Date;
  durationMinutes: number;
  reason: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'ongoing';
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  userType: 'doctor' | 'patient';
  onSelectAppointment: (appointment: Appointment) => void;
  currentAppointment?: Appointment | null;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  userType,
  onSelectAppointment,
  currentAppointment
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showPopover, setShowPopover] = useState(false);
  
  // Safe format function to handle invalid dates
  const safeFormat = (date: Date | null | undefined, formatStr: string): string => {
    if (!date || !isValid(date)) {
      return 'Invalid date';
    }
    return format(date, formatStr);
  };
  
  // Filter appointments for the selected date
  const filteredAppointments = selectedDate 
    ? appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return isValid(aptDate) && isSameDay(aptDate, selectedDate);
      })
    : [];
    
  // Find upcoming appointments (today's only)
  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return isValid(aptDate) && isToday(aptDate) && 
      apt.status === 'upcoming' && 
      aptDate > new Date();
  }).sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return isValid(dateA) && isValid(dateB) ? 
      dateA.getTime() - dateB.getTime() : 0;
  });
  
  // Find the next appointment
  const nextAppointment = upcomingAppointments[0];
  
  const isDayWithAppointments = (day: Date) => {
    return appointments.some(appointment => {
      const appointmentDate = new Date(appointment.date);
      return isValid(appointmentDate) && isSameDay(day, appointmentDate);
    });
  };

  return (
    <div className="space-y-4">
      {/* Next appointment with timer */}
      {nextAppointment && (
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Next Appointment</h3>
                <p className="font-semibold">
                  {userType === 'doctor' 
                    ? nextAppointment.patientName 
                    : nextAppointment.doctorName}
                </p>
                <div className="flex items-center mt-1 text-sm">
                  <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                  {safeFormat(new Date(nextAppointment.date), 'hh:mm a')}
                  <span className="mx-2 text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{nextAppointment.reason}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Badge variant={nextAppointment.status === 'ongoing' ? "default" : "outline"} className="mb-2">
                  {nextAppointment.status === 'ongoing' ? 'In Progress' : 'Upcoming'}
                </Badge>
                <CallTimer 
                  durationMinutes={0} // Countdown to appointment
                  startTime={null}
                  appointmentTime={new Date(nextAppointment.date)}
                  className="text-sm"
                />
              </div>
            </div>
            
            <div className="mt-3">
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => onSelectAppointment(nextAppointment)}
                disabled={currentAppointment?.id === nextAppointment.id}
              >
                {currentAppointment?.id === nextAppointment.id 
                  ? 'Current Session' 
                  : 'Join Session'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Calendar and daily appointments */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-lg">Appointments</h3>
          <Popover open={showPopover} onOpenChange={setShowPopover}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
              >
                <CalendarIcon className="h-4 w-4" />
                <span>{selectedDate ? safeFormat(selectedDate, 'MMMM d, yyyy') : 'Pick a date'}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setShowPopover(false);
                }}
                modifiers={{
                  hasAppointment: (day) => isDayWithAppointments(day),
                }}
                modifiersStyles={{
                  hasAppointment: {
                    fontWeight: 'bold',
                    backgroundColor: 'var(--primary-50)',
                    borderRadius: '100%',
                  }
                }}
                className="rounded-md pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {filteredAppointments.length > 0 ? (
          <ScrollArea className="h-[230px]">
            <div className="space-y-2 pr-4">
              {filteredAppointments.map((appointment) => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment} 
                  userType={userType}
                  onClick={() => onSelectAppointment(appointment)}
                  isActive={currentAppointment?.id === appointment.id}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="h-[200px] flex flex-col items-center justify-center text-center border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">No appointments on this date</p>
            <Button 
              variant="link" 
              className="mt-2"
              onClick={() => setSelectedDate(new Date())}
            >
              View today's appointments
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

interface AppointmentCardProps {
  appointment: Appointment;
  userType: 'doctor' | 'patient';
  onClick: () => void;
  isActive?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  userType,
  onClick,
  isActive
}) => {
  const appointmentDate = new Date(appointment.date);
  const isPast = isValid(appointmentDate) && appointmentDate < new Date();
  const name = userType === 'doctor' ? appointment.patientName : appointment.doctorName;
  
  // Safe format function to handle invalid dates
  const safeFormat = (date: Date | null | undefined, formatStr: string): string => {
    if (!date || !isValid(date)) {
      return 'Invalid date';
    }
    return format(date, formatStr);
  };
  
  return (
    <div 
      className={`p-3 rounded-lg cursor-pointer transition-colors ${
        isActive 
          ? 'bg-primary/10 border border-primary/30' 
          : 'bg-card hover:bg-accent border'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${
            appointment.status === 'upcoming' ? 'bg-blue-500' : 
            appointment.status === 'completed' ? 'bg-green-500' :
            appointment.status === 'ongoing' ? 'bg-primary' : 'bg-red-500'
          }`} />
          <div>
            <p className="font-medium text-sm">{name}</p>
            <p className="text-xs text-muted-foreground">{appointment.reason}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm">{safeFormat(appointmentDate, 'hh:mm a')}</p>
          <p className="text-xs text-muted-foreground">{appointment.durationMinutes} min</p>
        </div>
      </div>
      {!isPast && appointment.status === 'upcoming' && isValid(appointmentDate) && (
        <div className="mt-2 flex justify-end">
          <CallTimer 
            durationMinutes={0}
            startTime={null}
            appointmentTime={appointmentDate}
            className="text-xs"
          />
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;
