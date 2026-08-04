import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const PrimaryButton = ({
  children,
  loading = false,
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
      whileHover={{ scale: disabled || loading ? 1 : 1.015 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.985 }}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center font-medium rounded-xl px-5 py-2.5 text-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-md shadow-blue-600/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Processing...</span>
        </span>
      ) : (
        <span className="flex items-center justify-center space-x-2">
          {Icon && <Icon className="w-5 h-5" />}
          <span>{children}</span>
        </span>
      )}
    </motion.button>
  );
};
