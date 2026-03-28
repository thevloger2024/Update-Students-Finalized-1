import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(12px)', y: 10 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      exit={{ opacity: 0, filter: 'blur(12px)', y: -10 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.4, 0, 0.2, 1] 
      }}
      className="min-h-screen bg-academic-light relative"
    >
      {/* Google-style blueish flash/overlay during transition */}
      <motion.div
        initial={{ opacity: 0.3 }}
        animate={{ opacity: 0 }}
        exit={{ opacity: 0.3 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 bg-academic-blue/10 pointer-events-none z-[9999]"
      />
      {children}
    </motion.div>
  );
}
