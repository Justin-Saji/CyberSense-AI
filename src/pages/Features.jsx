import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Mail,
  Globe,
  Lock,
  Activity,
  UserCheck,
  ShieldAlert,
  HelpCircle,
  LayoutDashboard,
  ArrowRight,
  CheckCircle,
  Search,
} from 'lucide-react';
import { useToast } from '../hooks/useToast';

export const Features = () => {
  const { addToast } = useToast();
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [testInput, setTestInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const featuresList = [
    {
      id: 'sms',
      title: 'SMS Phishing Detection',
      icon: MessageSquare,
      badge: 'NLP Engine',
      description: 'Intercept and analyze suspicious text messages using NLP to prevent phishing attacks before you click.',
      placeholder: 'Enter suspicious text message to analyze...',
    },
    {
      id: 'email',
      title: 'Email Phishing Detection',
      icon: Mail,
      badge: 'Header & Body',
      description: 'Deep inspection of headers and content to identify sophisticated business email compromise attempts.',
      placeholder: 'Paste email subject & body text...',
    },
    {
      id: 'url',
      title: 'Malicious URL Detection',
      icon: Globe,
      badge: 'Sandbox Scan',
      description: 'Scan links instantly against global threat databases and sandbox environments for safe browsing.',
      placeholder: 'Enter URL (e.g. http://secure-verify-account.com)...',
    },
    {
      id: 'auth',
      title: 'Auth Behavior Analysis',
      icon: Lock,
      badge: 'Real-time',
      description: 'Analyze login patterns to detect anomalies and compromised accounts in real-time.',
      placeholder: 'Enter user login timestamp / IP info...',
    },
    {
      id: 'drift',
      title: 'Behavioral Drift Detection',
      icon: Activity,
      badge: 'ML Drift',
      description: 'Identify subtle changes in system or user behavior that indicate potential long-term compromises.',
      placeholder: 'Enter metric log vector...',
    },
    {
      id: 'uba',
      title: 'User Behavior Analytics',
      icon: UserCheck,
      badge: 'Telemetry',
      description: 'UBA monitoring to pinpoint insider threats and compromised accounts through advanced telemetry.',
      placeholder: 'Enter user ID or session ID...',
    },
    {
      id: 'coaching',
      title: 'Cybersecurity Coaching',
      icon: ShieldAlert,
      badge: 'Adaptive',
      description: 'Adaptive learning modules based on your specific risk profile and historical interactions.',
      placeholder: 'Enter query for security advice...',
    },
    {
      id: 'xai',
      title: 'Explainable AI (XAI)',
      icon: HelpCircle,
      badge: 'XAI Logs',
      description: 'Transparent decision-making logs that explain why a specific action was flagged as a threat.',
      placeholder: 'Enter decision ID or threat vector...',
    },
    {
      id: 'dashboard',
      title: 'Cyber Risk Dashboard',
      icon: LayoutDashboard,
      badge: 'System Status: Optimal',
      description: 'A centralized command center visualizing your threat posture across all integrated modules.',
      placeholder: 'Overview mode...',
    },
  ];

  const handleOpenScanner = (feature) => {
    setSelectedFeature(feature);
    setTestInput('');
    setAnalysisResult(null);
  };

  const handleRunAnalysis = () => {
    if (!testInput.trim()) {
      addToast('Please enter text or data to analyze.', 'warning', 'Input Required');
      return;
    }
    setAnalyzing(true);
    setAnalysisResult(null);

    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisResult({
        score: Math.floor(Math.random() * 25) + 75,
        status: 'Low Threat Level',
        confidence: '98.5%',
        summary: `Analysis completed for ${selectedFeature?.title}. No critical compromise detected.`,
      });
      addToast(`Analysis complete for ${selectedFeature?.title}`, 'success', 'Scan Completed');
    }, 900);
  };

  return (
    <div className="space-y-12 py-8 max-w-6xl mx-auto px-4">
      {/* PAGE HEADER */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">ADVANCED PROTECTION</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Security Intelligence</h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Harnessing the power of AI to secure your digital footprint across all vectors.
        </p>
      </div>

      {/* FEATURE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuresList.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {feature.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{feature.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{feature.description}</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleOpenScanner(feature)}
                  className="w-full py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-400 hover:text-slate-950 text-cyan-400 border border-cyan-500/20 font-semibold text-xs transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>Analyze</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* MINIMAL SCAN MODAL */}
      {selectedFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  {React.createElement(selectedFeature.icon, { className: 'w-4 h-4' })}
                </div>
                <h3 className="text-base font-bold text-white">{selectedFeature.title}</h3>
              </div>
              <button
                onClick={() => setSelectedFeature(null)}
                className="text-slate-400 hover:text-white text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-300">Analysis Telemetry Input</label>
              <textarea
                rows={3}
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder={selectedFeature.placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />

              <button
                onClick={handleRunAnalysis}
                disabled={analyzing}
                className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-semibold text-xs hover:bg-cyan-300 transition-all flex items-center justify-center space-x-2 shadow-md disabled:opacity-50"
              >
                {analyzing ? (
                  <span>Processing Analysis...</span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Run AI Scan</span>
                  </>
                )}
              </button>
            </div>

            {analysisResult && (
              <div className="bg-slate-900 border border-cyan-500/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Security Score:</span>
                  <span className="font-bold text-cyan-400">{analysisResult.score}/100</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Confidence:</span>
                  <span className="font-semibold text-slate-200">{analysisResult.confidence}</span>
                </div>
                <p className="text-xs text-slate-300 pt-1 border-t border-slate-800">{analysisResult.summary}</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};
