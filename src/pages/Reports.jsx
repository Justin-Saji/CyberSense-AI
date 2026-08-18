import React, { useEffect, useState } from "react";
import { FileText, ShieldAlert, ShieldCheck, AlertTriangle, Cpu, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { reportService } from '../services/authService';
import { useToast } from '../hooks/useToast';

export const Reports = () => {
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const { addToast } = useToast();

  const fetchReports = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const data = await reportService.listReports();
      if (data && (data.success || Array.isArray(data.reports))) {
        setReportsList(data.reports || []);
      } else {
        const msg = data?.message || 'Failed to load reports.';
        setErrorMsg(msg);
        addToast(msg, 'danger', 'Reports Error');
      }
    } catch (err) {
      let msg = 'Failed to load security reports.';
      if (!err.response) {
        msg = 'Backend service unavailable. Please check backend connection.';
      } else if (err.response.status === 401) {
        msg = 'Session expired. Please log in again to view your reports.';
      } else {
        msg = err.response.data?.message || msg;
      }
      setErrorMsg(msg);
      addToast(msg, 'danger', 'Reports Error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async (report) => {
    const reportIdentifier = report.report_id || report.id;
    if (!reportIdentifier) {
      addToast('Invalid report identifier.', 'warning', 'Export Failed');
      return;
    }

    setDownloadingId(reportIdentifier);

    try {
      const blob = await reportService.downloadReportPdf(reportIdentifier);
      
      // Create blob download URL and trigger browser download
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CyberSense_Report_${reportIdentifier}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      addToast(`Downloaded PDF Report: ${reportIdentifier}`, 'success', 'PDF Export Complete');
    } catch (err) {
      let msg = 'Failed to generate or download PDF report.';
      if (!err.response) {
        msg = 'Backend service unavailable. Please check backend connection.';
      } else if (err.response.status === 401) {
        msg = 'Session expired. Please log in again.';
      } else if (err.response.status === 403) {
        msg = 'Unauthorized: You do not have permission to download this report.';
      } else if (err.response.status === 404) {
        msg = 'Report not found.';
      } else if (err.response.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          msg = parsed.message || msg;
        } catch (e) {
          // Fallback to generic message
        }
      }
      addToast(msg, 'danger', 'PDF Export Failed');
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 px-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-1">
          <FileText className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Security Reports</h1>
        <p className="text-xs text-slate-400">View and download your historical cyber threat assessment logs</p>
      </div>

      {loading ? (
        <div className="bg-[#0f172a]/95 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3 shadow-xl">
          <RefreshCw className="w-8 h-8 mx-auto text-cyan-400 animate-spin" />
          <p className="text-xs font-semibold text-slate-300">Retrieving security reports from database...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-8 text-center space-y-3">
          <AlertCircle className="w-10 h-10 mx-auto text-rose-400" />
          <h2 className="text-lg font-semibold text-white">Unable to Load Reports</h2>
          <p className="text-xs text-rose-300 max-w-md mx-auto">{errorMsg}</p>
          <button
            onClick={fetchReports}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white hover:border-cyan-400 transition-all cursor-pointer inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : reportsList.length === 0 ? (
        <div className="bg-[#0f172a]/95 border border-slate-800 rounded-2xl p-16 text-center shadow-xl">
          <FileText className="w-20 h-20 mx-auto text-slate-600 mb-6"/>
          <h2 className="text-2xl font-semibold text-white">
            No Reports Available
          </h2>
          <p className="text-slate-400 mt-4 max-w-lg mx-auto text-xs leading-relaxed">
            You have not generated any reports yet.
            After analyzing an SMS, Email, or URL, CyberSense AI will automatically save a report and display it here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reportsList.map((report) => {
            const reportIdentifier = report.report_id || report.id;
            const isDownloading = downloadingId === reportIdentifier;
            const analysisType = (report.analysis_type || report.module || 'SMS').toUpperCase();
            const prediction = report.prediction || (report.threatLevel === 'HIGH' ? 'phishing' : 'legitimate');
            const riskLevel = report.risk_level || report.threatLevel || (report.riskScore >= 60 ? 'High' : report.riskScore >= 35 ? 'Medium' : 'Low');
            const riskScore = report.risk_score ?? report.riskScore ?? 0;
            const confidence = report.confidence ?? 90;
            const isRisky = prediction === 'phishing' || prediction === 'malicious' || riskScore >= 45 || riskLevel === 'High' || riskLevel === 'HIGH';
            const Icon = isRisky ? ShieldAlert : ShieldCheck;
            const inputSnippet = report.input_data || report.inputSummary || '';
            const signals = report.detected_signals || report.factors?.map(f => f.label) || [];
            const modelEngine = report.model_name || report.model || 'heuristic';
            const createdAt = report.created_at || report.createdAt || '';

            return (
              <div key={reportIdentifier} className="bg-[#0f172a]/95 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isRisky ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h2 className="text-sm font-bold text-white uppercase">{analysisType} ANALYSIS REPORT</h2>
                        {report.report_id && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-400 font-mono">
                            {report.report_id}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1 font-mono break-all line-clamp-2">
                        {inputSnippet}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-2 font-mono">
                        {createdAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-mono ${
                        isRisky ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      }`}>
                        {riskLevel} Risk ({riskScore}%)
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleExportPdf(report)}
                      disabled={isDownloading}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/20 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 mt-1"
                    >
                      {isDownloading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                          <span>Generating PDF...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Export PDF</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Prediction: <strong className="text-white uppercase">{prediction}</strong></span>
                    <div className="flex items-center space-x-3">
                      <span>Confidence: <strong className="text-slate-200">{confidence}%</strong></span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900 border border-cyan-500/20 text-cyan-300 font-mono flex items-center space-x-1">
                        <Cpu className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span>{modelEngine}</span>
                      </span>
                    </div>
                  </div>
                  {report.explanation && (
                    <p className="text-xs text-slate-300 leading-relaxed">{report.explanation}</p>
                  )}
                  {signals.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {signals.map((signal, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-medium flex items-center space-x-1"
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                          <span>{signal}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reports;
