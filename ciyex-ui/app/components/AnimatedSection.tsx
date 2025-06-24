'use client';

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const AnimatedSection = ({ children, delay = 0, className = "" }: AnimatedSectionProps) => {
  return (
    <div className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        style={{ display: 'block' }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export function AnimatedHero({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{ display: 'block' }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function AnimatedText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{ display: 'block' }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function AnimatedImage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ display: 'block' }}
      >
        {children}
      </motion.div>
    </div>
  );
} 