import React, { useState, useEffect } from 'react';
import { apiClient } from '../api';
import { useAppStore } from '../store';
import { Contact, ContactList, WhatsAppTemplate } from '../types';

function NewDispatch() {
  const setContacts = useAppStore((state) => state.setContacts);
  const setLists = useAppStore((state) => state.setLists);
  const setTemplates = useAppStore((state) => state.setTemplates);
  const addJob = useAppStore((state) => state.addJob);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [mode, setMode] = useState<'individual' | 'list'>('individual');
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [selectedList, setSelectedList] = useState<ContactList | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [searchContact, setSearchContact] = useState('');

  const [contacts, setContactsLocal] = useState<Contact[]>([]);
  const [lists, setListsLocal] = useState<ContactList[]>([]);
  const [templates, setTemplatesLocal] = useState<WhatsAppTemplate[]>([]);
  const [listContacts, setListContacts] = useState<Contact[]>([]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const errors: string[] = [];

    const [contactsRes, listsRes, templatesRes] = await Promise.allSettled([
      apiClient.getContacts(),
      apiClient.getLists(),
      apiClient.getTemplates(),
    ]);

    if (contactsRes.status === 'fulfilled') {
      setContactsLocal(contactsRes.value.contacts);
      setContacts(contactsRes.value.contacts);
    } else {
      errors.push('contatos');
      console.error('Contacts error:', contactsRes.reason);
    }

    if (listsRes.status === 'fulfilled') {
      setListsLocal(listsRes.value.lists);
      setLists(listsRes.value.lists);
    } else {
      errors.push('listas');
      console.error('Lists error:', listsRes.reason);
    }

    if (templatesRes.status === 'fulfilled') {
      setTemplatesLocal(templatesRes.value.templates);
      setTemplates(templatesRes.value.templates);
    } else {
      errors.push('templates');
      console.error('Templates error:', templatesRes.reason);
    }

    if (errors.length > 0) {
      setError(`Erro ao carregar: ${errors.join(', ')}. Verifique os escopos do token no GHL.`);
    } else {
      setError('');
    }

    setLoading(false);
  };

  const handleSelectList = async (list: ContactList) => {
    setSelectedList(list);
    try {
      const res = await apiClient.getListContacts(list.id);
      setListContacts(res.contacts);
    } catch (err) {
      setError('Erro ao carregar contatos da lista');
    }
  };

  const handleSelectTemplate = (template: WhatsAppTemplate) => {
    setSelectedTemplate(template);
    const variables: Record<string, string> = {};
    if (template.variables) {
      template.variables.forEach((v) => {
        variables[v] = '';
      });
    }
    setTemplateVariables(variables);
  };

  const handleSendDispatch = async () => {
    try {
      if (!selectedTemplate) {
        setError('Selecione um template');
        return;
      }

      const recipients =
        mode === 'individual'
          ? selectedContacts.map((c) => c.id)
          : listContacts.map((c) => c.id);

      if (recipients.length === 0) {
        setError('Selecione pelo menos um contato');
        return;
      }

      setLoading(true);
      const response = await apiClient.sendDispatch({
        recipients,
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        variables: templateVariables,
        listId: selectedList?.id,
      });

      addJob({
        id: response.jobId,
        status: 'pending',
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        recipientCount: recipients.length,
        sentCount: 0,
        failedCount: 0,
        variables: templateVariables,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setSuccess(`Disparo ${response.jobId} enfileirado com sucesso!`);
      setTimeout(() => setSuccess(''), 5000);

      // Reset form
      setSelectedContacts([]);
      setSelectedTemplate(null);
      setTemplateVariables({});
    } catch (err) {
      setError('Erro ao enviar disparo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((c) =>
    `${c.firstName} ${c.lastName} ${c.phone}`
      .toLowerCase()
      .includes(searchContact.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Novo Disparo WhatsApp</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
            {success}
          </div>
        )}

        {/* Mode Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Modo de Envio
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setMode('individual')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                mode === 'individual'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              👤 Contatos Individuais
            </button>
            <button
              onClick={() => setMode('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                mode === 'list'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📋 Lista de Contatos
            </button>
          </div>
        </div>

        {/* Contacts Selection */}
        {mode === 'individual' && (
          <div className="mb-6 space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Procurar Contatos
            </label>
            <input
              type="text"
              placeholder="Digite nome, email ou telefone..."
              value={searchContact}
              onChange={(e) => setSearchContact(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <div className="max-h-48 overflow-y-auto border border-slate-300 rounded-lg">
              {filteredContacts.map((contact) => (
                <label
                  key={contact.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedContacts.some((c) => c.id === contact.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedContacts([...selectedContacts, contact]);
                      } else {
                        setSelectedContacts(
                          selectedContacts.filter((c) => c.id !== contact.id)
                        );
                      }
                    }}
                    className="w-4 h-4 accent-primary"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-sm text-slate-500">{contact.phone}</p>
                  </div>
                </label>
              ))}
            </div>

            <p className="text-sm text-slate-600">
              {selectedContacts.length} contato(s) selecionado(s)
            </p>
          </div>
        )}

        {/* List Selection */}
        {mode === 'list' && (
          <div className="mb-6 space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Selecionar Lista
            </label>
            <select
              value={selectedList?.id || ''}
              onChange={(e) => {
                const list = lists.find((l) => l.id === e.target.value);
                if (list) handleSelectList(list);
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Escolha uma lista...</option>
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name} ({list.memberCount} contatos)
                </option>
              ))}
            </select>

            {listContacts.length > 0 && (
              <p className="text-sm text-slate-600">
                {listContacts.length} contato(s) nesta lista
              </p>
            )}
          </div>
        )}

        {/* Template Selection */}
        <div className="mb-6 space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Template WhatsApp
          </label>
          <select
            value={selectedTemplate?.id || ''}
            onChange={(e) => {
              const template = templates.find((t) => t.id === e.target.value);
              if (template) handleSelectTemplate(template);
            }}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Escolha um template...</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} ({template.category})
              </option>
            ))}
          </select>
        </div>

        {/* Template Variables */}
        {selectedTemplate && selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
          <div className="mb-6 space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="block text-sm font-medium text-slate-700">
              Variáveis do Template
            </label>
            {selectedTemplate.variables.map((variable) => (
              <input
                key={variable}
                type="text"
                placeholder={`${variable}...`}
                value={templateVariables[variable] || ''}
                onChange={(e) =>
                  setTemplateVariables({
                    ...templateVariables,
                    [variable]: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ))}
          </div>
        )}

        {/* Preview */}
        {selectedTemplate && (
          <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-2">Preview</p>
            <p className="text-slate-600 whitespace-pre-wrap">
              Template: <strong>{selectedTemplate.name}</strong>
            </p>
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleSendDispatch}
          disabled={loading}
          className="w-full px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '⏳ Processando...' : '🚀 Enviar Agora'}
        </button>
      </div>
    </div>
  );
}

export default NewDispatch;
