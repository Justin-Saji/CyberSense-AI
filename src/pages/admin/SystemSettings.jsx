import { useState, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  Edit, 
  Save,
  Filter
} from 'lucide-react';
import { settingsService } from '../../services/adminService';

const SystemSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [formData, setFormData] = useState({ key: '', value: '', category: '', description: '' });

  useEffect(() => {
    loadSettings();
  }, [categoryFilter]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const params = categoryFilter ? { category: categoryFilter } : {};
      const data = await settingsService.getSettings(params);
      setSettings(data.settings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalType('create');
    setFormData({ key: '', value: '', category: '', description: '' });
    setSelectedSetting(null);
    setShowModal(true);
  };

  const handleEdit = (setting) => {
    setModalType('edit');
    setFormData({
      key: setting.key,
      value: setting.value,
      category: setting.category,
      description: setting.description,
    });
    setSelectedSetting(setting);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (modalType === 'create') {
        await settingsService.createSetting(formData);
      } else if (modalType === 'edit' && selectedSetting) {
        await settingsService.updateSetting(selectedSetting.id, formData);
      }
      setShowModal(false);
      loadSettings();
    } catch (error) {
      console.error('Failed to save setting:', error);
      alert(error.response?.data?.message || 'Failed to save setting');
    }
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) acc[setting.category] = [];
    acc[setting.category].push(setting);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">System Settings</h1>
          <p className="text-slate-400 mt-2">Configure application settings</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Add Setting</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center gap-4">
          <Filter className="text-slate-400" size={20} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All Categories</option>
            <option value="application">Application</option>
            <option value="security">Security</option>
            <option value="ai">AI</option>
            <option value="email">Email</option>
          </select>
        </div>
      </div>

      {/* Settings */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : Object.keys(groupedSettings).length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center text-slate-400">
          No settings found
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSettings).map(([category, categorySettings]) => (
            <div key={category} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-700">
                <h2 className="text-lg font-semibold text-white capitalize">{category}</h2>
              </div>
              <div className="divide-y divide-slate-700">
                {categorySettings.map((setting) => (
                  <div key={setting.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-white">{setting.key}</h3>
                        {setting.description && (
                          <span className="text-sm text-slate-400">- {setting.description}</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{setting.value}</p>
                    </div>
                    <button
                      onClick={() => handleEdit(setting)}
                      className="p-2 hover:bg-slate-600 text-slate-400 hover:text-white rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">
              {modalType === 'create' ? 'Add Setting' : 'Edit Setting'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Key</label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  disabled={modalType === 'edit'}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Value</label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select category</option>
                  <option value="application">Application</option>
                  <option value="security">Security</option>
                  <option value="ai">AI</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 h-24 resize-none"
                  placeholder="Enter description..."
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
                className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Save size={18} />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;
