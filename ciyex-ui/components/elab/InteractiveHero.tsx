"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from 'next/link';

type FeatureCard = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
};

const featureCards: FeatureCard[] = [
  {
    id: '1',
    title: 'Accurate Results',
    description: 'Our state-of-the-art laboratories provide precise and reliable test results.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-blue-500',
  },
  {
    id: '2',
    title: 'Quick Turnaround',
    description: 'Get your results faster with our efficient testing processes.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-green-500',
  },
  {
    id: '3',
    title: 'Expert Analysis',
    description: 'Our medical professionals provide thorough analysis and interpretation.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    color: 'bg-purple-500',
  }
];

const InteractiveHero: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCard, setActiveCard] = useState<string | null>(null);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    if (searchQuery.trim()) {
      window.location.href = `/#search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <section className="w-full pt-12 pb-20 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-elab-medical-blue">
              Advanced Laboratory Testing
            </h1>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Comprehensive diagnostic services with accurate results and professional interpretation.
            </p>
          </motion.div>
        </div>
        
        <div className="relative max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input 
                type="search" 
                placeholder="Search for a lab test (e.g., 'blood glucose', 'cholesterol')..." 
                className="pl-10 pr-24 py-6 text-lg rounded-full border-gray-200 shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                className="absolute right-1.5 top-1/2 transform -translate-y-1/2 rounded-full px-5 py-6"
              >
                Search
              </Button>
            </motion.div>
          </form>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {featureCards.map((card, index) => (
            <div
              key={card.id}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all ${activeCard === card.id ? 'ring-2 ring-blue-400' : ''}`}
              onClick={() => setActiveCard(activeCard === card.id ? null : card.id)}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                whileHover={{ y: -5 }}
              >
                <div className="p-6">
                  <div className={`${card.color} w-12 h-12 rounded-full flex items-center justify-center text-white mb-4`}>
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{card.title}</h3>
                  <p className="text-gray-600">{card.description}</p>
                </div>
                {activeCard === card.id && (
                  <div className="px-6 pb-6 pt-2 text-sm text-gray-600 border-t border-gray-100">
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <p className="mb-4">
                        Our medical professionals use the latest technologies to ensure you receive the most accurate and reliable results possible.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Learn More
                      </Button>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p className="text-lg font-medium text-gray-900 mb-6">
              Trusted by leading healthcare providers
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded-md w-32"></div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveHero;
