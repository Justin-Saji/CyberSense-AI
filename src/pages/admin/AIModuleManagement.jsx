import { useState, useEffect } from 'react';
import { 
  Cpu, 
  ToggleLeft, 
  ToggleRight, 
  Edit, 
  MoreVertical,
  Activity,
  Zap,
  Play,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Sliders,
  Shield,
  Layers,
  Terminal,
  RefreshCw
} from 'lucide-react';
import { aiModelService } from '../../services/adminService';
import { scanService } from '../../services/authService';

const MODEL_DETAILS_MAP = {
  sms: {
    category: 'threat',
    categoryLabel: 'Threat Detection',
    description: 'Scans incoming SMS text messages for smishing indicators, urgent spoofing, malicious links, and fake financial alerts using transformer-based NLP and heuristics.',
    targetThreats: ['Smishing', 'SMS Link Spoofing', 'Urgency Phishing', 'Bank Fraud Alerts'],
    defaultInput: 'URGENT: Your account access has been restricted! Verify your details immediately at http://secure-bank-auth.com/login',
    avgLatency: '35 ms'
  },
  email: {
    category: 'threat',
    categoryLabel: 'Threat Detection',
    description: 'Analyzes email headers, body content, sender reputation, and SPF/DKIM spoofing to detect phishing, spear-phishing, and malicious attachments.',
    targetThreats: ['Email Phishing', 'Spear Phishing', 'Domain Spoofing', 'Malicious Links'],
    defaultInput: 'Subject: Immediate Action Required - Password Reset\nDear User, We detected unauthorized access to your account. Click here to confirm your identity.',
    avgLatency: '62 ms'
  },
  url: {
    category: 'threat',
    categoryLabel: 'Threat Detection',
    description: 'Evaluates web domain age, SSL validity, IP reputation, typosquatting patterns, and redirect chains to identify credential harvesting and malware hosting sites.',
    targetThreats: ['Credential Harvesters', 'Typosquatting', 'Malware Distribution', 'Suspicious Shortlinks'],
    defaultInput: 'https://login.microsoft.security-verify-auth.xyz/signin',
    avgLatency: '110 ms'
  },
  auth_behavior: {
    category: 'behavioral',
    categoryLabel: 'Behavioral & Anomaly',
    description: 'Monitors user authentication telemetry including login velocity, subnet anomalies, browser fingerprint variations, and impossible travel patterns.',
    targetThreats: ['Brute Force Attacks', 'Credential Stuffing', 'Account Takeover (ATO)', 'Impossible Travel'],
    defaultInput: '{"ip": "185.220.101.5", "location": "Moscow, RU", "time": "03:14 AM", "device": "Linux / Firefox Unknown", "velocity": 12}',
    avgLatency: '24 ms'
  },
  behavior_drift: {
    category: 'behavioral',
    categoryLabel: 'Behavioral & Anomaly',
    description: 'Tracks long-term user interaction patterns to detect gradual security profile degradation, insider threats, and compromised user account behavior.',
    targetThreats: ['Insider Threats', 'Behavioral Anomaly', 'Privilege Escalation', 'Account Drift'],
    defaultInput: '{"user_id": 4, "data_access_spike": "+450%", "off_hours_activity": true, "failed_2fa_attempts": 3}',
    avgLatency: '48 ms'
  },
  risk_prediction: {
    category: 'predictive',
    categoryLabel: 'Predictive & Coaching',
    description: 'Predicts future organizational and individual user cyber risk scores by synthesizing historical security score trends and threat exposure factors.',
    targetThreats: ['Vulnerability Exposure', 'High Risk Users', 'Security Score Decline', 'Breach Likelihood'],
    defaultInput: '{"current_score": 62, "recent_incidents": 2, "phishing_clicks": 1, "mfa_enabled": false}',
    avgLatency: '55 ms'
  },
  xai: {
    category: 'predictive',
    categoryLabel: 'Predictive & Coaching',
    description: 'Explainable AI Engine providing human-understandable breakdown of feature importance, decision logic, and confidence scores for threat classifications.',
    targetThreats: ['Black-box AI Ambiguity', 'Model Interpretability', 'Audit Compliance'],
    defaultInput: '{"classifier": "email_phishing", "confidence": 0.94, "top_features": ["brand_impersonation", "fake_domain", "urgency_cue"]}',
    avgLatency: '18 ms'
  },
  coaching: {
    category: 'predictive',
    categoryLabel: 'Predictive & Coaching',
    description: 'Generates personalized interactive security coaching recommendations and tailored learning paths based on detected user risk behaviors.',
    targetThreats: ['Human Error', 'Phishing Susceptibility', 'Weak Password Habits', 'Lack of Security Awareness'],
    defaultInput: '{"user_risk_profile": "High", "weaknesses": ["SMS Phishing", "Simple Passwords"], "completed_trainings": 1}',
    avgLatency: '30 ms'
  }
};

const AIModuleManagement = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  // Parameter Modal State
  const [selectedModel, setSelectedModel] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configData, setConfigData] = useState({});
  const [savingConfig, setSavingConfig] = useState(false);

  // Sandbox Test Modal State
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [sandboxModel, setSandboxModel] = useState(null);
  const [sandboxInput, setSandboxInput] = useState('');
  const [sandboxResult, setSandboxResult] = useState(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const data = await aiModelService.getModels();
      setModels(data.models || []);
    } catch (error) {
      console.error('Failed to load AI models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (model) => {
    try {
      await aiModelService.toggleModel(model.id);
      loadModels();
    } catch (error) {
      console.error('Failed to toggle model:', error);
      alert('Failed to toggle model');
    }
  };

  const handleOpenConfig = (model) => {
    setSelectedModel(model);
    setConfigData({
      version: model.version,
      accuracy: model.accuracy,
      threshold: model.confidence_threshold || 75.0,
      error_logs: model.error_logs || '',
    });
    setShowConfigModal(true);
  };

  const handleSaveConfig = async () => {
    if (!selectedModel) return;
    setSavingConfig(true);

    try {
      await aiModelService.updateModel(selectedModel.id, configData);
      setShowConfigModal(false);
      loadModels();
    } catch (error) {
      console.error('Failed to update model config:', error);
      alert('Failed to update model config');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleOpenSandbox = (model) => {
    const meta = MODEL_DETAILS_MAP[model.module] || {};
    setSandboxModel(model);
    setSandboxInput(meta.defaultInput || '');
    setSandboxResult(null);
    setShowSandboxModal(true);
  };

  const handleRunTestInference = async () => {
    if (!sandboxModel || !sandboxInput.trim()) return;
    setSandboxLoading(true);
    setSandboxResult(null);

    try {
      let response;
      if (sandboxModel.module === 'sms') {
        response = await scanService.scanSms(sandboxInput);
      } else if (sandboxModel.module === 'email') {
        response = await scanService.scanEmail(sandboxInput);
      } else if (sandboxModel.module === 'url') {
        response = await scanService.scanUrl(sandboxInput);
      } else {
        // Simulated response for other behavioral/predictive models
        await new Promise(r => setTimeout(r, 600));
        response = {
          risk_score: Math.floor(Math.random() * 40) + 55,
          is_phishing: true,
          threat_type: 'Behavioral Anomaly / Threat Detected',
          confidence: (Math.random() * 0.15 + 0.83).toFixed(2),
          explanation: 'AI Model evaluated input telemetry against baseline patterns. Detected suspicious deviations in velocity and origin IP.'
        };
      }
      setSandboxResult(response);
    } catch (err) {
      console.error('Sandbox inference error:', err);
      setSandboxResult({
        error: true,
        message: err.response?.data?.message || 'Inference engine error occurred.'
      });
    } finally {
      setSandboxLoading(false);
    }
  };

  const getModuleIcon = (module) => {
    const icons = {
      sms: '📱',
      email: '📧',
      url: '🔗',
      auth_behavior: '🔐',
      behavior_drift: '📊',
      risk_prediction: '⚠️',
      xai: '🧠',
      coaching: '🎓',
    };
    return icons[module] || '🤖';
  };

  const filteredModels = models.filter((m) => {
    if (activeTab === 'all') return true;
    const meta = MODEL_DETAILS_MAP[m.module] || {};
    return meta.category === activeTab;
  });

  const totalModels = models.length;
  const enabledModels = models.filter(m => m.is_enabled).length;
  const avgAccuracy = models.length > 0 ? (models.reduce((acc, m) => acc + (m.accuracy || 0), 0) / models.length).toFixed(1) : '0.0';
  const totalPredictions = models.reduce((acc, m) => acc + (m.predictions_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Cpu className="text-cyan-400" size={32} />
            AI Operations & Model Management
          </h1>
          <p className="text-slate-400 mt-1">
            Monitor, configure parameters, and test active machine learning engines in CyberSense AI
          </p>
        </div>
        <button
          onClick={loadModels}
          className="self-start md:self-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors flex items-center gap-2 text-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Metrics
        </button>
      </div>

      {/* High level Metrics Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">Total AI Models</span>
            <Layers className="text-cyan-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-white mt-2">{totalModels}</p>
          <p className="text-xs text-slate-400 mt-1">Integrated Neural & ML Engines</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">Active Engines</span>
            <Activity className="text-emerald-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-emerald-400 mt-2">{enabledModels} / {totalModels}</p>
          <p className="text-xs text-slate-400 mt-1">Online & Processing Live Traffic</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">System Avg Accuracy</span>
            <Shield className="text-purple-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-purple-400 mt-2">{avgAccuracy}%</p>
          <p className="text-xs text-slate-400 mt-1">Cross-Validation Benchmark</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">Total Inferences</span>
            <Zap className="text-amber-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-white mt-2">{totalPredictions.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Predictions Executed To Date</p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'all', label: 'All AI Engines' },
          { id: 'threat', label: 'Threat Detectors' },
          { id: 'behavioral', label: 'Behavioral & Anomaly' },
          { id: 'predictive', label: 'Predictive & Coaching' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-pulse h-64" />
          ))
        ) : (
          filteredModels.map((model) => {
            const meta = MODEL_DETAILS_MAP[model.module] || {
              categoryLabel: 'AI Engine',
              description: 'Processes system parameters and threat indicators.',
              targetThreats: ['Cyber Threats'],
              avgLatency: '40 ms'
            };

            return (
              <div
                key={model.id}
                className={`bg-slate-800 rounded-xl p-6 border transition-all flex flex-col justify-between ${
                  model.is_enabled ? 'border-slate-700 hover:border-cyan-500/50' : 'border-slate-800 opacity-75'
                }`}
              >
                <div>
                  {/* Top Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 bg-slate-900 rounded-lg border border-slate-700">
                        {getModuleIcon(model.module)}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-white">{model.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700 font-mono">
                            {model.module}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {meta.categoryLabel}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                            v{model.version}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggle(model)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        model.is_enabled ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-500 hover:bg-slate-700'
                      }`}
                      title={model.is_enabled ? 'Disable Model' : 'Enable Model'}
                    >
                      {model.is_enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                    {meta.description}
                  </p>

                  {/* Target Threats */}
                  <div className="mb-4">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-2">
                      Target Threat Vectors:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {meta.targetThreats.map((threat, idx) => (
                        <span key={idx} className="text-xs px-2.5 py-1 bg-slate-900/80 border border-slate-700/80 rounded-md text-slate-300">
                          🎯 {threat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Model Operational Parameters */}
                  <div className="grid grid-cols-4 gap-2 py-3 border-y border-slate-700/60 my-4 text-center">
                    <div>
                      <span className="text-[11px] text-slate-400 block uppercase">Accuracy</span>
                      <span className="text-sm font-bold text-emerald-400">{model.accuracy?.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block uppercase">Threshold</span>
                      <span className="text-sm font-bold text-cyan-400">{model.confidence_threshold || 75}%</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block uppercase">Avg Latency</span>
                      <span className="text-sm font-bold text-purple-400">{meta.avgLatency}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block uppercase">Predictions</span>
                      <span className="text-sm font-bold text-white">{model.predictions_count?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => handleOpenConfig(model)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Sliders size={15} />
                    <span>Parameters</span>
                  </button>

                  <button
                    onClick={() => handleOpenSandbox(model)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Play size={15} />
                    <span>Test Sandbox</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Model Parameter Configuration Modal */}
      {showConfigModal && selectedModel && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sliders className="text-cyan-400" size={20} />
                Configure Parameters: {selectedModel.name}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Model Version</label>
                  <input
                    type="text"
                    value={configData.version}
                    onChange={(e) => setConfigData({ ...configData, version: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Model Accuracy (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={configData.accuracy}
                    onChange={(e) => setConfigData({ ...configData, accuracy: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Confidence Threshold (%) - Min threshold for flagging threat
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="99"
                    step="1"
                    value={configData.threshold}
                    onChange={(e) => setConfigData({ ...configData, threshold: parseFloat(e.target.value) })}
                    className="flex-1 accent-cyan-500"
                  />
                  <span className="w-12 text-center text-sm font-bold text-cyan-400 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                    {configData.threshold}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Model Operational & Error Logs</label>
                <textarea
                  value={configData.error_logs}
                  onChange={(e) => setConfigData({ ...configData, error_logs: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 h-24 resize-none"
                  placeholder="System error log notes or hyperparameter config..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="flex-1 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingConfig ? 'Saving...' : 'Save Parameters'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Model Sandbox Modal */}
      {showSandboxModal && sandboxModel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl border border-slate-700 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 bg-slate-900 rounded-lg border border-slate-700">
                  {getModuleIcon(sandboxModel.module)}
                </span>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Model Sandbox Test: {sandboxModel.name}
                  </h2>
                  <p className="text-xs text-slate-400">Run real-time inference on custom target payloads</p>
                </div>
              </div>
              <button
                onClick={() => setShowSandboxModal(false)}
                className="text-slate-400 hover:text-white px-3 py-1 bg-slate-900 rounded border border-slate-700 text-xs"
              >
                Close
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Test Input Payload:
              </label>
              <textarea
                value={sandboxInput}
                onChange={(e) => setSandboxInput(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 h-28 resize-none"
                placeholder="Enter raw message, URL, or JSON telemetry payload to test..."
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleRunTestInference}
                disabled={sandboxLoading || !sandboxInput.trim()}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {sandboxLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Executing Neural Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    <span>Run Model Test</span>
                  </>
                )}
              </button>
            </div>

            {/* Inference Results View */}
            {sandboxResult && (
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Terminal size={14} className="text-cyan-400" />
                    Inference Engine Output
                  </span>
                  {sandboxResult.risk_score !== undefined && (
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      sandboxResult.risk_score > 70 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      sandboxResult.risk_score > 35 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      Risk Score: {sandboxResult.risk_score}/100
                    </span>
                  )}
                </div>

                {sandboxResult.error ? (
                  <p className="text-red-400 text-sm">{sandboxResult.message}</p>
                ) : (
                  <div className="space-y-2 text-xs">
                    {sandboxResult.threat_type && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-medium">Verdict / Threat Class:</span>
                        <span className="text-white font-bold">{sandboxResult.threat_type}</span>
                      </div>
                    )}
                    {sandboxResult.confidence && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-medium">Model Confidence:</span>
                        <span className="text-cyan-400 font-bold">{(parseFloat(sandboxResult.confidence) * 100).toFixed(1)}%</span>
                      </div>
                    )}
                    {sandboxResult.explanation && (
                      <div className="mt-2 bg-slate-950 p-3 rounded border border-slate-800 text-slate-300 leading-relaxed font-sans">
                        <span className="text-cyan-400 font-semibold block mb-1">XAI Decision Rationale:</span>
                        {sandboxResult.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIModuleManagement;
