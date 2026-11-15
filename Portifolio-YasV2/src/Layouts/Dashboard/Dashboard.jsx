import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router";
import "./dashboard.css";

const navigationItems = [
  { label: "Geral", path: "/dashboard/geral", icon: "bi-grid-1x2" },
  { label: "Atividades", path: "/dashboard/atividades", icon: "bi-calendar3" },
  { label: "Financeiro", path: "/dashboard/financeiro", icon: "bi-bar-chart-line" },
  { label: "Configurações", path: "/dashboard/configuracoes", icon: "bi-sliders" },
];

function DashboardLayout() {
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span className="dashboard-brand-mark">L</span>
          <div>
            <strong>Lumina</strong>
            <span>workspace</span>
          </div>
          <button
            className={`dashboard-mobile-menu-button${menuMobileAberto ? " is-open" : ""}`}
            type="button"
            aria-label={menuMobileAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuMobileAberto}
            aria-controls="dashboard-navigation"
            onClick={() => setMenuMobileAberto((aberto) => !aberto)}
          >
            <i aria-hidden="true" />
          </button>
        </div>

        <nav
          className={`dashboard-navigation${menuMobileAberto ? " is-mobile-open" : ""}`}
          id="dashboard-navigation"
          aria-label="Navegação principal"
        >
          <span className="dashboard-navigation-label">Menu principal</span>
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMenuMobileAberto(false)}
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
          <Link
            className="dashboard-portfolio-link"
            to="/"
            aria-label="Voltar ao portfólio"
            title="Voltar ao portfólio"
          >
            <i className="bi bi-arrow-left" aria-hidden="true" />
            <span>Voltar ao portfólio</span>
          </Link>
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