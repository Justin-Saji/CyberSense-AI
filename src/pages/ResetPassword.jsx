import React, { useState, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { validatePassword } from '../utils/validators';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { addToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({ password: false, confirmPassword: false });
  const [errors, setErrors] = useState({});

  const getFieldBorder = useCallback((fieldName, value) => {
    if (!touched[fieldName]) return 'border-slate-800';
    if (errors[fieldName]) return 'border-rose-500 focus:border-rose-500';
    if (value) return 'border-emerald-500 focus:border-emerald-500';
    return 'border-slate-800';
  }, [touched, errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    const pwErr = validatePassword(password);
    if (pwErr) newErrors.password = pwErr;
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    
    return newErrors;
  }, [password, confirmPassword]);

  const isFormValid = useCallback(() => {
    const pwErr = validatePassword(password);
    const hasValidPassword = !pwErr;
    const hasMatchingPassword = confirmPassword && password === confirmPassword;
    return hasValidPassword && hasMatchingPassword;
  }, [password, confirmPassword]);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      const pwErr = validatePassword(value);
      setErrors(prev => ({ ...prev, password: pwErr || '' }));
    }
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    const pwErr = validatePassword(password);
    setErrors(prev => ({ ...prev, password: pwErr || '' }));
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      if (!value) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Please confirm your password.' }));
      } else if (password !== value) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleConfirmPasswordBlur = () => {
    setTouched(prev => ({ ...prev, confirmPassword: true }));
    if (!confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Please confirm your password.' }));
    } else if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
    } else {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing password reset token.');
      addToast('Invalid or expired reset link. Please request a new one.', 'danger', 'Invalid Token');
      return;
    }

    // Mark all fields as touched
    setTouched({ password: true, confirmPassword: true });
    
    const valErrors = validateForm();
    setErrors(valErrors);
    if (Object.keys(valErrors).length > 0) return;

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      addToast('Password reset successfully! Please login with your new password.', 'success', 'Password Updated');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      let msg = 'Failed to reset password. Link may have expired.';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.code === 'ERR_NETWORK') {
        msg = 'Network error. Please check your connection.';
      }
      setError(msg);
      addToast(msg, 'danger', 'Reset Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-15 px-4 w-full">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-[#0f172a]/95 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-1">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reset Your Password</h1>
          <p className="text-xs text-slate-400">Enter your new secure account password below</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center space-y-3">
            <div className="flex justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="font-semibold text-sm">Password Updated!</p>
            <p className="text-slate-300">Redirecting to login page...</p>
            <Link
              to="/login"
              className="inline-block px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors pr-10 ${getFieldBorder('password', password)}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
              {password && <PasswordStrengthMeter password={password} />}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  onBlur={handleConfirmPasswordBlur}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors pr-10 ${getFieldBorder('confirmPassword', confirmPassword && confirmPassword === password ? confirmPassword : '')}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid() || !token}
              className="w-full py-3 rounded-xl bg-cyan-400 text-slate-950 font-semibold text-xs hover:bg-cyan-300 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-800/80">
          <Link to="/login" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold">
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
