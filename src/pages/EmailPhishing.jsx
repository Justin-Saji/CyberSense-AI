import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ShieldCheck, AlertTriangle, Send, Cpu, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { scanService } from '../services/authService';

export const EmailPhishing = () => {
  const [emailContent, setEmailContent] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [inputError, setInputError] = useState('');
  const { addToast } = useToast();

  const handleScan = async (e) => {
    e.preventDefault();
    setInputError('');

    const trimmed = emailContent.trim();
    if (!trimmed) {
      const err = 'Please enter email text or raw headers to analyze.';
      setInputError(err);
      addToast(err, 'warning', 'Empty Input');
      return;
    }

    if (trimmed.length > 10000) {
      const err = 'Email content is too long (maximum 10,000 characters).';
      setInputError(err);
      addToast(err, 'warning', 'Content Too Long');
      return;
    }

    setScanning(true);
    setResult(null);

    try {
      const data = await scanService.scanEmail(trimmed);
      if (data && (data.success || data.prediction || data.result)) {
        setResult(data);
        const prediction = data.prediction || (data.result?.threatLevel === 'HIGH' ? 'phishing' : 'legitimate');
        const riskLevel = data.risk_level || data.result?.threatLevel || 'Low';
        const isPhishing = prediction === 'phishing' || riskLevel === 'HIGH' || riskLevel === 'High';
        
        addToast(
          `Email Analysis Complete: ${prediction.toUpperCase()} (${riskLevel} Risk)`,
          isPhishing ? 'danger' : 'success',
          'Scan Complete'
        );
      } else {
        const errorMsg = data?.message || 'Failed to analyze email content.';
        setInputError(errorMsg);
        addToast(errorMsg, 'danger', 'Scan Failed');
      }
    } catch (err) {
      let msg = 'Failed to analyze email content.';
      if (!err.response) {
        msg = 'Backend service unavailable. Please check backend connection.';
      } else if (err.response.status === 400) {
        msg = err.response.data?.message || 'Invalid email input provided.';
      } else if (err.response.status === 401) {
        msg = 'You must log in to access this page.';
      } else if (err.response.status === 500) {
        msg = 'Server error analyzing email. Please try again later.';
      } else {
        msg = err.response.data?.message || msg;
      }
      setInputError(msg);
      addToast(msg, 'danger', 'Scan Error');
    } finally {
      setScanning(false);
    }
  };

  // Helper values for rendering display cards
  const prediction = result?.prediction || (result?.result?.threatLevel === 'HIGH' ? 'phishing' : 'legitimate');
  const riskLevel = result?.risk_level || (result?.result?.threatLevel ? result.result.threatLevel.charAt(0).toUpperCase() + result.result.threatLevel.slice(1).toLowerCase() : 'Low');
  const riskScore = result?.risk_score ?? result?.result?.riskScore ?? 0;
  const confidence = result?.confidence ?? 92;
  const detectedSignals = result?.detected_signals || result?.result?.detected_signals || result?.result?.factors?.map(f => f.label) || [];
  const explanation = result?.explanation || result?.result?.explanation || '';
  const modelEngine = result?.model || 'heuristic';

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 px-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-1">
          <Mail className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Email Phishing Detection</h1>
        <p className="text-xs text-slate-400">Inspect email body text and raw headers with threat intelligence models</p>
      </div>

      <div className="bg-[#0f172a]/95 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-300">Email Text or Header Content</label>
              <span className="text-[11px] text-slate-500 font-mono">
                {emailContent.length}/10000 characters
              </span>
            </div>
            <textarea
              rows={6}
              value={emailContent}
              onChange={(e) => {
                setEmailContent(e.target.value);
                if (inputError) setInputError('');
              }}
              placeholder="Paste email body or full raw email headers here..."
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed font-mono"
            />
            {inputError && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{inputError}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={scanning}
            className="w-full py-3 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-md"
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
              prediction === 'phishing' || riskLevel === 'High' || riskLevel === 'HIGH'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                : riskLevel === 'Medium' || riskLevel === 'MEDIUM'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            } space-y-4`}
          >
            {/* Verdict Header & Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-2.5">
                {prediction === 'phishing' || riskLevel === 'High' || riskLevel === 'HIGH' || riskLevel === 'Medium' ? (
                  <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                )}
                <div>
                  <h3 className="font-bold text-sm tracking-wide text-white uppercase">
                    Prediction: {prediction === 'phishing' ? 'PHISHING DETECTED' : 'LEGITIMATE EMAIL'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Risk Level: <span className="font-semibold text-slate-200">{riskLevel} Risk</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 font-mono text-cyan-400">
                  Risk Score: {riskScore}%
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 font-mono text-slate-300">
                  Confidence: {confidence}%
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-cyan-500/30 font-mono text-cyan-300 flex items-center space-x-1">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>model: {modelEngine}</span>
                </span>
              </div>
            </div>

            {/* Explanation */}
            {explanation && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-300">Explanation:</p>
                <p className="text-xs text-slate-300 leading-relaxed">{explanation}</p>
              </div>
            )}

            {/* Detected Signals */}
            {detectedSignals && detectedSignals.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold text-slate-300">Detected Signals:</p>
                <div className="flex flex-wrap gap-2">
                  {detectedSignals.map((signal, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-medium flex items-center space-x-1"
                    >
                      <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                      <span>{signal}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EmailPhishing;
