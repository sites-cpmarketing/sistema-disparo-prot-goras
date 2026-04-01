import React, { useState, useEffect } from 'react';
import { apiClient } from '../api';
import { useAppStore } from '../store';
import { DispatchJob } from '../types';

function History() {
  const [jobs, setJobs] = useState<DispatchJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState<DispatchJob | null>(null);

  useEffect(() => {
    loadHistory();
    const interval = setInterval(loadHistory, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getDispatchHistory(100);
      setJobs(res.history);
      setError('');
    } catch (err) {
      setError('Erro ao carregar histórico');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sending':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳ Pendente';
      case 'sending':
        return '📤 Enviando';
      case 'completed':
        return '✅ Concluído';
      case 'failed':
        return '❌ Falha';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Histórico de Disparos</h2>
          <button
            onClick={loadHistory}
            disabled={loading}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 transition-colors"
          >
            🔄 Atualizar
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Nenhum disparo realizado ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(job.status)}`}>
                        {getStatusLabel(job.status)}
                      </span>
                      <h3 className="font-medium text-slate-900">{job.templateName}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      ID: <code className="bg-slate-100 px-2 py-1 rounded">{job.id}</code>
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Destinatários</p>
                        <p className="font-medium text-slate-900">{job.recipientCount}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Enviados</p>
                        <p className="font-medium text-green-600">{job.sentCount}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Falhas</p>
                        <p className="font-medium text-red-600">{job.failedCount}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>{new Date(job.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                {/* Expanded details */}
                {selectedJob?.id === job.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                    <p className="text-sm text-slate-600">
                      <strong>Última atualização:</strong> {new Date(job.updatedAt).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-slate-600">
                      <strong>Taxa de sucesso:</strong>{' '}
                      {job.recipientCount > 0
                        ? ((job.sentCount / job.recipientCount) * 100).toFixed(1)
                        : 0}
                      %
                    </p>
                    {Object.keys(job.variables).length > 0 && (
                      <div className="text-sm">
                        <strong className="text-slate-600">Variáveis:</strong>
                        <pre className="bg-slate-100 p-2 rounded mt-1 text-xs overflow-x-auto">
                          {JSON.stringify(job.variables, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
