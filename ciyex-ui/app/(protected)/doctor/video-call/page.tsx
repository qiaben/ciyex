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

const VideoConferenceDoctor = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const [client, setClient] = useState<any>(null);
  const [stream, setStream] = useState<any>(null);
  const [callStarted, setCallStarted] = useState(false);
  const [patientWaiting, setPatientWaiting] = useState(false);
  const [patientAdmitted, setPatientAdmitted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [participants, setParticipants] = useState<any[]>([]);

  // Only allow doctors
  React.useEffect(() => {
    if (isLoaded && userId) {
      const role = user?.publicMetadata?.role as string;
      if (role !== 'doctor') {
        toast({
          title: "Access Denied",
          description: "This page is only accessible to doctors.",
          variant: "destructive"
        });
        router.push('/');
      }
    }
  }, [isLoaded, userId, user, router, toast]);

  const handleStartCall = async () => {
    try {
      if (!searchParams || !user) return;

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

      // Verify this is the correct doctor
      if (appointment.doctor_id !== user.id) {
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
        topic: `Appointment with ${appointment.patient.first_name} ${appointment.patient.last_name}`,
        userName: user.id, // Using doctor's ID as username
        role_type: 'host',
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
        setPatientWaiting(true);
        toast({
          title: "Patient Joined",
          description: "A patient has joined the waiting room",
        });
      });

      newClient.on('user-removed', (payload: any) => {
        console.log('User removed:', payload);
        setParticipants(prev => prev.filter(p => p.userId !== payload.userId));
        if (payload.userId === currentAppointment?.patient.id) {
          setPatientWaiting(false);
          setPatientAdmitted(false);
          toast({
            title: "Patient Left",
            description: "The patient has left the call",
          });
        }
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
        
        setCallStarted(true);
        toast({
          title: "Call Started",
          description: "The video call has been started",
        });
      }
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Error",
        description: "Failed to start video call",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (!searchParams || !user) return;

    return () => {
      if (client) {
        client.off('connection-change');
        client.off('user-added');
        client.off('user-removed');
        client.leave();
      }
    };
  }, [searchParams, user]);

  const handleAdmitPatient = () => {
    setPatientWaiting(false);
    setPatientAdmitted(true);
    toast({
      title: "Patient Admitted",
      description: "The patient has been admitted to the call",
    });
  };

  const handleRemovePatient = () => {
    setPatientAdmitted(false);
    toast({
      title: "Patient Removed",
      description: "The patient has been removed from the call",
    });
  };

  const handleToggleScreenShare = async () => {
    if (!stream) return;

    try {
      if (!isScreenSharing) {
        await stream.startShareScreen();
        setIsScreenSharing(true);
        toast({
          title: "Screen Sharing Started",
          description: "Your screen is now being shared",
        });
      } else {
        await stream.stopShareScreen();
        setIsScreenSharing(false);
        toast({
          title: "Screen Sharing Stopped",
          description: "Screen sharing has been stopped",
        });
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast({
        title: "Error",
        description: "Failed to toggle screen sharing",
        variant: "destructive"
      });
    }
  };

  const handleLeaveCall = async () => {
    try {
      if (stream) {
        // Stop all media streams
        await stream.stopVideo();
        await stream.stopAudio();
        if (isScreenSharing) {
          await stream.stopShareScreen();
        }
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
      setCallStarted(false);
      setPatientWaiting(false);
      setPatientAdmitted(false);
      setIsScreenSharing(false);

      toast({
        title: "Call Ended",
        description: "The video call session has been ended",
      });

      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error ending call:', error);
      toast({
        title: "Error",
        description: "Failed to end call properly",
        variant: "destructive"
      });
    }
  };

  // Add connection status display
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

  if (!isLoaded || !userId) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  return (
    <VideoCallUI
      videoRef={videoRef}
      callStarted={callStarted}
      patientWaiting={patientWaiting}
      patientAdmitted={patientAdmitted}
      isScreenSharing={isScreenSharing}
      isDoctor={true}
      onStartCall={handleStartCall}
      onAdmitPatient={handleAdmitPatient}
      onRemovePatient={handleRemovePatient}
      onToggleScreenShare={handleToggleScreenShare}
      onLeaveCall={handleLeaveCall}
      title={currentAppointment ? `Appointment with ${currentAppointment.patient.first_name} ${currentAppointment.patient.last_name}` : 'Joining call...'}
      connectionStatus={connectionStatus}
      participants={participants}
    />
  );
};

export default VideoConferenceDoctor;
