import React, { useState, useEffect } from 'react';
import { Settings, Key, Globe, Cpu, X, Check } from 'lucide-react';

interface ApiConfigProps {
  onClose: () => void;
}

export const ApiConfig: React.FC<ApiConfigProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [baseURL, setBaseURL] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const [customModel, setCustomModel] = useState('');
  const [saved, setSaved] = useState(false);

  // Popular models in 2026
  const POPULAR_MODELS = [
    { group: 'OpenAI', models: [
      { value: 'gpt-5.2', label: 'GPT-5.2' },
      { value: 'gpt-5', label: 'GPT-5' },
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    ]},
    { group: 'Anthropic', models: [
      { value: 'claude-opus-4-5-20251101', label: 'Claude 4.5 Opus' },
      { value: 'claude-sonnet-4-20250514', label: 'Claude 4 Sonnet' },
      { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    ]},
    { group: 'Google', models: [
      { value: 'gemini-3-pro', label: 'Gemini 3 Pro' },
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    ]},
    { group: 'DeepSeek', models: [
      { value: 'deepseek-v3', label: 'DeepSeek V3' },
      { value: 'deepseek-r1', label: 'DeepSeek R1' },
    ]},
  ];

  useEffect(() => {
    setApiKey(localStorage.getItem('openai_api_key') || '');
    setBaseURL(localStorage.getItem('api_base_url') || '');
    const savedModel = localStorage.getItem('model_name') || 'gpt-4o';
    // Check if saved model is in popular list
    const isPopular = POPULAR_MODELS.some(g => g.models.some(m => m.value === savedModel));
    if (isPopular) {
      setModel(savedModel);
    } else {
      setModel('custom');
      setCustomModel(savedModel);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('openai_api_key', apiKey);
    localStorage.setItem('api_base_url', baseURL);
    const finalModel = model === 'custom' ? customModel : model;
    localStorage.setItem('model_name', finalModel);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-lg text-slate-800">API Configuration</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* API Key */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <Key className="w-4 h-4" /> API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-... or your API key"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Base URL */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <Globe className="w-4 h-4" /> Base URL (Optional)
            </label>
            <input
              type="text"
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-400 mt-1">Leave empty for default OpenAI endpoint</p>
          </div>

          {/* Model */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <Cpu className="w-4 h-4" /> Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {POPULAR_MODELS.map(group => (
                <optgroup key={group.group} label={group.group}>
                  {group.models.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </optgroup>
              ))}
              <optgroup label="Other">
                <option value="custom">Custom Model...</option>
              </optgroup>
            </select>
          </div>

          {/* Custom Model Input */}
          {model === 'custom' && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                <Cpu className="w-4 h-4" /> Custom Model Name
              </label>
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="e.g., llama-3.1-70b, qwen-2.5-72b"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-400 mt-1">Enter any model name supported by your API</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            {saved ? <Check className="w-4 h-4" /> : null}
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
