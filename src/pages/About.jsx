import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, Database, Network, Lock, HelpCircle, CheckCircle2 } from 'lucide-react';

export const About = () => {
  return (
    <div className="space-y-16 py-8 max-w-5xl mx-auto px-4">
      {/* PAGE HEADER */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">OUR PURPOSE</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Securing the <span className="text-cyan-400">Human Element</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          CyberSense AI focuses on human behavioral patterns to protect digital assets against evolving threats.
        </p>
      </div>

      {/* MISSION & VISION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Mission</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            To augment cybersecurity defense by decoding human digital behavior through advanced neural processing, transforming the weakest link into the strongest shield.
          </p>
        </motion.div>

        {/* Vision */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Vision</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Establishing a world where artificial intelligence and human intuition work in seamless symbiosis to preemptively neutralize cyber threats before they manifest.
          </p>
        </motion.div>
      </div>

      {/* THE HUMAN PROBLEM SECTION */}
      <section className="bg-[#0f172a]/60 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="border-l-4 border-cyan-400 pl-4 space-y-1">
          <h3 className="text-xl font-bold text-white">The Human Problem</h3>
          <p className="text-xs text-slate-400">Understanding vulnerability beyond firewall perimeter defenses</p>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Over 85% of cybersecurity breaches involve the human element. Traditional security focuses heavily on network patches and firewalls, but often ignores the micro-behaviors that precede social engineering attacks, phishing clicks, and credential harvesting.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-cyan-400 flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>Behavioral Blindspots</span>
            </h4>
            <p className="text-xs text-slate-400">
              Invisible micro-behaviors that signal insider threats or compromised user accounts before damage occurs.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-cyan-400 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4" />
              <span>Cognitive Fatigue</span>
            </h4>
            <p className="text-xs text-slate-400">
              Security lapses caused by analyst burnout and information overload during manual log triage.
            </p>
          </div>
        </div>
      </section>

      {/* EXPLAINABLE AI (XAI) SECTION */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Explainable AI (XAI)</h3>
            <p className="text-xs text-cyan-400 font-semibold">The Glass Box Approach</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          "We don't just tell you there's a threat; we show you exactly why our AI model reached that conclusion."
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400 pt-2">
          <div className="flex items-center space-x-2 bg-[#0f172a] p-3 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Insight: Clear attribution of risk factors</span>
          </div>
          <div className="flex items-center space-x-2 bg-[#0f172a] p-3 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Compliance: Audit-ready AI decision logs</span>
          </div>
        </div>
      </section>

      {/* CORE STACK BADGES */}
      <section className="space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Core Stack</h4>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200">
            LLM Fusion
          </span>
          <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200">
            Edge Cloud
          </span>
          <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200">
            Zero Trust Architecture
          </span>
          <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200">
            Graph Threat DB
          </span>
        </div>
      </section>
    </div>
  );
};
