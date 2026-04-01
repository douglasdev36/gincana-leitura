import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { ParticipantList } from '../components/ParticipantList';
import { BookSearch } from '../components/BookSearch';
import { ScoreBoard } from '../components/ScoreBoard';
import { Dashboard } from '../components/Dashboard';
import { Trophy, X, BarChart3 } from 'lucide-react';
import { useStore } from '../hooks/useStore';

export function Home() {
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const loadParticipants = useStore(state => state.loadParticipants);

  useEffect(() => {
    // Carrega a lista inicial do backend quando abrir a página
    loadParticipants();
  }, [loadParticipants]);

  const openPanelsCount = 2 + (isRankingOpen ? 1 : 0) + (isDashboardOpen ? 1 : 0);
  
  let gridClass = 'lg:grid-cols-2 max-w-5xl mx-auto';
  if (openPanelsCount === 3) gridClass = 'lg:grid-cols-3 max-w-7xl mx-auto';
  if (openPanelsCount === 4) gridClass = 'lg:grid-cols-4 max-w-[100rem] mx-auto';

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setIsDashboardOpen(!isDashboardOpen)}
          className="flex items-center gap-2 bg-blue-100 text-blue-800 hover:bg-blue-200 px-4 py-2 rounded-md font-medium transition-colors shadow-sm border border-blue-200"
        >
          {isDashboardOpen ? (
            <>
              <X size={20} />
              Ocultar Dashboard
            </>
          ) : (
            <>
              <BarChart3 size={20} className="text-blue-600" />
              Ver Dashboard
            </>
          )}
        </button>

        <button
          onClick={() => setIsRankingOpen(!isRankingOpen)}
          className="flex items-center gap-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-4 py-2 rounded-md font-medium transition-colors shadow-sm border border-emerald-200"
        >
          {isRankingOpen ? (
            <>
              <X size={20} />
              Ocultar Ranking
            </>
          ) : (
            <>
              <Trophy size={20} className="text-yellow-500" />
              Ver Ranking
            </>
          )}
        </button>
      </div>

      <div className={`grid grid-cols-1 ${gridClass} gap-6`}>
        {/* Coluna Mais à Esquerda: Dashboard (Renderizado condicionalmente) */}
        {isDashboardOpen && (
          <div className="lg:col-span-1 animate-in fade-in slide-in-from-left-4 duration-300">
            <Dashboard />
          </div>
        )}

        {/* Coluna Central-Esquerda: Registro de Leitura */}
        <div className="lg:col-span-1 flex flex-col">
          <BookSearch />
        </div>

        {/* Coluna Central-Direita: Participantes */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 flex-grow">
            <ParticipantList />
          </div>
        </div>

        {/* Coluna Mais à Direita: Ranking (Renderizado condicionalmente) */}
        {isRankingOpen && (
          <div className="lg:col-span-1 animate-in fade-in slide-in-from-right-4 duration-300">
            <ScoreBoard />
          </div>
        )}
      </div>
    </Layout>
  );
}
