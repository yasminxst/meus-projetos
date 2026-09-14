import { BrowserRouter, Routes, Route } from "react-router";
import { Navigate } from "react-router";
import PortalPublico from "./Layouts/PortalPublico";
import Home from "./Routes/Portal/Home";
import Lumina from "./Routes/Portal/Lumina";
import Login from "./Routes/Dashboard/Login";
import DashboardLayout from "./Layouts/Dashboard";
import DashboardHome from "./Routes/Dashboard/Home";
import DashboardAgenda from "./Routes/Dashboard/Agenda";
import DashboardConfiguracoes from "./Routes/Dashboard/Configuracoes";
import DashboardFinanceiro from "./Routes/Dashboard/Financeiro";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PortalPublico />}>
          <Route index element={<Home />} />
          <Route path="lumina" element={<Lumina />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="Geral" element={<DashboardHome />} />
          <Route path="agenda" element={<DashboardAgenda />} />
          <Route path="financeiro" element={<DashboardFinanceiro />} />
          <Route path="configuracoes" element={<DashboardConfiguracoes />} />
          <Route path="projetos" element={<Navigate to="/dashboard/configuracoes?tab=projetos" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;