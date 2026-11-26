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

  // Modo de visualização: 'mes' ou 'semana'
  const [modoVisao, setModoVisao] = useState("mes");

  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState(hoje);
  const [refreshKey, setRefreshKey] = useState(0);

  // Dados mensais
  const [eventosCalendario, setEventosCalendario] = useState({});
  const [agendaDia, setAgendaDia] = useState({
    data: formatDateKey(hoje),
    dataFormatada: "",
    totalAgendados: 0,
    compromissos: [],
    destaques: [],
  });

  // Dados semanais
  const [dadosSemana, setDadosSemana] = useState({
    inicio_semana: "",
    fim_semana: "",
    dias: [],
    total_semana: 0,
  });

  // Lista de pacientes cadastrados para seleção rápida
  const [pacientesCadastrados, setPacientesCadastrados] = useState([]);
  const [categorias] = useState(categoriasPadrao);

  // Modais
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoEdicao, setEventoEdicao] = useState(null);
  const [popupDetalhes, setPopupDetalhes] = useState(null);

  // Modal de Evolução Clínica / Prontuário direto da consulta
  const [modalProntuarioAberto, setModalProntuarioAberto] = useState(false);
  const [formProntuario, setFormProntuario] = useState({
    titulo: "",
    evolucao: "",
    metas_terapeuticas: "",
    observacoes: "",
  });

  // Modal de Recibo Clínico
  const [dadosRecibo, setDadosRecibo] = useState(null);

  // Confirmação de Escopo para Séries Recorrentes
  const [confirmacaoEscopo, setConfirmacaoEscopo] = useState(null);

  // Estado do Formulário de Agendamento
  const [tipoAgendamento, setTipoAgendamento] = useState("avulso"); // 'avulso' ou 'recorrente'
  const [modoRecorrencia, setModoRecorrencia] = useState("sessoes"); // 'sessoes' ou 'periodo'
  const [quantidadeSessoes, setQuantidadeSessoes] = useState(4);
  const [periodoMeses, setPeriodoMeses] = useState(1);
  const [tipoFrequencia, setTipoFrequencia] = useState("semanal"); // 'semanal' ou 'quinzenal'
  const [simulacaoRecorrencia, setSimulacaoRecorrencia] = useState(null);
  const [simulando, setSimulando] = useState(false);

  const [formData, setFormData] = useState({
    paciente_id: "",
    nome: "",
    descricao: "",
    data: formatDateKey(hoje),
    horario_inicio: "09:00",
    horario_fim: "09:50",
    categoria: "Sessão de terapia",
    tone: "rose",
    status: "agendado",
    status_pagamento: "pendente",
    valor_sessao: 180,
    observacoes: "",
    gerar_receita: true,
    valor_receita: 180,
  });

  // Carrega pacientes cadastrados
  useEffect(() => {
    async function carregarPacientes() {
      try {
        const data = await api.getPacientes();
        if (Array.isArray(data)) {
          setPacientesCadastrados(data);
        }
      } catch (err) {
        console.warn("Falha ao buscar pacientes:", err.message);
      }
    }
    carregarPacientes();
  }, [refreshKey]);

  // Carrega dados da visualização mensal
  useEffect(() => {
    let isMounted = true;
    async function carregarAgendaMensal() {
      try {
        const data = await api.getAgenda(mesAtual + 1, anoAtual);
        if (!isMounted) return;
        if (data.calendario) {
          setEventosCalendario(data.calendario);
        }
      } catch (err) {
        console.error("Falha ao carregar agenda:", err);
      }
    }
    carregarAgendaMensal();
    return () => { isMounted = false; };
  }, [mesAtual, anoAtual, refreshKey]);

  // Carrega dados da visualização semanal
  useEffect(() => {
    let isMounted = true;
    async function carregarAgendaSemanal() {
      try {
        const data = await api.getAgendaSemanal(formatDateKey(diaSelecionado));
        if (!isMounted) return;
        setDadosSemana(data);
      } catch (err) {
        console.error("Falha ao carregar semana:", err);
      }
    }
    if (modoVisao === "semana") {
      carregarAgendaSemanal();
    }
    return () => { isMounted = false; };
  }, [diaSelecionado, modoVisao, refreshKey]);

  // Carrega dados do dia selecionado
  useEffect(() => {
    let isMounted = true;
    async function carregarAgendaDia() {
      try {
        const dataKey = formatDateKey(diaSelecionado);
        const data = await api.getAgendaDia(dataKey);
        if (!isMounted) return;
        setAgendaDia({
          data: data.data || dataKey,
          dataFormatada: data.dataFormatada || "",
          totalAgendados: data.totalAgendados || 0,
          compromissos: data.compromissos || [],
          destaques: data.destaques || [],
        });
      } catch (err) {
        console.error("Falha ao carregar compromissos do dia:", err);
      }
    }
    carregarAgendaDia();
    return () => { isMounted = false; };
  }, [diaSelecionado, refreshKey]);

  // Monta os dias da grade mensal
  const primeiroDiaMes = new Date(anoAtual, mesAtual, 1).getDay();
  const totalDiasMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const diasDoMes = [];
  for (let i = 0; i < primeiroDiaMes; i++) diasDoMes.push(null);
  for (let dia = 1; dia <= totalDiasMes; dia++) {
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

  const abrirModalCriar = () => {
    setEventoEdicao(null);
    setTipoAgendamento("avulso");
    setSimulacaoRecorrencia(null);
    setFormData({
      paciente_id: "",
      nome: "",
      descricao: "",
      data: formatDateKey(diaSelecionado),
      horario_inicio: "09:00",
      horario_fim: "09:50",
      categoria: "Sessão de terapia",
      tone: "rose",
      status: "agendado",
      status_pagamento: "pendente",
      valor_sessao: 180,
      observacoes: "",
      gerar_receita: true,
      valor_receita: 180,
    });
    setModalAberto(true);
  };

  const abrirModalEditar = (evento) => {
    setPopupDetalhes(null);
    setEventoEdicao(evento);
    setTipoAgendamento("avulso");
    setSimulacaoRecorrencia(null);
    setFormData({
      paciente_id: evento.paciente_id || "",
      nome: evento.nome || "",
      descricao: evento.descricao || "",
      data: evento.data ? (typeof evento.data === "string" ? evento.data.slice(0, 10) : formatDateKey(new Date(evento.data))) : formatDateKey(diaSelecionado),
      horario_inicio: evento.horario_inicio || evento.horario || "09:00",
      horario_fim: evento.horario_fim || "",
      categoria: evento.categoria || evento.tipo || "Sessão de terapia",
      tone: evento.tone || "rose",
      status: evento.status || "agendado",
      status_pagamento: evento.status_pagamento || "pendente",
      valor_sessao: evento.valor_sessao || 180,
      observacoes: evento.observacoes || "",
      gerar_receita: false,
      valor_receita: evento.valor_sessao || 180,
    });
    setModalAberto(true);
  };

  const handleSelecionarPacienteForm = (e) => {
    const pId = e.target.value;
    if (!pId) {
      setFormData((prev) => ({ ...prev, paciente_id: "", nome: "" }));
      return;
    }
    const pac = pacientesCadastrados.find((p) => String(p.id) === String(pId));
    if (pac) {
      setFormData((prev) => ({
        ...prev,
        paciente_id: pac.id,
        nome: `${pac.nome} ${pac.sobrenome || ""}`.trim(),
      }));
    }
  };

  // Simular e verificar conflitos da série recorrente
  const handleSimularRecorrencia = async () => {
    if (!formData.data || !formData.horario_inicio) {
      toast.required("Informe a data inicial e o horário da sessão.");
      return;
    }

    setSimulando(true);
    try {
      const resp = await api.createEventoRecorrente({
        nome: formData.nome || "Consulta",
        data_inicio: formData.data,
        horario_inicio: formData.horario_inicio,
        modo: modoRecorrencia,
        quantidade_sessoes: quantidadeSessoes,
        periodo_meses: periodoMeses,
        recorrencia_tipo: tipoFrequencia,
        simulacao: true,
      });

      if (resp && resp.datas) {
        setSimulacaoRecorrencia(resp);
        if (resp.total_conflitos > 0) {
          toast.error(`Atenção: ${resp.total_conflitos} data(s) possuem conflitos de horário com outros compromissos.`);
        } else {
          toast.success(`Todas as ${resp.total_sessoes} sessões estão livres para agendamento!`);
        }
      }
    } catch {
      toast.error("Falha ao simular as datas da série.");
    } finally {
      setSimulando(false);
    }
  };

  // Salvar agendamento (avulso ou recorrente)
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.nome.trim() || !formData.data || !formData.horario_inicio) {
      toast.required("Preencha todos os campos obrigatórios.");
      return;
    }

    toast.saving();
    const catObj = categorias.find((c) => c.nome === formData.categoria);
    const dadosEnvio = {
      ...formData,
      tone: catObj ? catObj.tone : formData.tone,
    };

    try {
      if (eventoEdicao) {
        // Se for edição e o evento fizer parte de uma série recorrente
        if (eventoEdicao.recorrencia_grupo_id) {
          setConfirmacaoEscopo({
            tipo: "edicao",
            evento: eventoEdicao,
            dados: dadosEnvio,
          });
          setModalAberto(false);
          return;
        }

        await api.updateEvento(eventoEdicao.id, dadosEnvio);
        toast.success("Consulta atualizada com sucesso!");
      } else if (tipoAgendamento === "recorrente") {
        // Criação de série recorrente
        await api.createEventoRecorrente({
          ...dadosEnvio,
          data_inicio: formData.data,
          modo: modoRecorrencia,
          quantidade_sessoes: quantidadeSessoes,
          periodo_meses: periodoMeses,
          recorrencia_tipo: tipoFrequencia,
          valor_sessao: formData.valor_sessao,
          status_pagamento: formData.status_pagamento,
          ignorar_conflitos: true,
        });
        toast.success("Série recorrente criada com sucesso mantendo o padrão semanal de atendimento!");
      } else {
        await api.createEvento(dadosEnvio);
        toast.success("Consulta agendada com sucesso!");
      }

      setModalAberto(false);
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Não foi possível salvar o agendamento. Tente novamente.");
    }
  };

  // Exclusão com suporte a escopo
  const handleConfirmarExclusao = async (evento) => {
    if (evento.recorrencia_grupo_id) {
      setConfirmacaoEscopo({
        tipo: "exclusao",
        evento: evento,
      });
      return;
    }

    if (!window.confirm("Deseja realmente remover esta consulta da agenda?")) return;
    toast.saving();
    try {
      await api.deleteEvento(evento.id, "individual");
      toast.success("Consulta excluída com sucesso!");
      setPopupDetalhes(null);
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Erro ao excluir consulta.");
    }
  };

  const executarAcaoEscopo = async (escopo) => {
    if (!confirmacaoEscopo) return;
    const { tipo, evento, dados } = confirmacaoEscopo;
    toast.saving();

    try {
      if (tipo === "exclusao") {
        await api.deleteEvento(evento.id, escopo);
        toast.success(escopo === "futuras" ? "Esta e todas as consultas futuras da série foram removidas." : "Consulta pontual removida.");
      } else if (tipo === "edicao") {
        await api.updateEvento(evento.id, { ...dados, escopo });
        toast.success(escopo === "futuras" ? "Esta e todas as consultas futuras da série foram atualizadas!" : "Consulta pontual atualizada!");
      }
      setConfirmacaoEscopo(null);
      setPopupDetalhes(null);
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Falha ao executar ação na série.");
    }
  };

  // Ações rápidas no pop-up do paciente e consulta
  const handleAlterarStatus = async (item, novoStatus, gerarReceita = false) => {
    toast.saving();
    try {
      await api.updateEvento(item.id, {
        status: novoStatus,
        status_pagamento: gerarReceita ? "pago" : item.status_pagamento,
        gerar_receita: gerarReceita,
        valor_receita: item.valor_sessao || 180.00,
      });

      if (novoStatus === "realizado" && gerarReceita) {
        toast.success("Atendimento concluído e receita lançada no financeiro!");
      } else {
        toast.success(`Status atualizado para: ${novoStatus}!`);
      }

      setPopupDetalhes(null);
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Não foi possível atualizar o status.");
    }
  };

  // Abrir modal para registrar prontuário/evolução clínica da sessão
  const handleAbrirProntuarioModal = (item) => {
    setFormProntuario({
      titulo: `Evolução Clínica${item.sessao_numero ? ` (Sessão #${item.sessao_numero})` : ""} - ${item.nome}`,
      evolucao: "",
      metas_terapeuticas: "",
      observacoes: "",
    });
    setModalProntuarioAberto(true);
  };

  const handleSalvarProntuarioAgendamento = async (e) => {
    e.preventDefault();
    if (!formProntuario.evolucao.trim()) {
      toast.required("Informe o relato da evolução clínica.");
      return;
    }

    toast.saving();
    try {
      await api.registrarProntuarioAgendamento(popupDetalhes.id, formProntuario);
      toast.success("Evolução clínica registrada no prontuário do paciente com sucesso!");
      setModalProntuarioAberto(false);
    } catch {
      toast.error("Falha ao registrar prontuário.");
    }
  };

  // Emitir Recibo
  const handleEmitirRecibo = async (item) => {
    try {
      const recibo = await api.getRecibo(item.id);
      setDadosRecibo(recibo);
    } catch {
      toast.error("Falha ao carregar dados do recibo.");
    }
  };

  return (
    <div className="agenda-page">
      {/* Cabeçalho com Seletor de Visão (Mês vs Semana) */}
      <div className="agenda-page-heading">
        <div>
          <span className="dashboard-kicker">Atividades & Consultas</span>
          <h1>Agenda do Consultório<span>.</span></h1>
          <p>Organize atendimentos, agende séries recorrentes e acompanhe seus pacientes.</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* SELETOR DE VISUALIZAÇÃO: MÊS OU SEMANA */}
          <div className="agenda-view-switch" role="tablist" aria-label="Visualização da agenda">
            <button
              type="button"
              className={modoVisao === "mes" ? "active" : ""}
              onClick={() => setModoVisao("mes")}
            >
              <i className="bi bi-calendar-month me-1" /> Visão Mensal
            </button>
            <button
              type="button"
              className={modoVisao === "semana" ? "active" : ""}
              onClick={() => setModoVisao("semana")}
            >
              <i className="bi bi-calendar-week me-1" /> Visão Semanal
            </button>
          </div>

          <button
            className="dashboard-primary-button"
            type="button"
            onClick={abrirModalCriar}
          >
            <i className="bi bi-plus-lg me-1" /> Novo agendamento
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODO 1: VISÃO SEMANAL (7 DIAS DA SEMANA) */}
      {/* ========================================== */}
      {modoVisao === "semana" ? (
        <section className="dashboard-panel agenda-calendar-panel" style={{ padding: "24px" }}>
          <div className="agenda-calendar-header">
            <div>
              <span className="dashboard-kicker">Visualização da Semana</span>
              <h2>
                Semana de {dadosSemana.inicio_semana} até {dadosSemana.fim_semana}
              </h2>
            </div>
            <div className="agenda-calendar-actions">
              <button
                className="dashboard-secondary-button"
                type="button"
                onClick={selecionarHoje}
              >
                Semana atual
              </button>
              <button
                className="dashboard-nav-button"
                type="button"
                onClick={() => {
                  const d = new Date(diaSelecionado);
                  d.setDate(d.getDate() - 7);
                  setDiaSelecionado(d);
                }}
                aria-label="Semana anterior"
              >
                <i className="bi bi-chevron-left" />
              </button>
              <button
                className="dashboard-nav-button"
                type="button"
                onClick={() => {
                  const d = new Date(diaSelecionado);
                  d.setDate(d.getDate() + 7);
                  setDiaSelecionado(d);
                }}
                aria-label="Próxima semana"
              >
                <i className="bi bi-chevron-right" />
              </button>
            </div>
          </div>

          {/* GRADE DOS 7 DIAS DA SEMANA */}
          <div className="agenda-week-grid">
            {dadosSemana.dias.map((diaItem) => (
              <div
                key={diaItem.data}
                className={`agenda-week-col ${diaItem.is_hoje ? "is-today" : ""}`}
              >
                <div className="agenda-week-col-header">
                  <span>{diaItem.dia_semana_curto}</span>
                  <strong>{diaItem.dia_numero}</strong>
                </div>

                <div className="agenda-week-events">
                  {diaItem.compromissos && diaItem.compromissos.length > 0 ? (
                    diaItem.compromissos.map((ev) => (
                      <div
                        key={ev.id}
                        className={`agenda-week-card ${ev.tone || "rose"}`}
                        onClick={() => setPopupDetalhes(ev)}
                        title="Clique para ver detalhes do paciente e consulta"
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <strong>{ev.nome}</strong>
                          {ev.recorrencia_grupo_id && (
                            <span className="agenda-recurrence-badge" title="Consulta recorrente semanal">
                              <i className="bi bi-arrow-repeat" />
                            </span>
                          )}
                        </div>
                        <span>{ev.horario_inicio} {ev.horario_fim ? `- ${ev.horario_fim}` : ""}</span>
                        <small style={{ fontSize: "0.68rem", color: "#666" }}>{ev.categoria}</small>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: "0.72rem", color: "var(--agenda-muted)", textAlign: "center", marginTop: "16px" }}>
                      Sem consultas
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        /* ========================================== */
        /* MODO 2: VISÃO MENSAL + LISTA DIÁRIA */
        /* ========================================== */
        <div className="agenda-layout">
          {/* Painel do Calendário Mensal */}
          <section className="dashboard-panel agenda-calendar-panel">
            <div className="agenda-calendar-header">
              <div>
                <span className="dashboard-kicker">Visão Mensal</span>
                <h2>{meses[mesAtual]} de {anoAtual}</h2>
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
                  if (!dia) return <div className="agenda-day empty" key={`empty-${index}`} />;
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
                              title={`${evento.nome} (${evento.categoria})`}
                            />
                          ))}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

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

          {/* Painel Lateral: Detalhes do Dia Selecionado */}
          <aside className="dashboard-panel agenda-patients-panel">
            <div className="agenda-patients-header">
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
                title="Adicionar consulta"
              >
                <i className="bi bi-plus-lg" />
              </button>
            </div>

            <div className="agenda-patients-count">
              <strong>{agendaDia.totalAgendados}</strong>
              <span>
                {agendaDia.totalAgendados === 1 ? "atendimento agendado" : "atendimentos agendados"}
              </span>
            </div>

            {/* Lista dos Atendimentos do Dia */}
            <div className="agenda-patient-list">
              {agendaDia.compromissos.length > 0 ? (
                agendaDia.compromissos.map((item) => (
                  <div
                    className="agenda-patient"
                    key={item.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setPopupDetalhes(item)}
                    title="Clique para abrir detalhes do paciente"
                  >
                    <div className={`agenda-patient-icon ${item.tone || "rose"}`}>
                      <i className="bi bi-person" />
                    </div>
                    <div className="agenda-patient-info">
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <strong>{item.nome}</strong>
                        {item.recorrencia_grupo_id && (
                          <span className="agenda-recurrence-badge">Recorrente</span>
                        )}
                      </div>
                      <span>{item.categoria}</span>
                      <small style={{ color: "#777", display: "block", marginTop: "2px" }}>
                        Status: <strong style={{ textTransform: "capitalize" }}>{item.status}</strong>
                        {item.status_pagamento && ` • ${item.status_pagamento === "pago" ? "Pago" : "Pendente"}`}
                      </small>
                    </div>
                    <div className="agenda-patient-time" style={{ textAlign: "right" }}>
                      <div>{item.horario_inicio} {item.horario_fim ? `- ${item.horario_fim}` : ""}</div>
                      <span className="badge-status" style={{ fontSize: "0.68rem" }}>
                        Ver detalhes <i className="bi bi-box-arrow-up-right ms-1" />
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="agenda-empty">
                  <div><i className="bi bi-calendar2-check" /></div>
                  <strong>Nenhum atendimento</strong>
                  <span>Não há compromissos agendados para este dia.</span>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ========================================== */}
      {/* POP-UP CENTRALIZADO DO PACIENTE E CONSULTA */}
      {/* ========================================== */}
      {popupDetalhes && (
        <div
          className="agenda-patient-popup-overlay"
          role="presentation"
          onClick={() => setPopupDetalhes(null)}
        >
          <div
            className="agenda-patient-popup-card"
            style={{ maxWidth: "580px" }}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="agenda-patient-popup-header">
              <div>
                <span className="dashboard-kicker">Ficha da Consulta & Paciente</span>
                <h2>{popupDetalhes.nome}</h2>
              </div>
              <button
                type="button"
                onClick={() => setPopupDetalhes(null)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="agenda-patient-popup-body">
              {/* Informações da Série Recorrente se houver */}
              {popupDetalhes.recorrencia_grupo_id && (
                <div style={{ background: "#fbf6ef", border: "1px solid #ebd3b6", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <i className="bi bi-arrow-repeat text-warning" style={{ fontSize: "1.2rem" }} />
                  <div>
                    <strong style={{ fontSize: "0.85rem", color: "#664d28" }}>
                      Atendimento Recorrente ({popupDetalhes.recorrencia_tipo || "Semanal"})
                    </strong>
                    <span style={{ fontSize: "0.78rem", color: "#8a6d3b", display: "block" }}>
                      Sessão #{popupDetalhes.sessao_numero || 1} de {popupDetalhes.sessao_total || "Série"} mantendo o dia e horário fixo.
                    </span>
                  </div>
                </div>
              )}

              {/* Informações de Contato do Paciente */}
              <div className="agenda-detail-group">
                <span className="agenda-detail-label">Dados do Paciente</span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.85rem" }}>
                  <div>
                    <span style={{ color: "var(--agenda-muted)" }}>Telefone:</span>
                    <p style={{ margin: "2px 0 0", fontWeight: 500 }}>
                      {popupDetalhes.paciente?.telefone ? (
                        <a
                          href={`https://wa.me/55${popupDetalhes.paciente.telefone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#25D366", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          <i className="bi bi-whatsapp" /> {popupDetalhes.paciente.telefone}
                        </a>
                      ) : (
                        "Não informado"
                      )}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: "var(--agenda-muted)" }}>E-mail:</span>
                    <p style={{ margin: "2px 0 0", fontWeight: 500 }}>
                      {popupDetalhes.paciente?.email || "Não informado"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações da Consulta */}
              <div className="agenda-detail-group" style={{ background: "var(--agenda-paper)", padding: "12px", borderRadius: "8px" }}>
                <span className="agenda-detail-label">Informações do Agendamento</span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.85rem" }}>
                  <div><strong>Data:</strong> {popupDetalhes.data}</div>
                  <div><strong>Horário:</strong> {popupDetalhes.horario_inicio} {popupDetalhes.horario_fim ? `às ${popupDetalhes.horario_fim}` : ""}</div>
                  <div><strong>Categoria:</strong> {popupDetalhes.categoria}</div>
                  <div><strong>Valor Sessão:</strong> R$ {Number(popupDetalhes.valor_sessao || 180).toFixed(2)}</div>
                  <div><strong>Status Atendimento:</strong> <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{popupDetalhes.status}</span></div>
                  <div><strong>Status Cobrança:</strong> <span style={{ textTransform: "capitalize", fontWeight: 600, color: popupDetalhes.status_pagamento === "pago" ? "green" : "#b05d45" }}>{popupDetalhes.status_pagamento || "Pendente"}</span></div>
                </div>
                {popupDetalhes.observacoes && (
                  <div style={{ marginTop: "8px", borderTop: "1px dashed var(--agenda-line)", paddingTop: "8px", fontSize: "0.82rem" }}>
                    <strong>Observações Clínicas:</strong>
                    <p style={{ margin: "2px 0 0" }}>{popupDetalhes.observacoes}</p>
                  </div>
                )}
              </div>

              {/* Ações Rápidas & Conexão de Módulos */}
              <span className="agenda-detail-label" style={{ marginTop: "16px" }}>Ações da Sessão</span>
              <div className="agenda-quick-actions">
                {/* Botão Registrar Prontuário (A7) */}
                <button
                  type="button"
                  className="agenda-quick-btn"
                  style={{ background: "#f4f1de", borderColor: "#e0d8b0", color: "#3d405b", fontWeight: 600 }}
                  onClick={() => handleAbrirProntuarioModal(popupDetalhes)}
                  title="Registrar evolução clínica do paciente sem sair da agenda"
                >
                  <i className="bi bi-journal-medical text-primary" /> Registrar Prontuário
                </button>

                {/* Botão Concluir & Gerar Receita (A8) */}
                <button
                  type="button"
                  className="agenda-quick-btn success"
                  onClick={() => handleAlterarStatus(popupDetalhes, "realizado", true)}
                  title="Conclui a consulta e lança receita no financeiro"
                >
                  <i className="bi bi-check-circle" /> Concluir (Gerar Receita)
                </button>

                {/* Botão Emitir Recibo (A9) */}
                <button
                  type="button"
                  className="agenda-quick-btn"
                  onClick={() => handleEmitirRecibo(popupDetalhes)}
                  title="Gerar e imprimir recibo clínico"
                >
                  <i className="bi bi-receipt" /> Emitir Recibo
                </button>

                {/* Botão Editar */}
                <button
                  type="button"
                  className="agenda-quick-btn"
                  onClick={() => abrirModalEditar(popupDetalhes)}
                >
                  <i className="bi bi-pencil" /> Editar dados
                </button>

                {/* Botão Excluir */}
                <button
                  type="button"
                  className="agenda-quick-btn danger"
                  onClick={() => handleConfirmarExclusao(popupDetalhes)}
                >
                  <i className="bi bi-trash3" /> Excluir consulta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: ADICIONAR / EDITAR COMPROMISSO */}
      {/* ========================================== */}
      {modalAberto && (
        <div
          className="agenda-modal-backdrop"
          role="presentation"
          onClick={() => setModalAberto(false)}
        >
          <div
            className="agenda-modal"
            style={{ maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="agenda-modal-header">
              <div>
                <span className="dashboard-kicker">
                  {eventoEdicao ? "Atualizar consulta" : "Novo agendamento"}
                </span>
                <h2>{eventoEdicao ? "Editar compromisso" : "Agendar atendimento"}</h2>
              </div>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                aria-label="Fechar"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {/* SELETOR: CONSULTA AVULSA OU SÉRIE RECORRENTE (Solicitado pelo usuário) */}
            {!eventoEdicao && (
              <div className="agenda-recurrence-toggle">
                <button
                  type="button"
                  className={tipoAgendamento === "avulso" ? "active" : ""}
                  onClick={() => setTipoAgendamento("avulso")}
                >
                  <i className="bi bi-calendar-check" /> Consulta Avulsa (Única)
                </button>
                <button
                  type="button"
                  className={tipoAgendamento === "recorrente" ? "active" : ""}
                  onClick={() => setTipoAgendamento("recorrente")}
                >
                  <i className="bi bi-arrow-repeat" /> Atendimento Recorrente
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Seleção de Paciente Cadastrado ou Nome Avulso */}
              <label>
                <span>Vincular Paciente Cadastrado</span>
                <select
                  value={formData.paciente_id}
                  onChange={handleSelecionarPacienteForm}
                >
                  <option value="">-- Digitar nome avulso / Novo paciente --</option>
                  {pacientesCadastrados.map((pac) => (
                    <option key={pac.id} value={pac.id}>
                      {pac.nome} {pac.sobrenome || ""} ({pac.telefone || pac.email || "Sem contato"})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Nome do Paciente / Evento *</span>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Beatriz Lima"
                />
              </label>

              <div className="agenda-form-grid">
                <label>
                  <span>{tipoAgendamento === "recorrente" ? "Data da 1ª Consulta *" : "Data *"}</span>
                  <input
                    type="date"
                    required
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  />
                </label>
                <label>
                  <span>Categoria</span>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  >
                    {categorias.map((c) => (
                      <option key={c.nome} value={c.nome}>{c.nome}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="agenda-form-grid">
                <label>
                  <span>Horário de Início *</span>
                  <input
                    type="time"
                    required
                    value={formData.horario_inicio}
                    onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                  />
                </label>
                <label>
                  <span>Horário de Término</span>
                  <input
                    type="time"
                    value={formData.horario_fim}
                    onChange={(e) => setFormData({ ...formData, horario_fim: e.target.value })}
                  />
                </label>
              </div>

              <div className="agenda-form-grid">
                <label>
                  <span>Valor da Sessão (R$)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor_sessao}
                    onChange={(e) => setFormData({ ...formData, valor_sessao: parseFloat(e.target.value) || 0 })}
                  />
                </label>
                <label>
                  <span>Status do Pagamento</span>
                  <select
                    value={formData.status_pagamento}
                    onChange={(e) => setFormData({ ...formData, status_pagamento: e.target.value })}
                  >
                    <option value="pendente">Pendente / A receber</option>
                    <option value="pago">Pago</option>
                    <option value="isento">Isento / Cortesia</option>
                  </select>
                </label>
              </div>

              {/* SEÇÃO DE CONFIGURAÇÃO DE RECORRÊNCIA (A1 & A2) */}
              {tipoAgendamento === "recorrente" && !eventoEdicao && (
                <div className="agenda-recurrence-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <i className="bi bi-clock-history text-success" style={{ fontSize: "1.1rem" }} />
                    <strong style={{ fontSize: "0.88rem", color: "var(--agenda-ink)" }}>
                      Duração do Atendimento (Padrão Semanal Fixo)
                    </strong>
                  </div>

                  <div className="agenda-form-grid" style={{ marginBottom: "10px" }}>
                    <label>
                      <span>Frequência:</span>
                      <select value={tipoFrequencia} onChange={(e) => setTipoFrequencia(e.target.value)}>
                        <option value="semanal">Semanal (Todo mesmo dia)</option>
                        <option value="quinzenal">Quinzenal (A cada 15 dias)</option>
                      </select>
                    </label>

                    <label>
                      <span>Definir duração por:</span>
                      <select value={modoRecorrencia} onChange={(e) => setModoRecorrencia(e.target.value)}>
                        <option value="sessoes">Número de Sessões</option>
                        <option value="periodo">Período de Meses</option>
                      </select>
                    </label>
                  </div>

                  {modoRecorrencia === "sessoes" ? (
                    <label>
                      <span>Por quantas sessões o paciente será atendido?</span>
                      <select value={quantidadeSessoes} onChange={(e) => setQuantidadeSessoes(Number(e.target.value))}>
                        <option value={4}>4 sessões (aprox. 1 mês)</option>
                        <option value={8}>8 sessões (aprox. 2 meses)</option>
                        <option value={12}>12 sessões (aprox. 3 meses)</option>
                        <option value={24}>24 sessões (aprox. 6 meses)</option>
                        <option value={48}>48 sessões (aprox. 1 ano)</option>
                      </select>
                    </label>
                  ) : (
                    <label>
                      <span>Por quanto tempo o paciente será atendido?</span>
                      <select value={periodoMeses} onChange={(e) => setPeriodoMeses(Number(e.target.value))}>
                        <option value={1}>1 mês</option>
                        <option value={3}>3 meses</option>
                        <option value={6}>6 meses</option>
                        <option value={12}>12 meses (1 ano)</option>
                      </select>
                    </label>
                  )}

                  <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button
                      type="button"
                      className="dashboard-secondary-button"
                      style={{ fontSize: "0.78rem", padding: "6px 12px" }}
                      onClick={handleSimularRecorrencia}
                      disabled={simulando}
                    >
                      <i className="bi bi-shield-check me-1" />
                      {simulando ? "Verificando..." : "Verificar datas & conflitos"}
                    </button>
                    {simulacaoRecorrencia && (
                      <span style={{ fontSize: "0.78rem", color: simulacaoRecorrencia.total_conflitos > 0 ? "#c94a4a" : "#22543d", fontWeight: 600 }}>
                        {simulacaoRecorrencia.total_sessoes} sessões calculadas ({simulacaoRecorrencia.total_conflitos} conflito/s)
                      </span>
                    )}
                  </div>

                  {/* Lista de Simulação */}
                  {simulacaoRecorrencia && (
                    <div className="agenda-simulation-box">
                      {simulacaoRecorrencia.datas.map((dItem) => (
                        <div key={dItem.data} className={`agenda-simulation-item ${dItem.tem_conflito ? "conflict" : ""}`}>
                          <span>
                            <strong>Sessão #{dItem.sessao_numero}:</strong> {dItem.dataFormatada} ({dItem.dia_semana}) às {dItem.horario_inicio}
                          </span>
                          {dItem.tem_conflito ? (
                            <span className="badge-conflict" title={`Conflito com: ${dItem.conflito_com}`}>
                              Ocupado: {dItem.conflito_com}
                            </span>
                          ) : (
                            <span className="badge-free">Livre</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <label>
                <span>Observações Clínicas / Anotações Rápidas</span>
                <textarea
                  rows="3"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Anotações para a sessão, queixa principal ou objetivos."
                />
              </label>

              <div className="agenda-modal-footer">
                <button
                  type="button"
                  className="dashboard-secondary-button"
                  onClick={() => setModalAberto(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="dashboard-primary-button">
                  {tipoAgendamento === "recorrente" ? "Confirmar Série Recorrente" : "Salvar Agendamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: CONFIRMAÇÃO DE ESCOPO DE SÉRIE (A3) */}
      {/* ========================================== */}
      {confirmacaoEscopo && (
        <div className="agenda-patient-popup-overlay">
          <div className="agenda-patient-popup-card" style={{ maxWidth: "460px", padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", margin: "0 0 10px", color: "var(--agenda-ink)" }}>
              {confirmacaoEscopo.tipo === "exclusao" ? "Excluir Consulta Recorrente" : "Atualizar Consulta Recorrente"}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--agenda-muted)", marginBottom: "20px" }}>
              Esta consulta faz parte de uma série de atendimentos semanais. Qual escopo de alteração você deseja aplicar?
            </p>

            <div style={{ display: "grid", gap: "10px" }}>
              <button
                type="button"
                className="dashboard-secondary-button"
                style={{ padding: "10px", textAlign: "center", justifyContent: "center" }}
                onClick={() => executarAcaoEscopo("individual")}
              >
                Alterar apenas esta consulta pontual
              </button>
              <button
                type="button"
                className="dashboard-primary-button"
                style={{ padding: "10px", textAlign: "center", justifyContent: "center" }}
                onClick={() => executarAcaoEscopo("futuras")}
              >
                Alterar esta e todas as consultas futuras desta série
              </button>
              <button
                type="button"
                className="btn btn-link text-muted btn-sm"
                onClick={() => setConfirmacaoEscopo(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: REGISTRAR PRONTUÁRIO DIRETO DA CONSULTA (A7) */}
      {/* ========================================== */}
      {modalProntuarioAberto && (
        <div className="agenda-modal-backdrop" onClick={() => setModalProntuarioAberto(false)}>
          <div className="agenda-modal" style={{ maxWidth: "560px" }} onClick={(e) => e.stopPropagation()}>
            <div className="agenda-modal-header">
              <div>
                <span className="dashboard-kicker">Prontuário & Evolução Clínica</span>
                <h2>Registrar Atendimento Clínico</h2>
              </div>
              <button type="button" onClick={() => setModalProntuarioAberto(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleSalvarProntuarioAgendamento}>
              <label>
                <span>Título da Evolução</span>
                <input
                  type="text"
                  value={formProntuario.titulo}
                  onChange={(e) => setFormProntuario({ ...formProntuario, titulo: e.target.value })}
                />
              </label>

              <label>
                <span>Relato e Evolução Clínica da Sessão *</span>
                <textarea
                  rows="5"
                  required
                  value={formProntuario.evolucao}
                  onChange={(e) => setFormProntuario({ ...formProntuario, evolucao: e.target.value })}
                  placeholder="Relato das intervenções, queixas trazidas, humor e respostas clínicas do paciente..."
                />
              </label>

              <label>
                <span>Metas Terapêuticas & Tarefas entre Sessões</span>
                <textarea
                  rows="2"
                  value={formProntuario.metas_terapeuticas}
                  onChange={(e) => setFormProntuario({ ...formProntuario, metas_terapeuticas: e.target.value })}
                  placeholder="Metas combinadas com o paciente..."
                />
              </label>

              <div className="agenda-modal-footer">
                <button type="button" className="dashboard-secondary-button" onClick={() => setModalProntuarioAberto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="dashboard-primary-button">
                  Salvar no Prontuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: RECIBO CLÍNICO FORMATADO (A9) */}
      {/* ========================================== */}
      {dadosRecibo && (
        <div className="agenda-patient-popup-overlay" onClick={() => setDadosRecibo(null)}>
          <div className="agenda-patient-popup-card" style={{ maxWidth: "560px", padding: "28px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", borderBottom: "1px solid var(--agenda-line)", paddingBottom: "16px", marginBottom: "20px" }}>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--agenda-accent)", fontWeight: 700 }}>
                Recibo de Prestação de Serviços Psicológicos
              </span>
              <h2 style={{ margin: "6px 0 0", color: "var(--agenda-ink)" }}>Nº {dadosRecibo.recibo_numero}</h2>
            </div>

            <div style={{ fontSize: "0.9rem", color: "var(--agenda-ink)", lineHeight: 1.6, marginBottom: "24px" }}>
              <p>{dadosRecibo.declaracao}</p>
              <div style={{ background: "var(--agenda-paper)", padding: "12px", borderRadius: "8px", margin: "16px 0", fontSize: "0.85rem" }}>
                <div><strong>Valor:</strong> {dadosRecibo.valor_formatado}</div>
                <div><strong>Paciente:</strong> {dadosRecibo.paciente_nome}</div>
                <div><strong>Data do Atendimento:</strong> {dadosRecibo.data_atendimento}</div>
              </div>
              <div style={{ textAlign: "right", marginTop: "24px" }}>
                <strong>{dadosRecibo.profissional_nome}</strong>
                <span style={{ display: "block", fontSize: "0.8rem", color: "var(--agenda-muted)" }}>
                  CRP: {dadosRecibo.profissional_crp}
                </span>
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--agenda-muted)" }}>
                  Emitido em: {dadosRecibo.data_emissao}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button type="button" className="dashboard-secondary-button" onClick={() => setDadosRecibo(null)}>
                Fechar
              </button>
              <button
                type="button"
                className="dashboard-primary-button"
                onClick={() => window.print()}
              >
                <i className="bi bi-printer me-1" /> Imprimir / Salvar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Agenda;