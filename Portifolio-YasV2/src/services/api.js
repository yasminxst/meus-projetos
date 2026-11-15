/**
 * Serviço de Integração com a API Backend Lumina (api.js)
 * 
 * Centraliza as requisições HTTP para o backend Laravel (sistema-psico).
 * Responsável por:
 * 1. Definir a URL base do servidor backend (porta 8000).
 * 2. Injetar automaticamente o cabeçalho Authorization com o Bearer Token quando autenticado.
 * 3. Tratar erros de requisição e converter respostas JSON.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/**
 * Função utilitária para requisições fetch com autenticação e tratamento de JSON.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Recupera o token de autenticação salvo na sessão do navegador
  const token = sessionStorage.getItem("lumina-token") || localStorage.getItem("lumina-token");

  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Se houver um token, anexa ao cabeçalho Authorization no padrão Bearer
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
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

    // Se o backend responder com código de erro (4xx ou 5xx)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `Erro na requisição (${response.status}): ${response.statusText}`;
      throw new Error(message);
    }

    // Se a resposta for 204 No Content (ex: após exclusão)
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
  // 1. AUTENTICAÇÃO
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
    } catch {
      // Ignora erro ao deslogar
    } finally {
      sessionStorage.removeItem("lumina-token");
      sessionStorage.removeItem("lumina-authenticated");
      sessionStorage.removeItem("lumina-user");
    }
  },

  async getMe() {
    return await request("/me");
  },

  // ==========================================
  // 2. DASHBOARD — AMBIENTE GERAL
  // ==========================================

  /**
   * Retorna os 4 indicadores reais e a seção de últimas atualizações da agenda.
   */
  async getDashboard() {
    return await request("/dashboard");
  },

  /**
   * Alias para getDashboard
   */
  async getDashboardStats() {
    return await request("/dashboard");
  },

  /**
   * Busca as últimas atualizações da agenda separadamente se necessário.
   */
  async getDashboardUpdates() {
    return await request("/dashboard/updates");
  },

  // ==========================================
  // 3. ATIVIDADES — AGENDA
  // ==========================================

  /**
   * Consulta a Agenda Geral (mensal com calendário e mapa de dias).
   */
  async getAgenda(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/agenda?${query}` : "/agenda";
    return await request(endpoint);
  },

  /**
   * Consulta a Agenda Diária para um dia específico (com destaques dos 3 mais próximos).
   */
  async getAgendaDia(dataStr) {
    return await request(`/agenda/dia?data=${encodeURIComponent(dataStr)}`);
  },

  /**
   * Retorna as categorias disponíveis da agenda e suas cores para a legenda.
   */
  async getCategorias() {
    return await request("/agenda/categorias");
  },

  /**
   * Cadastra um novo evento na agenda.
   */
  async createEvento(dados) {
    return await request("/agenda/eventos", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  /**
   * Edita um evento existente na agenda.
   */
  async updateEvento(id, dados) {
    return await request(`/agenda/eventos/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  /**
   * Exclui um evento da agenda.
   */
  async deleteEvento(id) {
    return await request(`/agenda/eventos/${id}`, {
      method: "DELETE",
    });
  },

  // Compatibilidade retroativa
  async getAgendamentos(params = {}) {
    return this.getAgenda(params);
  },
  async createAgendamento(dados) {
    return this.createEvento(dados);
  },
  async deleteAgendamento(id) {
    return this.deleteEvento(id);
  },

  // ==========================================
  // 4. FINANCEIRO
  // ==========================================

  /**
   * Consulta as movimentações financeiras com base nos filtros manuais do usuário.
   */
  async getFinanceiro(filtros = {}) {
    const query = new URLSearchParams();
    if (filtros.mes !== undefined && filtros.mes !== null && filtros.mes !== "") {
      query.append("mes", filtros.mes);
    }
    if (filtros.ano !== undefined && filtros.ano !== null && filtros.ano !== "") {
      query.append("ano", filtros.ano);
    }
    if (filtros.periodo) {
      query.append("periodo", filtros.periodo);
    }

    const endpoint = query.toString() ? `/financeiro?${query.toString()}` : "/financeiro";
    return await request(endpoint);
  },

  /**
   * Cadastra uma nova movimentação financeira (receita ou despesa).
   */
  async createMovimentacao(dados) {
    return await request("/financeiro", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  /**
   * Remove uma movimentação financeira pelo ID.
   */
  async deleteMovimentacao(id) {
    return await request(`/financeiro/${id}`, {
      method: "DELETE",
    });
  },

  // ==========================================
  // 5. CONFIGURAÇÕES — PERFIL PROFISSIONAL
  // ==========================================

  /**
   * Retorna os dados do perfil profissional (CRP, telefone, bio, foto, nome, email).
   */
  async getPerfil() {
    return await request("/perfil");
  },

  /**
   * Salva as alterações no perfil profissional.
   */
  async updatePerfil(dados) {
    return await request("/perfil", {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  // ==========================================
  // 6. PROJETOS (CRUD COMPLETO)
  // ==========================================

  async getProjetos(publicadosApenas = false) {
    const endpoint = publicadosApenas ? "/projetos?publicados_apenas=1" : "/projetos";
    return await request(endpoint);
  },

  async createProjeto(dados) {
    return await request("/projetos", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  async updateProjeto(id, dados) {
    return await request(`/projetos/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  async deleteProjeto(id) {
    return await request(`/projetos/${id}`, {
      method: "DELETE",
    });
  },
};
