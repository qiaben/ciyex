import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ButtonHTMLAttributes } from 'react';

interface EditProfileButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  profileData: any;
  className?: string;
  children?: React.ReactNode;
}

const EditProfileButton: React.FC<EditProfileButtonProps> = ({
  profileData,
  className,
  children,
  ...props
}) => {
  const router = useRouter();
  
  const handleEditClick = () => {
    router.push('/doctor-registration?edit=true');
  };

  return (
    <Button
      variant="outline"
      className={cn("flex items-center gap-2", className)}
      onClick={handleEditClick}
      {...props}
    >
      {children || (
        <>
          <Edit className="h-4 w-4" />
          Edit Profile
        </>
      )}
    </Button>
  );
};

export default EditProfileButton;
