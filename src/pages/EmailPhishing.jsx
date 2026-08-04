import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ShieldCheck, AlertTriangle, Send } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { scanService } from '../services/authService';

export const EmailPhishing = () => {
  const [emailContent, setEmailContent] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const { addToast } = useToast();

  const handleScan = (e) => {
    e.preventDefault();
    if (!emailContent.trim()) {
      addToast('Please enter email text or headers to analyze.', 'warning', 'Empty Input');
      return;
    }

    setScanning(true);
    setResult(null);

    scanService.scanEmail(emailContent)
      .then(({ result: res }) => {
      setResult(res);
        addToast(`Email Analysis Complete: ${res.threatLevel}`, res.riskScore >= 45 ? 'danger' : 'success', 'Scan Complete');
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Failed to analyze email content.';
        addToast(msg, 'danger', 'Scan Failed');
      })
      .finally(() => {
        setScanning(false);
      });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 px-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-1">
          <Mail className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Email Phishing Detection</h1>
        <p className="text-xs text-slate-400">Inspect email content and headers with heuristic checks for spoofing and scam indicators.</p>
      </div>

      <div className="bg-[#0f172a]/95 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Email Text or Header Content</label>
            <textarea
              rows={6}
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              placeholder="Paste email body or full raw email headers here..."
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={scanning}
            className="w-full py-3 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{scanning ? 'Inspecting Email Headers & Body...' : 'Scan Email'}</span>
          </button>
        </form>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-xl border ${
              result.threatLevel === 'HIGH'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                : result.threatLevel === 'MEDIUM'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            } space-y-3`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {result.threatLevel === 'HIGH' || result.threatLevel === 'MEDIUM' ? (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                )}
                <span className="font-bold text-sm tracking-wide">Threat Status: {result.threatLevel}</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 font-mono">
                Risk Score: {result.riskScore}%
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{result.explanation}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{result.coaching}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EmailPhishing;
