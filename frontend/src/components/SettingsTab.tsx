import React, { useState, useEffect } from 'react';
import { apiClient } from '../api';
import { useAppStore } from '../store';
import { Contact } from '../types';

type Tab = 'templates' | 'lists';

function SettingsTab() {
  const logout = useAppStore((state) => state.logout);
  const ghlApiKey = useAppStore((state) => state.ghlApiKey);
  const ghlLocationId = useAppStore((state) => state.ghlLocationId);

  const [activeTab, setActiveTab] = useState<Tab>('templates');

  return (
    <div className="space-y-6">
      {/* Connection Info */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Configurações</h2>
            <p className="text-sm text-slate-500 mt-1">
              Location: <code className="bg-slate-100 px-1 rounded">{ghlLocationId}</code>
              {' · '}
              Key: <code className="bg-slate-100 px-1 rounded">{ghlApiKey.substring(0, 12)}...</code>
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
          >
            Sair
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Templates de Mensagem
          </button>
          <button
            onClick={() => setActiveTab('lists')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'lists'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Listas de Contatos
          </button>
        </div>
      </div>

      {activeTab === 'templates' && <TemplatesManager />}
      {activeTab === 'lists' && <ListsManager />}
    </div>
  );
}

/* ───────────────────────── Templates Manager ───────────────────────── */
function TemplatesManager() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newBody, setNewBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
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
      setNewName(''); setNewBody('');
      setMsg('Template criado!');
      setTimeout(() => setMsg(''), 3000);
      load();
    } catch { setMsg('Erro ao criar template.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este template?')) return;
    await apiClient.deleteCustomTemplate(id);
    load();
  };

  const detectedVars = (body: string) =>
    [...new Set((body.match(/\{\{(\w+)\}\}/g) || []).map((m) => m.replace(/\{\{|\}\}/g, '')))];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-1">Templates de Mensagem</h3>
      <p className="text-sm text-slate-500 mb-6">
        Use <code className="bg-slate-100 px-1 rounded">{'{{nome}}'}</code>,{' '}
        <code className="bg-slate-100 px-1 rounded">{'{{empresa}}'}</code> etc. para variáveis dinâmicas.
      </p>

      {msg && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm">{msg}</div>
      )}

      <form onSubmit={handleCreate} className="space-y-4 mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h4 className="font-semibold text-slate-800">Novo Template</h4>
        <input
          type="text"
          placeholder="Nome do template..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div>
          <textarea
            rows={5}
            placeholder={'Olá {{nome}}, tudo bem?\n\nGostaríamos de informar sobre {{assunto}}.\n\nAté logo!'}
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm resize-none"
          />
          {newBody && detectedVars(newBody).length > 0 && (
            <p className="text-xs text-blue-600 mt-1">
              Variáveis: {detectedVars(newBody).map((v) => `{{${v}}}`).join(', ')}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={saving || !newName.trim() || !newBody.trim()}
          className="px-5 py-2 bg-primary text-white font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Salvando...' : '+ Criar Template'}
        </button>
      </form>

      {templates.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">Nenhum template criado ainda.</p>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="border border-slate-200 rounded-lg p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{t.name}</p>
                <p className="text-sm text-slate-500 whitespace-pre-wrap mt-1 line-clamp-3">{t.body}</p>
                {t.variables?.length > 0 && (
                  <p className="text-xs text-blue-500 mt-2">
                    Variáveis: {t.variables.map((v: string) => `{{${v}}}`).join(', ')}
                  </p>
                )}
              </div>
              <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-600 text-sm flex-shrink-0">
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Lists Manager ───────────────────────── */
function ListsManager() {
  const [lists, setLists] = useState<any[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Create form
  const [newListName, setNewListName] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');

  // Edit state
  const [editList, setEditList] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editIds, setEditIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadLists();
    loadContacts();
  }, []);

  const loadLists = async () => {
    try {
      const res = await apiClient.getLists();
      setLists(res.lists);
    } catch {}
  };

  const loadContacts = async () => {
    setLoadingContacts(true);
    try {
      const res = await apiClient.getContacts();
      setContacts(res.contacts);
    } catch {} finally { setLoadingContacts(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || selectedIds.size === 0) return;
    try {
      setCreating(true);
      await apiClient.createCustomList(newListName.trim(), [...selectedIds]);
      setNewListName(''); setSelectedIds(new Set()); setSearch('');
      setMsg('Lista criada!');
      setTimeout(() => setMsg(''), 3000);
      loadLists();
    } catch { setMsg('Erro ao criar lista.'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta lista?')) return;
    await apiClient.deleteCustomList(id);
    loadLists();
  };

  const startEdit = (list: any) => {
    setEditList(list);
    setEditName(list.name);
    // We don't have the contactIds directly, would need to load them
    setEditIds(new Set());
  };

  const handleSaveEdit = async () => {
    if (!editList || !editName.trim()) return;
    try {
      await apiClient.updateCustomList(editList.id, editName.trim(), [...editIds]);
      setEditList(null);
      setMsg('Lista atualizada!');
      setTimeout(() => setMsg(''), 3000);
      loadLists();
    } catch { setMsg('Erro ao atualizar.'); }
  };

  const toggleContact = (id: string, set: Set<string>, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    setter(next);
  };

  const filtered = contacts.filter((c) =>
    `${c.firstName} ${c.lastName} ${c.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Create List */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-1">Nova Lista</h3>
        <p className="text-sm text-slate-500 mb-6">Selecione contatos do GHL para criar um grupo de disparo.</p>

        {msg && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm">{msg}</div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <input
            type="text"
            placeholder="Nome da lista (ex: Alunos Turma A, Leads Outubro...)"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            placeholder="Buscar contatos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {loadingContacts ? (
            <p className="text-sm text-slate-400">Carregando contatos...</p>
          ) : (
            <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-lg">
              {filtered.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Nenhum contato encontrado.</p>
              ) : (
                filtered.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(c.id)}
                      onChange={() => toggleContact(c.id, selectedIds, setSelectedIds)}
                      className="w-4 h-4 accent-primary"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-slate-500">{c.phone}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{selectedIds.size} contato(s) selecionado(s)</p>
            <button
              type="submit"
              disabled={creating || !newListName.trim() || selectedIds.size === 0}
              className="px-5 py-2 bg-primary text-white font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              {creating ? 'Criando...' : '+ Criar Lista'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Lists */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Suas Listas</h3>
        {lists.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Nenhuma lista criada ainda.</p>
        ) : (
          <div className="space-y-3">
            {lists.map((l) =>
              editList?.id === l.id ? (
                <div key={l.id} className="border border-primary rounded-lg p-4 space-y-3">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveEdit} className="px-4 py-1.5 bg-primary text-white text-sm rounded-lg">Salvar</button>
                    <button onClick={() => setEditList(null)} className="px-4 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div key={l.id} className="border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{l.name}</p>
                    <p className="text-sm text-slate-500">{l.memberCount} contato(s)</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => startEdit(l)} className="text-blue-400 hover:text-blue-600 text-sm">Editar</button>
                    <button onClick={() => handleDelete(l.id)} className="text-red-400 hover:text-red-600 text-sm">Excluir</button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsTab;
