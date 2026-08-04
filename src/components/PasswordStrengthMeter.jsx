import React from 'react';
import { Check, X } from 'lucide-react';
import { checkPasswordStrength } from '../utils/validators';

export const PasswordStrengthMeter = ({ password = '' }) => {
  const { reqs, score, label, color } = checkPasswordStrength(password);

  const requirementsList = [
    { key: 'length', text: 'At least 8 characters' },
    { key: 'uppercase', text: 'At least one uppercase letter (A-Z)' },
    { key: 'lowercase', text: 'At least one lowercase letter (a-z)' },
    { key: 'number', text: 'At least one number (0-9)' },
    { key: 'special', text: 'At least one special character (!@#$%...)' },
  ];

  if (!password) return null;

  return (
    <div className="mt-3 p-4 rounded-xl glass-card bg-slate-900/60 border border-slate-800 space-y-3">
      {/* Visual Strength Meter Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Password Security Score:</span>
          <span className="font-semibold text-slate-200">{label} ({score}/5)</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex gap-1">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`h-full flex-1 transition-all duration-300 rounded-full ${
                step <= score ? color : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Criteria Requirement Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
        {requirementsList.map(({ key, text }) => {
          const isMet = reqs[key];
          return (
            <div
              key={key}
              className={`flex items-center space-x-2 transition-colors duration-200 ${
                isMet ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  isMet
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-800 border border-slate-700 text-slate-500'
                }`}
              >
                {isMet ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-2.5 h-2.5" />}
              </div>
              <span>{text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
