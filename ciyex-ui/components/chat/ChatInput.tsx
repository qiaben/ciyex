
import React, { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PaperclipIcon, SendIcon, SmileIcon, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  placeholder = "Type a message...",
  disabled = false,
  className
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("flex flex-col w-full border-t bg-background py-4 px-4", className)}>
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-12 max-h-32 py-3 pr-12 resize-none rounded-full"
            rows={1}
          />
          <div className="absolute right-3 bottom-2 flex space-x-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full hover:bg-muted"
              type="button"
            >
              <PaperclipIcon className="h-4 w-4" />
              <span className="sr-only">Attach file</span>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full hover:bg-muted"
              type="button"
            >
              <SmileIcon className="h-4 w-4" />
              <span className="sr-only">Add emoji</span>
            </Button>
          </div>
        </div>
        
        {message.trim() ? (
          <Button 
            onClick={handleSend} 
            size="icon" 
            className="h-10 w-10 rounded-full flex-shrink-0 bg-primary hover:bg-primary/90"
            disabled={disabled}
          >
            <SendIcon className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        ) : (
          <Button
            size="icon"
            className="h-10 w-10 rounded-full flex-shrink-0 bg-primary hover:bg-primary/90"
          >
            <Mic className="h-4 w-4" />
            <span className="sr-only">Voice message</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
