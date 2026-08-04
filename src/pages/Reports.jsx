
import React, { useEffect, useState } from "react";
import { FileText, ShieldAlert, ShieldCheck } from 'lucide-react';
import { reportService } from '../services/authService';
import { useToast } from '../hooks/useToast';

export const Reports = () => {
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    let mounted = true;

    reportService.listReports()
      .then((data) => {
        if (mounted) setReportsList(data.reports || []);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Failed to load reports.';
        addToast(msg, 'danger', 'Reports Error');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [addToast]);

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
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-10 text-center text-slate-400 text-sm">
          Loading reports...
        </div>
      ) : reportsList.length === 0 ? (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-16 text-center">

          <FileText className="w-20 h-20 mx-auto text-slate-600 mb-6"/>

          <h2 className="text-2xl font-semibold text-white">
            No Reports Available
          </h2>

          <p className="text-slate-400 mt-4 max-w-lg mx-auto">
            You have not generated any reports yet.
            After analyzing an SMS, Email, or URL, CyberSense AI will automatically save a report and display it here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reportsList.map((report) => {
            const isRisky = report.riskScore >= 45;
            const Icon = isRisky ? ShieldAlert : ShieldCheck;
            return (
              <div key={report.id} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isRisky ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white uppercase">{report.module} Scan</h2>
                      <p className="text-xs text-slate-400 mt-1">{report.inputSummary}</p>
                      <p className="text-xs text-slate-500 mt-2">{report.createdAt}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isRisky ? 'text-rose-400' : 'text-emerald-400'}`}>{report.threatLevel}</p>
                    <p className="text-xs text-slate-400">Risk {report.riskScore}%</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-slate-800 pt-4 space-y-2">
                  <p className="text-xs text-slate-300">{report.explanation}</p>
                  <p className="text-xs text-slate-400">{report.coaching}</p>
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
