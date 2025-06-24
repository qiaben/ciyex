"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import CartDropdown from '@/components/elab/CartDropdown';
import { Search, Phone, Award } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import NotificationCenter from '@/components/elab/NotificationCenter';
import UserProfile from '@/components/elab/UserProfile';
import LabLocator from '@/components/elab/LabLocator';

const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    window.location.href = `/#search=${encodeURIComponent(searchTerm)}`;
  };
  
  return (
    <header className="bg-gradient-to-r from-elab-light-blue to-blue-50 shadow-md sticky top-0 z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <form onSubmit={handleSearch} className="relative w-full md:w-auto flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                type="search" 
                placeholder="Search for tests..." 
                className="pl-10 py-2 pr-4 w-full text-sm rounded-full border-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
            
            <div className="hidden md:flex items-center space-x-3">
              
              <div className="flex items-center border-l border-gray-300 pl-3">
                <Award size={16} className="text-elab-medical-blue mr-1" />
                <span className="text-sm font-medium">Certified Labs</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <UserProfile />
                <CartDropdown />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
