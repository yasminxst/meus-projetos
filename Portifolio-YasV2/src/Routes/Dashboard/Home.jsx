import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../services/api";

// Ícones SVG padronizados na identidade visual Lumina
const statIcons = {
  patients: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3.5 19c.6-3.2 2.4-5 5.5-5s4.9 1.8 5.5 5M14 14.8c2.9-.7 5.3.8 6 3.7" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="15" rx="2" />
      <path d="M8 3.5v4M16 3.5v4M4 10h16M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" />
    </svg>
  ),
  care: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20s-7-4.4-7-10.2A4 4 0 0 1 12 7a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20Z" />
      <path d="M12 10v5M9.5 12.5h5" />
    </svg>
  ),
  annual: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
};

function DashboardHome() {
  const [cards, setCards] = useState([
    { id: "pacientes_ativos", label: "Pacientes ativos", value: "0", icon: "patients", tone: "rose", change: "Cadastrados no sistema" },
    { id: "consultas_hoje", label: "Consultas hoje", value: "0", icon: "calendar", tone: "gold", change: "Agendadas para hoje" },
    { id: "agendamentos_mes", label: "Agendamentos no mês", value: "0", icon: "care", tone: "green", change: "Marcados este mês" },
    { id: "atendimentos_ano", label: "Atendimentos no ano", value: "0", icon: "annual", tone: "gold", change: "Realizados no ano" },
  ]);

  const [updates, setUpdates] = useState({
    proximos_atendimentos: [],
    eventos_recentes: [],
    alteracoes_recentes: [],
  });

  const [proximaConsulta, setProximaConsulta] = useState(null);
  const [abaUpdates, setAbaUpdates] = useState("proximos");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const impersonate = api.getImpersonate();
  const userRaw = sessionStorage.getItem("lumina-user");
  const userObj = userRaw ? JSON.parse(userRaw) : null;
  const userName = impersonate ? impersonate.name.split(" ")[0] : userObj ? userObj.name.split(" ")[0] : "Yasmin";

  useEffect(() => {
    let isMounted = true;

    async function carregarDashboard() {
      setCarregando(true);
      setErro(null);

      try {
        const [dashData, alertasData] = await Promise.all([
          api.getDashboard(),
          api.getAlertas().catch(() => null),
        ]);

        if (!isMounted) return;

        if (dashData.cards) {
          setCards(dashData.cards);
        }

        const upData = dashData.updates || dashData.ultimas_atualizacoes || {};
        setUpdates({
          proximos_atendimentos: upData.proximos_atendimentos || [],
          eventos_recentes: upData.eventos_recentes || [],
          alteracoes_recentes: upData.alteracoes_recentes || [],
        });

        if (alertasData && alertasData.proxima_consulta) {
          setProximaConsulta(alertasData.proxima_consulta);
        }
      } catch {
        if (isMounted) {
          setErro("Não foi possível carregar as informações do dashboard. Verifique se o servidor está ativo.");
        }
      } finally {
        if (isMounted) setCarregando(false);
      }
    }

    carregarDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const listaAtual =
    abaUpdates === "proximos"
      ? updates.proximos_atendimentos
      : abaUpdates === "recentes"
      ? updates.eventos_recentes
      : updates.alteracoes_recentes;

  return (
    <div className="dashboard-page">
      {/* Cabeçalho */}
      <div className="dashboard-page-heading">
        <div>
          <span className="dashboard-kicker">Ambiente Geral</span>
          <h1>Olá, {userName}<span>.</span></h1>
          <p>Acompanhe os indicadores e compromissos do seu consultório.</p>
        </div>
        <Link className="dashboard-primary-button" to="/dashboard/agenda">
          <i className="bi bi-calendar-plus" aria-hidden="true" /> Nova consulta
        </Link>
      </div>

      {/* Alerta de erro */}
      {erro && (
        <div className="alert alert-danger small py-2 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          {erro}
        </div>
      )}

      {/* ALERTA: PRÓXIMO COMPROMISSO IMEDIATO */}
      {proximaConsulta && (
        <div
          style={{
            background: "linear-gradient(135deg, #f7ede2 0%, #f5cac3 100%)",
            border: "1px solid #e0a96d",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "#e07a5f",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
              }}
            >
              <i className="bi bi-clock-history" />
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#b05d45" }}>
                Próximo compromisso de hoje
              </span>
              <strong style={{ display: "block", fontSize: "1rem", color: "#3d405b" }}>
                {proximaConsulta.nome} &bull; às {proximaConsulta.horario_inicio}
              </strong>
              <small style={{ color: "#555" }}>
                {proximaConsulta.categoria} {proximaConsulta.paciente?.telefone ? `(${proximaConsulta.paciente.telefone})` : ""}
              </small>
            </div>
          </div>
          <Link
            to="/dashboard/agenda"
            className="dashboard-secondary-button"
            style={{ fontSize: "0.82rem", padding: "6px 14px", textDecoration: "none" }}
          >
            Ver na agenda <i className="bi bi-arrow-right ms-1" />
          </Link>
        </div>
      )}

      {/* 1. SEÇÃO DE INDICADORES (4 INDICADORES SOLICITADOS) */}
      <div className="dashboard-stat-grid">
        {cards.map((card) => (
          <article className="dashboard-stat-card" key={card.id || card.label}>
            <div className={`dashboard-stat-icon ${card.tone || "rose"}`}>
              {statIcons[card.icon] || statIcons.care}
            </div>
            <div>
              <span>{card.label}</span>
              <strong>{carregando ? "..." : card.value}</strong>
              <small>{card.change}</small>
            </div>
          </article>
        ))}
      </div>

      {/* 2. SEÇÃO DE ÚLTIMAS ATUALIZAÇÕES */}
      <section className="dashboard-panel dashboard-activity-panel" style={{ padding: "24px" }}>
        <div className="dashboard-panel-heading" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span className="dashboard-kicker">Extensão da Agenda</span>
            <h2>Últimas atualizações</h2>
          </div>
          <Link to="/dashboard/agenda" className="dashboard-link">
            Ir para agenda completa <i className="bi bi-arrow-right ms-1" />
          </Link>
        </div>

        {/* Abas de Navegação das Atualizações */}
        <div className="dashboard-settings-tabs" role="tablist" style={{ margin: "16px 0 20px" }}>
          <button
            type="button"
            className={abaUpdates === "proximos" ? "is-selected" : ""}
            onClick={() => setAbaUpdates("proximos")}
          >
            <i className="bi bi-clock me-1" /> Próximos atendimentos ({updates.proximos_atendimentos.length})
          </button>
          <button
            type="button"
            className={abaUpdates === "recentes" ? "is-selected" : ""}
            onClick={() => setAbaUpdates("recentes")}
          >
            <i className="bi bi-calendar-plus me-1" /> Eventos adicionados ({updates.eventos_recentes.length})
          </button>
          <button
            type="button"
            className={abaUpdates === "alteracoes" ? "is-selected" : ""}
            onClick={() => setAbaUpdates("alteracoes")}
          >
            <i className="bi bi-arrow-repeat me-1" /> Alterações recentes ({updates.alteracoes_recentes.length})
          </button>
        </div>

        {/* Lista de Registros */}
        <div className="dashboard-activity-list">
          {listaAtual.length > 0 ? (
            listaAtual.map((item) => (
              <div className="dashboard-activity-item" key={item.id}>
                <span className={`dashboard-activity-dot ${item.tone || "rose"}`} />
                <div className="dashboard-activity-info">
                  <strong>{item.nome}</strong>
                  <p>
                    {item.categoria || item.tipo} &bull; {item.horario_inicio || item.horario}
                    {item.horario_fim ? ` às ${item.horario_fim}` : ""} &bull; {item.data}
                  </p>
                </div>
                <span className={`badge-status ${item.status || "agendado"}`}>
                  {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : "Agendado"}
                </span>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--dashboard-muted)" }}>
              <i className="bi bi-inbox" style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }} />
              <p>Nenhuma informação encontrada para esta categoria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default DashboardHome;
