import { ReactNode, useState, useEffect } from 'react';
import { BookOpen, LogOut, UserCog } from 'lucide-react';
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

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="bg-emerald-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={28} />
            <h1 className="text-2xl font-bold">Gincana de Leitura</h1>
          </div>
          <div className="flex items-center gap-4">
            {user && !user.isFirstLogin && (
              <button 
                onClick={() => setIsManageAdminsModalOpen(true)}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                title="Gerenciar Administradores"
              >
                <UserCog size={18} />
                <span className="hidden sm:inline">Admins</span>
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              title="Sair do sistema"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 relative">
        {children}
      </main>

      <footer className="bg-emerald-900 text-emerald-100 py-6 text-center">
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
