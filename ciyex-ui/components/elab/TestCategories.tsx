import React from 'react';
import { motion } from 'framer-motion';
import { getUniqueCategories } from '../data/labTests';
import TestCategoryCard from './TestCategoryCard';
import { Badge } from '@/components/ui/badge';

const categoryIcons: Record<string, string> = {
  'Blood': 'droplets',
  'Liver Function': 'activity',
  'Pancreas': 'activity',
  'Autoimmune': 'shieldAlert',
  'Anemia': 'droplets',
  'Basic Wellness': 'heart',
  'Vitamins and Minerals': 'apple',
  'Thyroid Function': 'activity',
  'STD Tests': 'shieldAlert',
  'Cardiac Health': 'heart',
  'all': 'microscope'
};

const TestCategories: React.FC = () => {
  const categories = getUniqueCategories();
  
  return (
    <section className="py-12 px-4 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-2 bg-blue-100 text-blue-700 hover:bg-blue-200">Categories</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Browse Tests by Category</h2>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            viewport={{ once: true }}
          >
            {categories.map((category, index) => (
              <div
                key={category}
                onClick={() => {
                  const testCatalogElement = document.getElementById('test-catalog');
                  if (testCatalogElement) {
                    testCatalogElement.scrollIntoView({ behavior: 'smooth' });
                    const categorySelector = document.querySelector(`select option[value="${category}"]`) as HTMLOptionElement;
                    if (categorySelector) {
                      categorySelector.selected = true;
                      const event = new Event('change', { bubbles: true });
                      categorySelector.parentElement?.dispatchEvent(event);
                    }
                  }
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <TestCategoryCard 
                    name={category.charAt(0).toUpperCase() + category.slice(1)} 
                    description={`Browse ${category} tests`}
                    iconType={categoryIcons[category] || 'microscope'}
                    colorClass={index % 2 === 0 ? "bg-blue-50" : "bg-elab-soft-green"}
                  />
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TestCategories;
