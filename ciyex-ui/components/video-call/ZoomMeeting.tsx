import React, { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateZoomSignature } from '@/utils/services/zoom';

declare global {
  interface Window {
    ZoomMtg: any;
  }
}

interface ZoomMeetingProps {
  meetingNumber: string;
  userName: string;
  userEmail: string;
  passWord: string;
  role: number; // 0 for attendee, 1 for host
  onMeetingEnd?: () => void;
}

const ZoomMeeting: React.FC<ZoomMeetingProps> = ({
  meetingNumber,
  userName,
  userEmail,
  passWord,
  role,
  onMeetingEnd,
}) => {
  const { toast } = useToast();
  const zoomContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadZoomScript = async () => {
      try {
        // Load Zoom SDK script
        const script = document.createElement('script');
        script.src = 'https://source.zoom.us/2.9.5/lib/vendor/react.min.js';
        document.body.appendChild(script);

        const script2 = document.createElement('script');
        script2.src = 'https://source.zoom.us/2.9.5/lib/vendor/react-dom.min.js';
        document.body.appendChild(script2);

        const script3 = document.createElement('script');
        script3.src = 'https://source.zoom.us/2.9.5/lib/vendor/redux.min.js';
        document.body.appendChild(script3);

        const script4 = document.createElement('script');
        script4.src = 'https://source.zoom.us/2.9.5/lib/vendor/redux-thunk.min.js';
        document.body.appendChild(script4);

        const script5 = document.createElement('script');
        script5.src = 'https://source.zoom.us/2.9.5/lib/vendor/lodash.min.js';
        document.body.appendChild(script5);

        const script6 = document.createElement('script');
        script6.src = 'https://source.zoom.us/zoom-meeting-2.9.5.min.js';
        document.body.appendChild(script6);

        // Wait for scripts to load
        await Promise.all([
          new Promise((resolve) => script.onload = resolve),
          new Promise((resolve) => script2.onload = resolve),
          new Promise((resolve) => script3.onload = resolve),
          new Promise((resolve) => script4.onload = resolve),
          new Promise((resolve) => script5.onload = resolve),
          new Promise((resolve) => script6.onload = resolve),
        ]);

        // Initialize Zoom meeting
        const signature = generateZoomSignature({ meetingNumber, role });
        
        window.ZoomMtg.init({
          leaveUrl: window.location.origin,
          success: () => {
            window.ZoomMtg.join({
              signature,
              meetingNumber,
              userName,
              userEmail,
              passWord,
              success: () => {
                toast({
                  title: "Connected to Zoom",
                  description: "You have successfully joined the meeting.",
                });
              },
              error: (error: any) => {
                console.error('Error joining meeting:', error);
                toast({
                  title: "Connection Error",
                  description: "Failed to join the Zoom meeting.",
                  variant: "destructive"
                });
              },
            });
          },
          error: (error: any) => {
            console.error('Error initializing Zoom:', error);
            toast({
              title: "Initialization Error",
              description: "Failed to initialize Zoom meeting.",
              variant: "destructive"
            });
          },
        });
      } catch (error) {
        console.error('Error loading Zoom scripts:', error);
        toast({
          title: "Loading Error",
          description: "Failed to load Zoom components.",
          variant: "destructive"
        });
      }
    };

    loadZoomScript();

    return () => {
      // Cleanup Zoom meeting when component unmounts
      if (window.ZoomMtg) {
        window.ZoomMtg.leave({
          success: () => {
            if (onMeetingEnd) {
              onMeetingEnd();
            }
          },
        });
      }
    };
  }, [meetingNumber, userName, userEmail, passWord, role, toast, onMeetingEnd]);

  return (
    <div 
      ref={zoomContainerRef} 
      className="w-full h-full"
      id="zmmtg-root"
    />
  );
};

export default ZoomMeeting; 