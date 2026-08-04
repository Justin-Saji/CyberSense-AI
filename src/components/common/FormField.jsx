import React from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { getFieldBorder } from '../../utils/validators';

export const FormField = ({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  touched,
  showPassword,
  onTogglePassword,
  autoComplete,
  disabled = false,
  className = '',
}) => {
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
            isPassword ? 'pr-10' : ''
          } ${getFieldBorder(touched, error, value)} ${className}`}
        />
        {isPassword && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {touched && error && (
        <p className="text-[11px] text-rose-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

export const CheckboxField = ({
  label,
  checked,
  onChange,
  error,
  touched,
  name,
}) => {
  return (
    <div className="space-y-1">
      <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-cyan-400 focus:ring-0 cursor-pointer"
        />
        <span>{label}</span>
      </label>
      {touched && error && (
        <p className="text-[11px] text-rose-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};
