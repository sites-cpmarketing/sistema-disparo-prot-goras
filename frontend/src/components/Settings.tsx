import React, { useState } from 'react';
import { apiClient } from '../api';
import { useAppStore } from '../store';

function Settings() {
  const setAuth = useAppStore((state) => state.setAuth);

  const [apiKey, setApiKey] = useState('');
  const [locationId, setLocationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleConnect = async () => {
    try {
      if (!apiKey.trim() || !locationId.trim()) {
        setError('Por favor, preencha todos os campos');
        return;
      }

      setLoading(true);
      setError('');
      setSuccess('');

      const response = await apiClient.validateGHLKey(apiKey, locationId);

      if (response.valid) {
        setAuth(apiKey, locationId);
        setSuccess('Conectado ao GHL com sucesso! ✅');
        setApiKey('');
        setLocationId('');
      } else {
        setError(response.error || 'Chave API inválida');
      }
    } catch (err) {
      setError('Erro ao conectar ao GHL. Verifique suas credenciais.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">🔗</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">WhatsApp Dispatcher</h1>
          <p className="text-slate-600 mt-2">Conectar ao GHL</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm">
            {success}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleConnect();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              API Key do GHL
            </label>
            <input
              type="password"
              placeholder="Sua API Key aqui..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Encontre em: GHL Dashboard → Settings → API Keys
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Location ID
            </label>
            <input
              type="text"
              placeholder="Seu Location ID..."
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Encontre em: GHL Dashboard → Settings → Location Details
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '⏳ Conectando...' : '🔗 Conectar ao GHL'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Como obter as credenciais:</h2>
          <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
            <li>Acesse seu dashboard do GHL</li>
            <li>Vá para Settings → API Keys</li>
            <li>Copie sua API Key</li>
            <li>Vá para Settings → Location Details</li>
            <li>Copie seu Location ID</li>
            <li>Cole ambos os valores acima</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Settings;
