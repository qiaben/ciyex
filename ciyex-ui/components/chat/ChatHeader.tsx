
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PhoneCall, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  name: string;
  avatar?: string;
  status?: string;
  onBack?: () => void;
  showBackButton?: boolean;
  className?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  avatar,
  status,
  onBack,
  showBackButton = false,
  className
}) => {
  return (
    <div className={cn("flex items-center justify-between px-4 py-3 border-b bg-background/95", className)}>
      <div className="flex items-center">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 sm:hidden"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        )}
        
        <Avatar className="h-10 w-10 mr-3">
          {avatar ? (
            <AvatarImage src={avatar} alt={name} />
          ) : (
            <AvatarFallback className="bg-primary/10 text-primary">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div>
          <h3 className="font-semibold">{name}</h3>
          {status && (
            <p className="text-xs text-muted-foreground">{status}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="icon" className="rounded-full">
          <PhoneCall className="h-4 w-4" />
          <span className="sr-only">Voice call</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Video className="h-4 w-4" />
          <span className="sr-only">Video call</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">More options</span>
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
