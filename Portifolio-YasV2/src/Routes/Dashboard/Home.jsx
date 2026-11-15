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
    { id: "pacientes_ativos", label: "Pacientes ativos", value: "0", icon: "patients", tone: "rose", change: "Ativos no sistema" },
    { id: "consultas_hoje", label: "Consultas hoje", value: "0", icon: "calendar", tone: "gold", change: "Agendadas para hoje" },
    { id: "atendimentos_mes", label: "Atendimentos no mês", value: "0", icon: "care", tone: "green", change: "Realizados este mês" },
    { id: "atendimentos_ano", label: "Total no ano", value: "0", icon: "annual", tone: "gold", change: "Realizados no ano" },
  ]);

  const [updates, setUpdates] = useState({
    proximos_atendimentos: [],
    eventos_recentes: [],
    alteracoes_recentes: [],
  });

  const [abaUpdates, setAbaUpdates] = useState("proximos"); // 'proximos', 'recentes', 'alteracoes'
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Recupera o nome do profissional salvo na sessão
  const userRaw = sessionStorage.getItem("lumina-user");
  const userName = userRaw ? JSON.parse(userRaw).name?.split(" ")[0] || "Yasmin" : "Yasmin";

  /**
   * Carrega os dados consolidados do dashboard da API Laravel
   */
  useEffect(() => {
    let isMounted = true;

    async function carregarDashboard() {
      setCarregando(true);
      setErro(null);

      try {
        const data = await api.getDashboard();
        if (!isMounted) return;

        if (data.cards) {
          setCards(data.cards);
        }

        if (data.ultimas_atualizacoes) {
          setUpdates({
            proximos_atendimentos: data.ultimas_atualizacoes.proximos_atendimentos || [],
            eventos_recentes: data.ultimas_atualizacoes.eventos_recentes || [],
            alteracoes_recentes: data.ultimas_atualizacoes.alteracoes_recentes || [],
          });
        }
      } catch {
        if (isMounted) {
          setErro("Não foi possível carregar as informações do dashboard. Verifique a conexão com o servidor.");
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

  // Lista a ser exibida conforme a aba de atualizações ativa
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
          <h1>Bom dia, {userName}<span>.</span></h1>
          <p>Acompanhe a situação atualizada do seu consultório.</p>
        </div>
        <Link className="dashboard-primary-button" to="/dashboard/atividades">
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

      {/* 1. SEÇÃO DE INDICADORES (4 INDICADORES CONFORME DIRETRIZES) */}
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

      {/* 2. SEÇÃO DE ÚLTIMAS ATUALIZAÇÕES (EXTENSÃO DA AGENDA) */}
      <section className="dashboard-panel dashboard-activity-panel" style={{ padding: "24px" }}>
        <div className="dashboard-panel-heading" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span className="dashboard-kicker">Extensão da Agenda</span>
            <h2>Últimas atualizações</h2>
          </div>
          <Link to="/dashboard/atividades" className="dashboard-link">
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
            <i className="bi bi-pencil-square me-1" /> Alterações recentes ({updates.alteracoes_recentes.length})
          </button>
        </div>

        {/* Conteúdo da Lista */}
        {carregando ? (
          <div className="text-center py-4 text-muted small">
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
            Carregando atualizações...
          </div>
        ) : listaAtual.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-calendar-check fs-2 d-block mb-2 text-secondary" />
            <p className="mb-1 fw-medium">Nenhum registro encontrado nesta categoria.</p>
            <small className="text-secondary">Novos agendamentos e alterações aparecerão aqui automaticamente.</small>
          </div>
        ) : (
          <div className="dashboard-activity-list">
            {listaAtual.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.6)",
                  border: "1px solid var(--dashboard-line)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className={`dashboard-activity-dot ${item.tone || "rose"}`} />
                  <div>
                    <strong style={{ display: "block", color: "var(--dashboard-ink)", fontSize: "0.95rem" }}>
                      {item.nome}
                    </strong>
                    <span style={{ fontSize: "0.82rem", color: "var(--dashboard-muted)" }}>
                      {item.categoria || item.tipo || "Sessão"} &bull; {item.data}
                      {item.horario_inicio ? ` às ${item.horario_inicio}` : (item.horario ? ` às ${item.horario}` : "")}
                      {item.horario_fim ? ` - ${item.horario_fim}` : ""}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontWeight: 500,
                      background:
                        item.status === "realizado"
                          ? "rgba(128, 140, 109, 0.2)"
                          : item.status === "cancelado"
                          ? "rgba(217, 83, 79, 0.15)"
                          : "rgba(217, 177, 143, 0.25)",
                      color:
                        item.status === "realizado"
                          ? "var(--dashboard-accent)"
                          : item.status === "cancelado"
                          ? "#d9534f"
                          : "var(--dashboard-ink)",
                    }}
                  >
                    {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : "Agendado"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default DashboardHome;
