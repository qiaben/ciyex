"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DoctorServiceCreation from '@/components/DoctorServiceCreation';
import DoctorServiceList from '@/components/DoctorServiceList';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, List, Edit } from 'lucide-react';
import { useUser } from "@clerk/nextjs";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0 }
};

const headerVariants = {
  initial: { y: -20, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const tabVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

const contentVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
};

const DoctorServiceManagement = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('list');
  const [editingService, setEditingService] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoaded } = useUser();

  const userId = user?.id;

  const fetchServices = async () => {
    setLoading(true);
    const res = await fetch('/api/services');
    const data = await res.json();
    setServices(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEditService = (service: any) => {
    setEditingService(service);
    setActiveTab('create');
  };

  // Filter services to only show the current doctor's services
  const myServices = services.filter((service) => service.doctor_id === userId);

  return (
    <motion.div 
      style={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(to bottom right, #EFF6FF, #EEF2FF, #F5F3FF)'
      }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex-grow container mx-auto px-4 py-8">
        <motion.div 
          variants={headerVariants}
          style={{ marginBottom: '3rem', textAlign: 'center' }}
        >
          <motion.h1 
            style={{ 
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              background: 'linear-gradient(to right, #2563EB, #4F46E5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Service Management
          </motion.h1>
          <motion.p 
            style={{ 
              color: '#4B5563',
              fontSize: '1.125rem',
              maxWidth: '42rem',
              margin: '0 auto'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Create and manage the healthcare services you offer to patients
          </motion.p>
        </motion.div>
        
        <div className="max-w-5xl mx-auto">
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'create' | 'list')} 
            className="w-full"
          >
            <motion.div variants={tabVariants}>
              <TabsList className="grid w-full grid-cols-2 mb-8 rounded-xl p-1 bg-white/50 backdrop-blur-sm shadow-lg">
                <TabsTrigger 
                  value="list" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-lg transition-all duration-300"
                >
                  <List className="w-4 h-4 mr-2" /> My Services
                </TabsTrigger>
                <TabsTrigger 
                  value="create" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-lg transition-all duration-300"
                >
                  {editingService ? (
                    <><Edit className="w-4 h-4 mr-2" /> Edit Service</>
                  ) : (
                    <><Plus className="w-4 h-4 mr-2" /> Create New Service</>
                  )}
                </TabsTrigger>
              </TabsList>
            </motion.div>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                variants={contentVariants}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="create" className="mt-0">
                  <DoctorServiceCreation 
                    editingService={editingService} 
                    onServiceSaved={() => {
                      setEditingService(null);
                      setActiveTab('list');
                      fetchServices();
                    }}
                    onCancel={() => {
                      setEditingService(null);
                      setActiveTab('list');
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="list" className="mt-0">
                  <DoctorServiceList onEditService={handleEditService} services={myServices} loading={loading} onServiceSaved={fetchServices} />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorServiceManagement;
