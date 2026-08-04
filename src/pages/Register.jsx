import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { isValidEmail, validateName, validatePassword } from '../utils/validators';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the border class based on touched / error / value state.
 */
const fieldBorder = (touched, error, value) => {
  if (!touched) return 'border-slate-800';
  if (error)    return 'border-rose-500 focus:border-rose-500';
  if (value)    return 'border-emerald-500 focus:border-emerald-500';
  return 'border-slate-800';
};

// ─── Component ───────────────────────────────────────────────────────────────

export const Register = () => {
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name:            '',
    email:           '',
    password:        '',
    confirmPassword: '',
    acceptTerms:     false,
  });

  const [touched, setTouched] = useState({
    name:            false,
    email:           false,
    password:        false,
    confirmPassword: false,
  });

  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors,              setErrors]              = useState({});
  const [loading,             setLoading]             = useState(false);

  // ─── Live validation ──────────────────────────────────────────────────────

  const getFieldErrors = useCallback((data) => {
    const errs = {};

    const nameErr = validateName(data.name);
    if (nameErr) errs.name = nameErr;

    if (!data.email) {
      errs.email = 'Email address is required.';
    } else if (!isValidEmail(data.email)) {
      errs.email = 'Please enter a valid email address.';
    }

    const pwErr = validatePassword(data.password);
    if (pwErr) errs.password = pwErr;

    if (!data.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (data.password !== data.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (!data.acceptTerms) {
      errs.acceptTerms = 'You must accept the Terms & Conditions.';
    }

    return errs;
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    const newData = { ...formData, [name]: val };
    setFormData(newData);

    // Revalidate live once a field has been touched
    if (touched[name] !== undefined) {
      const newErrs = getFieldErrors(newData);
      setErrors(newErrs);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const newErrs = getFieldErrors(formData);
    setErrors(newErrs);
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields touched on submit attempt
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    const valErrors = getFieldErrors(formData);
    setErrors(valErrors);
    if (Object.keys(valErrors).length > 0) return;

    setLoading(true);
    try {
      await register({
        name:     formData.name.trim(),
        email:    formData.email.toLowerCase().trim(),
        password: formData.password,
      });
      addToast('Account created successfully! Welcome to CyberSense AI.', 'success', 'Registration Complete');
      navigate('/dashboard');
    } catch (err) {
      let msg   = 'Registration failed. Please try again.';
      const field = err.response?.data?.field;
      
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.code === 'ERR_NETWORK') {
        msg = 'Network error. Please check your connection.';
      }
      
      if (field) {
        setErrors((prev) => ({ ...prev, [field]: msg }));
      } else {
        setErrors((prev) => ({ ...prev, auth: msg }));
      }
      addToast(msg, 'danger', 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  // ─── Google ───────────────────────────────────────────────────────────────

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      addToast('Google registration failed. No token received.', 'danger', 'Google Auth Error');
      return;
    }
    setLoading(true);
    try {
      const data = await googleLogin(credentialResponse.credential);
      // Check if user was just registered or already existed
      const isNewUser = data.message?.toLowerCase().includes('created') || data.message?.toLowerCase().includes('registered');
      addToast(
        isNewUser ? 'Google Registration Successful! Welcome to CyberSense AI.' : 'Google Login Successful! Welcome back.',
        'success',
        isNewUser ? 'Account Ready' : 'Login Successful'
      );
      navigate('/dashboard');
    } catch (err) {
      let msg = 'Google registration failed. Please try again.';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.code === 'ERR_NETWORK') {
        msg = 'Network error. Please check your connection.';
      }
      setErrors({ auth: msg });
      addToast(msg, 'danger', 'Google Auth Failed');
    } finally {
      setLoading(false);
    }
  };

  // ─── Derived ──────────────────────────────────────────────────────────────

  const allTouched   = Object.values(touched).every(Boolean);
  const liveErrors   = getFieldErrors(formData);
  const isFormValid  = allTouched && Object.keys(liveErrors).length === 0;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-3xl bg-[#0f172a]/95 border border-slate-800 rounded-2xl p-10 shadow-2xl space-y-6"
      >
        {/* LOGO & HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-1">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-xs text-slate-400">Secure Your System</p>
        </div>

        {/* AUTH ERROR ALERT */}
        {errors.auth && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
            {errors.auth}
          </div>
        )}

        {/* GOOGLE SIGN UP BUTTON */}
        <GoogleSignInButton
          onSuccess={handleGoogleSuccess}
          onError={() => addToast('Google Registration cancelled.', 'warning', 'Cancelled')}
          text="signup_with"
        />

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#0f172a] px-3 text-[11px] text-slate-500 font-medium uppercase tracking-wider absolute">
            or fill details
          </span>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="John Doe"
              autoComplete="name"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${fieldBorder(touched.name, errors.name, formData.name.trim())}`}
            />
            {touched.name && errors.name && (
              <p className="text-[11px] text-rose-400">{errors.name}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="name@example.com"
              autoComplete="email"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${fieldBorder(touched.email, errors.email, formData.email.trim())}`}
            />
            {touched.email && errors.email && (
              <p className="text-[11px] text-rose-400">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors pr-10 ${fieldBorder(touched.password, errors.password, formData.password)}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="text-[11px] text-rose-400">{errors.password}</p>
            )}
            {formData.password && (
              <div className="md:col-span-2">
                <PasswordStrengthMeter password={formData.password} />
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors pr-10 ${fieldBorder(
                  touched.confirmPassword,
                  errors.confirmPassword,
                  formData.confirmPassword && formData.confirmPassword === formData.password ? formData.confirmPassword : ''
                )}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-[11px] text-rose-400">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Accept Terms & Conditions */}
          <div className="space-y-1 pt-1 md:col-span-2">
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-cyan-400 focus:ring-0 cursor-pointer"
              />
              <span>I accept the Terms &amp; Conditions</span>
            </label>
            {errors.acceptTerms && (
              <p className="text-[11px] text-rose-400">{errors.acceptTerms}</p>
            )}
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full md:col-span-2 py-3 rounded-xl bg-cyan-400 text-slate-950 font-semibold hover:bg-cyan-300 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        {/* LOGIN LINK */}
        <div className="text-center pt-4 border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
