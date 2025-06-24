'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from "../../../components/ui/button";
import { ThemeToggle } from '@/components/ThemeToggle';
import { MessageCircle, Search, Phone, Video, Smile, Send } from 'lucide-react';
import { NoDataFound } from "../../../components/no-data-found";

interface Doctor {
  id: string;
  name: string;
  imageUrl?: string;
  specialization?: string;
}

interface MessagesClientProps {
  doctors: Doctor[];
}

// Mock last message/timestamp for demo
const getLastMessage = (doctorId: string) => ({
  text: 'Last message preview...',
  time: '16:24',
});

export default function MessagesClient({ doctors }: MessagesClientProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(
    doctors.length > 0 ? doctors[0] : null
  );
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock messages for demonstration
  const mockMessages = [
    { id: 1, sender: 'doctor', text: 'Hello! How can I help you today?', timestamp: '10:00' },
    { id: 2, sender: 'patient', text: 'I have a question about my prescription.', timestamp: '10:01' },
    { id: 3, sender: 'doctor', text: 'Of course, what would you like to know?', timestamp: '10:02' },
    { id: 4, sender: 'patient', text: 'Thank you!', timestamp: '10:03' },
  ];

  const filteredDoctors = doctors.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    // TODO: Implement actual message sending
    setMessage('');
  };

  return (
    <div className="w-full min-h-screen flex items-stretch bg-background text-foreground">
      {/* Sidebar */}
      <aside className={`flex flex-col w-full max-w-xs md:max-w-sm border-r border-border bg-card transition-transform duration-300 z-20 ${sidebarOpen ? 'translate-x-0' : 'md:translate-x-0 -translate-x-full'} md:relative fixed md:static h-full`}>
        {/* Sidebar Header */}
        {/* <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-card/90"> */}
          {/* <span className="text-xl font-bold flex items-center gap-2"><MessageCircle className="w-5 h-5 text-primary" />Chats</span> */}
          {/* <div className="flex items-center gap-2"> */}
            {/* <ThemeToggle /> */}
            {/* <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}> */}
              {/* <span className="sr-only">Close</span> */}
              {/* × */}
            {/* </Button> */}
          {/* </div> */}
        {/* </div> */}
        {/* Search Bar */}
        <div className="px-4 py-2 border-b border-border bg-card/80">
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search or start a new chat"
              className="bg-transparent outline-none flex-1 text-sm text-foreground"
            />
          </div>
        </div>
        {/* Chat List */}
        <div className="flex-1 overflow-y-auto bg-card/90">
          {filteredDoctors.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <NoDataFound note="No chats found" />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filteredDoctors.map((doctor) => {
                const last = getLastMessage(doctor.id);
                const active = selectedDoctor?.id === doctor.id;
                return (
                  <li key={doctor.id}>
                    <button
                      onClick={() => { setSelectedDoctor(doctor); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${active ? 'bg-muted/70' : 'hover:bg-muted/40'} focus:outline-none`}
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        {doctor.imageUrl ? (
                          <Image src={doctor.imageUrl} alt={doctor.name} fill className="object-cover" />
                        ) : (
                          <span className="text-lg text-muted-foreground font-bold">{doctor.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground truncate">{doctor.name}</span>
                          <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">{last.time}</span>
                        </div>
                        <span className="text-xs text-muted-foreground truncate block">{last.text}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col relative bg-background" style={{ backgroundImage: 'url("/whatsapp-bg.svg")', backgroundSize: 'cover', backgroundRepeat: 'repeat' }}>
        {/* Mobile sidebar toggle */}
        <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-30 md:hidden" onClick={() => setSidebarOpen(true)}>
          <span className="sr-only">Open sidebar</span>
          <MessageCircle className="w-6 h-6" />
        </Button>
        {selectedDoctor ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b border-border bg-card/90 px-6 py-4 sticky top-0 z-10">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                {selectedDoctor.imageUrl ? (
                  <Image src={selectedDoctor.imageUrl} alt={selectedDoctor.name} fill className="object-cover" />
                ) : (
                  <span className="text-lg text-muted-foreground font-bold">{selectedDoctor.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{selectedDoctor.name}</h3>
                {selectedDoctor.specialization && (
                  <span className="text-xs text-muted-foreground">{selectedDoctor.specialization}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon"><Phone className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon"><Video className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon"><Search className="w-5 h-5" /></Button>
              </div>
            </div>
            {/* Messages */}
            <div className="flex-1 px-4 py-6 overflow-y-auto flex flex-col gap-2" style={{ minHeight: 0 }}>
              {mockMessages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm border border-border break-words relative whitespace-pre-line ${
                      msg.sender === 'patient'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted text-foreground rounded-bl-none'
                    }`}
                  >
                    <span>{msg.text}</span>
                    <span className="text-[10px] opacity-70 mt-1 block text-right absolute bottom-1 right-2">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="px-4 py-3 border-t border-border bg-card/90 flex items-center gap-2 sticky bottom-0 z-10">
              <Button type="button" variant="ghost" size="icon"><Smile className="w-5 h-5" /></Button>
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type a message"
                className="flex-1 px-4 py-2 rounded-full border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit" size="icon" className="rounded-full"><Send className="w-5 h-5" /></Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <NoDataFound note="Select a chat to start messaging" />
          </div>
        )}
      </main>
      {/* Optional: Add a subtle SVG background pattern for WhatsApp look. Place /whatsapp-bg.svg in public/ */}
    </div>
  );
}
