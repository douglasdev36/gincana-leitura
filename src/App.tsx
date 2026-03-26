import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';

// Componente para proteger rotas
function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('@gincana:token');
  
  if (!token) {
    // Se não tem token, redireciona pro login
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
