export const APP_NAME = 'CyberSense AI';
export const APP_TAGLINE = 'AI-Powered Cyber Threat Behaviour Prediction System (MCA Final Year Project)';

export const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'India',
  'Germany',
  'Australia',
  'Singapore',
  'Japan',
  'France',
  'Brazil',
  'United Arab Emirates',
  'Other',
];

export const OCCUPATIONS = [
  'Cybersecurity Analyst',
  'SOC Engineer',
  'Security Consultant',
  'IT Administrator',
  'Software Engineer / Developer',
  'Chief Information Security Officer (CISO)',
  'Student / Researcher',
  'Other',
];

export const THREAT_LEVELS = {
  LOW: { label: 'Low Risk', color: 'text-cyber-success', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  MEDIUM: { label: 'Medium Risk', color: 'text-cyber-warning', bg: 'bg-amber-500/10 border-amber-500/30' },
  HIGH: { label: 'High Risk', color: 'text-cyber-danger', bg: 'bg-rose-500/10 border-rose-500/30' },
  CRITICAL: { label: 'Critical Threat', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || '/api';
