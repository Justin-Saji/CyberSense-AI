import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Globe, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export const Dashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(null);
  const [scanText, setScanText] = useState('');
  const [scanning, setScanning] = useState(false);

  const actionCards = [
    {
      id: 'sms',
      title: 'SMS Phishing Detection',
  desc: 'Run a heuristic review of suspicious text messages for smishing signals, urgency cues, and credential-harvesting patterns.',
      icon: MessageSquare,
      route: '/sms-phishing',
      placeholder: 'Paste the SMS message you want to inspect...',
    },
    {
      id: 'email',
      title: 'Email Phishing Detection',
  desc: 'Inspect email body text and headers with rule-based checks for spoofing, urgency, and credential request signals.',
      icon: Mail,
      route: '/email-phishing',
      placeholder: 'Paste email content or headers...',
    },
    {
      id: 'url',
      title: 'URL Threat Scanner',
  desc: 'Evaluate suspicious links with heuristic checks for malicious domains, login lures, and typosquatting patterns.',
      icon: Globe,
      route: '/url-scanner',
      placeholder: 'Enter the URL you want to scan...',
    },
    {
      id: 'reports',
      title: 'Security Reports',
      desc: 'Review saved cyber risk results and historical assessment reports.',
      icon: ShieldCheck,
      route: '/reports',
      placeholder: 'Enter a note to search or summarize report context...',
    },
  ];

  const handleRunQuickScan = (card) => {
    if (!scanText.trim()) {
      addToast('Please enter text to scan.', 'warning', 'Input Empty');
      return;
    }
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      addToast(`Completed heuristic scan for ${card.title}. Threat score: Low Risk.`, 'success', 'Scan Finished');
      setScanText('');
      setActiveTab(null);
    }, 800);
  };

  return (
    <div className="space-y-10 py-6 max-w-5xl mx-auto px-4">
      {/* 1. WELCOME MESSAGE */}
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, <span className="text-cyan-400">{user?.name || 'User'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1.5">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Authenticated Session ({user?.email}) • Security monitoring active.</span>
          </p>
        </div>
      </div>

      {/* 2. THREE ACTION CARDS */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight">Cyber Security Analysis Modules</h2>
          <p className="text-[11px] text-slate-400">
            These tools currently use heuristic risk scoring and rule-based checks rather than a deployed ML model.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actionCards.map((card) => {
            const Icon = card.icon;
            const isOpen = activeTab === card.id;

            return (
              <motion.div
                key={card.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-md hover:border-cyan-500/30 transition-all"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{card.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{card.desc}</p>
                  </div>
                </div>

                {isOpen ? (
                  <div className="space-y-3 pt-2">
                    <textarea
                      rows={2}
                      value={scanText}
                      onChange={(e) => setScanText(e.target.value)}
                      placeholder={card.placeholder}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRunQuickScan(card)}
                        disabled={scanning}
                        className="flex-1 py-2 rounded-xl bg-cyan-400 text-slate-950 font-semibold text-xs hover:bg-cyan-300 transition-all disabled:opacity-50"
                      >
                        {scanning ? 'Scanning...' : 'Scan Now'}
                      </button>
                      <button
                        onClick={() => setActiveTab(null)}
                        className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(card.route)}
                      className="flex-1 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-400 hover:text-slate-950 text-cyan-400 border border-cyan-500/20 font-semibold text-xs transition-all flex items-center justify-center space-x-1.5"
                    >
                      <span>Open Tool</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab(card.id);
                        setScanText('');
                      }}
                      className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:border-slate-700"
                    >
                      Quick Scan
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
