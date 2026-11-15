import { BrowserRouter, Routes, Route } from "react-router";
import { ToastProvider } from "./contexts/ToastContext";
import PortalPublico from "./Layouts/Portal/Portal";
import Home from "./Routes/Portal/Home";
import Lumina from "./Routes/Portal/Lumina";
import Login from "./Routes/Dashboard/Login";
import DashboardLayout from "./Layouts/Dashboard/Dashboard";
import DashboardHome from "./Routes/Dashboard/Home";
import DashboardAgenda from "./Routes/Dashboard/Agenda";
import Atividades from "./Routes/Dashboard/Atividades";
import DashboardConfiguracoes from "./Routes/Dashboard/Configuracoes";
import DashboardFinanceiro from "./Routes/Dashboard/Financeiro";
import DashboardProjetos from "./components/sections/Dashboard/Projetos";
import ProtectedRoute from "./Routes/Dashboard/ProtectedRoute";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PortalPublico />}>
            <Route index element={<Home />} />
            <Route path="lumina" element={<Lumina />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="geral" element={<DashboardHome />} />
              <Route path="atividades" element={<Atividades />} />
              <Route path="agenda" element={<DashboardAgenda />} />
              <Route path="financeiro" element={<DashboardFinanceiro />} />
              <Route path="configuracoes" element={<DashboardConfiguracoes />} />
              <Route path="projetos" element={<DashboardProjetos />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;