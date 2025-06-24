import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { File } from 'lucide-react';

interface ChatMessageProps {
  content: string;
  sender: 'user' | 'other';
  timestamp: Date;
  senderName: string;
  senderAvatar?: string;
  isRead?: boolean;
  attachment?: {
    type: 'image' | 'file';
    name: string;
    url: string;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  sender,
  timestamp,
  senderName,
  senderAvatar,
  isRead = false,
  attachment
}) => {
  const isUser = sender === 'user';
  
  return (
    <div className={cn(
      "flex w-full max-w-[85%] mb-4",
      isUser ? "ml-auto justify-end" : "mr-auto justify-start"
    )}>
      {!isUser && (
        <div className="flex-shrink-0 mr-2">
          <Avatar className="h-8 w-8 border border-border">
            {senderAvatar ? (
              <AvatarImage src={senderAvatar} alt={senderName} />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary">
                {senderName.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
      )}
      
      <div className={cn(
        "flex flex-col",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-2xl px-4 py-2 text-sm shadow-sm",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-none" 
            : "bg-muted/80 dark:bg-muted text-foreground rounded-tl-none"
        )}>
          {content}
          {attachment && (
            <div className="mt-2">
              {attachment.type === 'image' ? (
                <div className="relative rounded-md overflow-hidden">
                  <img 
                    src={attachment.url} 
                    alt={attachment.name} 
                    className="max-w-full h-auto object-cover rounded-md"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-background/50 rounded-md p-2">
                  <File className="h-4 w-4" />
                  <span className="text-xs truncate">{attachment.name}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center mt-1 text-xs text-muted-foreground space-x-1">
          <span>{format(timestamp, 'h:mm a')}</span>
          {isUser && (
            <>
              <span>•</span>
              <span>{isRead ? 'Read' : 'Sent'}</span>
            </>
          )}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 ml-2">
          <Avatar className="h-8 w-8 border border-border">
            {senderAvatar ? (
              <AvatarImage src={senderAvatar} alt={senderName} />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary">
                {senderName.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
