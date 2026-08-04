import React from 'react';
import { motion } from 'framer-motion';

export const SecondaryButton = ({
  children,
  fullWidth = false,
  icon: Icon,
  className = '',
  disabled,
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center font-medium rounded-xl px-6 py-3.5 text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-sky-400/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      <span className="flex items-center justify-center space-x-2">
        {Icon && <Icon className="w-5 h-5 text-sky-400" />}
        <span>{children}</span>
      </span>
    </motion.button>
  );
};
