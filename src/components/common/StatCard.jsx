import React from 'react';
import { GlassCard } from './GlassCard';

export const StatCard = ({ title, value, change, trend = 'up', icon: Icon, color = 'blue' }) => {
  const isUp = trend === 'up';

  return (
    <GlassCard hover className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
        <h3 className="text-2xl font-extrabold text-white tracking-tight">{value}</h3>
        {change && (
          <p className={`text-xs font-medium ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isUp ? '↑' : '↓'} {change} vs last 24h
          </p>
        )}
      </div>
      {Icon && (
        <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-sky-400">
          <Icon className="w-5 h-5" />
        </div>
      )}
    </GlassCard>
  );
};
