"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, ArrowRight } from 'lucide-react';
import { useTheme } from 'next-themes';

const MovingBar = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / 100, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      alpha: true,
      antialias: true 
    });
    
    renderer.setSize(window.innerWidth, 80);
    renderer.setClearColor(0x000000, 0);

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 400;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      color: theme === 'dark' ? 0x10b981 : 0x059669,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 5;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      particlesMesh.rotation.x += 0.0005;
      particlesMesh.rotation.y += 0.0005;
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      const width = window.innerWidth;
      camera.aspect = width / 100;
      camera.updateProjectionMatrix();
      renderer.setSize(width, 80);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      scene.remove(particlesMesh);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, [theme]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[80px] overflow-hidden transition-colors duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full opacity-30"
        style={{ zIndex: 1 }}
      />
      
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: '-100%' }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        }}
        className="absolute inset-0 flex items-center"
        style={{ zIndex: 3 }}
      >
        <div className="flex items-center space-x-16 whitespace-nowrap">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
            </motion.div>
            <span className="text-yellow-600 dark:text-yellow-400 font-bold text-lg tracking-wider">
              SPECIAL OFFER
            </span>
          </motion.div>

          <div className="flex items-center space-x-4">
            <span className="text-gray-800 dark:text-white font-bold text-2xl">
              Online consultations just
            </span>
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0],
                y: [0, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="relative"
            >
              <span className="text-yellow-600 dark:text-yellow-400 font-extrabold text-4xl">
                $29
              </span>
              <motion.div
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                }}
                className="absolute -top-2 -right-2"
              >
                <Star className="h-4 w-4 text-yellow-500 dark:text-yellow-400" fill="currentColor" />
              </motion.div>
            </motion.div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-gray-600 dark:text-emerald-200">
              Available in
            </span>
            <motion.div
              animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-2"
            >
              <span className="text-gray-800 dark:text-white font-semibold">
                Florida
              </span>
              <span className="text-emerald-500 dark:text-emerald-200">•</span>
              <span className="text-gray-800 dark:text-white font-semibold">
                Oregon
              </span>
              <span className="text-emerald-500 dark:text-emerald-200">•</span>
              <span className="text-gray-800 dark:text-white font-semibold">
                Washington
              </span>
            </motion.div>
          </div>

          <motion.div
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [0.98, 1, 0.98],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
            }}
            className="flex items-center space-x-2"
          >
            <span className="text-gray-600 dark:text-emerald-200">
              More states coming soon
            </span>
            <ArrowRight className="h-4 w-4 text-emerald-500 dark:text-emerald-200" />
          </motion.div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-600 dark:text-emerald-200">
              Must be
            </span>
            <motion.span
              animate={{ 
                color: theme === 'dark' 
                  ? ["#fff", "#fef08a", "#fff"]
                  : ["#1f2937", "#fef08a", "#1f2937"],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
              }}
              className="font-semibold"
            >
              18+
            </motion.span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MovingBar; 