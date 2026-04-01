import { useState, useMemo } from 'react';
import { X, TrendingUp, Download } from 'lucide-react';
import { useStore } from '../hooks/useStore';

interface DashboardReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewType = 'semanal' | 'mensal';

interface PeriodData {
  key: string;      // Ex: "2026-03-W2" ou "2026-03"
  label: string;    // Ex: "15/03 a 21/03" ou "Março/2026"
  booksRead: number;
  points: number;
  dateValue: number; // Para ordenação
}

export function DashboardReportModal({ isOpen, onClose }: DashboardReportModalProps) {
  const participants = useStore(state => state.participants);
  const [viewType, setViewType] = useState<ViewType>('semanal');

  // Memoiza os cálculos para não refazer a cada render
  const reportData = useMemo(() => {
    const dataMap: Record<string, PeriodData> = {};

    participants.forEach(p => {
      if (p.history) {
        p.history.forEach(h => {
          const d = new Date(h.date);
          let key = '';
          let label = '';
          let dateValue = 0;

          if (viewType === 'mensal') {
            const year = d.getFullYear();
            const month = d.getMonth(); // 0-11
            key = `${year}-${String(month).padStart(2, '0')}`;
            
            const monthNames = [
              'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
              'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];
            label = `${monthNames[month]} de ${year}`;
            dateValue = new Date(year, month, 1).getTime();
          } else {
            // Semanal (Domingo a Sábado)
            const startOfWeek = new Date(d);
            startOfWeek.setDate(d.getDate() - d.getDay());
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            const year = startOfWeek.getFullYear();
            const month = startOfWeek.getMonth();
            const date = startOfWeek.getDate();

            key = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
            
            const format = (dateObj: Date) => 
              `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
            
            label = `${format(startOfWeek)} a ${format(endOfWeek)}`;
            dateValue = startOfWeek.getTime();
          }

          if (!dataMap[key]) {
            dataMap[key] = { key, label, booksRead: 0, points: 0, dateValue };
          }

          dataMap[key].booksRead++;
          dataMap[key].points += h.pages; // Páginas representam pontos
        });
      }
    });

    // Converte para array e ordena (mais recentes primeiro)
    return Object.values(dataMap).sort((a, b) => b.dateValue - a.dateValue);
  }, [participants, viewType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="text-blue-600 dark:text-blue-400" />
            Crescimento e Métricas (Evolução)
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
            <X size={24} />
          </button>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap gap-4 items-center justify-between transition-colors">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Agrupar por:</label>
            <div className="flex bg-white dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 shadow-sm p-1 transition-colors">
              <button
                className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                  viewType === 'semanal' 
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
                onClick={() => setViewType('semanal')}
              >
                Semanal
              </button>
              <button
                className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                  viewType === 'mensal' 
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
                onClick={() => setViewType('mensal')}
              >
                Mensal
              </button>
            </div>
          </div>

          <div>
            <button 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
              onClick={() => window.print()}
            >
              <Download size={18} />
              Imprimir / Salvar PDF
            </button>
          </div>
        </div>

        {/* Tabela de Resultados */}
        <div className="flex-1 overflow-auto p-6">
          {reportData.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
              Nenhuma leitura registrada no sistema ainda.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Período ({viewType})
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Livros Lidos
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Pontos Somados
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {reportData.map((item, idx) => (
                    <tr key={item.key} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {item.label}
                        {idx === 0 && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">Atual</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-blue-600 dark:text-blue-400">
                        {item.booksRead}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-teal-600 dark:text-teal-400">
                        {item.points} pts
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