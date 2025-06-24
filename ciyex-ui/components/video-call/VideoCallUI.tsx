import React from 'react';
import { Button } from "@/components/ui/button";
import { Phone, UserPlus, UserMinus, Share2, FileText, Settings, MessageSquare } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoCallUIProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  callStarted: boolean;
  patientWaiting: boolean;
  patientAdmitted: boolean;
  isScreenSharing: boolean;
  isDoctor: boolean;
  onStartCall?: () => void;
  onAdmitPatient?: () => void;
  onRemovePatient?: () => void;
  onToggleScreenShare?: () => void;
  onLeaveCall: () => void;
  title: string;
  connectionStatus: string;
  participants: any[];
}

const VideoCallUI: React.FC<VideoCallUIProps> = ({
  videoRef,
  callStarted,
  patientWaiting,
  patientAdmitted,
  isScreenSharing,
  isDoctor,
  onStartCall,
  onAdmitPatient,
  onRemovePatient,
  onToggleScreenShare,
  onLeaveCall,
  title,
  connectionStatus,
  participants
}) => {
  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'disconnected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="p-4 bg-white border-b">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">{title}</h1>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 ${getConnectionStatusColor(connectionStatus)}`}>
              <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span className="text-sm capitalize">{connectionStatus}</span>
            </div>
            {participants.length > 0 && (
              <div className="text-sm text-gray-500">
                {participants.length} participant{participants.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <video ref={videoRef} className="w-full h-full bg-black rounded-lg" autoPlay playsInline />
      </div>
      
      <div className="p-4 bg-white border-t">
        <div className="flex items-center justify-center gap-4">
          {isDoctor && !callStarted && onStartCall && (
            <Button
              onClick={onStartCall}
              className="flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              Start Session
            </Button>
          )}

          {isDoctor && callStarted && patientWaiting && !patientAdmitted && onAdmitPatient && (
            <Button
              onClick={onAdmitPatient}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Admit Patient
            </Button>
          )}

          {isDoctor && callStarted && patientAdmitted && onRemovePatient && (
            <Button
              onClick={onRemovePatient}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <UserMinus className="h-4 w-4" />
              Remove Patient
            </Button>
          )}

          {callStarted && (
            <>
              {onToggleScreenShare && (
                <Button
                  onClick={onToggleScreenShare}
                  variant={isScreenSharing ? "destructive" : "default"}
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  {isScreenSharing ? "Stop Sharing" : "Share Screen"}
                </Button>
              )}

              {isDoctor && (
                <Button
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Share File
                </Button>
              )}

              {isDoctor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Toggle Chat
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Video Settings
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button
                variant="destructive"
                onClick={onLeaveCall}
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                {isDoctor ? "End Call" : "Leave Call"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCallUI; 