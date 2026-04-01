import { useState } from 'react';
import { X, FileText, Download } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { ReadingHistory } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = 'geral' | 'semanal' | 'mensal' | 'periodo' | 'ranking';

interface ReportEntry {
  studentName: string;
  history: ReadingHistory;
}

export function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const participants = useStore(state => state.participants);
  const [filter, setFilter] = useState<FilterType>('geral');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!isOpen) return null;

  // Função para checar se a data está no período
  const isDateInRange = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    if (filter === 'geral') return true;
    
    if (filter === 'semanal') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= oneWeekAgo && date <= now;
    }
    
    if (filter === 'mensal') {
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      return date >= oneMonthAgo && date <= now;
    }
    
    if (filter === 'periodo') {
      if (!startDate || !endDate) return true;
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end;
    }

    return true;
  };

  // Coletar e formatar todos os dados para o relatório
  const reportData: ReportEntry[] = [];
  
  participants.forEach(p => {
    if (p.history) {
      p.history.forEach(h => {
        if (isDateInRange(h.date)) {
          reportData.push({
            studentName: p.name,
            history: h
          });
        }
      });
    }
  });

  // Ordenar por data (mais recente primeiro)
  reportData.sort((a, b) => new Date(b.history.date).getTime() - new Date(a.history.date).getTime());

  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);

  const downloadRankingCsv = () => {
    const escapeCsv = (value: string | number) => {
      const s = String(value ?? '');
      if (/[;"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const rows: string[] = [];
    rows.push(['Posição', 'Aluno', 'Pontos', 'Leituras'].join(';'));

    sortedParticipants.forEach((p, idx) => {
      const readingsCount = p.history?.length ?? 0;
      rows.push(
        [idx + 1, p.name, p.score, readingsCount]
          .map(escapeCsv)
          .join(';')
      );
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const iso = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `ranking-${iso}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="text-emerald-600 dark:text-emerald-400" />
            Relatório de Leituras
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap gap-4 items-end transition-colors">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Relatório</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors duration-200"
            >
              <option value="geral">Geral (Tudo)</option>
              <option value="semanal">Últimos 7 dias</option>
              <option value="mensal">Últimos 30 dias</option>
              <option value="periodo">Por Período (Datas)</option>
              <option value="ranking">Ranking (Pontuação)</option>
            </select>
          </div>

          {filter === 'periodo' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Inicial</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Final</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors duration-200"
                />
              </div>
            </>
          )}

          <div className="ml-auto flex gap-2">
            {filter === 'ranking' && (
              <button
                className="flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:hover:bg-emerald-900 dark:text-emerald-300 text-emerald-800 px-4 py-2 rounded-md font-medium transition-colors shadow-sm border border-emerald-200 dark:border-emerald-800"
                onClick={downloadRankingCsv}
              >
                <Download size={18} />
                Baixar CSV
              </button>
            )}
            <button 
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
              onClick={() => window.print()}
            >
              <Download size={18} />
              Imprimir / PDF
            </button>
          </div>
        </div>

        {/* Tabela de Resultados */}
        <div className="flex-1 overflow-auto p-6">
          {filter === 'ranking' ? (
            sortedParticipants.length === 0 ? (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                Nenhum participante encontrado.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg transition-colors duration-200">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Posição
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Aluno
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Pontos
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Leituras
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {sortedParticipants.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                          {idx + 1}º
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                          {p.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-emerald-600 dark:text-emerald-400">
                          {p.score}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-600 dark:text-slate-400">
                          {p.history?.length ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : reportData.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
              Nenhuma leitura encontrada para este período.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg transition-colors duration-200">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Aluno
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Livro Lido
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Páginas (Pontos)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {reportData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {new Date(item.history.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                        {item.studentName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{item.history.bookTitle}</span>
                        <br />
                        <span className="text-xs text-slate-400 dark:text-slate-500">Tombo: {item.history.bookId}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-emerald-600 dark:text-emerald-400">
                        +{item.history.pages}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
