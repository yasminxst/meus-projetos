import { NavLink, Outlet } from "react-router";
import "./dashboard.css";

const navigationItems = [
  { label: "Geral", path: "/dashboard/geral", icon: "bi-grid-1x2" },
  { label: "Agenda", path: "/dashboard/agenda", icon: "bi-calendar3" },
  { label: "Financeiro", path: "/dashboard/financeiro", icon: "bi-bar-chart-line" },
  { label: "Configurações", path: "/dashboard/configuracoes", icon: "bi-sliders" },
];

function DashboardLayout() {
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span className="dashboard-brand-mark">L</span>
          <div>
            <strong>Lumina</strong>
            <span>workspace</span>
          </div>
        </div>

        <nav className="dashboard-navigation" aria-label="Navegação principal">
          <span className="dashboard-navigation-label">Menu principal</span>
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `dashboard-nav-link${isActive ? " is-active" : ""}`
              }
            >
              <i className={`bi ${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="dashboard-sidebar-footer">
          <div className="dashboard-profile-mini">
            <span className="dashboard-avatar">Y</span>
            <div>
              <strong>Yasmin Teixeira</strong>
              <span>Administradora</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <span className="dashboard-eyebrow">Área administrativa</span>
            <p className="dashboard-breadcrumb">Lumina <span>/</span> Workspace</p>
          </div>
        </header>
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;