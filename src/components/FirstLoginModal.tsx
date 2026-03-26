import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { Admin } from '../types';

interface FirstLoginModalProps {
  isOpen: boolean;
  onSuccess: (user: Admin) => void;
}

export function FirstLoginModal({ isOpen, onSuccess }: FirstLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !name) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const updatedAdmin = await api.updateAdminCredentials(username, password, name);
      onSuccess(updatedAdmin);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-300">
        
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-orange-100 p-3 rounded-full mb-3 text-orange-600">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Bem-vindo(a) à Gincana!</h2>
          <p className="text-sm text-slate-600 mt-2">
            Como este é o seu primeiro acesso, é obrigatório alterar suas credenciais padrão para manter o sistema seguro.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Seu Nome Completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              placeholder="Ex: João da Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Novo Nome de Usuário (Login)</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              placeholder="Ex: joao.silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nova Senha</label>
            <input
              type="password"
              required
              minLength={4}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              placeholder="Digite uma senha segura"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:bg-emerald-400 flex justify-center"
          >
            {isLoading ? 'Salvando...' : 'Salvar e Acessar Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}