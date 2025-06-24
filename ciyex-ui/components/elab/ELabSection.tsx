
import React, { useState, useEffect } from 'react';
import TestCatalog from './TestCatalog';
import { motion } from 'framer-motion';
import { TestCardSkeletonGroup } from './TestCardSkeleton';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const ELabSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <section id="test-catalog" className="w-full bg-white py-8">
      <div className="container mx-auto px-4">
        {/* Test Catalog with enhanced UI */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-elab-medical-blue to-blue-700">
              Browse Lab Tests
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our comprehensive selection of laboratory tests
            </p>
          </div>
          
          <div className="sticky top-20 z-10 backdrop-blur-md bg-white/80 py-3 px-4 rounded-xl shadow-md mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-1">
              {isLoading ? (
                <div className="container mx-auto px-4 py-8">
                  <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                      <Skeleton className="h-12 w-full" />
                    </div>
                    <div className="relative min-w-[200px]">
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                  <TestCardSkeletonGroup />
                </div>
              ) : (
                <TestCatalog />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Add the Skeleton component here since it's only used in this file
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

export default ELabSection;
