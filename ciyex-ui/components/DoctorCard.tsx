
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

type DoctorCardProps = {
  name: string;
  specialty: string;
  availableTime?: string;
  avatarUrl?: string;
  onBookAppointment?: () => void;
};

const DoctorCard: React.FC<DoctorCardProps> = ({
  name,
  specialty,
  availableTime = "09:00 - 17:00",
  avatarUrl,
  onBookAppointment,
}) => {
  // Get initials for avatar placeholder
  const initials = name.split(' ').map(n => n[0]).join('');
  
  return (
    <Card className="healthcare-card">
      <CardContent className="p-5">
        <div className="flex flex-col items-center text-center mb-4">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={name}
              className="w-16 h-16 rounded-full object-cover mb-3"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-healthcare-secondary flex items-center justify-center mb-3">
              <span className="text-healthcare-primary font-bold text-lg">
                {initials}
              </span>
            </div>
          )}
          <h3 className="font-semibold text-gray-800">{name}</h3>
          <p className="text-sm text-gray-500">{specialty}</p>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-sm mb-4">
          <Calendar size={16} className="text-healthcare-primary" />
          <span className="text-gray-600">Available: {availableTime}</span>
        </div>
        
        {onBookAppointment && (
          <Button 
            className="w-full bg-healthcare-primary hover:bg-healthcare-primary/90"
            onClick={onBookAppointment}
          >
            Book Appointment
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorCard;
