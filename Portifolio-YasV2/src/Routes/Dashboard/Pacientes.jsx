import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useToast } from "../../contexts/useToast";

function Pacientes() {
  const toast = useToast();
  const [pacientes, setPacientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [loading, setLoading] = useState(true);

  // Modais
  const [modalPacienteAberto, setModalPacienteAberto] = useState(false);
  const [pacienteEdicao, setPacienteEdicao] = useState(null);
  const [pacienteFicha, setPacienteFicha] = useState(null);
  const [prontuariosPaciente, setProntuariosPaciente] = useState([]);
  const [modalProntuarioAberto, setModalProntuarioAberto] = useState(false);

  // Forms
  const [formPaciente, setFormPaciente] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    telefone: "",
    cpf: "",
    data_nascimento: "",
    status: "ativo",
    observacoes: "",
  });

  const [formProntuario, setFormProntuario] = useState({
    titulo: "",
    data_sessao: new Date().toISOString().slice(0, 10),
    evolucao: "",
    metas_terapeuticas: "",
    observacoes: "",
  });

  const carregarPacientes = async () => {
    setLoading(true);
    try {
      const data = await api.getPacientes();
      if (Array.isArray(data)) {
        setPacientes(data);
      }
    } catch (err) {
      toast.error("Falha ao carregar lista de pacientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPacientes();
  }, []);

  const abrirModalNovo = () => {
    setPacienteEdicao(null);
    setFormPaciente({
      nome: "",
      sobrenome: "",
      email: "",
      telefone: "",
      cpf: "",
      data_nascimento: "",
      status: "ativo",
      observacoes: "",
    });
    setModalPacienteAberto(true);
  };

  const abrirModalEditar = (pac) => {
    setPacienteEdicao(pac);
    setFormPaciente({
      nome: pac.nome || "",
      sobrenome: pac.sobrenome || "",
      email: pac.email || "",
      telefone: pac.telefone || "",
      cpf: pac.cpf || "",
      data_nascimento: pac.data_nascimento || "",
      status: pac.status || "ativo",
      observacoes: pac.observacoes || "",
    });
    setModalPacienteAberto(true);
  };

  const abrirFichaPaciente = async (pac) => {
    setPacienteFicha(pac);
    try {
      const resp = await api.getProntuarios(pac.id);
      if (resp && resp.prontuarios) {
        setProntuariosPaciente(resp.prontuarios);
      } else {
        setProntuariosPaciente([]);
      }
    } catch {
      setProntuariosPaciente([]);
    }
  };

  const handleSalvarPaciente = async (e) => {
    e.preventDefault();
    if (!formPaciente.nome.trim()) {
      toast.required("O nome do paciente é obrigatório.");
      return;
    }

    toast.saving();
    try {
      if (pacienteEdicao) {
        await api.updatePaciente(pacienteEdicao.id, formPaciente);
        toast.success("Paciente atualizado com sucesso!");
      } else {
        await api.createPaciente(formPaciente);
        toast.success("Paciente cadastrado com sucesso!");
      }
      setModalPacienteAberto(false);
      carregarPacientes();
      if (pacienteFicha && pacienteEdicao && pacienteFicha.id === pacienteEdicao.id) {
        setPacienteFicha({ ...pacienteFicha, ...formPaciente });
      }
    } catch (err) {
      toast.error(err.message || "Erro ao salvar paciente.");
    }
  };

  const handleExcluirPaciente = async (id) => {
    if (!window.confirm("Deseja realmente excluir este paciente? Todos os registros associados poderão ser afetados.")) return;
    toast.saving();
    try {
      await api.deletePaciente(id);
      toast.success("Paciente excluído com sucesso.");
      if (pacienteFicha && pacienteFicha.id === id) {
        setPacienteFicha(null);
      }
      carregarPacientes();
    } catch {
      toast.error("Erro ao excluir paciente.");
    }
  };

  const handleSalvarProntuario = async (e) => {
    e.preventDefault();
    if (!formProntuario.evolucao.trim()) {
      toast.required("O texto da evolução clínica é obrigatório.");
      return;
    }

    toast.saving();
    try {
      await api.createProntuario(pacienteFicha.id, formProntuario);
      toast.success("Evolução clínica registrada no prontuário!");
      setModalProntuarioAberto(false);
      setFormProntuario({
        titulo: "",
        data_sessao: new Date().toISOString().slice(0, 10),
        evolucao: "",
        metas_terapeuticas: "",
        observacoes: "",
      });
      abrirFichaPaciente(pacienteFicha);
    } catch {
      toast.error("Falha ao registrar evolução clínica.");
    }
  };

  const pacientesFiltrados = pacientes.filter((p) => {
    const nomeCompleto = `${p.nome} ${p.sobrenome || ""}`.toLowerCase();
    const termo = busca.toLowerCase();
    const matchBusca = nomeCompleto.includes(termo) || (p.email && p.email.toLowerCase().includes(termo)) || (p.telefone && p.telefone.includes(termo));
    const matchStatus = filtroStatus === "todos" ? true : p.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  return (
    <div className="dashboard-page">
      {/* Cabeçalho */}
      <div className="dashboard-page-heading">
        <div>
          <span className="dashboard-kicker">Gestão Clínica</span>
          <h1>Pacientes e Prontuários<span>.</span></h1>
          <p>Cadastre pacientes, acompanhe histórico de sessões e registre evoluções clínicas com sigilo ético.</p>
        </div>

        <button type="button" className="dashboard-primary-button" onClick={abrirModalNovo}>
          <i className="bi bi-person-plus me-1" /> Novo paciente
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="dashboard-panel" style={{ padding: "16px 20px", marginBottom: "20px", display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: "1", minWidth: "260px" }}>
          <i className="bi bi-search text-muted" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ width: "100%", border: "1px solid var(--dashboard-line)", borderRadius: "8px", padding: "8px 12px", fontSize: "0.88rem" }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "0.82rem", color: "var(--dashboard-muted)", fontWeight: 500 }}>Status:</span>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            style={{ border: "1px solid var(--dashboard-line)", borderRadius: "8px", padding: "6px 12px", fontSize: "0.85rem", background: "#fff" }}
          >
            <option value="todos">Todos ({pacientes.length})</option>
            <option value="ativo">Ativos ({pacientes.filter((p) => p.status === "ativo").length})</option>
            <option value="inativo">Inativos ({pacientes.filter((p) => p.status === "inativo").length})</option>
          </select>
        </div>
      </div>

      {/* Tabela de Pacientes */}
      <div className="dashboard-panel" style={{ padding: "0", overflow: "hidden" }}>
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Contato</th>
                <th>CPF</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "32px", color: "var(--dashboard-muted)" }}>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Carregando pacientes...
                  </td>
                </tr>
              ) : pacientesFiltrados.length > 0 ? (
                pacientesFiltrados.map((pac) => (
                  <tr key={pac.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="dashboard-avatar" style={{ width: "36px", height: "36px", fontSize: "0.9rem" }}>
                          {pac.nome.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <strong>{pac.nome} {pac.sobrenome || ""}</strong>
                          <span style={{ fontSize: "0.75rem", color: "var(--dashboard-muted)", display: "block" }}>
                            Cadastrado em: {pac.created_at ? new Date(pac.created_at).toLocaleDateString("pt-BR") : "Recente"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        {pac.telefone ? (
                          <a
                            href={`https://wa.me/55${pac.telefone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#25D366", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            <i className="bi bi-whatsapp" /> {pac.telefone}
                          </a>
                        ) : (
                          <span className="text-muted small">Sem telefone</span>
                        )}
                        <span style={{ display: "block", fontSize: "0.78rem", color: "var(--dashboard-muted)" }}>
                          {pac.email || "Sem e-mail"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="small text-muted">{pac.cpf || "Não informado"}</span>
                    </td>
                    <td>
                      <span className={`badge-status ${pac.status === "ativo" ? "agendado" : "cancelado"}`}>
                        {pac.status ? pac.status.charAt(0).toUpperCase() + pac.status.slice(1) : "Ativo"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          className="dashboard-primary-button"
                          style={{ padding: "5px 10px", fontSize: "0.75rem" }}
                          onClick={() => abrirFichaPaciente(pac)}
                          title="Abrir ficha e prontuário"
                        >
                          <i className="bi bi-journal-medical me-1" /> Ficha & Prontuário
                        </button>
                        <button
                          type="button"
                          className="dashboard-secondary-button"
                          style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                          onClick={() => abrirModalEditar(pac)}
                          title="Editar cadastro"
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm text-danger p-1"
                          onClick={() => handleExcluirPaciente(pac.id)}
                          title="Excluir paciente"
                        >
                          <i className="bi bi-trash3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "40px 16px", color: "var(--dashboard-muted)" }}>
                    <i className="bi bi-person-x" style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }} />
                    <p style={{ margin: 0 }}>Nenhum paciente encontrado com os filtros atuais.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: FICHA & PRONTUÁRIOS DO PACIENTE */}
      {pacienteFicha && (
        <div className="agenda-patient-popup-overlay" onClick={() => setPacienteFicha(null)}>
          <div className="agenda-patient-popup-card" style={{ maxWidth: "720px", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="agenda-patient-popup-header">
              <div>
                <span className="dashboard-kicker">Prontuário & Histórico Clínico</span>
                <h2>{pacienteFicha.nome} {pacienteFicha.sobrenome || ""}</h2>
              </div>
              <button type="button" onClick={() => setPacienteFicha(null)} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="agenda-patient-popup-body">
              {/* Dados Cadastrais */}
              <div style={{ background: "var(--dashboard-background)", padding: "14px", borderRadius: "10px", marginBottom: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", fontSize: "0.85rem" }}>
                  <div><strong>Telefone:</strong> {pacienteFicha.telefone || "Não informado"}</div>
                  <div><strong>E-mail:</strong> {pacienteFicha.email || "Não informado"}</div>
                  <div><strong>CPF:</strong> {pacienteFicha.cpf || "Não informado"}</div>
                  <div><strong>Status:</strong> <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{pacienteFicha.status}</span></div>
                </div>
              </div>

              {/* Botão de Nova Evolução */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <strong style={{ fontSize: "0.95rem", color: "var(--dashboard-ink)" }}>
                  Evoluções Registradas ({prontuariosPaciente.length})
                </strong>
                <button
                  type="button"
                  className="dashboard-primary-button"
                  style={{ fontSize: "0.78rem", padding: "6px 12px" }}
                  onClick={() => setModalProntuarioAberto(true)}
                >
                  <i className="bi bi-plus-lg me-1" /> Nova Evolução Clínica
                </button>
              </div>

              {/* Lista de Prontuários */}
              <div style={{ display: "grid", gap: "12px" }}>
                {prontuariosPaciente.length > 0 ? (
                  prontuariosPaciente.map((pr) => (
                    <article key={pr.id} style={{ background: "#fff", border: "1px solid var(--dashboard-line)", borderRadius: "8px", padding: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <strong style={{ fontSize: "0.88rem", color: "var(--dashboard-accent)" }}>
                          {pr.titulo || "Evolução Clínica"}
                        </strong>
                        <small style={{ color: "var(--dashboard-muted)", fontWeight: 600 }}>
                          Data da sessão: {new Date(pr.data_sessao).toLocaleDateString("pt-BR")}
                        </small>
                      </div>
                      <p style={{ fontSize: "0.85rem", color: "var(--dashboard-ink)", margin: "6px 0 8px", whiteSpace: "pre-line" }}>
                        {pr.evolucao}
                      </p>
                      {pr.metas_terapeuticas && (
                        <div style={{ fontSize: "0.78rem", color: "var(--dashboard-muted)", background: "var(--dashboard-background)", padding: "6px 10px", borderRadius: "6px" }}>
                          <strong>Metas terapêuticas:</strong> {pr.metas_terapeuticas}
                        </div>
                      )}
                    </article>
                  ))
                ) : (
                  <p style={{ textAlign: "center", padding: "24px", color: "var(--dashboard-muted)", fontSize: "0.85rem" }}>
                    Nenhuma evolução clínica registrada até o momento para este paciente.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CADASTRO / EDIÇÃO DE PACIENTE */}
      {modalPacienteAberto && (
        <div className="agenda-modal-backdrop" onClick={() => setModalPacienteAberto(false)}>
          <div className="agenda-modal" onClick={(e) => e.stopPropagation()}>
            <div className="agenda-modal-header">
              <div>
                <span className="dashboard-kicker">{pacienteEdicao ? "Atualizar Dados" : "Novo Cadastro"}</span>
                <h2>{pacienteEdicao ? "Editar Paciente" : "Cadastrar Paciente"}</h2>
              </div>
              <button type="button" onClick={() => setModalPacienteAberto(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleSalvarPaciente}>
              <div className="agenda-form-grid">
                <label>
                  <span>Nome *</span>
                  <input
                    type="text"
                    required
                    value={formPaciente.nome}
                    onChange={(e) => setFormPaciente({ ...formPaciente, nome: e.target.value })}
                    placeholder="Primeiro nome"
                  />
                </label>
                <label>
                  <span>Sobrenome</span>
                  <input
                    type="text"
                    value={formPaciente.sobrenome}
                    onChange={(e) => setFormPaciente({ ...formPaciente, sobrenome: e.target.value })}
                    placeholder="Sobrenome"
                  />
                </label>
              </div>

              <div className="agenda-form-grid">
                <label>
                  <span>Telefone / WhatsApp</span>
                  <input
                    type="text"
                    value={formPaciente.telefone}
                    onChange={(e) => setFormPaciente({ ...formPaciente, telefone: e.target.value })}
                    placeholder="(11) 98765-4321"
                  />
                </label>
                <label>
                  <span>E-mail</span>
                  <input
                    type="email"
                    value={formPaciente.email}
                    onChange={(e) => setFormPaciente({ ...formPaciente, email: e.target.value })}
                    placeholder="paciente@exemplo.com"
                  />
                </label>
              </div>

              <div className="agenda-form-grid">
                <label>
                  <span>CPF</span>
                  <input
                    type="text"
                    value={formPaciente.cpf}
                    onChange={(e) => setFormPaciente({ ...formPaciente, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </label>
                <label>
                  <span>Status</span>
                  <select
                    value={formPaciente.status}
                    onChange={(e) => setFormPaciente({ ...formPaciente, status: e.target.value })}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </label>
              </div>

              <div className="agenda-modal-footer">
                <button type="button" className="dashboard-secondary-button" onClick={() => setModalPacienteAberto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="dashboard-primary-button">
                  Salvar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA EVOLUÇÃO CLÍNICA */}
      {modalProntuarioAberto && (
        <div className="agenda-modal-backdrop" onClick={() => setModalProntuarioAberto(false)}>
          <div className="agenda-modal" style={{ maxWidth: "560px" }} onClick={(e) => e.stopPropagation()}>
            <div className="agenda-modal-header">
              <div>
                <span className="dashboard-kicker">Prontuário Confidencial</span>
                <h2>Registrar Evolução Clínica</h2>
              </div>
              <button type="button" onClick={() => setModalProntuarioAberto(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleSalvarProntuario}>
              <div className="agenda-form-grid">
                <label>
                  <span>Data da Sessão *</span>
                  <input
                    type="date"
                    required
                    value={formProntuario.data_sessao}
                    onChange={(e) => setFormProntuario({ ...formProntuario, data_sessao: e.target.value })}
                  />
                </label>
                <label>
                  <span>Título / Sessão</span>
                  <input
                    type="text"
                    value={formProntuario.titulo}
                    onChange={(e) => setFormProntuario({ ...formProntuario, titulo: e.target.value })}
                    placeholder="Ex: Sessão #5 - Reavaliação"
                  />
                </label>
              </div>

              <label>
                <span>Evolução Clínica / Anotações Terapêuticas *</span>
                <textarea
                  rows="5"
                  required
                  value={formProntuario.evolucao}
                  onChange={(e) => setFormProntuario({ ...formProntuario, evolucao: e.target.value })}
                  placeholder="Relato do estado emocional, intervenções e resposta do paciente..."
                />
              </label>

              <label>
                <span>Metas Terapêuticas & Combinados</span>
                <textarea
                  rows="2"
                  value={formProntuario.metas_terapeuticas}
                  onChange={(e) => setFormProntuario({ ...formProntuario, metas_terapeuticas: e.target.value })}
                  placeholder="Exercícios e metas para a próxima sessão..."
                />
              </label>

              <div className="agenda-modal-footer">
                <button type="button" className="dashboard-secondary-button" onClick={() => setModalProntuarioAberto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="dashboard-primary-button">
                  Salvar Evolução
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pacientes;
