import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-[#070A10] border-t border-slate-800/60 py-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">CyberSense AI</span>
          <span className="text-slate-500">• Secure Intelligence</span>
        </div>

        {/* Links */}
        <div className="flex items-center space-x-6">
          <Link to="/about" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link>
          <Link to="/about" className="hover:text-cyan-400 transition-colors">Terms</Link>
          <Link to="/about" className="hover:text-cyan-400 transition-colors">Documentation</Link>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">GitHub</a>
        </div>

        {/* Copyright */}
        <div className="text-slate-500">
          © {new Date().getFullYear()} CyberSense AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

