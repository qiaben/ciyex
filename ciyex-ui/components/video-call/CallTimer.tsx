import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { isValid } from 'date-fns';

interface CallTimerProps {
  durationMinutes: number; // Total duration in minutes
  startTime?: Date | null; // When the call officially started, if undefined, not started yet
  onTimeUp?: () => void; // Callback for when time is up
  className?: string;
  appointmentTime?: Date | null; // Optional: For countdown to appointment
}

const CallTimer: React.FC<CallTimerProps> = ({ 
  durationMinutes, 
  startTime, 
  onTimeUp,
  className,
  appointmentTime
}) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isWarning, setIsWarning] = useState<boolean>(false);
  const [isValidAppointmentTime, setIsValidAppointmentTime] = useState<boolean>(
    appointmentTime != null && isValid(appointmentTime)
  );

  useEffect(() => {
    // Check if appointmentTime is valid
    if (appointmentTime) {
      setIsValidAppointmentTime(isValid(appointmentTime));
    }
  }, [appointmentTime]);

  useEffect(() => {
    // If appointmentTime is provided, we're counting down to appointment
    if (appointmentTime && isValidAppointmentTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const secondsToAppointment = Math.floor((appointmentTime.getTime() - now.getTime()) / 1000);
        
        setTimeLeft(secondsToAppointment > 0 ? secondsToAppointment : 0);
        
        // Set warning state when less than 5 minutes to appointment
        setIsWarning(secondsToAppointment > 0 && secondsToAppointment <= 300);
        
        if (secondsToAppointment <= 0) {
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    } 
    // Otherwise we're tracking time left in a call that's already started
    else if (startTime && isValid(startTime)) {
      const totalSeconds = durationMinutes * 60;
      const interval = setInterval(() => {
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setTimeElapsed(elapsedSeconds);
        
        const remaining = totalSeconds - elapsedSeconds;
        setTimeLeft(remaining > 0 ? remaining : 0);
        
        // Set warning state when less than 2 minutes remaining
        setIsWarning(remaining > 0 && remaining <= 120);
        
        if (remaining <= 0 && onTimeUp) {
          onTimeUp();
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startTime, appointmentTime, durationMinutes, onTimeUp, isValidAppointmentTime]);

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return "--:--";
    
    if (seconds >= 3600) {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  // If appointment time isn't valid, show a fallback message
  if (appointmentTime && !isValidAppointmentTime) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Time not available</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${isWarning ? 'animate-pulse' : ''} ${className}`}>
      <Clock className={`h-4 w-4 ${isWarning ? 'text-red-500' : 'text-muted-foreground'}`} />
      <div className="flex items-center text-sm">
        {startTime && isValid(startTime) ? (
          <>
            <span className={`font-medium ${
              timeLeft && timeLeft < 60 ? 'text-red-500' :
              timeLeft && timeLeft < 120 ? 'text-yellow-500' :
              ''
            }`}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-muted-foreground mx-1">/</span>
            <span>{durationMinutes}:00</span>
          </>
        ) : appointmentTime && isValidAppointmentTime ? (
          <span className={`font-medium ${
            timeLeft && timeLeft < 300 ? 'text-primary' : ''
          }`}>
            {timeLeft && timeLeft > 0 
              ? `Starts in ${formatTime(timeLeft)}`
              : "Starting now..."}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Not started</span>
        )}
      </div>
    </div>
  );
};

export default CallTimer;
