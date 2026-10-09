import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, FileText, CheckCircle2 } from 'lucide-react';

export const TermsModal = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Terms &amp; Conditions</h3>
                <p className="text-xs text-slate-400">CyberSense AI Platform Agreement</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* CONTENT BODY */}
          <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed custom-scrollbar">
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-300 text-[11px] leading-relaxed">
              Please read these Terms &amp; Conditions carefully before accessing or registering an account on CyberSense AI.
            </div>

            <section className="space-y-1.5">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" /> 1. Acceptance of Terms
              </h4>
              <p>
                By creating an account, accessing, or utilizing the CyberSense AI platform ("Service"), you agree to be bound by these Terms &amp; Conditions and our Privacy Policy. If you do not agree to these terms, you must not access or use the platform.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" /> 2. User Accounts &amp; Security
              </h4>
              <p>
                When creating an account on CyberSense AI, you must provide accurate, complete, and updated information. You are solely responsible for maintaining the confidentiality of your credentials and for all activities conducted under your account. You agree to immediately notify CyberSense AI administrators of any unauthorized access or security breach.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" /> 3. Description of Services
              </h4>
              <p>
                CyberSense AI provides artificial intelligence-driven cyber defense tools, including SMS Phishing Analysis, Email Header &amp; Payload Inspection, Malicious URL Scanning, Risk Scoring, and Security Awareness Coaching. Features may be updated or modified at any time to enhance threat intelligence.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-400" /> 4. Acceptable Use Policy
              </h4>
              <p>
                You agree not to misuse CyberSense AI. Specifically, you agree NOT to reverse engineer machine learning models, submit malicious code or bot traffic designed to overload infrastructure, scan unauthorized networks, or bypass access controls.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" /> 5. AI Threat Detection &amp; XAI Disclaimer
              </h4>
              <p>
                CyberSense AI leverages probabilistic Machine Learning models and Explainable AI (XAI) algorithms. Threat predictions and risk scores are provided for advisory and educational purposes. CyberSense AI does not guarantee 100% detection of all zero-day vulnerabilities.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" /> 6. Data Privacy &amp; Handling
              </h4>
              <p>
                Scanned text, URLs, and headers submitted for analysis are processed strictly for real-time threat evaluation, risk scoring, and security report generation. Personal data is encrypted and managed in accordance with our Privacy Policy.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" /> 7. Limitation of Liability
              </h4>
              <p>
                CyberSense AI shall not be liable for any indirect, incidental, or consequential damages resulting from reliance on risk scores or platform availability.
              </p>
            </section>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-slate-900/50">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Close
            </button>
            {onAccept && (
              <button
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md"
              >
                <CheckCircle2 size={15} />
                <span>I Accept Terms &amp; Conditions</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
