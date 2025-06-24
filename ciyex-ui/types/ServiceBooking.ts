// Define the interface for a Service Booking
export interface ServiceBooking {
  id: string;
  serviceId: string;
  serviceName: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  bookingDate: string; // e.g., 'YYYY-MM-DD'
  bookingTime: string; // e.g., 'HH:mm'
  serviceAmount: number;
  platformFee: number;
  totalAmount: number;
  paymentMethod: 'credit_card' | 'insurance';
  paymentStatus: 'pending' | 'paid' | 'failed';
  insuranceStatus?: 'pending' | 'approved' | 'rejected'; // For insurance payments
  // Add other relevant fields like status of the booking (scheduled, completed, cancelled), etc.
  status: 'scheduled' | 'completed' | 'cancelled';
} 