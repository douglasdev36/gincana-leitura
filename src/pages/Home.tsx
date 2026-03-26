import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { ParticipantList } from '../components/ParticipantList';
import { BookSearch } from '../components/BookSearch';
import { ScoreBoard } from '../components/ScoreBoard';
import { Trophy, X } from 'lucide-react';
import { useStore } from '../hooks/useStore';

export function Home() {
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const loadParticipants = useStore(state => state.loadParticipants);

  useEffect(() => {
    // Carrega a lista inicial do backend quando abrir a página
    loadParticipants();
  }, [loadParticipants]);

  return (
    <Layout>
      <div className="flex justify-end mb-6">
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

      <div className={`grid grid-cols-1 ${isRankingOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-2 max-w-6xl mx-auto'} gap-8`}>
        {/* Coluna Esquerda: Registro de Leitura */}
        <div className="lg:col-span-1 flex flex-col">
          <BookSearch />
        </div>

        {/* Coluna Central/Direita: Participantes */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 flex-grow">
            <ParticipantList />
          </div>
        </div>

        {/* Coluna Direita: Ranking (Renderizado condicionalmente) */}
        {isRankingOpen && (
          <div className="lg:col-span-1 animate-in fade-in slide-in-from-right-4 duration-300">
            <ScoreBoard />
          </div>
        )}
      </div>
    </Layout>
  );
}
