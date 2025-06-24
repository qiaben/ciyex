import { getDoctorById } from '@/utils/doctors';
import { getDoctorRatings } from '@/utils/ratings';
import { getRecentApplications } from '@/utils/appointments';
import DoctorProfileClient from './doctor-profile-client';
import { WorkingDays } from '@prisma/client';

interface ParamsProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const DoctorProfile = async (props: ParamsProps) => {
  const params = await props.params;
  // Fetch doctor data
  const { data: doctor, totalAppointment } = await getDoctorById(params.id);
  if (!doctor) {
    return <div>Doctor not found</div>;
  }

  // Get available days string
  const availableDaysStr = doctor.working_days
    ?.filter((schedule: WorkingDays) => schedule.start_time && schedule.close_time)
    .map((schedule: WorkingDays) => schedule.day)
    .join(', ') || 'Not available';

  // Fetch recent applications
  const recentApplications = await getRecentApplications(params.id);

  // Fetch ratings
  const ratings = await getDoctorRatings(params.id);

  // Transform doctor data to match client component expectations
  const transformedDoctor = {
    ...doctor,
    name: doctor.name,
    specialty: doctor.specialization,
    title: `${doctor.specialization} Specialist`,
    experience: doctor.years_in_practice || '0',
    location: `${doctor.address}, ${doctor.city}, ${doctor.state} ${doctor.zip}`,
    email: doctor.email,
    phone: doctor.phone,
    website: '#', // Add website if available
    bio: `Dr. ${doctor.name} is a ${doctor.specialization} specialist with ${doctor.years_in_practice || '0'} years of experience.`,
    education: [], // Add education if available
    certifications: [], // Add certifications if available
    languages: [], // Add languages if available
    workingHours: doctor.working_days.map((day: WorkingDays) => ({
      day: day.day,
      hours: `${day.start_time} - ${day.close_time}`,
    })),
  };

  return (
    <DoctorProfileClient
      data={transformedDoctor}
      totalAppointment={totalAppointment}
      availableDaysStr={availableDaysStr}
      recentApplications={recentApplications}
      ratings={ratings}
    />
  );
};

export default DoctorProfile;
