import { useState, useEffect } from 'react';
import { 
  Cpu, 
  ToggleLeft, 
  ToggleRight, 
  Edit, 
  MoreVertical,
  Activity,
  Zap
} from 'lucide-react';
import { aiModelService } from '../../services/adminService';

const AIModuleManagement = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({});

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const data = await aiModelService.getModels();
      setModels(data.models);
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

  const handleEdit = (model) => {
    setSelectedModel(model);
    setModalData({
      accuracy: model.accuracy,
      version: model.version,
      error_logs: model.error_logs || '',
    });
    setShowModal(true);
    setShowDropdown(null);
  };

  const handleSave = async () => {
    if (!selectedModel) return;

    try {
      await aiModelService.updateModel(selectedModel.id, modalData);
      setShowModal(false);
      loadModels();
    } catch (error) {
      console.error('Failed to update model:', error);
      alert('Failed to update model');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Module Management</h1>
          <p className="text-slate-400 mt-2">Manage and monitor AI-powered security modules</p>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-pulse">
              <div className="h-6 bg-slate-700 rounded mb-4" />
              <div className="h-4 bg-slate-700 rounded mb-2" />
              <div className="h-4 bg-slate-700 rounded mb-4" />
              <div className="h-8 bg-slate-700 rounded" />
            </div>
          ))
        ) : (
          models.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              onToggle={() => handleToggle(model)}
              onEdit={() => handleEdit(model)}
              icon={getModuleIcon(model.module)}
            />
          ))
        )}
      </div>

      {/* Edit Modal */}
      {showModal && selectedModel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Edit AI Model</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Model Name</label>
                <p className="text-white">{selectedModel.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Version</label>
                <input
                  type="text"
                  value={modalData.version}
                  onChange={(e) => setModalData({ ...modalData, version: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Accuracy (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={modalData.accuracy}
                  onChange={(e) => setModalData({ ...modalData, accuracy: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Error Logs</label>
                <textarea
                  value={modalData.error_logs}
                  onChange={(e) => setModalData({ ...modalData, error_logs: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 h-24 resize-none"
                  placeholder="Enter error logs..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ModelCard = ({ model, onToggle, onEdit, icon }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{icon}</div>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <MoreVertical size={20} className="text-slate-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-10">
              <button
                onClick={() => {
                  onEdit();
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-800 flex items-center gap-2 rounded-lg"
              >
                <Edit size={16} />
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white mb-1">{model.name}</h3>
      <p className="text-sm text-slate-400 mb-4">{model.module}</p>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Version</span>
          <span className="text-sm text-white font-medium">{model.version}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Accuracy</span>
          <span className="text-sm text-emerald-400 font-medium">{model.accuracy?.toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Predictions</span>
          <span className="text-sm text-white font-medium">{model.predictions_count?.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
            model.is_enabled
              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          }`}
        >
          {model.is_enabled ? <Activity size={16} /> : <Zap size={16} />}
          <span className="text-sm font-medium">
            {model.is_enabled ? 'Enabled' : 'Disabled'}
          </span>
        </button>
        <button
          onClick={onToggle}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          {model.is_enabled ? <ToggleRight size={24} className="text-emerald-400" /> : <ToggleLeft size={24} className="text-slate-400" />}
        </button>
      </div>
    </div>
  );
};

export default AIModuleManagement;
