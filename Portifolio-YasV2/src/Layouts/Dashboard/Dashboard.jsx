import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { api } from "../../services/api";
import "./dashboard.css";

const baseNavigationItems = [
  { label: "Geral", path: "/dashboard/geral", icon: "bi-grid-1x2" },
  { label: "Agenda", path: "/dashboard/agenda", icon: "bi-calendar3" },
  { label: "Pacientes", path: "/dashboard/pacientes", icon: "bi-people" },
  { label: "Financeiro", path: "/dashboard/financeiro", icon: "bi-bar-chart-line" },
  { label: "Configurações", path: "/dashboard/configuracoes", icon: "bi-sliders" },
];

function tocarAlertaSuave() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Autoplay policy fallback
  }
}

function DashboardLayout() {
  const navigate = useNavigate();
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [impersonate, setImpersonate] = useState(api.getImpersonate());
  const [alertas, setAlertas] = useState({ total_hoje: 0, proxima_consulta: null, alertas: [] });
  const [dropdownAlertasAberto, setDropdownAlertasAberto] = useState(false);
  const [dropdownPerspectivaAberto, setDropdownPerspectivaAberto] = useState(false);
  const [psicologosLista, setPsicologosLista] = useState([]);

  // Dados do usuário logado
  const userRaw = sessionStorage.getItem("lumina-user");
  const user = userRaw ? JSON.parse(userRaw) : { name: "Yasmin Teixeira", role: "admin" };
  const isAdmin = user.role === "admin";

  const navigationItems = isAdmin
    ? [
        ...baseNavigationItems,
        { label: "Administração", path: "/dashboard/configuracoes?tab=admin", icon: "bi-shield-lock" },
      ]
    : baseNavigationItems;

  useEffect(() => {
    let isMounted = true;

    async function carregarAlertas() {
      try {
        const data = await api.getAlertas();
        if (isMounted && data) {
          setAlertas(data);

          // Verifica se a próxima consulta é nos próximos 15 minutos e emite aviso suave
          if (data.proxima_consulta && data.proxima_consulta.horario_inicio) {
            const agora = new Date();
            const [hora, min] = data.proxima_consulta.horario_inicio.split(":").map(Number);
            const agoraMin = agora.getHours() * 60 + agora.getMinutes();
            const consultaMin = hora * 60 + min;
            const diffMin = consultaMin - agoraMin;

            if (diffMin >= 0 && diffMin <= 15) {
              tocarAlertaSuave();
            }
          }
        }
      } catch (err) {
        console.warn("Falha ao buscar alertas:", err.message);
      }
    }

    async function carregarPsicologosParaPerspectiva() {
      if (isAdmin) {
        try {
          const resp = await api.getAdminPsicologos();
          if (isMounted && resp && resp.psicologos) {
            setPsicologosLista(resp.psicologos);
          }
        } catch (err) {
          console.warn("Falha ao listar psicólogos:", err.message);
        }
      }
    }

    carregarAlertas();
    carregarPsicologosParaPerspectiva();
    const interval = setInterval(carregarAlertas, 60000); // Polling a cada 60s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAdmin]);

  const handleSelecionarPerspectiva = (psico) => {
    if (!psico) {
      api.clearImpersonate();
      setImpersonate(null);
    } else {
      api.setImpersonate(psico.id, psico.name);
      setImpersonate({ id: psico.id, name: psico.name });
    }
    setDropdownPerspectivaAberto(false);
    window.location.reload();
  };

  const handleSairImpersonate = () => {
    api.clearImpersonate();
    setImpersonate(null);
    window.location.reload();
  };

  const handleLogout = async () => {
    await api.logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-shell">
      {/* BANNER DE PERSPECTIVA (IMPERSONATION) */}
      {impersonate && (
        <aside
          className="impersonate-banner"
          aria-label="Aviso de impersonação de perfil"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "#808C6D",
            color: "#fff",
            padding: "8px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.85rem",
            fontWeight: 500,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <i className="bi bi-eye-fill" style={{ fontSize: "1.1rem" }} />
            <span>
              Você está visualizando o sistema na perspectiva do profissional:{" "}
              <strong>{impersonate.name}</strong> (Modo Psicólogo)
            </span>
          </div>
          <button
            type="button"
            onClick={handleSairImpersonate}
            style={{
              background: "#fff",
              color: "#465335",
              border: "none",
              borderRadius: "4px",
              padding: "4px 12px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            Voltar à visão Administrador
          </button>
        </aside>
      )}

      <aside className="dashboard-sidebar" style={{ paddingTop: impersonate ? "52px" : "32px" }}>
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
            <span className="dashboard-avatar">
              {impersonate ? impersonate.name.charAt(0) : user.name ? user.name.charAt(0) : "Y"}
            </span>
            <div>
              <strong>{impersonate ? impersonate.name : user.name}</strong>
              <span>{impersonate ? "Psicólogo (Visão)" : user.role === "admin" ? "Administrador(a)" : "Psicólogo(a)"}</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="dashboard-main" style={{ paddingTop: impersonate ? "42px" : "0" }}>
        <header className="dashboard-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span className="dashboard-eyebrow">
              {user.role === "admin" ? "Área Administrativa" : "Consultório de Psicologia"}
            </span>
            <p className="dashboard-breadcrumb">Lumina <span>/</span> Workspace</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
            {/* SELETOR DE PERSPECTIVA DO ADMINISTRADOR (A4 & A5) */}
            {isAdmin && (
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setDropdownPerspectivaAberto(!dropdownPerspectivaAberto)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: impersonate ? "#808C6D" : "#f4f1de",
                    color: impersonate ? "#fff" : "#3d405b",
                    border: "1px solid var(--dashboard-line)",
                    borderRadius: "20px",
                    padding: "7px 16px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                  title="Clique para alternar entre visão de Administrador ou Psicólogo"
                >
                  <i className={impersonate ? "bi bi-eye-fill" : "bi bi-shield-check"} />
                  <span>
                    {impersonate ? `Visão: ${impersonate.name} (Psicólogo)` : "Visão: Administrador (Padrão)"}
                  </span>
                  <i className="bi bi-chevron-down" style={{ fontSize: "0.75rem", marginLeft: "2px" }} />
                </button>

                {dropdownPerspectivaAberto && (
                  <div
                    style={{
                      position: "absolute",
                      top: "44px",
                      right: 0,
                      width: "300px",
                      background: "#fff",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                      border: "1px solid var(--dashboard-line)",
                      zIndex: 1050,
                      padding: "8px 0",
                    }}
                  >
                    <div style={{ padding: "6px 14px", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700, color: "var(--dashboard-muted)" }}>
                      Modo de Visualização
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelecionarPerspectiva(null)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 14px",
                        background: !impersonate ? "var(--dashboard-background)" : "transparent",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "0.84rem",
                        color: "var(--dashboard-ink)",
                        cursor: "pointer",
                      }}
                    >
                      <span><i className="bi bi-shield-lock me-2 text-primary" /> Administrador (Padrão)</span>
                      {!impersonate && <i className="bi bi-check2 text-success fw-bold" />}
                    </button>

                    <div style={{ borderTop: "1px solid var(--dashboard-line)", margin: "4px 0" }} />
                    <div style={{ padding: "6px 14px", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700, color: "var(--dashboard-muted)" }}>
                      Ver como Psicólogo:
                    </div>

                    {psicologosLista.length > 0 ? (
                      psicologosLista.map((p) => {
                        const isAtivo = impersonate && String(impersonate.id) === String(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelecionarPerspectiva(p)}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "9px 14px",
                              background: isAtivo ? "var(--dashboard-background)" : "transparent",
                              border: "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              fontSize: "0.84rem",
                              color: "var(--dashboard-ink)",
                              cursor: "pointer",
                            }}
                          >
                            <span><i className="bi bi-person me-2" /> {p.name}</span>
                            {isAtivo && <i className="bi bi-check2 text-success fw-bold" />}
                          </button>
                        );
                      })
                    ) : (
                      <span style={{ display: "block", padding: "8px 14px", fontSize: "0.8rem", color: "var(--dashboard-muted)" }}>
                        Nenhum psicólogo adicional cadastrado.
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SINO DE NOTIFICAÇÕES */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setDropdownAlertasAberto(!dropdownAlertasAberto)}
                style={{
                  position: "relative",
                  background: "#fff",
                  border: "1px solid var(--dashboard-line)",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--dashboard-ink)",
                }}
                aria-label="Notificações de compromissos"
                title="Notificações de compromissos"
              >
                <i className="bi bi-bell" style={{ fontSize: "1.1rem" }} />
                {alertas.total_hoje > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-4px",
                      background: "#e07a5f",
                      color: "#fff",
                      borderRadius: "50%",
                      width: "18px",
                      height: "18px",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {alertas.total_hoje}
                  </span>
                )}
              </button>

              {/* DROPDOWN DE NOTIFICAÇÕES */}
              {dropdownAlertasAberto && (
                <div
                  style={{
                    position: "absolute",
                    top: "48px",
                    right: 0,
                    width: "320px",
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                    border: "1px solid var(--dashboard-line)",
                    zIndex: 1000,
                    padding: "16px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <strong style={{ fontSize: "0.9rem", color: "var(--dashboard-ink)" }}>
                      Compromissos de Hoje
                    </strong>
                    <span style={{ fontSize: "0.75rem", color: "var(--dashboard-muted)" }}>
                      {alertas.total_hoje} agendados
                    </span>
                  </div>

                  {alertas.alertas.length > 0 ? (
                    <div style={{ display: "grid", gap: "8px", maxHeight: "260px", overflowY: "auto" }}>
                      {alertas.alertas.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            padding: "8px 10px",
                            borderRadius: "8px",
                            background: "var(--dashboard-background)",
                            borderLeft: `4px solid ${item.tone === "rose" ? "#d98a8a" : item.tone === "green" ? "#808c6d" : "#e0a96d"}`,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <strong style={{ fontSize: "0.85rem", color: "var(--dashboard-ink)" }}>
                              {item.nome}
                            </strong>
                            <small style={{ fontWeight: 600, color: "var(--dashboard-accent)" }}>
                              {item.horario_inicio}
                            </small>
                          </div>
                          <small style={{ color: "var(--dashboard-muted)", display: "block" }}>
                            {item.categoria}
                          </small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: "0.82rem", color: "var(--dashboard-muted)", textAlign: "center", margin: "16px 0" }}>
                      Nenhum compromisso pendente para hoje.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* BOTÃO DE LOGOUT */}
            <button
              type="button"
              onClick={handleLogout}
              style={{
                background: "transparent",
                border: "1px solid var(--dashboard-line)",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "0.82rem",
                color: "var(--dashboard-ink)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              title="Encerrar sessão"
            >
              <i className="bi bi-box-arrow-right" />
              <span>Sair</span>
            </button>
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