import { UserMinus } from 'lucide-react';
import { useStore } from '../hooks/useStore';

export function ParticipantList() {
  const participants = useStore((state) => state.participants);
  const removeParticipant = useStore((state) => state.removeParticipant);
  const setActiveStudent = useStore((state) => state.setActiveStudent);

  const handleRemove = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja remover ${name} da gincana? O histórico de pontos não será apagado do banco de dados, mas ele deixará de aparecer no ranking.`)) {
      removeParticipant(id);
    }
  };

  if (participants.length === 0) {
    return (
      <div className="text-slate-500 dark:text-slate-400 text-sm py-4">
        Nenhum participante adicionado ainda.
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 transition-colors duration-200">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
        Participantes da Gincana ({participants.length})
      </h3>
      <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {participants.map((participant) => (
          <li
            key={participant.id}
            className="flex items-center justify-between bg-white dark:bg-slate-800 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            onClick={() => setActiveStudent({ id: participant.id, name: participant.name })}
          >
            <span className="font-medium text-slate-700 dark:text-slate-300">{participant.name}</span>
            <button
              onClick={(e) => handleRemove(e, participant.id, participant.name)}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              title="Remover participante"
            >
              <UserMinus size={18} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
