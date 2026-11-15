import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useToast } from "../../contexts/useToast";
import "./agenda.css";

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const categoriasPadrao = [
  { nome: "Sessão de terapia", tone: "rose", descricao: "Atendimento psicoterápico" },
  { nome: "Primeira consulta", tone: "green", descricao: "Acolhimento inicial" },
  { nome: "Avaliação psicológica", tone: "gold", descricao: "Avaliação diagnóstica" },
  { nome: "Retorno / Acompanhamento", tone: "blue", descricao: "Reavaliação" },
];

function formatDateKey(date) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function Agenda() {
  const toast = useToast();
  const hoje = new Date();

  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState(hoje);
  const [refreshKey, setRefreshKey] = useState(0);

  const [eventosCalendario, setEventosCalendario] = useState({});
  const [agendaDia, setAgendaDia] = useState({
    data: formatDateKey(hoje),
    dataFormatada: "",
    totalAgendados: 0,
    compromissos: [],
    destaques: [],
  });

  const [categorias, setCategorias] = useState(categoriasPadrao);
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoEdicao, setEventoEdicao] = useState(null);

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    data: formatDateKey(hoje),
    horario_inicio: "09:00",
    horario_fim: "09:50",
    categoria: "Sessão de terapia",
    tone: "rose",
    status: "agendado",
  });

  /**
   * 1. Consulta geral da agenda (calendário mensal)
   */
  useEffect(() => {
    let ativo = true;

    async function carregarAgendaGeral() {
      try {
        const resp = await api.getAgenda({ ano: anoAtual, mes: mesAtual, zero_indexed: 1 });
        if (!ativo) return;
        if (resp && resp.calendario) {
          setEventosCalendario(resp.calendario);
        }
        if (resp && resp.categorias && resp.categorias.length > 0) {
          setCategorias(resp.categorias);
        }
      } catch {
        // silencioso
      }
    }

    carregarAgendaGeral();

    return () => {
      ativo = false;
    };
  }, [anoAtual, mesAtual, refreshKey]);

  /**
   * 2. Consulta da agenda diária para a data selecionada
   */
  useEffect(() => {
    let ativo = true;

    async function carregarAgendaDia() {
      const dataKey = formatDateKey(diaSelecionado);
      try {
        const resp = await api.getAgendaDia(dataKey);
        if (!ativo) return;
        if (resp) {
          setAgendaDia({
            data: resp.data,
            dataFormatada:
              resp.dataFormatada ||
              diaSelecionado.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            totalAgendados: resp.totalAgendados || 0,
            compromissos: resp.compromissos || [],
            destaques: resp.destaques || [],
          });
        }
      } catch {
        // silencioso
      }
    }

    carregarAgendaDia();

    return () => {
      ativo = false;
    };
  }, [diaSelecionado, refreshKey]);

  // Navegação do calendário mensal
  const primeiroDia = new Date(anoAtual, mesAtual, 1);
  const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);

  const diasDoMes = [];
  for (let i = 0; i < primeiroDia.getDay(); i++) {
    diasDoMes.push(null);
  }
  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    diasDoMes.push(new Date(anoAtual, mesAtual, dia));
  }

  const selecionarMesAnterior = () => {
    if (mesAtual === 0) {
      setMesAtual(11);
      setAnoAtual((ano) => ano - 1);
    } else {
      setMesAtual((mes) => mes - 1);
    }
  };

  const selecionarProximoMes = () => {
    if (mesAtual === 11) {
      setMesAtual(0);
      setAnoAtual((ano) => ano + 1);
    } else {
      setMesAtual((mes) => mes + 1);
    }
  };

  const selecionarHoje = () => {
    const agora = new Date();
    setMesAtual(agora.getMonth());
    setAnoAtual(agora.getFullYear());
    setDiaSelecionado(agora);
  };

  /**
   * Abre o modal para cadastro de novo evento
   */
  const abrirModalCriar = () => {
    setEventoEdicao(null);
    setFormData({
      nome: "",
      descricao: "",
      data: formatDateKey(diaSelecionado),
      horario_inicio: "09:00",
      horario_fim: "09:50",
      categoria: "Sessão de terapia",
      tone: "rose",
      status: "agendado",
    });
    setModalAberto(true);
  };

  /**
   * Abre o modal para edição de evento existente
   */
  const abrirModalEditar = (evento) => {
    setEventoEdicao(evento);
    setFormData({
      nome: evento.nome || "",
      descricao: evento.descricao || "",
      data: evento.data ? (typeof evento.data === "string" ? evento.data.slice(0, 10) : formatDateKey(new Date(evento.data))) : formatDateKey(diaSelecionado),
      horario_inicio: evento.horario_inicio || evento.horario || "09:00",
      horario_fim: evento.horario_fim || "",
      categoria: evento.categoria || evento.tipo || "Sessão de terapia",
      tone: evento.tone || "rose",
      status: evento.status || "agendado",
    });
    setModalAberto(true);
  };

  /**
   * Submete criação ou edição de evento com Toast de confirmação
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validação de campos obrigatórios
    if (!formData.nome.trim() || !formData.data || !formData.horario_inicio) {
      toast.required("Preencha todos os campos obrigatórios.");
      return;
    }

    toast.saving();

    // Sincroniza cor vinculada à categoria
    const catObj = categorias.find((c) => c.nome === formData.categoria);
    const dadosEnvio = {
      ...formData,
      tone: catObj ? catObj.tone : formData.tone,
    };

    try {
      if (eventoEdicao) {
        await api.updateEvento(eventoEdicao.id, dadosEnvio);
      } else {
        await api.createEvento(dadosEnvio);
      }

      toast.success("Alterações salvas com sucesso!");
      setModalAberto(false);

      // Atualiza ambas as visualizações (mensal e diária) a partir da mesma fonte
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Não foi possível salvar as alterações. Tente novamente.");
    }
  };

  /**
   * Exclui um evento com Toast de confirmação
   */
  const handleExcluir = async (id) => {
    if (!window.confirm("Deseja realmente remover este compromisso da agenda?")) {
      return;
    }

    toast.saving();

    try {
      await api.deleteEvento(id);
      toast.success("Alterações salvas com sucesso!");

      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Não foi possível salvar as alterações. Tente novamente.");
    }
  };

  /**
   * Altera rapidamente o status do atendimento ('agendado', 'realizado', 'cancelado')
   */
  const handleAlterarStatus = async (evento, novoStatus) => {
    toast.saving();

    try {
      await api.updateEvento(evento.id, { status: novoStatus });
      toast.success("Alterações salvas com sucesso!");

      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Não foi possível salvar as alterações. Tente novamente.");
    }
  };

  return (
    <div className="agenda-page">
      {/* CABEÇALHO */}
      <div className="agenda-page-heading">
        <div>
          <span className="dashboard-kicker">Atividades</span>
          <h1>Minha agenda<span>.</span></h1>
          <p>Gerencie seus atendimentos diários e organize seus compromissos profissionais.</p>
        </div>

        <button
          className="dashboard-primary-button"
          type="button"
          onClick={abrirModalCriar}
        >
          <i className="bi bi-plus-lg" aria-hidden="true" />
          Novo evento
        </button>
      </div>

      <div className="agenda-layout">
        {/* ========================================== */}
        {/* A. VISUALIZAÇÃO: AGENDA GERAL (MENSAL) */}
        {/* ========================================== */}
        <section className="dashboard-panel agenda-calendar-panel">
          <div className="agenda-calendar-header">
            <div>
              <span className="dashboard-kicker">Visão Geral</span>
              <h2>
                {meses[mesAtual]} de {anoAtual}
              </h2>
            </div>

            <div className="agenda-calendar-actions">
              <button
                className="dashboard-secondary-button"
                type="button"
                onClick={selecionarHoje}
              >
                Hoje
              </button>

              <button
                className="dashboard-nav-button"
                type="button"
                onClick={selecionarMesAnterior}
                aria-label="Mês anterior"
              >
                <i className="bi bi-chevron-left" />
              </button>

              <button
                className="dashboard-nav-button"
                type="button"
                onClick={selecionarProximoMes}
                aria-label="Próximo mês"
              >
                <i className="bi bi-chevron-right" />
              </button>
            </div>
          </div>

          <div className="agenda-calendar">
            <div className="agenda-weekdays">
              {diasSemana.map((dia) => (
                <span key={dia}>{dia}</span>
              ))}
            </div>

            <div className="agenda-days">
              {diasDoMes.map((dia, index) => {
                if (!dia) {
                  return <div className="agenda-day empty" key={`empty-${index}`} />;
                }

                const dataKey = formatDateKey(dia);
                const selecionado = formatDateKey(diaSelecionado) === dataKey;
                const isHoje = formatDateKey(hoje) === dataKey;
                const eventosDia = eventosCalendario[dataKey] || [];
                const possuiEventos = eventosDia.length > 0;

                return (
                  <button
                    type="button"
                    key={dataKey}
                    className={`agenda-day ${selecionado ? "selected" : ""} ${isHoje ? "today" : ""}`}
                    onClick={() => setDiaSelecionado(dia)}
                  >
                    <span className="agenda-day-number">{dia.getDate()}</span>

                    {possuiEventos && (
                      <span className="agenda-event-dots">
                        {eventosDia.slice(0, 3).map((evento, idx) => (
                          <span
                            key={idx}
                            className={`agenda-event-dot ${evento.tone || "rose"}`}
                            title={`${evento.nome} (${evento.categoria || evento.tipo})`}
                          />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* LEGENDA DE CORES PARA DIFERENCIAR CATEGORIAS */}
          <div className="agenda-legend" aria-label="Legenda de categorias">
            <span className="fw-semibold text-dark me-1">Legenda:</span>
            {categorias.map((cat) => (
              <span className="agenda-legend-item" key={cat.nome}>
                <span className={`agenda-legend-dot ${cat.tone}`} />
                {cat.nome}
              </span>
            ))}
          </div>
        </section>

        {/* ========================================== */}
        {/* B. VISUALIZAÇÃO: AGENDA DIÁRIA */}
        {/* ========================================== */}
        <aside className="dashboard-panel agenda-patients-panel">
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-kicker">
                {diaSelecionado.toLocaleDateString("pt-BR", { weekday: "long" })}
              </span>
              <h2>
                {diaSelecionado.getDate()} de {meses[diaSelecionado.getMonth()].toLowerCase()}
              </h2>
            </div>

            <button
              className="dashboard-more-button"
              type="button"
              onClick={abrirModalCriar}
              aria-label="Adicionar evento"
              title="Adicionar evento"
            >
              <i className="bi bi-plus-lg" />
            </button>
          </div>

          {/* Quantidade de atendimentos agendados */}
          <div className="agenda-patients-count">
            <strong>{agendaDia.totalAgendados}</strong>
            <span>
              {agendaDia.totalAgendados === 1 ? "atendimento agendado" : "atendimentos agendados"}
            </span>
          </div>

          {/* Destaque para os três atendimentos mais próximos ou recentes */}
          {agendaDia.destaques.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <span
                style={{
                  display: "block",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--agenda-muted)",
                  marginBottom: "8px",
                }}
              >
                Próximos atendimentos (Destaques)
              </span>
              <div style={{ display: "grid", gap: "8px" }}>
                {agendaDia.destaques.map((item) => (
                  <div
                    key={`destaque-${item.id}`}
                    style={{
                      padding: "9px 12px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.7)",
                      border: "1px solid var(--agenda-line)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "0.88rem", display: "block", color: "var(--agenda-ink)" }}>
                        {item.nome}
                      </strong>
                      <small style={{ color: "var(--agenda-muted)" }}>
                        {item.categoria || item.tipo} &bull; {item.horario_inicio || item.horario}
                        {item.horario_fim ? ` - ${item.horario_fim}` : ""}
                      </small>
                    </div>
                    <span className="agenda-destaque-badge">Destaque</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista completa de compromissos do dia */}
          <div className="agenda-patient-list">
            {agendaDia.compromissos.length > 0 ? (
              agendaDia.compromissos.map((item) => (
                <div className="agenda-patient" key={item.id}>
                  <div className={`agenda-patient-icon ${item.tone || "rose"}`}>
                    <i className="bi bi-person" />
                  </div>

                  <div className="agenda-patient-info" style={{ flex: 1 }}>
                    <strong>{item.nome}</strong>
                    <span>
                      {item.categoria || item.tipo}
                      {item.descricao ? ` • ${item.descricao}` : ""}
                    </span>

                    {/* Controle de Status */}
                    <div style={{ marginTop: "4px", display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => handleAlterarStatus(item, "realizado")}
                        className="btn btn-sm py-0 px-1"
                        style={{
                          fontSize: "0.7rem",
                          borderRadius: "4px",
                          background: item.status === "realizado" ? "var(--dashboard-accent)" : "#eee",
                          color: item.status === "realizado" ? "#fff" : "#666",
                        }}
                      >
                        Realizado
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAlterarStatus(item, "cancelado")}
                        className="btn btn-sm py-0 px-1"
                        style={{
                          fontSize: "0.7rem",
                          borderRadius: "4px",
                          background: item.status === "cancelado" ? "#d9534f" : "#eee",
                          color: item.status === "cancelado" ? "#fff" : "#666",
                        }}
                      >
                        Cancelado
                      </button>
                    </div>
                  </div>

                  <div className="agenda-patient-time" style={{ textAlign: "right" }}>
                    <div>
                      {item.horario_inicio || item.horario}
                      {item.horario_fim ? ` - ${item.horario_fim}` : ""}
                    </div>
                    <div style={{ marginTop: "6px", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => abrirModalEditar(item)}
                        style={{ background: "none", border: "none", color: "var(--agenda-muted)", cursor: "pointer" }}
                        title="Editar evento"
                      >
                        <i className="bi bi-pencil" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExcluir(item.id)}
                        style={{ background: "none", border: "none", color: "#d9534f", cursor: "pointer" }}
                        title="Excluir evento"
                      >
                        <i className="bi bi-trash3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="agenda-empty">
                <div>
                  <i className="bi bi-calendar2-check" />
                </div>
                <strong>Nenhum atendimento</strong>
                <span>Não há compromissos agendados para este dia.</span>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ========================================== */}
      {/* C. MODAL: ADICIONAR E EDITAR EVENTO */}
      {/* ========================================== */}
      {modalAberto && (
        <div
          className="agenda-modal-backdrop"
          role="presentation"
          onClick={() => setModalAberto(false)}
        >
          <div
            className="agenda-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="agenda-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="agenda-modal-header">
              <div>
                <span className="dashboard-kicker">
                  {eventoEdicao ? "Atualizar compromisso" : "Novo compromisso"}
                </span>
                <h2 id="agenda-modal-title">
                  {eventoEdicao ? "Editar evento" : "Adicionar evento"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setModalAberto(false)}
                aria-label="Fechar"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Nome do evento */}
              <label>
                <span>Nome do evento / Paciente *</span>
                <input
                  type="text"
                  required
                  placeholder="Ex.: Sessão de Psicoterapia com Beatriz"
                  value={formData.nome}
                  onChange={(event) =>
                    setFormData({ ...formData, nome: event.target.value })
                  }
                />
              </label>

              {/* Descrição opcional */}
              <label>
                <span>Descrição opcional</span>
                <textarea
                  rows="2"
                  placeholder="Ex.: Acompanhamento semanal, focar em técnicas de respiração."
                  value={formData.descricao}
                  onChange={(event) =>
                    setFormData({ ...formData, descricao: event.target.value })
                  }
                />
              </label>

              <div className="agenda-form-grid">
                {/* Data */}
                <label>
                  <span>Data *</span>
                  <input
                    type="date"
                    required
                    value={formData.data}
                    onChange={(event) =>
                      setFormData({ ...formData, data: event.target.value })
                    }
                  />
                </label>

                {/* Categoria vinculada à legenda */}
                <label>
                  <span>Categoria *</span>
                  <select
                    value={formData.categoria}
                    onChange={(event) => {
                      const novaCat = event.target.value;
                      const catObj = categorias.find((c) => c.nome === novaCat);
                      setFormData({
                        ...formData,
                        categoria: novaCat,
                        tone: catObj ? catObj.tone : formData.tone,
                      });
                    }}
                  >
                    {categorias.map((cat) => (
                      <option key={cat.nome} value={cat.nome}>
                        {cat.nome}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="agenda-form-grid">
                {/* Horário inicial */}
                <label>
                  <span>Horário inicial *</span>
                  <input
                    type="time"
                    required
                    value={formData.horario_inicio}
                    onChange={(event) =>
                      setFormData({ ...formData, horario_inicio: event.target.value })
                    }
                  />
                </label>

                {/* Horário final */}
                <label>
                  <span>Horário final</span>
                  <input
                    type="time"
                    value={formData.horario_fim}
                    onChange={(event) =>
                      setFormData({ ...formData, horario_fim: event.target.value })
                    }
                  />
                </label>
              </div>

              {/* Status */}
              <label>
                <span>Status do atendimento</span>
                <select
                  value={formData.status}
                  onChange={(event) =>
                    setFormData({ ...formData, status: event.target.value })
                  }
                >
                  <option value="agendado">Agendado</option>
                  <option value="realizado">Realizado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </label>

              {/* Identificação visual vinculada à legenda */}
              <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="small text-muted">Cor da legenda:</span>
                <span className={`agenda-legend-dot ${formData.tone}`} />
                <span className="small fw-medium text-capitalize">{formData.tone}</span>
              </div>

              <div className="agenda-modal-actions">
                <button
                  type="button"
                  className="dashboard-secondary-button"
                  onClick={() => setModalAberto(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="dashboard-primary-button">
                  {eventoEdicao ? "Salvar alterações" : "Adicionar evento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Agenda;