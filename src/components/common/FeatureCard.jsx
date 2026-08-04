import React from 'react';
import { GlassCard } from './GlassCard';

export const FeatureCard = ({ icon: Icon, title, description, badge, className = '' }) => {
  return (
    <GlassCard hover className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/30 to-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
          {Icon && <Icon className="w-6 h-6" />}
        </div>
        {badge && (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-sky-400 border border-sky-500/20">
            {badge}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-lg font-bold text-slate-100">{title}</h4>
        <p className="text-sm text-slate-400 leading-relaxed mt-1.5">{description}</p>
      </div>
    </GlassCard>
  );
};
