"use client";
import React from 'react';
import dynamic from "next/dynamic";
import { labTests } from '@/components/data/labTests';
import { useCart } from '@/components/context/CartContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Star, Plus } from 'lucide-react';

const MotionDiv = dynamic(() => import("framer-motion").then(mod => mod.motion.div), { ssr: false });

// Top rated tests - we'll just pick some popular ones from the existing list
const topRatedTests = labTests
  .filter(test => ['1', '12', '13', '14', '19'].includes(test.id))
  .map(test => ({ ...test, rating: 4 + Math.random() })); // Add random high rating

const TopRatedTests: React.FC = () => {
  const { addToCart } = useCart();
  
  return (
    <section className="py-12 px-4 bg-pattern">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-2 bg-blue-100 text-blue-700 hover:bg-blue-200">Featured</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Most Popular Lab Tests</h2>
          </MotionDiv>
        </div>
        
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-4 min-w-max">
            <MotionDiv 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
              viewport={{ once: true }}
            >
              {topRatedTests.map((test, index) => (
                <div key={test.id} className="w-72 flex-shrink-0">
                  <MotionDiv
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Badge className="bg-blue-500">{test.category}</Badge>
                          <Badge variant="outline" className="bg-white">
                            {test.code}
                          </Badge>
                        </div>
                        
                        <h3 className="font-bold text-lg mb-2">{test.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{test.description}</p>
                        
                        <div className="flex items-center mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={`${
                                i < Math.floor(test.rating)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : i < test.rating
                                  ? "text-yellow-400 fill-yellow-400 opacity-50"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-sm text-gray-600">({(test.rating).toFixed(1)})</span>
                        </div>
                        
                        <div className="flex justify-between items-center mt-auto">
                          <span className="font-bold text-lg">${test.price.toFixed(2)}</span>
                          <Button 
                            size="sm" 
                            className="bg-elab-medical-blue"
                            onClick={() => addToCart(test)}
                          >
                            <Plus size={16} className="mr-1" />
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </MotionDiv>
                </div>
              ))}
            </MotionDiv>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopRatedTests;
