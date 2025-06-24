"use client"
import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import VideoCallUI from '@/components/video-call/VideoCallUI';

interface Appointment {
  id: number;
  doctor: {
    id: string;
    name: string;
    email: string;
    specialization: string;
  };
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

const VideoConferencePatient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const [client, setClient] = useState<any>(null);
  const [stream, setStream] = useState<any>(null);
  const [joined, setJoined] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [participants, setParticipants] = useState<any[]>([]);

  // Only allow patients
  React.useEffect(() => {
    if (isLoaded && userId) {
      const role = user?.publicMetadata?.role as string;
      if (role !== 'patient') {
        toast({
          title: "Access Denied",
          description: "This page is only accessible to patients.",
          variant: "destructive"
        });
        router.push('/');
      }
    }
  }, [isLoaded, userId, user, router, toast]);

  useEffect(() => {
    if (!searchParams || !user) return;

    const joinMeeting = async () => {
      try {
        const appointmentId = searchParams.get('appointmentId');
        if (!appointmentId) {
          toast({
            title: "Error",
            description: "No appointment specified",
            variant: "destructive"
          });
          return;
        }

        // Get appointment details
        const { data: appointmentData } = await axios.get(`/api/appointments/${appointmentId}`);
        const appointment = appointmentData.appointment;

        // Verify this is the correct patient
        if (appointment.patient_id !== user.id) {
          toast({
            title: "Error",
            description: "You are not authorized to access this appointment",
            variant: "destructive"
          });
          return;
        }

        setCurrentAppointment(appointment);

        const VideoSDK = await (await import('@zoom/videosdk')).default;
        
        const payload = {
          topic: `Appointment with Dr. ${appointment.doctor.name}`,
          userName: user.id, // Using patient's ID as username
          role_type: 'attendee',
          password: 'abc123'
        };

        const {data} = await axios({
          url: '/api/zoom',
          method: 'post',
          data: payload
        });

        let newClient = VideoSDK.createClient();
        newClient.init('en-US', 'zoom.us');

        // Add event listeners for connection status
        newClient.on('connection-change', (payload: any) => {
          console.log('Connection status changed:', payload);
          setConnectionStatus(payload.state);
          
          if (payload.state === 'connected') {
            toast({
              title: "Connected",
              description: "Successfully connected to the video call",
            });
          } else if (payload.state === 'disconnected') {
            toast({
              title: "Disconnected",
              description: "Lost connection to the video call",
              variant: "destructive"
            });
          }
        });

        // Add event listeners for participant changes
        newClient.on('user-added', (payload: any) => {
          console.log('User added:', payload);
          setParticipants(prev => [...prev, payload]);
        });

        newClient.on('user-removed', (payload: any) => {
          console.log('User removed:', payload);
          setParticipants(prev => prev.filter(p => p.userId !== payload.userId));
        });

        setClient(newClient);
        
        if (data?.sessionToken && payload.userName) {
          await newClient.join(
            payload.topic,
            data.sessionToken,
            payload.userName,
            payload.password
          );
          
          const mediaStream = newClient.getMediaStream();
          setStream(mediaStream);
          
          // Start video and audio with proper configuration
          if (videoRef.current) {
            try {
              await mediaStream.startVideo({
                videoElement: videoRef.current
              });
              await mediaStream.startAudio();
              console.log('Video and audio started successfully');
            } catch (error) {
              console.error('Error starting video/audio:', error);
              toast({
                title: "Error",
                description: "Failed to start video/audio",
                variant: "destructive"
              });
            }
          }
          
          setJoined(true);
        }
      } catch (error) {
        console.error('Error joining meeting:', error);
        toast({
          title: "Error",
          description: "Failed to join video call",
          variant: "destructive"
        });
      }
    };

    joinMeeting();

    return () => {
      if (client) {
        client.off('connection-change');
        client.off('user-added');
        client.off('user-removed');
        client.leave();
      }
    };
  }, [searchParams, user, toast]);

  const handleLeaveCall = async () => {
    try {
      if (stream) {
        // Stop all media streams
        await stream.stopVideo();
        await stream.stopAudio();
      }

      if (client) {
        // Leave the meeting
        await client.leave();
        
        // Clean up the client
        client.destroy();
      }

      // Reset all states
      setClient(null);
      setStream(null);
      setJoined(false);

      toast({
        title: "Call Ended",
        description: "You have left the video call",
      });

      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error leaving call:', error);
      toast({
        title: "Error",
        description: "Failed to leave call properly",
        variant: "destructive"
      });
    }
  };

  if (!isLoaded || !userId) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  return (
    <VideoCallUI
      videoRef={videoRef}
      callStarted={joined}
      patientWaiting={false}
      patientAdmitted={false}
      isScreenSharing={false}
      isDoctor={false}
      onLeaveCall={handleLeaveCall}
      title={currentAppointment ? `Appointment with Dr. ${currentAppointment.doctor.name}` : 'Joining call...'}
      connectionStatus={connectionStatus}
      participants={participants}
    />
  );
};

export default VideoConferencePatient;
