import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogIn } from 'lucide-react';
import { api } from '../services/api';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await api.login(username, password);
      // Salva o token no localStorage para manter a sessão
      localStorage.setItem('@gincana:token', data.token);
      localStorage.setItem('@gincana:user', JSON.stringify(data.user));
      
      // Redireciona para a home
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-slate-200">
        
        <div className="flex flex-col items-center mb-8">
          <div className="bg-emerald-100 p-4 rounded-full mb-4">
            <BookOpen size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 text-center">Gincana de Leitura</h1>
          <p className="text-sm text-slate-500 mt-1">Acesso restrito à administração</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Usuário
            </label>
            <input
              type="text"
              required
              className="block w-full px-4 py-3 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
              placeholder="Digite seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              className="block w-full px-4 py-3 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-all mt-6"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={18} />
                Entrar no Sistema
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}