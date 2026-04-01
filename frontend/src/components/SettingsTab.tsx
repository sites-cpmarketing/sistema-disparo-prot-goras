import React from 'react';
import { useAppStore } from '../store';

function SettingsTab() {
  const logout = useAppStore((state) => state.logout);
  const ghlApiKey = useAppStore((state) => state.ghlApiKey);
  const ghlLocationId = useAppStore((state) => state.ghlLocationId);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Configurações</h2>

        <div className="space-y-6">
          {/* Current Connection */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Conexão Atual</h3>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-700">Location ID</p>
                <code className="text-sm bg-white px-3 py-2 rounded border border-slate-200 text-slate-900 block mt-1">
                  {ghlLocationId}
                </code>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">API Key (primeiros caracteres)</p>
                <code className="text-sm bg-white px-3 py-2 rounded border border-slate-200 text-slate-900 block mt-1">
                  {ghlApiKey.substring(0, 10)}...
                </code>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="border-t border-slate-200 pt-6">
            <button
              onClick={logout}
              className="px-6 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
            >
              🚪 Sair da Conta
            </button>
          </div>

          {/* Info */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Informações</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <strong>Versão:</strong> 1.0.0
              </div>
              <div>
                <strong>Ambiente:</strong> Production
              </div>
              <div>
                <strong>Status:</strong> <span className="text-green-600">✅ Online</span>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="border-t border-slate-200 pt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Dicas</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Templates devem estar pré-aprovados no WhatsApp</li>
              <li>Respeite o rate limit do WhatsApp (80 msg/seg)</li>
              <li>Use variáveis do template com cuidado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsTab;
