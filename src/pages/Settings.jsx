import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Shield, Bell, Lock, Key } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export const Settings = () => {
  const { addToast } = useToast();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [autoScan, setAutoScan] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    addToast('Security settings saved successfully.', 'success', 'Settings Updated');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 px-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-1">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">System Settings</h1>
        <p className="text-xs text-slate-400">Manage security preferences, alerts, and authentication parameters</p>
      </div>

      <div className="bg-[#0f172a]/95 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              <span>Notifications & Security Alerts</span>
            </h3>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <p className="text-xs font-semibold text-white">Email Threat Alerts</p>
                <p className="text-[11px] text-slate-400">Receive instant email notifications when critical threats are flagged.</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-cyan-400 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <p className="text-xs font-semibold text-white">Automated Heuristic Scanning</p>
                <p className="text-[11px] text-slate-400">Automatically inspect incoming text payloads with NLP threat models.</p>
              </div>
              <input
                type="checkbox"
                checked={autoScan}
                onChange={(e) => setAutoScan(e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-cyan-400 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-all shadow-md"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
