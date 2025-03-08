import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Adicionar logs para depuração
  console.log('ProtectedRoute - Auth State:', { 
    isAuthenticated, 
    loading, 
    user: user ? {
      id: user.id,
      email: user.email,
      verified: user.verified
    } : null 
  });

  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to email verification if user is not verified
  // Modificado para tratar 'undefined' como verificado (true)
  if (user && user.verified === false) {
    console.log('Redirecionando para verificação de email porque user.verified =', user.verified);
    return <Navigate to="/verify-email" state={{ email: user.email }} replace />;
  }

  // Render children if authenticated and verified
  console.log('Renderizando rota protegida - usuário verificado');
  return <>{children}</>;
};