import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../../../services/api";
import { useToast } from "../../../contexts/useToast";

function AdminConfig() {
  const toast = useToast();
  const navigate = useNavigate();

  const [psicologos, setPsicologos] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalNovoAberto, setModalNovoAberto] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    crp: "",
    telefone: "",
    role: "psicologo",
  });

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [psicoData, statsData] = await Promise.all([
        api.getAdminPsicologos(),
        api.getAdminEstatisticas().catch(() => null),
      ]);

      if (psicoData && psicoData.psicologos) {
        setPsicologos(psicoData.psicologos);
      }
      if (statsData) {
        setEstatisticas(statsData);
      }
    } catch (err) {
      console.warn("Falha ao carregar dados administrativos:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Alternar para perspectiva do psicólogo (Impersonation)
  const handleImpersonar = (psicologo) => {
    api.setImpersonate(psicologo.id, psicologo.name);
    toast.success(`Visualizando sistema na perspectiva de ${psicologo.name}`);
    setTimeout(() => {
      navigate("/dashboard/geral");
      window.location.reload();
    }, 400);
  };

  const handleToggleStatus = async (psicologo) => {
    toast.saving();
    try {
      const resp = await api.togglePsicologoStatus(psicologo.id);
      toast.success(resp.message || "Status alterado com sucesso!");
      carregarDados();
    } catch (err) {
      toast.error(err.message || "Erro ao alterar status do profissional.");
    }
  };

  const handleCriarPsicologo = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.required("Preencha todos os campos obrigatórios.");
      return;
    }

    toast.saving();
    try {
      await api.createAdminPsicologo(formData);
      toast.success("Psicólogo cadastrado com sucesso!");
      setModalNovoAberto(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        crp: "",
        telefone: "",
        role: "psicologo",
      });
      carregarDados();
    } catch (err) {
      toast.error(err.message || "Erro ao cadastrar psicólogo.");
    }
  };

  return (
    <div style={{ marginTop: "12px" }}>
      {/* Indicadores Gerais da Clínica */}
      {estatisticas && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "24px" }}>
          <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid var(--dashboard-line)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--dashboard-muted)", textTransform: "uppercase", fontWeight: 600 }}>
              Psicólogos Ativos
            </span>
            <strong style={{ display: "block", fontSize: "1.4rem", color: "var(--dashboard-ink)", marginTop: "4px" }}>
              {estatisticas.total_psicologos_ativos}
            </strong>
          </div>
          <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid var(--dashboard-line)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--dashboard-muted)", textTransform: "uppercase", fontWeight: 600 }}>
              Pacientes Cadastrados
            </span>
            <strong style={{ display: "block", fontSize: "1.4rem", color: "var(--dashboard-ink)", marginTop: "4px" }}>
              {estatisticas.total_pacientes_ativos}
            </strong>
          </div>
          <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid var(--dashboard-line)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--dashboard-muted)", textTransform: "uppercase", fontWeight: 600 }}>
              Consultas na Clínica Hoje
            </span>
            <strong style={{ display: "block", fontSize: "1.4rem", color: "var(--dashboard-ink)", marginTop: "4px" }}>
              {estatisticas.consultas_hoje_total}
            </strong>
          </div>
          <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid var(--dashboard-line)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--dashboard-muted)", textTransform: "uppercase", fontWeight: 600 }}>
              Faturamento Anual Global
            </span>
            <strong style={{ display: "block", fontSize: "1.4rem", color: "var(--dashboard-accent)", marginTop: "4px" }}>
              {Number(estatisticas.receitas_ano_clinica || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </strong>
          </div>
        </div>
      )}

      {/* Cabeçalho da Seção de Psicólogos */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ fontSize: "1.15rem", margin: 0, color: "var(--dashboard-ink)" }}>
            Corpo Clínico & Usuários
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--dashboard-muted)" }}>
            Gerencie o acesso dos profissionais e visualize o sistema na perspectiva de cada um.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-primary-button"
          onClick={() => setModalNovoAberto(true)}
        >
          <i className="bi bi-person-plus me-1" /> Cadastrar Psicólogo
        </button>
      </div>

      {/* Tabela de Psicólogos */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid var(--dashboard-line)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ background: "var(--dashboard-background)", borderBottom: "1px solid var(--dashboard-line)" }}>
              <th style={{ padding: "12px 16px" }}>Profissional</th>
              <th style={{ padding: "12px 16px" }}>Função</th>
              <th style={{ padding: "12px 16px" }}>CRP</th>
              <th style={{ padding: "12px 16px" }}>Pacientes</th>
              <th style={{ padding: "12px 16px" }}>Agendamentos</th>
              <th style={{ padding: "12px 16px" }}>Status</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Ações & Perspectiva</th>
            </tr>
          </thead>
          <tbody>
            {psicologos.map((psico) => (
              <tr key={psico.id} style={{ borderBottom: "1px solid var(--dashboard-line)" }}>
                <td style={{ padding: "14px 16px" }}>
                  <strong style={{ display: "block", color: "var(--dashboard-ink)" }}>{psico.name}</strong>
                  <span style={{ fontSize: "0.78rem", color: "var(--dashboard-muted)" }}>{psico.email}</span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      background: psico.role === "admin" ? "#eed9c4" : "#e3e9d8",
                      color: psico.role === "admin" ? "#735d43" : "#465335",
                      textTransform: "uppercase",
                    }}
                  >
                    {psico.role === "admin" ? "Administrador" : "Psicólogo"}
                  </span>
                </td>
                <td style={{ padding: "14px 16px" }}>{psico.crp || "Não informado"}</td>
                <td style={{ padding: "14px 16px" }}>{psico.pacientes_count ?? 0}</td>
                <td style={{ padding: "14px 16px" }}>{psico.agendamentos_count ?? 0}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span className={`badge-status ${psico.is_active ? "ativo" : "cancelado"}`}>
                    {psico.is_active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: "8px" }}>
                    {/* BOTÃO DE VISUALIZAÇÃO NA PERSPECTIVA */}
                    <button
                      type="button"
                      onClick={() => handleImpersonar(psico)}
                      style={{
                        background: "var(--dashboard-accent)",
                        color: "#fff",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                      title="Visualizar o sistema como este psicólogo"
                    >
                      <i className="bi bi-eye" /> Ver como
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(psico)}
                      className="dashboard-secondary-button"
                      style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                      title={psico.is_active ? "Desativar conta" : "Ativar conta"}
                    >
                      <i className={`bi ${psico.is_active ? "bi-person-x" : "bi-person-check"}`} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Cadastro de Psicólogo */}
      {modalNovoAberto && (
        <div className="agenda-modal-backdrop" onClick={() => setModalNovoAberto(false)}>
          <div className="agenda-modal" onClick={(e) => e.stopPropagation()}>
            <div className="agenda-modal-header">
              <div>
                <span className="dashboard-kicker">Gestão de Usuários</span>
                <h2>Cadastrar Novo Psicólogo</h2>
              </div>
              <button type="button" onClick={() => setModalNovoAberto(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleCriarPsicologo}>
              <label>
                <span>Nome completo *</span>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Dr. Roberto Martins"
                />
              </label>

              <div className="agenda-form-grid">
                <label>
                  <span>E-mail profissional *</span>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="exemplo@lumina.com"
                  />
                </label>
                <label>
                  <span>Senha de acesso *</span>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mínimo 6 dígitos"
                  />
                </label>
              </div>

              <div className="agenda-form-grid">
                <label>
                  <span>CRP</span>
                  <input
                    type="text"
                    value={formData.crp}
                    onChange={(e) => setFormData({ ...formData, crp: e.target.value })}
                    placeholder="06/123456"
                  />
                </label>
                <label>
                  <span>Telefone</span>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(11) 98765-4321"
                  />
                </label>
              </div>

              <div className="agenda-modal-footer">
                <button
                  type="button"
                  className="dashboard-secondary-button"
                  onClick={() => setModalNovoAberto(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="dashboard-primary-button">
                  Cadastrar profissional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminConfig;
