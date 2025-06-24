// Sample mock data for development purposes
// In a real application, this would come from an API

export interface Appointment {
  id: string;
  patientId?: string;
  doctorId?: string;
  patientName?: string;
  doctorName?: string;
  avatar?: string;
  date: Date;
  durationMinutes: number;
  reason: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'ongoing' | 'pending';
}

export const generateMockAppointments = (userType: 'doctor' | 'patient'): Appointment[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Create appointments for today
  const todayAppointments = [
    {
      id: '1',
      patientId: 'p1',
      doctorId: 'd1',
      patientName: 'Sarah Johnson',
      doctorName: 'Dr. Emily Chen',
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
      date: new Date(today.getTime() + 10 * 60 * 1000), // 10 minutes from now
      durationMinutes: 15,
      reason: 'Annual Checkup',
      status: 'upcoming' as const
    },
    {
      id: '2',
      patientId: 'p2',
      doctorId: 'd1',
      patientName: 'Robert Lee',
      doctorName: 'Dr. Emily Chen',
      avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
      date: new Date(today.getTime() + 60 * 60 * 1000), // 1 hour from now
      durationMinutes: 30,
      reason: 'Follow-up Consultation',
      status: 'upcoming' as const
    },
    {
      id: '3',
      patientId: 'p3',
      doctorId: 'd1',
      patientName: 'Emma Wilson',
      doctorName: 'Dr. Emily Chen',
      avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
      date: new Date(today.getTime() + 3 * 60 * 60 * 1000), // 3 hours from now
      durationMinutes: 15,
      reason: 'Medication Review',
      status: 'upcoming' as const
    }
  ];
  
  // Create appointments for tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const tomorrowAppointments = [
    {
      id: '4',
      patientId: 'p4',
      doctorId: 'd1',
      patientName: 'James Brown',
      doctorName: 'Dr. Emily Chen',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      date: new Date(tomorrow.getTime() + 10 * 60 * 60 * 1000), // 10 AM tomorrow
      durationMinutes: 30,
      reason: 'Initial Consultation',
      status: 'upcoming' as const
    },
    {
      id: '5',
      patientId: 'p5',
      doctorId: 'd1',
      patientName: 'Olivia Davis',
      doctorName: 'Dr. Emily Chen',
      avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
      date: new Date(tomorrow.getTime() + 14 * 60 * 60 * 1000), // 2 PM tomorrow
      durationMinutes: 15,
      reason: 'Test Results Discussion',
      status: 'upcoming' as const
    }
  ];
  
  // Create appointments for the day after tomorrow
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
  
  const dayAfterTomorrowAppointments = [
    {
      id: '6',
      patientId: 'p6',
      doctorId: 'd1',
      patientName: 'Michael Smith',
      doctorName: 'Dr. Emily Chen',
      avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
      date: new Date(dayAfterTomorrow.getTime() + 9 * 60 * 60 * 1000), // 9 AM day after tomorrow
      durationMinutes: 45,
      reason: 'Comprehensive Evaluation',
      status: 'upcoming' as const
    }
  ];
  
  // Create past appointments
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const pastAppointments = [
    {
      id: '7',
      patientId: 'p7',
      doctorId: 'd1',
      patientName: 'William Taylor',
      doctorName: 'Dr. Emily Chen',
      avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
      date: new Date(yesterday.getTime() + 11 * 60 * 60 * 1000), // 11 AM yesterday
      durationMinutes: 30,
      reason: 'Routine Checkup',
      status: 'completed' as const
    },
    {
      id: '8',
      patientId: 'p8',
      doctorId: 'd1',
      patientName: 'Sophia Anderson',
      doctorName: 'Dr. Emily Chen',
      avatar: 'https://randomuser.me/api/portraits/women/67.jpg',
      date: new Date(yesterday.getTime() + 15 * 60 * 60 * 1000), // 3 PM yesterday
      durationMinutes: 15,
      reason: 'Quick Follow-up',
      status: 'completed' as const
    }
  ];
  
  // Create cancelled appointment
  const twoDaysAgo = new Date(yesterday);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 1);
  
  const cancelledAppointments = [
    {
      id: '9',
      patientId: 'p9',
      doctorId: 'd1',
      patientName: 'Daniel Martinez',
      doctorName: 'Dr. Emily Chen',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      date: new Date(twoDaysAgo.getTime() + 13 * 60 * 60 * 1000), // 1 PM two days ago
      durationMinutes: 15,
      reason: 'Consultation',
      status: 'cancelled' as const
    }
  ];
  
  return [
    ...todayAppointments,
    ...tomorrowAppointments,
    ...dayAfterTomorrowAppointments,
    ...pastAppointments,
    ...cancelledAppointments
  ];
};
