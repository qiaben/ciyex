
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, User, Video, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WaitingRoomProps {
  doctorName: string;
  doctorAvatar?: string;
  doctorSpecialty?: string;
  appointmentTime?: string;
  reason?: string;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  doctorName,
  doctorAvatar,
  doctorSpecialty,
  appointmentTime,
  reason
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-gray-900 to-black">
      <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5 bg-repeat"></div>
      
      <Card className="max-w-md w-full p-6 space-y-6 text-center bg-card/80 backdrop-blur-md border-primary/20 shadow-lg">
        <Badge variant="outline" className="absolute top-4 right-4 bg-primary/10 text-primary border-primary/30">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>Waiting Room</span>
          </div>
        </Badge>
        
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar className="h-24 w-24 mb-4 border-4 border-primary/20">
              {doctorAvatar ? (
                <AvatarImage src={doctorAvatar} alt={doctorName} />
              ) : (
                <AvatarFallback>{doctorName.charAt(0)}</AvatarFallback>
              )}
            </Avatar>
            <span className="absolute bottom-3 right-0 h-5 w-5 rounded-full bg-orange-500 border-2 border-white"></span>
          </div>
          
          <h2 className="text-2xl font-bold">{doctorName}</h2>
          {doctorSpecialty && (
            <p className="text-muted-foreground">{doctorSpecialty}</p>
          )}
        </div>

        <div className="py-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-primary" />
            {appointmentTime ? (
              <span>Appointment scheduled for {appointmentTime}</span>
            ) : (
              <span>Your appointment is scheduled for today</span>
            )}
          </div>
          
          {reason && (
            <div className="text-sm text-muted-foreground mt-2 mb-4">
              <span>Reason: {reason}</span>
            </div>
          )}

          <div className="space-y-2 mt-6">
            <p className="font-medium">Waiting for the doctor to start the session</p>
            <p className="text-sm text-muted-foreground">
              The doctor will admit you shortly. Please make sure your camera and microphone are enabled.
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-center gap-4">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs">Camera Ready</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs">Audio Ready</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <User className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs">Profile Ready</span>
            </div>
          </div>
        </div>

        <div className="animate-pulse flex items-center justify-center gap-2 text-primary mt-2">
          <div className="h-2 w-2 bg-primary rounded-full"></div>
          <div className="h-2 w-2 bg-primary rounded-full animation-delay-200"></div>
          <div className="h-2 w-2 bg-primary rounded-full animation-delay-500"></div>
        </div>
      </Card>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">Need to cancel or reschedule?</p>
        <Button variant="ghost" size="sm" className="text-primary">
          Contact Support
        </Button>
      </div>
    </div>
  );
};

export default WaitingRoom;
