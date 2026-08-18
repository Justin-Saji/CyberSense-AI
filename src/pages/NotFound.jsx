import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Terminal } from 'lucide-react';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { GlassCard } from '../components/common/GlassCard';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <GlassCard glow hover className="max-w-md w-full text-center p-8 space-y-6 bg-slate-900/90 border-rose-500/40">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-20 h-20 rounded-3xl bg-rose-500/20 border-2 border-rose-500/50 mx-auto flex items-center justify-center text-rose-400 shadow-[0_0_30px_rgba(243,24,94,0.4)]"
        >
          <ShieldAlert className="w-10 h-10" />
        </motion.div>

        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-rose-400 font-mono">
            ERR 404 PAGE NOT FOUND
          </span>
          <h1 className="text-3xl font-extrabold text-white">Page Not Found</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Check the requested URL or reach out to your IT security administrator to clear this block.
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <Link to="/">
            <PrimaryButton icon={ArrowLeft}>
              Return to Home Page
            </PrimaryButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};
