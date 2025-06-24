
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  CalendarDays, 
  Monitor,
  MessageSquare,
  X
} from "lucide-react";
import AppointmentCalendar from './AppointmentCalendar';
import VideoCallChat from './VideoCallChat';
import NetworkInfo from './NetworkInfo';

type Tab = 'appointments' | 'chat' | 'info';

interface AppointmentSidebarProps {
  userType: 'doctor' | 'patient';
  appointments: any[];
  onSelectAppointment: (appointment: any) => void;
  currentAppointment: any | null;
  onClose?: () => void;
  fullWidth?: boolean; // For mobile view
}

const AppointmentSidebar: React.FC<AppointmentSidebarProps> = ({
  userType,
  appointments,
  onSelectAppointment,
  currentAppointment,
  onClose,
  fullWidth = false
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('appointments');

  return (
    <div className={`flex flex-col h-full ${fullWidth ? 'w-full' : 'w-[350px]'} border-l bg-card`}>
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center">
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="font-semibold">
            {activeTab === 'appointments' ? 'Your Appointments' : 
             activeTab === 'chat' ? 'Session Chat' : 'Connection Info'}
          </h2>
        </div>
        {!onClose && (
          <div className="flex gap-1">
            <Button 
              variant={activeTab === 'appointments' ? 'default' : 'ghost'} 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setActiveTab('appointments')}
            >
              <CalendarDays className="h-4 w-4" />
            </Button>
            <Button 
              variant={activeTab === 'chat' ? 'default' : 'ghost'} 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button 
              variant={activeTab === 'info' ? 'default' : 'ghost'} 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setActiveTab('info')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>
        )}
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-auto">
        {activeTab === 'appointments' && (
          <div className="p-4">
            <AppointmentCalendar 
              appointments={appointments} 
              userType={userType}
              onSelectAppointment={onSelectAppointment}
              currentAppointment={currentAppointment}
            />
          </div>
        )}
        
        {activeTab === 'chat' && (
          <VideoCallChat />
        )}
        
        {activeTab === 'info' && (
          <div className="p-4">
            <NetworkInfo />
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentSidebar;
