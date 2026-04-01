import { useState } from 'react';
import { BarChart3, BookOpen, Star, Trophy, Users, FileText } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { DashboardReportModal } from './DashboardReportModal';

export function Dashboard() {
  const participants = useStore(state => state.participants);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Calcula o início da semana atual (Domingo como dia 0)
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Variáveis para as métricas
  let weeklyBooksRead = 0;
  let weeklyPoints = 0;
  let totalBooksRead = 0;
  let totalPoints = 0;

  // Variáveis para os livros mais lidos (todos os tempos)
  // bookId -> { title, count }
  const bookCounts: Record<string, { title: string, count: number, tombo: string }> = {};

  participants.forEach(p => {
    if (p.history) {
      p.history.forEach(h => {
        totalBooksRead++;
        totalPoints += h.pages; // Assume que as páginas são os pontos
        
        // Conta todos os livros para o Top 5
        if (!bookCounts[h.bookId]) {
          bookCounts[h.bookId] = { title: h.bookTitle, count: 0, tombo: h.bookId };
        }
        bookCounts[h.bookId].count++;

        // Checa se foi lido nesta semana
        const readDate = new Date(h.date);
        if (readDate >= startOfWeek) {
          weeklyBooksRead++;
          weeklyPoints += h.pages; // Pontos somados = páginas lidas
        }
      });
    }
  });

  const top5Books = Object.values(bookCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="text-blue-600 dark:text-blue-400" />
            Dashboard
          </h3>
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50 px-3 py-1.5 rounded transition-colors border border-blue-200 dark:border-blue-800"
            title="Estatísticas de Crescimento"
          >
            <FileText size={16} />
            Evolução
          </button>
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50 flex flex-col items-center text-center transition-colors duration-200">
            <BookOpen className="text-blue-500 dark:text-blue-400 mb-2" size={24} />
            <span className="text-2xl font-black text-blue-700 dark:text-blue-300">{weeklyBooksRead}</span>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Livros na Semana</span>
          </div>
          
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800/50 flex flex-col items-center text-center transition-colors duration-200">
            <Star className="text-emerald-500 dark:text-emerald-400 mb-2" size={24} />
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{weeklyPoints}</span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Pontos na Semana</span>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/50 flex flex-col items-center text-center transition-colors duration-200">
            <BookOpen className="text-indigo-500 dark:text-indigo-400 mb-2" size={24} />
            <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{totalBooksRead}</span>
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Livros no Total</span>
          </div>

          <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-100 dark:border-teal-800/50 flex flex-col items-center text-center transition-colors duration-200">
            <Star className="text-teal-500 dark:text-teal-400 mb-2" size={24} />
            <span className="text-2xl font-black text-teal-700 dark:text-teal-300">{totalPoints}</span>
            <span className="text-xs font-medium text-teal-600 dark:text-teal-400 uppercase tracking-wide">Pontos no Total</span>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800/50 flex flex-col items-center text-center col-span-2 transition-colors duration-200">
            <Users className="text-purple-500 dark:text-purple-400 mb-2" size={24} />
            <span className="text-2xl font-black text-purple-700 dark:text-purple-300">{participants.length}</span>
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">Alunos na Gincana</span>
          </div>
        </div>

        {/* Top 5 Livros Mais Lidos */}
        <div>
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Trophy size={16} className="text-yellow-500" />
            Top 5 Livros Mais Lidos
          </h4>
          
          {top5Books.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
              Nenhuma leitura registrada ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {top5Books.map((book, idx) => (
                <div key={book.tombo} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md border border-slate-100 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                      idx === 0 ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400' :
                      idx === 1 ? 'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-300' :
                      idx === 2 ? 'bg-orange-200 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400' :
                      'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate" title={book.title}>
                        {book.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Tombo: {book.tombo}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                      {book.count} {book.count === 1 ? 'leitura' : 'leituras'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
    <DashboardReportModal 
      isOpen={isReportModalOpen} 
      onClose={() => setIsReportModalOpen(false)} 
    />
  </>
  );
}
