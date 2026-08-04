/**
 * Validates email format.
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

/**
 * Validates full name:
 * - Required, 3–100 chars, letters and spaces only
 */
export const validateName = (name) => {
  const trimmed = name.trim();
  if (!trimmed) return 'Full name is required.';
  if (trimmed.length < 3) return 'Full name must be at least 3 characters.';
  if (trimmed.length > 100) return 'Full name must be at most 100 characters.';
  if (!/^[A-Za-z ]+$/.test(trimmed)) return 'Full name can only contain letters and spaces.';
  return '';
};

/**
 * Validates password complexity:
 * - 8–50 chars
 * - At least one uppercase, lowercase, digit, special character
 */
export const validatePassword = (password) => {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (password.length > 50) return 'Password must be at most 50 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  if (!/[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]/.test(password))
    return 'Password must contain at least one special character.';
  return '';
};

/**
 * Validates login password (minimum 6 characters)
 */
export const validateLoginPassword = (password) => {
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return '';
};

/**
 * Returns true if password passes all complexity rules.
 */
export const isStrongPassword = (password) => validatePassword(password) === '';

/**
 * Evaluates password strength score 0–5 and label.
 */
export const checkPasswordStrength = (password) => {
  const reqs = {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number:    /[0-9]/.test(password),
    special:   /[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]/.test(password),
  };

  const score = Object.values(reqs).filter(Boolean).length;

  let label = 'Weak';
  let color = 'bg-cyber-danger';

  if (score === 5) {
    label = 'Master Security';
    color = 'bg-cyber-success';
  } else if (score >= 4) {
    label = 'Strong';
    color = 'bg-cyber-secondary';
  } else if (score >= 3) {
    label = 'Medium';
    color = 'bg-cyber-warning';
  }

  return { reqs, score, label, color };
};

/**
 * Sanitize basic string input against XSS
 */
export const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>]/g, '');
};

/**
 * Get border class based on validation state
 */
export const getFieldBorder = (touched, error, value) => {
  if (!touched) return 'border-slate-800';
  if (error) return 'border-rose-500 focus:border-rose-500';
  if (value) return 'border-emerald-500 focus:border-emerald-500';
  return 'border-slate-800';
};

/**
 * Format date for display
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

/**
 * Format datetime for display
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
