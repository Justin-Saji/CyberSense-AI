import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare, Globe, Cpu, CheckCircle2, Shield, Lock, Activity } from 'lucide-react';

export const Home = () => {
  return (
    <div className="space-y-20 py-8 max-w-6xl mx-auto px-4">
      {/* HERO SECTION */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-6">
        {/* Subtitle Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-400"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>AI INTELLIGENCE</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight"
        >
          Predict Human Cyber Risks <br className="hidden sm:inline" />
          <span className="text-cyan-400">Before They Become Threats</span>
        </motion.h1>

        {/* Short Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          Harness advanced behavioral AI to identify vulnerability patterns and secure your organization's most critical asset: its people.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-cyan-400 text-slate-950 font-semibold text-sm hover:bg-cyan-300 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-slate-900 border border-slate-800 text-slate-200 font-semibold text-sm hover:bg-slate-800 transition-all flex items-center justify-center space-x-2"
          >
            <span>Login</span>
          </Link>
        </motion.div>
      </section>

      {/* THREE FEATURE CARDS */}
      <section className="space-y-6 pt-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">Top Tools & Core Features</h2>
          <p className="text-xs text-slate-400">Empowering resilience through neural behavioral analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: SMS Phishing */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md hover:border-cyan-500/30 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">SMS Phishing Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Intercept and analyze suspicious text messages using NLP to prevent phishing attacks before you click.
            </p>
            <Link
              to="/features"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors pt-2"
            >
              <span>Explore Scanner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Card 2: Malicious URL Detection */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md hover:border-cyan-500/30 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Malicious URL Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scan web links instantly against global threat databases and sandbox environments for safe browsing.
            </p>
            <Link
              to="/features"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors pt-2"
            >
              <span>Explore Scanner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Card 3: AI Security Insights */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md hover:border-cyan-500/30 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Security Insights</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transparent XAI risk scoring and behavioral telemetry that explain why specific actions are flagged as threats.
            </p>
            <Link
              to="/features"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors pt-2"
            >
              <span>Explore Insights</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SIMPLE HOW IT WORKS SECTION */}
      <section className="bg-[#0f172a]/60 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-white tracking-tight">How CyberSense AI Works</h2>
          <p className="text-xs text-slate-400">Simple three-step approach to threat prediction and mitigation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3 text-center sm:text-left">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-sm flex items-center justify-center mx-auto sm:mx-0">
              01
            </div>
            <h4 className="text-base font-semibold text-white">Input Telemetry</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Submit suspicious text messages, web links, or login activity for rapid AI inspection.
            </p>
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-sm flex items-center justify-center mx-auto sm:mx-0">
              02
            </div>
            <h4 className="text-base font-semibold text-white">Neural Analysis</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Machine learning models analyze natural language patterns, entropy, and behavioral anomalies.
            </p>
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-sm flex items-center justify-center mx-auto sm:mx-0">
              03
            </div>
            <h4 className="text-base font-semibold text-white">Actionable Risk Score</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receive a clear confidence breakdown and explainable security score with recommended steps.
            </p>
          </div>
        </div>
      </section>

      {/* SIMPLE CTA SECTION */}
      <section className="bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">Ready to secure your digital footprint?</h3>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Experience clean, accurate, and explainable AI threat prediction built for simplicity.
        </p>
        <div>
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-cyan-400 text-slate-950 font-semibold text-xs hover:bg-cyan-300 transition-all shadow-md"
          >
            <span>Create Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
