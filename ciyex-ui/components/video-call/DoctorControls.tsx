import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import {
  Play,
  UserPlus,
  UserX,
  Video,
  Mic,
  Phone,
  Settings,
  ScreenShare,
  ScreenShareOff,
  Share,
  FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DoctorControlsProps {
  onStartCall: () => void;
  onAdmitPatient: () => void;
  onRemovePatient: () => void;
  onToggleChat?: () => void;
  onShareScreen?: () => void;
  onShareFile?: () => void;
  onOpenSettings?: () => void;
  callStarted: boolean;
  patientWaiting: boolean;
  patientAdmitted: boolean;
  isScreenSharing?: boolean;
}

const DoctorControls: React.FC<DoctorControlsProps> = ({
  onStartCall,
  onAdmitPatient,
  onRemovePatient,
  onToggleChat,
  onShareScreen,
  onShareFile,
  onOpenSettings,
  callStarted,
  patientWaiting,
  patientAdmitted,
  isScreenSharing = false
}) => {
  const { toast } = useToast();

  const handleStartCall = () => {
    onStartCall();
    toast({
      title: "Video call started",
      description: "You can now admit patients to the call.",
    });
  };

  const handleAdmitPatient = () => {
    onAdmitPatient();
    toast({
      title: "Patient admitted",
      description: "The patient has joined the call.",
    });
  };

  const handleRemovePatient = () => {
    onRemovePatient();
    toast({
      title: "Patient removed",
      description: "The patient has been removed from the call.",
    });
  };

  return (
    <div className="flex items-center justify-center gap-4">
      {!callStarted ? (
        <Button 
          onClick={handleStartCall}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Play className="h-4 w-4 mr-2" />
          Start Session
        </Button>
      ) : (
        <>
          {patientWaiting && !patientAdmitted && (
            <Button 
              onClick={handleAdmitPatient}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Admit Patient
            </Button>
          )}
          
          {patientAdmitted && (
            <>
              <Button 
                variant="destructive"
                onClick={handleRemovePatient}
              >
                <UserX className="h-4 w-4 mr-2" />
                Remove Patient
              </Button>
              
              {onShareScreen && (
                <Button
                  variant={isScreenSharing ? "secondary" : "outline"}
                  onClick={onShareScreen}
                >
                  {isScreenSharing ? (
                    <>
                      <ScreenShareOff className="h-4 w-4 mr-2" />
                      Stop Sharing
                    </>
                  ) : (
                    <>
                      <ScreenShare className="h-4 w-4 mr-2" />
                      Share Screen
                    </>
                  )}
                </Button>
              )}

              {onShareFile && (
                <Button
                  variant="outline"
                  onClick={onShareFile}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Share File
                </Button>
              )}
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onToggleChat}>
                Toggle Chat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenSettings}>
                Video Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
};

export default DoctorControls;
