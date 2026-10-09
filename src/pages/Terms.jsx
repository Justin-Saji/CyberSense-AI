import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, Lock, AlertTriangle, Cpu, Eye, UserCheck, Scale, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Terms = () => {
  const sections = [
    {
      id: 'acceptance',
      icon: UserCheck,
      title: '1. Acceptance of Terms',
      content: `By creating an account, accessing, or utilizing the CyberSense AI platform ("Service"), you agree to be bound by these Terms & Conditions ("Terms") and our Privacy Policy. If you do not agree to these terms, you must not access or use the platform.`
    },
    {
      id: 'accounts',
      icon: Lock,
      title: '2. User Accounts & Security',
      content: `When creating an account on CyberSense AI, you must provide accurate, complete, and updated information. You are solely responsible for maintaining the confidentiality of your credentials and for all activities conducted under your account. You agree to immediately notify CyberSense AI administrators of any unauthorized access or security breach.`
    },
    {
      id: 'services',
      icon: Cpu,
      title: '3. Description of Services',
      content: `CyberSense AI provides artificial intelligence-driven cyber defense tools, including SMS Phishing Analysis, Email Header & Payload Inspection, Malicious URL Scanning, Risk Scoring, and Security Awareness Coaching. Features may be updated, expanded, or modified at any time to enhance system security and threat intelligence.`
    },
    {
      id: 'acceptable-use',
      icon: AlertTriangle,
      title: '4. Acceptable Use Policy',
      content: `You agree not to misuse CyberSense AI. Specifically, you agree NOT to:
• Reverse engineer, decompile, or attempt to extract the source code or machine learning models of CyberSense AI.
• Submit malicious code, malware payloads, or automated bot traffic designed to disrupt or overload our infrastructure.
• Scan domains, URLs, or communications without proper authorization or for illicit surveillance purposes.
• Use the Service to impersonate third parties, bypass access controls, or perform unauthorized security penetration testing.`
    },
    {
      id: 'ai-disclaimer',
      icon: Eye,
      title: '5. AI Threat Detection & XAI Disclaimer',
      content: `CyberSense AI leverages probabilistic Machine Learning models and Explainable AI (XAI) algorithms for threat detection. While our models provide high-accuracy risk scores and vulnerability warnings, cybersecurity threat landscapes evolve continuously. Risk scores and threat predictions are provided for advisory and educational purposes. CyberSense AI does not guarantee 100% detection of zero-day threats.`
    },
    {
      id: 'privacy',
      icon: Shield,
      title: '6. Data Privacy & Scanned Content Handling',
      content: `We respect your privacy. Scanned text, URLs, and headers submitted for analysis are processed strictly for real-time threat evaluation, risk scoring, and security report generation. Your personal data is stored securely using encryption and is managed in accordance with our Privacy Policy.`
    },
    {
      id: 'intellectual-property',
      icon: Scale,
      title: '7. Intellectual Property Rights',
      content: `All content, features, visual design, branding, algorithms, and software code related to CyberSense AI are the exclusive intellectual property of CyberSense AI and its licensors. You are granted a limited, non-exclusive, non-transferable license to use the Service for personal or internal enterprise security purposes.`
    },
    {
      id: 'termination',
      icon: FileText,
      title: '8. Account Termination & Suspension',
      content: `CyberSense AI reserves the right to suspend or terminate user accounts immediately, without prior notice, if a user violates these Terms, engages in prohibited activities, or poses a security risk to the platform or other users.`
    },
    {
      id: 'limitation',
      icon: Scale,
      title: '9. Limitation of Liability',
      content: `To the maximum extent permitted by applicable law, CyberSense AI and its team shall not be liable for any indirect, incidental, consequential, or punitive damages, including loss of data, revenue, or security incidents resulting from reliance on risk scores or platform availability.`
    },
    {
      id: 'changes',
      icon: Mail,
      title: '10. Changes to Terms & Contact Information',
      content: `We reserve the right to modify these Terms at any time. Changes will take effect upon posting to the website. Your continued use of the platform following updates constitutes acceptance of the modified terms. For inquiries regarding these terms, contact support@cybersense.ai.`
    }
  ];

  return (
    <div className="space-y-12 py-8 max-w-4xl mx-auto px-4">
      {/* HEADER */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5" />
          <span>Legal Documentation</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Terms &amp; <span className="text-cyan-400">Conditions</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Please review the terms and rules governing your use of CyberSense AI enterprise threat intelligence and security platform.
        </p>
        <p className="text-[11px] text-slate-500">Last updated: October 2026</p>
      </div>

      {/* QUICK SUMMARY CARD */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/80 border border-cyan-500/20 rounded-2xl p-6 shadow-lg backdrop-blur-sm space-y-3"
      >
        <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
          <Shield className="w-4 h-4" /> Executive Summary
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          CyberSense AI provides real-time threat detection, AI risk assessment, and security analytics. By registering an account or using our tools, you agree to use the platform responsibly, maintain account security, and adhere to acceptable security scanning policies.
        </p>
      </motion.div>

      {/* TERMS SECTIONS */}
      <div className="space-y-6">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-[#0f172a]/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 transition-all shadow-md space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">{section.title}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line pl-11">
                {section.content}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* FOOTER CALLOUT */}
      <div className="text-center pt-4 space-y-4 border-t border-slate-800/80">
        <p className="text-xs text-slate-400">
          Have questions about our Terms &amp; Conditions or Privacy Policy?
        </p>
        <div className="flex items-center justify-center gap-4 text-xs font-semibold">
          <Link to="/register" className="px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors shadow-md">
            Return to Registration
          </Link>
          <Link to="/about" className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors">
            About CyberSense AI
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;
