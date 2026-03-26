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
      <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            Ranking
          </h3>
        </div>
        <p className="text-sm text-slate-500 text-center py-4">
          Ainda não há participantes na gincana.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            Ranking
          </h3>
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded transition-colors"
            title="Gerar Relatório"
          >
            <FileBarChart size={16} />
            Relatório
          </button>
        </div>

        <div className="space-y-3">
          {sortedParticipants.map((participant, index) => (
            <div 
              key={participant.id} 
              className={`flex items-center justify-between p-3 rounded-md ${
                index === 0 ? 'bg-yellow-50 border border-yellow-200' :
                index === 1 ? 'bg-slate-50 border border-slate-200' :
                index === 2 ? 'bg-orange-50 border border-orange-200' :
                'bg-white border border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-500 w-5">
                  {index + 1}º
                </span>
                {index < 3 && (
                  <Medal className={
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-slate-400' :
                    'text-orange-500'
                  } size={20} />
                )}
                <span className="font-medium text-slate-800">{participant.name}</span>
              </div>
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                {participant.score} pts
              </span>
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
