import React, { useState, useEffect } from 'react';
import { apiClient } from '../api';
import { useAppStore } from '../store';

function SettingsTab() {
  const logout = useAppStore((state) => state.logout);
  const ghlApiKey = useAppStore((state) => state.ghlApiKey);
  const ghlLocationId = useAppStore((state) => state.ghlLocationId);

  const [templates, setTemplates] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newBody, setNewBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await apiClient.getCustomTemplates();
      setTemplates(res.templates);
    } catch {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newBody.trim()) return;
    try {
      setSaving(true);
      await apiClient.createCustomTemplate(newName.trim(), newBody.trim());
      setNewName('');
      setNewBody('');
      setMsg('Template criado com sucesso!');
      setTimeout(() => setMsg(''), 3000);
      loadTemplates();
    } catch {
      setMsg('Erro ao criar template.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este template?')) return;
    try {
      await apiClient.deleteCustomTemplate(id);
      loadTemplates();
    } catch {}
  };

  // Extract variable names from body for preview hint
  const previewVars = (body: string) =>
    (body.match(/\{\{(\w+)\}\}/g) || []).map((m) => m.replace(/\{\{|\}\}/g, ''));

  return (
    <div className="space-y-6">
      {/* Connection Info */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Configurações</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Conexão Atual</h3>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-700">Location ID</p>
                <code className="text-sm bg-white px-3 py-2 rounded border border-slate-200 text-slate-900 block mt-1">
                  {ghlLocationId}
                </code>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">API Key</p>
                <code className="text-sm bg-white px-3 py-2 rounded border border-slate-200 text-slate-900 block mt-1">
                  {ghlApiKey.substring(0, 12)}...
                </code>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-4">
            <button
              onClick={logout}
              className="px-6 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
            >
              Sair da Conta
            </button>
          </div>
        </div>
      </div>

      {/* Custom Templates Manager */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Templates Personalizados</h3>
        <p className="text-sm text-slate-500 mb-6">
          Crie templates de mensagem com variáveis dinâmicas usando{' '}
          <code className="bg-slate-100 px-1 rounded">{'{{nome}}'}</code>,{' '}
          <code className="bg-slate-100 px-1 rounded">{'{{empresa}}'}</code>, etc.
        </p>

        {msg && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm">
            {msg}
          </div>
        )}

        {/* Create Form */}
        <form onSubmit={handleCreate} className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome do Template
            </label>
            <input
              type="text"
              placeholder="Ex: Boas-vindas, Lembrete de reunião..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mensagem
            </label>
            <textarea
              rows={5}
              placeholder={'Olá {{nome}}, tudo bem?\n\nGostaríamos de informar que {{assunto}}.\n\nAté logo!'}
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm resize-none"
            />
            {newBody && previewVars(newBody).length > 0 && (
              <p className="text-xs text-blue-600 mt-1">
                Variáveis detectadas: {previewVars(newBody).map((v) => `{{${v}}}`).join(', ')}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={saving || !newName.trim() || !newBody.trim()}
            className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Salvando...' : '+ Criar Template'}
          </button>
        </form>

        {/* Templates List */}
        {templates.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            Nenhum template criado ainda.
          </p>
        ) : (
          <div className="space-y-3">
            {templates.map((t) => (
              <div
                key={t.id}
                className="border border-slate-200 rounded-lg p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{t.name}</p>
                  <p className="text-sm text-slate-500 whitespace-pre-wrap mt-1 line-clamp-3">
                    {t.body}
                  </p>
                  {t.variables.length > 0 && (
                    <p className="text-xs text-blue-500 mt-2">
                      Variáveis: {t.variables.map((v: string) => `{{${v}}}`).join(', ')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-red-400 hover:text-red-600 text-sm font-medium flex-shrink-0"
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Dicas</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Use <code className="bg-blue-100 px-1 rounded">{'{{nome}}'}</code> para personalizar com o nome do contato</li>
          <li>As listas são baseadas nas <strong>tags</strong> dos seus contatos no GHL</li>
          <li>Templates do WhatsApp Business aparecem automaticamente se configurados</li>
        </ul>
      </div>
    </div>
  );
}

export default SettingsTab;
