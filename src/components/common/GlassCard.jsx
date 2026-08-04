import React from 'react';
import { motion } from 'framer-motion';

export const GlassCard = ({ children, className = '', hover = true, glow = false, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass-card rounded-2xl p-6 relative overflow-hidden ${
        hover ? 'glass-card-hover' : ''
      } ${glow ? 'border-sky-400/40 shadow-cyber-glow' : ''} ${className}`}
      {...props}
    >
      {/* Subtle glass reflection highlight top border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-400/30 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
};
