import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { isValidEmail } from '../utils/validators';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, forgotPassword, googleLogin } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';
  const redirectedMessage = location.state?.message;

  useEffect(() => {
    if (redirectedMessage) {
      addToast(redirectedMessage, 'warning', 'Authentication Required');
    }
  }, [redirectedMessage]);

  // Helper function to get border class based on validation state
  const getFieldBorder = useCallback((fieldName, value) => {
    if (!touched[fieldName]) return 'border-slate-800';
    if (errors[fieldName]) return 'border-rose-500 focus:border-rose-500';
    if (value) return 'border-emerald-500 focus:border-emerald-500';
    return 'border-slate-800';
  }, [touched, errors]);

  const validate = useCallback(() => {
    const newErrors = {};
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      newErrors.email = 'Email address is required';
    } else if (!isValidEmail(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  }, [email, password]);

  const isFormValid = useCallback(() => {
    const trimmedEmail = email.trim();
    const hasEmail = trimmedEmail && isValidEmail(trimmedEmail);
    const hasPassword = password && password.length >= 6;
    return hasEmail && hasPassword;
  }, [email, password]);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) {
      const trimmedValue = value.trim();
      if (!trimmedValue) {
        setErrors(prev => ({ ...prev, email: 'Email address is required' }));
      } else if (!isValidEmail(trimmedValue)) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      } else {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    }
  };

  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrors(prev => ({ ...prev, email: 'Email address is required' }));
    } else if (!isValidEmail(trimmedEmail)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      if (!value) {
        setErrors(prev => ({ ...prev, password: 'Password is required' }));
      } else if (value.length < 6) {
        setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      } else {
        setErrors(prev => ({ ...prev, password: '' }));
      }
    }
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
    } else if (password.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
    } else {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ email: true, password: true });
    
    const valErrors = validate();
    setErrors(valErrors);
    if (Object.keys(valErrors).length > 0) return;

    setLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      await login(trimmedEmail, password);
      addToast('Welcome back to CyberSense AI!', 'success', 'Login Successful');
      navigate(from, { replace: true });
    } catch (err) {
      let msg = 'Invalid email or password.';
      
      // Handle different error scenarios
      if (err.response) {
        if (err.response.status === 401) {
          msg = 'Invalid email or password.';
        } else if (err.response.status === 404) {
          msg = 'Account not found. Please check your email.';
        } else if (err.response.status === 500) {
          msg = 'Server error. Please try again later.';
        } else if (err.response.data?.message) {
          msg = err.response.data.message;
        }
      } else if (err.code === 'ERR_NETWORK') {
        msg = 'Network error. Please check your connection.';
      }
      
      setErrors({ auth: msg });
      addToast(msg, 'danger', 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = forgotEmail.trim().toLowerCase();
    
    if (!trimmedEmail) {
      addToast('Please enter a valid email address.', 'warning', 'Invalid Email');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      addToast('Please enter a valid email address.', 'warning', 'Invalid Email');
      return;
    }
    
    setForgotLoading(true);
    try {
      const res = await forgotPassword(trimmedEmail);
      addToast(res.message || `Password reset link sent to ${trimmedEmail}`, 'success', 'Reset Link Sent');
      setShowForgotModal(false);
      setForgotEmail('');
    } catch (err) {
      let msg = 'Failed to send reset email. Please try again.';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.code === 'ERR_NETWORK') {
        msg = 'Network error. Please check your connection.';
      }
      addToast(msg, 'danger', 'Error Sending Reset Email');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      addToast('Google authentication failed. No token received.', 'danger', 'Google Auth Error');
      return;
    }

    setLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      addToast('Google Login Successful! Welcome to CyberSense AI.', 'success', 'Google Authenticated');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Google login failed. Please try again.';
      setErrors({ auth: msg });
      addToast(msg, 'danger', 'Google Auth Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    addToast('Google Sign-In was cancelled or failed.', 'warning', 'Google Auth Cancelled');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-15 px-15">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg bg-[#0f172a]/95 border border-slate-800 rounded-2xl p-10 shadow-2xl space-y-6"
      >
        {/* LOGO & TITLE */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-1">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
        </div>

        {/* REDIRECT WARNING ALERT */}
        {redirectedMessage && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs text-center font-medium flex items-center justify-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{redirectedMessage}</span>
          </div>
        )}

        {/* AUTH ERROR ALERT */}
        {errors.auth && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
            {errors.auth}
          </div>
        )}

        {/* GOOGLE SIGN IN BUTTON */}
        <GoogleSignInButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          text="continue_with"
        />

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-[#0f172a] px-3 text-[11px] text-slate-500 font-medium uppercase tracking-wider absolute">
            or email
          </span>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              onKeyDown={handleKeyDown}
              placeholder="name@example.com"
              autoComplete="email"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${getFieldBorder('email', email.trim())}`}
            />
            {touched.email && errors.email && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                autoComplete="current-password"
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="w-full py-3 rounded-xl bg-cyan-400 text-slate-950 font-semibold text-xs hover:bg-cyan-300 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* REGISTER LINK */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
              Register
            </Link>
          </p>
        </div>
      </motion.div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-white">Reset Password</h3>
            <p className="text-xs text-slate-400">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                onBlur={() => {
                  const trimmed = forgotEmail.trim();
                  if (trimmed && !isValidEmail(trimmed)) {
                    addToast('Please enter a valid email address.', 'warning', 'Invalid Email');
                  }
                }}
                placeholder="name@example.com"
                autoComplete="email"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={forgotLoading || !forgotEmail.trim() || !isValidEmail(forgotEmail.trim())}
                  className="flex-1 py-2 rounded-xl bg-cyan-400 text-slate-950 font-semibold text-xs hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Link'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotEmail('');
                  }}
                  disabled={forgotLoading}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs hover:text-white disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Login;
