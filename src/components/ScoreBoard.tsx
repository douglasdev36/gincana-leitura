import { useState } from 'react';
import { Trophy, Medal, FileBarChart } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { ReportModal } from './ReportModal';

export function ScoreBoard() {
  const participants = useStore(state => state.participants);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Ordena os participantes pela pontuação de forma decrescente
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);

  if (sortedParticipants.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            Ranking
          </h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
          Ainda não há participantes na gincana.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            Ranking
          </h3>
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 px-3 py-1.5 rounded transition-colors border border-emerald-200 dark:border-emerald-800"
            title="Gerar Relatório"
          >
            <FileBarChart size={16} />
            Relatório
          </button>
        </div>

        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {sortedParticipants.map((participant, index) => (
            <div 
              key={participant.id} 
              className={`flex items-center justify-between p-3 rounded-md transition-colors duration-200 ${
                index === 0 ? 'bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/50' :
                index === 1 ? 'bg-slate-50 border border-slate-200 dark:bg-slate-700/30 dark:border-slate-600' :
                index === 2 ? 'bg-orange-50 border border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/50' :
                'bg-white border border-slate-100 dark:bg-slate-800 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-500 dark:text-slate-400 w-5">
                  {index + 1}º
                </span>
                {index < 3 && (
                  <Medal className={
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-slate-400 dark:text-slate-300' :
                    'text-orange-500'
                  } size={20} />
                )}
                <span className="font-medium text-slate-800 dark:text-slate-200">{participant.name}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 rounded mb-1">
                  {participant.score} pts
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {participant.history ? participant.history.length : 0} {participant.history?.length === 1 ? 'livro' : 'livros'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </>
  );
}
