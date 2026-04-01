import { useState, useMemo } from 'react';
import { X, TrendingUp, Download, BarChart2 } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';

interface DashboardReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewType = 'diario' | 'semanal' | 'mensal';

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

          if (viewType === 'diario') {
            const year = d.getFullYear();
            const month = d.getMonth();
            const date = d.getDate();
            key = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
            label = `${String(date).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
            dateValue = new Date(year, month, date).getTime();
          } else if (viewType === 'mensal') {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print-modal-overlay">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 transition-colors print-area">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="text-blue-600 dark:text-blue-400" />
            Crescimento e Métricas (Evolução)
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 print-hide">
            <X size={24} />
          </button>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap gap-4 items-center justify-between transition-colors print-hide">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Agrupar por:</label>
            <div className="flex bg-white dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 shadow-sm p-1 transition-colors">
              <button
                className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                  viewType === 'diario' 
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
                onClick={() => setViewType('diario')}
              >
                Diário
              </button>
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

        {/* Tabela e Gráfico */}
        <div className="flex-1 overflow-auto p-6 flex flex-col gap-8">
          {reportData.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
              Nenhuma leitura registrada no sistema ainda.
            </div>
          ) : (
            <>
              {/* Gráfico */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                  <BarChart2 className="text-blue-500" size={20} />
                  Gráfico de Evolução
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={[...reportData].reverse()}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                      <XAxis 
                        dataKey="label" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        dy={10}
                      />
                      <YAxis 
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                      />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar yAxisId="left" dataKey="booksRead" name="Livros Lidos" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      <Line yAxisId="right" type="monotone" dataKey="points" name="Pontos Somados" stroke="#0d9488" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tabela */}
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
            </>
          )}
        </div>
        
      </div>
    </div>
  );
}