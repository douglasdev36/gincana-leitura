import { useState } from 'react';
import { X, UserCog } from 'lucide-react';
import { api } from '../services/api';

interface ManageAdminsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManageAdminsModal({ isOpen, onClose }: ManageAdminsModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !password) {
      setError('Usuário e senha são obrigatórios.');
      return;
    }

    setIsLoading(true);

    try {
      await api.createAdmin(username, password, name);
      setSuccess('Administrador criado com sucesso! O novo usuário precisará alterar a senha no primeiro acesso.');
      setUsername('');
      setPassword('');
      setName('');
      
      // Fecha o modal após 2 segundos
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 2500);

    } catch (err: any) {
      setError(err.message || 'Erro ao criar administrador.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200 transition-colors">
        
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <UserCog className="text-emerald-600 dark:text-emerald-400" />
            Criar Novo Administrador
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm text-center border border-red-200 dark:border-red-800/50 transition-colors">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-3 rounded-md text-sm text-center border border-emerald-200 dark:border-emerald-800/50 transition-colors">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors duration-200"
              placeholder="Opcional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome de Usuário (Login) *</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors duration-200"
              placeholder="Ex: maria.biblioteca"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Senha Inicial *</label>
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors duration-200"
              placeholder="Ex: senha123"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-medium py-2.5 px-4 rounded-md transition-colors disabled:bg-emerald-400 dark:disabled:bg-emerald-800"
          >
            {isLoading ? 'Criando...' : 'Cadastrar Administrador'}
          </button>
        </form>
      </div>
    </div>
  );
}