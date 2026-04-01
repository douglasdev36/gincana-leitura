import { ReactNode, useState, useEffect } from 'react';
import { BookOpen, LogOut, UserCog, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FirstLoginModal } from './FirstLoginModal';
import { ManageAdminsModal } from './ManageAdminsModal';
import { Admin } from '../types';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<Admin | null>(null);
  const [isFirstLoginModalOpen, setIsFirstLoginModalOpen] = useState(false);
  const [isManageAdminsModalOpen, setIsManageAdminsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Carrega a preferência de tema ao montar
    const savedTheme = localStorage.getItem('@gincana:theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    const userStr = localStorage.getItem('@gincana:user');
    if (userStr) {
      const parsedUser = JSON.parse(userStr) as Admin;
      setUser(parsedUser);
      if (parsedUser.isFirstLogin) {
        setIsFirstLoginModalOpen(true);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('@gincana:token');
    localStorage.removeItem('@gincana:user');
    navigate('/login');
  };

  const handleUpdateSuccess = (updatedUser: Admin) => {
    localStorage.setItem('@gincana:user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsFirstLoginModalOpen(false);
  };

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('@gincana:theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('@gincana:theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-900 transition-colors duration-200 flex flex-col">
      <header className="bg-emerald-600 dark:bg-emerald-800 text-white shadow-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={28} />
            <h1 className="text-2xl font-bold">Gincana de Leitura</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-full transition-colors"
              title={isDarkMode ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user && !user.isFirstLogin && (
              <button 
                onClick={() => setIsManageAdminsModalOpen(true)}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-700 dark:hover:bg-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                title="Gerenciar Administradores"
              >
                <UserCog size={18} />
                <span className="hidden sm:inline">Admins</span>
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-900 dark:hover:bg-emerald-950 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              title="Sair do sistema"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 relative text-slate-800 dark:text-slate-100">
        {children}
      </main>

      <footer className="bg-emerald-900 dark:bg-slate-950 text-emerald-100 dark:text-slate-400 py-6 text-center transition-colors duration-200">
        <p>© 2026 Gincana de Leitura. Todos os direitos reservados.</p>
      </footer>

      <FirstLoginModal 
        isOpen={isFirstLoginModalOpen} 
        onSuccess={handleUpdateSuccess} 
      />
      
      <ManageAdminsModal 
        isOpen={isManageAdminsModalOpen} 
        onClose={() => setIsManageAdminsModalOpen(false)} 
      />
    </div>
  );
}
