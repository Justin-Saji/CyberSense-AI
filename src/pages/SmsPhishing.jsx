import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ShieldCheck, AlertTriangle, Send, Cpu, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { scanService } from '../services/authService';

export const SmsPhishing = () => {
  const [text, setText] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [inputError, setInputError] = useState('');
  const { addToast } = useToast();

  const handleScan = async (e) => {
    e.preventDefault();
    setInputError('');

    const trimmed = text.trim();
    if (!trimmed) {
      const err = 'SMS message content cannot be empty.';
      setInputError(err);
      addToast(err, 'warning', 'Empty Input');
      return;
    }

    if (trimmed.length > 2000) {
      const err = 'SMS message text is too long (maximum 2000 characters).';
      setInputError(err);
      addToast(err, 'warning', 'Text Too Long');
      return;
    }

    setScanning(true);
    setResult(null);

    try {
      const data = await scanService.scanSms(trimmed);
      if (data && (data.success || data.prediction || data.result)) {
        setResult(data);
        const pred = String(
          data.prediction || (data.result?.threatLevel === 'HIGH' ? 'phishing' : 'legitimate')
        ).toUpperCase();
        const rLevel = String(data.risk_level || data.result?.threatLevel || 'Low').toUpperCase();
        const isPhish = pred === 'PHISHING' || rLevel === 'HIGH';

        addToast(
          `SMS Analysis Complete: ${pred} (${rLevel.charAt(0) + rLevel.slice(1).toLowerCase()} Risk)`,
          isPhish ? 'danger' : 'success',
          'Scan Complete'
        );
      } else {
        const errorMsg = data?.message || 'Failed to analyze SMS content.';
        setInputError(errorMsg);
        addToast(errorMsg, 'danger', 'Scan Failed');
      }
    } catch (err) {
      let msg = 'Failed to analyze SMS content.';
      if (!err.response) {
        msg = 'Backend service unavailable. Please check backend connection.';
      } else if (err.response.status === 400) {
        msg = err.response.data?.message || 'Invalid SMS input provided.';
      } else if (err.response.status === 401) {
        msg = 'You must log in to access this page.';
      } else if (err.response.status === 500) {
        msg = 'Server error analyzing SMS content. Please try again later.';
      } else {
        msg = err.response.data?.message || msg;
      }
      setInputError(msg);
      addToast(msg, 'danger', 'Scan Error');
    } finally {
      setScanning(false);
    }
  };

  // Helper values for display
  const prediction = String(
    result?.prediction || (result?.result?.threatLevel === 'HIGH' ? 'PHISHING' : 'LEGITIMATE')
  ).toUpperCase();
  const riskLevel = String(
    result?.risk_level || result?.result?.threatLevel || 'LOW'
  ).toUpperCase();
  const riskScore = Number(result?.risk_score ?? result?.result?.riskScore ?? 0);
  const confidence = Number(result?.confidence ?? 90);
  const detectedSignals = Array.isArray(result?.detected_signals)
    ? result.detected_signals
    : Array.isArray(result?.result?.detected_signals)
    ? result.result.detected_signals
    : [];
  const explanation = String(result?.explanation || result?.result?.explanation || '');
  const coaching = String(result?.coaching || result?.result?.coaching || '');
  const modelEngine = String(result?.model || 'DistilBERT');
  const threatType = String(result?.threat_type || result?.result?.threat_type || '');

  const isPhishing = prediction === 'PHISHING';
  const isHighRisk = riskLevel === 'HIGH';
  const isMediumRisk = riskLevel === 'MEDIUM';

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 px-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-1">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">SMS Phishing Detection</h1>
        <p className="text-xs text-slate-400">
          Analyze text messages and SMS links using threat intelligence models
        </p>
      </div>

      <div className="bg-[#0f172a]/95 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="sms-content" className="block text-xs font-semibold text-slate-300">
                SMS Message Content
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {text.length}/2000 characters
              </span>
            </div>
            <textarea
              id="sms-content"
              name="smsContent"
              rows={4}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (inputError) setInputError('');
              }}
              placeholder="Paste SMS message text here (e.g. 'URGENT: Your account has been suspended. Click here to verify: http://bit.ly/xyz')..."
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
            <span>{scanning ? 'Analyzing SMS Pattern with DistilBERT...' : 'Analyze SMS Message'}</span>
          </button>
        </form>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-xl border ${
              isPhishing || isHighRisk
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                : isMediumRisk
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            } space-y-4`}
          >
            {/* Verdict & Badge Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-2.5">
                {isPhishing || isHighRisk ? (
                  <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
                ) : isMediumRisk ? (
                  <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                )}
                <div>
                  <h3 className="font-bold text-sm tracking-wide text-white uppercase">
                    Prediction: {isPhishing ? 'PHISHING DETECTED' : 'LEGITIMATE SMS'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Risk Level:{' '}
                    <span className="font-semibold text-slate-200">
                      {riskLevel.charAt(0) + riskLevel.slice(1).toLowerCase()} Risk
                    </span>
                  </p>
                </div>
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                    isPhishing || isHighRisk
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : isMediumRisk
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  Risk Score: {riskScore}%
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium">
                  Confidence: {confidence}%
                </span>
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  <span>{modelEngine}</span>
                </span>
              </div>
            </div>

            {/* Classification & Threat Type */}
            {threatType && (
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                <p className="text-[11px] text-slate-400 font-mono">
                  <strong className="text-slate-300 font-semibold">Classification: </strong>
                  {threatType}
                </p>
              </div>
            )}

            {/* Explanation */}
            {explanation && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-300">Explanation:</p>
                <p className="text-xs text-slate-300 leading-relaxed">{explanation}</p>
              </div>
            )}

            {/* Detected Indicators */}
            {detectedSignals && detectedSignals.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold text-slate-300">Detected Indicators:</p>
                <div className="flex flex-wrap gap-2">
                  {detectedSignals.map((signal, idx) => (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center space-x-1 ${
                        isPhishing || isHighRisk
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                          : isMediumRisk
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{signal}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cybersecurity Coaching */}
            {coaching && (
              <div className="space-y-1 pt-2 border-t border-slate-800/60">
                <p className="text-xs font-semibold text-slate-300">Cybersecurity Coaching:</p>
                <p className="text-xs text-slate-300 leading-relaxed">{coaching}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SmsPhishing;
