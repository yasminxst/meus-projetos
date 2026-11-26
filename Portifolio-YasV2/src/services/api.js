/**
 * Serviço de Integração com a API Backend Lumina (api.js)
 * 
 * Centraliza as requisições HTTP para o backend Laravel (sistema-psico).
 * Responsável por:
 * 1. Definir a URL base do servidor backend.
 * 2. Injetar automaticamente o cabeçalho Authorization Bearer Token.
 * 3. Injetar o cabeçalho X-Impersonate-User-Id quando o administrador visualiza na perspectiva de outro psicólogo.
 * 4. Métodos para Dashboard, Agenda (Mensal e Semanal), Financeiro, Pacientes, Prontuário, Produtos, Ajustes de Conta e Administração.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/**
 * Função utilitária para requisições fetch com autenticação e tratamento de JSON.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Recupera o token de autenticação e o ID de impersonação
  const token = sessionStorage.getItem("lumina-token") || localStorage.getItem("lumina-token");
  const impersonateId = sessionStorage.getItem("lumina-impersonate-id");

  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  if (impersonateId) {
    defaultHeaders["X-Impersonate-User-Id"] = impersonateId;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `Erro na requisição (${response.status}): ${response.statusText}`;
      throw new Error(message);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`[API Error] Falha ao comunicar com ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // ==========================================
  // 1. AUTENTICAÇÃO E AJUSTES DE CONTA
  // ==========================================
  async login(email, password) {
    const data = await request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      sessionStorage.setItem("lumina-token", data.token);
      sessionStorage.setItem("lumina-authenticated", "true");
      sessionStorage.setItem("lumina-user", JSON.stringify(data.user));
    }

    return data;
  },

  async logout() {
    try {
      await request("/logout", { method: "POST" });
    } finally {
      sessionStorage.removeItem("lumina-token");
      sessionStorage.removeItem("lumina-authenticated");
      sessionStorage.removeItem("lumina-user");
      sessionStorage.removeItem("lumina-impersonate-id");
      sessionStorage.removeItem("lumina-impersonate-name");
    }
  },

  async getMe() {
    return await request("/me");
  },

  async atualizarSenha(dados) {
    return await request("/conta/senha", {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  async atualizarEmail(email) {
    return await request("/conta/email", {
      method: "PUT",
      body: JSON.stringify({ email }),
    });
  },

  // Impersonation (Visualização como outro psicólogo)
  setImpersonate(id, name) {
    if (id) {
      sessionStorage.setItem("lumina-impersonate-id", String(id));
      sessionStorage.setItem("lumina-impersonate-name", name || "Psicólogo");
    } else {
      this.clearImpersonate();
    }
  },

  clearImpersonate() {
    sessionStorage.removeItem("lumina-impersonate-id");
    sessionStorage.removeItem("lumina-impersonate-name");
  },

  getImpersonate() {
    const id = sessionStorage.getItem("lumina-impersonate-id");
    const name = sessionStorage.getItem("lumina-impersonate-name");
    return id ? { id, name } : null;
  },

  // ==========================================
  // 2. DASHBOARD
  // ==========================================
  async getDashboard() {
    return await request("/dashboard");
  },

  async getAlertas() {
    return await request("/dashboard/alertas");
  },

  // ==========================================
  // 3. AGENDA (MENSAL, SEMANAL E DIÁRIA)
  // ==========================================
  async getAgenda(mes, ano) {
    const params = new URLSearchParams();
    if (mes !== undefined && mes !== null) params.append("mes", mes);
    if (ano) params.append("ano", ano);
    return await request(`/agenda?${params.toString()}`);
  },

  async getAgendaSemanal(dataRef) {
    const params = new URLSearchParams();
    if (dataRef) params.append("data", dataRef);
    return await request(`/agenda/semana?${params.toString()}`);
  },

  async getAgendaDia(data) {
    return await request(`/agenda/dia?data=${encodeURIComponent(data)}`);
  },

  async getCategorias() {
    return await request("/agenda/categorias");
  },

  async createEvento(dados) {
    return await request("/agenda/eventos", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  async createEventoRecorrente(dados) {
    return await request("/agenda/recorrencia", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  async registrarProntuarioAgendamento(agendamentoId, dados) {
    return await request(`/agenda/eventos/${agendamentoId}/prontuario`, {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  async updateEvento(id, dados) {
    return await request(`/agenda/eventos/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  async deleteEvento(id, escopo = "individual") {
    return await request(`/agenda/eventos/${id}?escopo=${escopo}`, {
      method: "DELETE",
    });
  },

  // ==========================================
  // 4. PACIENTES & PRONTUÁRIOS
  // ==========================================
  async getPacientes() {
    return await request("/pacientes");
  },

  async getPaciente(id) {
    return await request(`/pacientes/${id}`);
  },

  async createPaciente(dados) {
    return await request("/pacientes", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  async updatePaciente(id, dados) {
    return await request(`/pacientes/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  async deletePaciente(id) {
    return await request(`/pacientes/${id}`, {
      method: "DELETE",
    });
  },

  async getProntuarios(pacienteId) {
    return await request(`/pacientes/${pacienteId}/prontuarios`);
  },

  async createProntuario(pacienteId, dados) {
    return await request(`/pacientes/${pacienteId}/prontuarios`, {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  async updateProntuario(id, dados) {
    return await request(`/prontuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  async deleteProntuario(id) {
    return await request(`/prontuarios/${id}`, {
      method: "DELETE",
    });
  },

  // ==========================================
  // 5. FINANCEIRO
  // ==========================================
  async getFinanceiro(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.mes) params.append("mes", filtros.mes);
    if (filtros.ano) params.append("ano", filtros.ano);
    if (filtros.periodo) params.append("periodo", filtros.periodo);
    return await request(`/financeiro?${params.toString()}`);
  },

  async createMovimentacao(dados) {
    return await request("/financeiro", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  async deleteMovimentacao(id) {
    return await request(`/financeiro/${id}`, {
      method: "DELETE",
    });
  },

  async getRecibo(agendamentoId) {
    return await request(`/financeiro/recibo/${agendamentoId}`);
  },

  getExportarCsvUrl(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.mes) params.append("mes", filtros.mes);
    if (filtros.ano) params.append("ano", filtros.ano);
    return `${API_BASE_URL}/financeiro/exportar?${params.toString()}`;
  },

  // ==========================================
  // 6. PRODUTOS E SERVIÇOS
  // ==========================================
  async getProdutos() {
    return await request("/produtos");
  },

  async createProduto(dados) {
    return await request("/produtos", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  async updateProduto(id, dados) {
    return await request(`/produtos/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  async deleteProduto(id) {
    return await request(`/produtos/${id}`, {
      method: "DELETE",
    });
  },

  // ==========================================
  // 7. CONFIGURAÇÕES & PERFIL
  // ==========================================
  async getPerfil() {
    return await request("/perfil");
  },

  async updatePerfil(dados) {
    return await request("/perfil", {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  // ==========================================
  // 8. ADMINISTRAÇÃO EXCLUSIVA
  // ==========================================
  async getAdminPsicologos() {
    return await request("/admin/psicologos");
  },

  async createAdminPsicologo(dados) {
    return await request("/admin/psicologos", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  async togglePsicologoStatus(id) {
    return await request(`/admin/psicologos/${id}/toggle-status`, {
      method: "PUT",
    });
  },

  async getAdminEstatisticas() {
    return await request("/admin/estatisticas-gerais");
  },

  // Projetos legado
  async getProjetos() {
    return await request("/projetos");
  },
};

export default api;
