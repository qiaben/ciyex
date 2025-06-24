
import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatInput from '@/components/chat/ChatInput';
import ChatMessage from '@/components/chat/ChatMessage';
import { Button } from '@/components/ui/button';
import { ChevronDown, Paperclip, Image, File } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VideoCallChatProps {
  onClose?: () => void;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'other';
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  isRead: boolean;
  attachment?: {
    type: 'image' | 'file';
    name: string;
    url: string;
  };
}

const VideoCallChat: React.FC<VideoCallChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I can see you have questions during our session. Feel free to ask anything here.',
      sender: 'other',
      senderName: 'Dr. Emily Chen',
      senderAvatar: 'https://randomuser.me/api/portraits/women/42.jpg',
      timestamp: new Date(Date.now() - 120000),
      isRead: true
    }
  ]);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      senderName: 'You',
      senderAvatar: 'https://randomuser.me/api/portraits/women/33.jpg',
      timestamp: new Date(),
      isRead: false
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate doctor response after a short delay
    if (messages.length < 2) {
      setTimeout(() => {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          content: "I see you have a question. Let me address that during our session, but feel free to ask more questions here if needed.",
          sender: 'other',
          senderName: 'Dr. Emily Chen',
          senderAvatar: 'https://randomuser.me/api/portraits/women/42.jpg',
          timestamp: new Date(),
          isRead: true
        };
        setMessages(prev => [...prev, response]);
      }, 3000);
    }
  };

  const handleAttachImage = () => {
    // In a real app, this would open a file picker
    const imageMessage: Message = {
      id: Date.now().toString(),
      content: "I'm sharing this image for reference.",
      sender: 'user',
      senderName: 'You',
      senderAvatar: 'https://randomuser.me/api/portraits/women/33.jpg',
      timestamp: new Date(),
      isRead: false,
      attachment: {
        type: 'image',
        name: 'medical_report.jpg',
        url: 'https://randomuser.me/api/portraits/women/33.jpg'
      }
    };

    setMessages(prev => [...prev, imageMessage]);
    setShowAttachmentOptions(false);
  };

  const handleAttachFile = () => {
    // In a real app, this would open a file picker
    const fileMessage: Message = {
      id: Date.now().toString(),
      content: "Here's the medical document I mentioned.",
      sender: 'user',
      senderName: 'You',
      senderAvatar: 'https://randomuser.me/api/portraits/women/33.jpg',
      timestamp: new Date(),
      isRead: false,
      attachment: {
        type: 'file',
        name: 'medical_report.pdf',
        url: '#'
      }
    };

    setMessages(prev => [...prev, fileMessage]);
    setShowAttachmentOptions(false);
  };

  return (
    <div className="flex flex-col h-full border-l bg-card">
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <h3 className="font-medium flex items-center gap-2">
          Live Chat
          <span className="inline-flex h-2 w-2 rounded-full bg-green-500"></span>
        </h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ChevronDown className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              sender={message.sender}
              timestamp={message.timestamp}
              senderName={message.senderName}
              senderAvatar={message.senderAvatar}
              isRead={message.isRead}
              attachment={message.attachment}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="relative p-3 border-t">
        {showAttachmentOptions && (
          <div className="absolute bottom-16 left-4 bg-card shadow-lg rounded-md border p-2 flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleAttachImage}>
                    <Image className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share image</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleAttachFile}>
                    <File className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share document</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
            className={showAttachmentOptions ? 'bg-muted' : ''}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <ChatInput 
            onSend={handleSendMessage}
            placeholder="Type a message..."
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};

export default VideoCallChat;
