import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Shield, LogOut, User, LayoutDashboard, Home, Info, Grid, Lock, UserPlus, FileText, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = isAuthenticated
    ? [
      { name: 'Home', path: '/', icon: Home },
      { name: 'Features', path: '/features', icon: Grid },
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Reports', path: '/reports', icon: FileText },
      { name: 'Profile', path: '/profile', icon: User },
      { name: 'Settings', path: '/settings', icon: Settings },
    ]
    : [
      { name: 'Home', path: '/', icon: Home },
      { name: 'Features', path: '/features', icon: Grid },
      { name: 'About', path: '/about', icon: Info },
      { name: 'Login', path: '/login', icon: Lock },
      { name: 'Register', path: '/register', icon: UserPlus },
    ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-white">
              CyberSense <span className="text-cyan-400">AI</span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Know the Risks, Stay Secure
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1.5 ${active
                    ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
              >
                {link.path === '/profile' && user?.avatar ? (
                  <img src={user.avatar} className="w-4 h-4 rounded-full object-cover border border-cyan-400/50" alt="User Avatar" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
                <span>{link.name}</span>
              </Link>
            );
          })}

          {isAuthenticated && (
            <div className="pl-3 border-l border-slate-800 flex items-center space-x-2">
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Menu Toggle */}
        <div className="flex lg:hidden items-center">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0B0F19] border-b border-slate-800 px-4 pt-2 pb-5 space-y-1.5 max-h-[80vh] overflow-y-auto"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2 rounded-lg text-xs font-medium ${isActive(link.path)
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'text-slate-300 hover:bg-slate-800'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {isAuthenticated && (
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
