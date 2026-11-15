import { Navigate, Outlet, useLocation } from "react-router";

/**
 * Componente de Guarda de Rota (ProtectedRoute)
 * 
 * Intercepta o acesso a qualquer rota interna do Dashboard (/dashboard/*).
 * Verifica se o usuário possui a flag de autenticação ou token salvo na sessão.
 * Caso não possua, redireciona imediatamente para a tela de login (/login),
 * preservando a rota de origem para redirecionar de volta após login.
 */
function ProtectedRoute() {
  const location = useLocation();
  
  // Valida tanto a flag de autenticação quanto a presença do token
  const isAuthenticated = 
    sessionStorage.getItem("lumina-authenticated") === "true" ||
    Boolean(sessionStorage.getItem("lumina-token"));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Renderiza a rota filha se estiver autenticado
  return <Outlet />;
}

export default ProtectedRoute;
