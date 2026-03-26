import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { api } from '../services/api';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: { id: string; name: string }) => void;
}

export function NewUserModal({ isOpen, onClose, onUserCreated }: NewUserModalProps) {
  const [name, setName] = useState('');
  const [matricula, setMatricula] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert("O nome é obrigatório");
      return;
    }

    setIsLoading(true);
    try {
      const newUser = await api.createUser({
        name,
        matricula,
        email,
        telefone,
        endereco
      });
      
      alert("Usuário criado com sucesso!");
      onUserCreated(newUser);
      
      // Limpa os campos
      setName('');
      setMatricula('');
      setEmail('');
      setTelefone('');
      setEndereco('');
      onClose();
    } catch (error) {
      alert("Erro ao criar usuário. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <UserPlus className="text-emerald-600" />
            Novo Usuário
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Matrícula</label>
            <input
              type="text"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2 px-4 rounded-md text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:bg-emerald-400"
            >
              {isLoading ? 'Salvando...' : 'Salvar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}