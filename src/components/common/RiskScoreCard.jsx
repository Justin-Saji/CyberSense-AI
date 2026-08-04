import React from 'react';
import { GlassCard } from './GlassCard';
import { ProgressRing } from './ProgressRing';
import { ShieldCheck, Zap } from 'lucide-react';

export const RiskScoreCard = ({ score = 94, status = 'Optimal', recommendationsCount = 2 }) => {
  return (
    <GlassCard glow hover className="flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex items-center space-x-5">
        <ProgressRing score={score} size={110} strokeWidth={9}/>
        <div className="space-y-1 text-left">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">System Security Health</h3>
          </div>
          <p className="text-xs text-slate-400">
            Real-time cyber behavior risk engine status: <span className="text-emerald-400 font-semibold">{status}</span>
          </p>
          <div className="pt-2 flex items-center space-x-2 text-xs text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{recommendationsCount} AI preventative recommendations available</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
