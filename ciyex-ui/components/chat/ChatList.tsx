
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  online?: boolean;
}

interface ChatListProps {
  users: ChatUser[];
  selectedUserId?: string;
  onSelectUser: (userId: string) => void;
  className?: string;
}

const ChatList: React.FC<ChatListProps> = ({
  users,
  selectedUserId,
  onSelectUser,
  className
}) => {
  return (
    <div className={cn("flex flex-col h-full border-r bg-background/95", className)}>
      <div className="p-4 border-b">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Messages</h2>
          <p className="text-sm text-muted-foreground">Chat with your doctors or patients</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-9 bg-muted/50"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-1">
          {users.map((user) => (
            <Button
              key={user.id}
              variant="ghost"
              className={cn(
                "w-full justify-start px-3 py-6 h-auto",
                selectedUserId === user.id && "bg-muted"
              )}
              onClick={() => onSelectUser(user.id)}
            >
              <div className="flex items-center w-full">
                <div className="relative mr-3">
                  <Avatar className="h-12 w-12">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {user.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <p className="truncate font-medium">{user.name}</p>
                    {user.lastMessageTime && (
                      <span className="text-xs text-muted-foreground">
                        {user.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  {user.lastMessage && (
                    <p className="truncate text-sm text-muted-foreground">
                      {user.lastMessage}
                    </p>
                  )}
                </div>
                
                {user.unreadCount && user.unreadCount > 0 && (
                  <div className="ml-2 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-foreground">
                      {user.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatList;
