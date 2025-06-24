
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Hand, 
  Share, 
  MessageSquare, 
  FileText, 
  ScreenShare, 
  ScreenShareOff
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PatientControlsProps {
  handRaised: boolean;
  onRaiseHand: () => void;
  isAdmitted: boolean;
  onToggleChat?: () => void;
  onShareFile?: () => void;
  onShareScreen?: () => void;
  isScreenSharing?: boolean;
  showChatButton?: boolean;
}

const PatientControls: React.FC<PatientControlsProps> = ({
  handRaised,
  onRaiseHand,
  isAdmitted,
  onToggleChat,
  onShareFile,
  onShareScreen,
  isScreenSharing = false,
  showChatButton = true
}) => {
  return (
    <div className="flex justify-center py-2 gap-2">
      {isAdmitted && (
        <>
          <Button 
            variant={handRaised ? "secondary" : "outline"} 
            size="sm"
            onClick={onRaiseHand}
            className={`text-xs flex items-center gap-2 ${handRaised ? 'border-primary' : ''}`}
          >
            <Hand className="h-3 w-3" />
            {handRaised ? 'Lower Hand' : 'Raise Hand'}
          </Button>
          
          {showChatButton && onToggleChat && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleChat}
              className="text-xs flex items-center gap-2"
            >
              <MessageSquare className="h-3 w-3" />
              Chat
            </Button>
          )}
          
          {onShareScreen && (
            <Button
              variant={isScreenSharing ? "secondary" : "outline"}
              size="sm"
              onClick={onShareScreen}
              className={`text-xs flex items-center gap-2 ${isScreenSharing ? 'border-primary' : ''}`}
            >
              {isScreenSharing ? (
                <>
                  <ScreenShareOff className="h-3 w-3" />
                  Stop Sharing
                </>
              ) : (
                <>
                  <ScreenShare className="h-3 w-3" />
                  Share Screen
                </>
              )}
            </Button>
          )}
          
          {onShareFile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs flex items-center gap-2"
                >
                  <Share className="h-3 w-3" />
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onShareFile}>
                  <FileText className="h-4 w-4 mr-2" />
                  Share Document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </>
      )}
    </div>
  );
};

export default PatientControls;
