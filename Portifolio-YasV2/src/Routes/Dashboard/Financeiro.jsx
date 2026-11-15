import { useState } from "react";
import { api } from "../../services/api";
import { useToast } from "../../contexts/useToast";
import "./financeiro.css";

const mesesNomes = [
  { id: 1, nome: "Janeiro" },
  { id: 2, nome: "Fevereiro" },
  { id: 3, nome: "Março" },
  { id: 4, nome: "Abril" },
  { id: 5, nome: "Maio" },
  { id: 6, nome: "Junho" },
  { id: 7, nome: "Julho" },
  { id: 8, nome: "Agosto" },
  { id: 9, nome: "Setembro" },
  { id: 10, nome: "Outubro" },
  { id: 11, nome: "Novembro" },
  { id: 12, nome: "Dezembro" },
];

const formatarMoeda = (valor) => {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

function Financeiro() {
  const toast = useToast();

  // ATENÇÃO À REGRA ESTRITA: Os filtros iniciam sem nenhuma seleção automática!
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAno, setFiltroAno] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("");

  // Estados de controle de requisição e dados
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  // Dados consolidados retornados pelo backend
  const [dadosFinanceiros, setDadosFinanceiros] = useState({
    receitas: 0,
    despesas: 0,
    saldo: 0,
    movimentacoes: [],
    historico: [],
  });

  // Modal para cadastro de nova movimentação
  const [modalAberto, setModalAberto] = useState(false);
  const [novaMovimentacao, setNovaMovimentacao] = useState({
    descricao: "",
    tipo: "receita",
    valor: "",
    data: new Date().toISOString().slice(0, 10),
    categoria: "Atendimentos",
  });

  /**
   * Consulta as informações financeiras somente após escolha manual do usuário
   */
  const handleConsultar = async (event) => {
    if (event) event.preventDefault();

    if (!filtroMes && !filtroAno && !filtroPeriodo) {
      toast.required("Selecione pelo menos um critério (Mês, Ano ou Período) para consultar.");
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const resp = await api.getFinanceiro({
        mes: filtroMes,
        ano: filtroAno,
        periodo: filtroPeriodo,
      });

      if (resp && resp.filtros_aplicados) {
        setDadosFinanceiros({
          receitas: resp.receitas || 0,
          despesas: resp.despesas || 0,
          saldo: resp.saldo || 0,
          movimentacoes: resp.movimentacoes || [],
          historico: resp.historico || [],
        });
        setFiltrosAplicados(true);
      } else {
        setFiltrosAplicados(false);
      }
    } catch {
      setErro("Não foi possível carregar as informações financeiras. Tente novamente.");
      toast.error("Não foi possível carregar as informações. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  /**
   * Limpa os filtros retornando ao estado inicial
   */
  const handleLimparFiltros = () => {
    setFiltroMes("");
    setFiltroAno("");
    setFiltroPeriodo("");
    setFiltrosAplicados(false);
    setDadosFinanceiros({
      receitas: 0,
      despesas: 0,
      saldo: 0,
      movimentacoes: [],
      historico: [],
    });
    setErro(null);
  };

  /**
   * Cadastra nova movimentação manual (Receita ou Despesa)
   */
  const handleSalvarMovimentacao = async (event) => {
    event.preventDefault();

    if (!novaMovimentacao.descricao.trim() || !novaMovimentacao.valor || !novaMovimentacao.data) {
      toast.required("Preencha todos os campos obrigatórios.");
      return;
    }

    toast.saving();

    try {
      await api.createMovimentacao({
        descricao: novaMovimentacao.descricao,
        tipo: novaMovimentacao.tipo,
        valor: parseFloat(novaMovimentacao.valor),
        data: novaMovimentacao.data,
        categoria: novaMovimentacao.categoria,
      });

      toast.success("Alterações salvas com sucesso!");
      setModalAberto(false);

      // Reseta form
      setNovaMovimentacao({
        descricao: "",
        tipo: "receita",
        valor: "",
        data: new Date().toISOString().slice(0, 10),
        categoria: "Atendimentos",
      });

      // Se houver filtros ativos, recarrega a consulta atual
      if (filtrosAplicados) {
        handleConsultar();
      }
    } catch {
      toast.error("Não foi possível salvar as alterações. Tente novamente.");
    }
  };

  /**
   * Exclui uma movimentação financeira
   */
  const handleExcluirMovimentacao = async (id) => {
    if (!window.confirm("Deseja realmente excluir este registro financeiro?")) {
      return;
    }

    toast.saving();

    try {
      await api.deleteMovimentacao(id);
      toast.success("Alterações salvas com sucesso!");
      handleConsultar();
    } catch {
      toast.error("Não foi possível salvar as alterações. Tente novamente.");
    }
  };

  const maiorReceitaHistorico = Math.max(
    ...dadosFinanceiros.historico.map((h) => h.receitas),
    1
  );

  return (
    <div className="dashboard-page financeiro-page">
      {/* Cabeçalho */}
      <div className="financeiro-page-heading">
        <div>
          <span className="dashboard-kicker">Gestão Financeira</span>
          <h1>Visão financeira<span>.</span></h1>
          <p>Acompanhamento de receitas, despesas e saldo real do consultório.</p>
        </div>

        <button
          className="dashboard-primary-button"
          type="button"
          onClick={() => setModalAberto(true)}
        >
          <i className="bi bi-plus-lg" aria-hidden="true" /> Nova movimentação
        </button>
      </div>

      {/* BARRA DE FILTROS MANUAIS (INICIA SEM SELEÇÃO AUTOMÁTICA) */}
      <form className="financeiro-filter-bar" onSubmit={handleConsultar}>
        <div className="financeiro-filter-item">
          <label htmlFor="filtro-mes">Mês</label>
          <select
            id="filtro-mes"
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
          >
            <option value="">Selecione o mês</option>
            {mesesNomes.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="financeiro-filter-item">
          <label htmlFor="filtro-ano">Ano</label>
          <select
            id="filtro-ano"
            value={filtroAno}
            onChange={(e) => setFiltroAno(e.target.value)}
          >
            <option value="">Selecione o ano</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>

        <div className="financeiro-filter-item">
          <label htmlFor="filtro-periodo">Período</label>
          <select
            id="filtro-periodo"
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value)}
          >
            <option value="">Selecione o período</option>
            <option value="mes">Mês específico</option>
            <option value="trimestre">Trimestre</option>
            <option value="semestre">Semestre</option>
            <option value="ano">Ano completo</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button className="dashboard-primary-button" type="submit" disabled={carregando}>
            {carregando ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                Consultando...
              </>
            ) : (
              <>
                <i className="bi bi-funnel" aria-hidden="true" /> Consultar
              </>
            )}
          </button>

          {filtrosAplicados && (
            <button
              className="dashboard-secondary-button"
              type="button"
              onClick={handleLimparFiltros}
            >
              Limpar
            </button>
          )}
        </div>
      </form>

      {/* ESTADO VISUAL 1: ERRO AO CARREGAR INFORMAÇÕES */}
      {erro && (
        <div className="alert alert-danger mb-4 py-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          {erro}
        </div>
      )}

      {/* ESTADO VISUAL 2: NENHUM FILTRO SELECIONADO */}
      {!filtrosAplicados && !carregando && (
        <div className="dashboard-panel financeiro-empty-state">
          <i className="bi bi-filter-circle" />
          <h3 className="fw-semibold text-dark mb-2">Nenhum filtro selecionado</h3>
          <p className="mb-0" style={{ maxWidth: "520px", margin: "0 auto" }}>
            Os registros financeiros não são carregados automaticamente. Escolha o <strong>Mês</strong>,{" "}
            <strong>Ano</strong> e/ou <strong>Período</strong> desejado nos filtros acima e clique em{" "}
            <strong>Consultar</strong> para visualizar os dados.
          </p>
        </div>
      )}

      {/* ESTADO VISUAL 3: CARREGANDO */}
      {carregando && (
        <div className="dashboard-panel financeiro-empty-state">
          <span className="spinner-border text-secondary mb-3" style={{ width: "2.5rem", height: "2.5rem" }} role="status" />
          <p className="mb-0 fw-medium">Consultando registros financeiros no banco de dados...</p>
        </div>
      )}

      {/* ESTADO VISUAL 4 & 5: RESULTADO DA CONSULTA OU NENHUMA MOVIMENTAÇÃO ENCONTRADA */}
      {filtrosAplicados && !carregando && (
        <>
          {/* CARDS DE RESUMO: RECEITAS, DESPESAS E SALDO */}
          <div className="financeiro-stat-grid" style={{ marginBottom: "24px" }}>
            <article className="financeiro-stat-card">
              <span className="financeiro-stat-label">Total de Receitas</span>
              <strong className="financeiro-stat-value text-success">
                {formatarMoeda(dadosFinanceiros.receitas)}
              </strong>
              <small className="financeiro-stat-change">Entradas registradas</small>
            </article>

            <article className="financeiro-stat-card">
              <span className="financeiro-stat-label">Total de Despesas</span>
              <strong className="financeiro-stat-value text-danger">
                {formatarMoeda(dadosFinanceiros.despesas)}
              </strong>
              <small className="financeiro-stat-change">Saídas operacionais</small>
            </article>

            <article className="financeiro-stat-card">
              <span className="financeiro-stat-label">Saldo do Período</span>
              <strong
                className={`financeiro-stat-value ${
                  dadosFinanceiros.saldo >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {formatarMoeda(dadosFinanceiros.saldo)}
              </strong>
              <small className="financeiro-stat-change">Receitas - Despesas</small>
            </article>
          </div>

          {/* GRÁFICO HISTÓRICO DOS ÚLTIMOS MESES */}
          {dadosFinanceiros.historico.length > 0 && (
            <section className="dashboard-panel mb-4" style={{ padding: "24px" }}>
              <div className="dashboard-panel-heading">
                <div>
                  <span className="dashboard-kicker">Desempenho</span>
                  <h2>Histórico de movimentações dos últimos meses</h2>
                </div>
              </div>

              <div className="financeiro-chart">
                {dadosFinanceiros.historico.map((h, idx) => (
                  <div className="financeiro-chart-column" key={`hist-${idx}`}>
                    <span className="financeiro-chart-value">{formatarMoeda(h.receitas)}</span>
                    <div className="financeiro-chart-track">
                      <div
                        className="financeiro-chart-bar"
                        style={{
                          height: `${Math.max(6, (h.receitas / maiorReceitaHistorico) * 100)}%`,
                        }}
                        title={`Receitas: ${formatarMoeda(h.receitas)} | Despesas: ${formatarMoeda(h.despesas)}`}
                      />
                    </div>
                    <span>{h.mes}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* LISTAGEM DAS MOVIMENTAÇÕES OU EMPTY STATE DE NENHUMA MOVIMENTAÇÃO */}
          {dadosFinanceiros.movimentacoes.length === 0 ? (
            <div className="dashboard-panel financeiro-empty-state">
              <i className="bi bi-wallet2" />
              <h3 className="fw-semibold text-dark mb-2">Nenhuma movimentação encontrada</h3>
              <p className="mb-0">
                Não foram encontrados lançamentos financeiros com os filtros selecionados.
              </p>
            </div>
          ) : (
            <section className="dashboard-panel" style={{ padding: "24px" }}>
              <div className="dashboard-panel-heading">
                <div>
                  <span className="dashboard-kicker">Registros</span>
                  <h2>Listagem das movimentações ({dadosFinanceiros.movimentacoes.length})</h2>
                </div>
              </div>

              <div className="dashboard-table-wrap">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Identificador</th>
                      <th>Descrição</th>
                      <th>Tipo</th>
                      <th>Categoria</th>
                      <th>Data</th>
                      <th>Valor</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dadosFinanceiros.movimentacoes.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <span className="text-secondary small fw-medium">#{item.id}</span>
                        </td>
                        <td>
                          <strong>{item.descricao}</strong>
                        </td>
                        <td>
                          <span
                            className={`financeiro-badge ${
                              item.tipo === "receita"
                                ? "financeiro-badge-receita"
                                : "financeiro-badge-despesa"
                            }`}
                          >
                            {item.tipo === "receita" ? "Receita" : "Despesa"}
                          </span>
                        </td>
                        <td>
                          <span className="small text-muted">{item.categoria}</span>
                        </td>
                        <td>
                          <span className="small text-muted">
                            {new Date(item.data).toLocaleDateString("pt-BR")}
                          </span>
                        </td>
                        <td>
                          <strong
                            className={
                              item.tipo === "receita" ? "text-success" : "text-danger"
                            }
                          >
                            {item.tipo === "receita" ? "+" : "-"} {formatarMoeda(item.valor)}
                          </strong>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm text-danger p-0"
                            onClick={() => handleExcluirMovimentacao(item.id)}
                            title="Excluir movimentação"
                            aria-label={`Excluir ${item.descricao}`}
                          >
                            <i className="bi bi-trash3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      {/* MODAL: NOVA MOVIMENTAÇÃO (RECEITA OU DESPESA) */}
      {modalAberto && (
        <div
          className="dashboard-modal-backdrop"
          role="presentation"
          onClick={() => setModalAberto(false)}
        >
          <div
            className="dashboard-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="financeiro-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dashboard-panel-heading">
              <div>
                <span className="dashboard-kicker">Lançamento Financeiro</span>
                <h2 id="financeiro-modal-title">Nova movimentação</h2>
              </div>
              <button
                className="dashboard-close-button"
                type="button"
                onClick={() => setModalAberto(false)}
                aria-label="Fechar"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form className="dashboard-form" onSubmit={handleSalvarMovimentacao}>
              {/* Tipo */}
              <div className="dashboard-form-group">
                <label htmlFor="mov-tipo">Tipo de movimentação *</label>
                <select
                  id="mov-tipo"
                  value={novaMovimentacao.tipo}
                  onChange={(e) =>
                    setNovaMovimentacao({ ...novaMovimentacao, tipo: e.target.value })
                  }
                  required
                >
                  <option value="receita">Receita (Entrada)</option>
                  <option value="despesa">Despesa (Saída)</option>
                </select>
              </div>

              {/* Descrição */}
              <div className="dashboard-form-group">
                <label htmlFor="mov-descricao">Descrição da movimentação *</label>
                <input
                  id="mov-descricao"
                  type="text"
                  placeholder="Ex.: Sessão de Psicoterapia - Beatriz"
                  value={novaMovimentacao.descricao}
                  onChange={(e) =>
                    setNovaMovimentacao({ ...novaMovimentacao, descricao: e.target.value })
                  }
                  required
                />
              </div>

              <div className="dashboard-form-grid">
                {/* Valor */}
                <div className="dashboard-form-group">
                  <label htmlFor="mov-valor">Valor (R$) *</label>
                  <input
                    id="mov-valor"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="180.00"
                    value={novaMovimentacao.valor}
                    onChange={(e) =>
                      setNovaMovimentacao({ ...novaMovimentacao, valor: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Data */}
                <div className="dashboard-form-group">
                  <label htmlFor="mov-data">Data *</label>
                  <input
                    id="mov-data"
                    type="date"
                    value={novaMovimentacao.data}
                    onChange={(e) =>
                      setNovaMovimentacao({ ...novaMovimentacao, data: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Categoria */}
              <div className="dashboard-form-group">
                <label htmlFor="mov-categoria">Categoria *</label>
                <select
                  id="mov-categoria"
                  value={novaMovimentacao.categoria}
                  onChange={(e) =>
                    setNovaMovimentacao({ ...novaMovimentacao, categoria: e.target.value })
                  }
                  required
                >
                  <option value="Atendimentos">Atendimentos Clínicos</option>
                  <option value="Consultório">Aluguel / Consultório</option>
                  <option value="Supervisão">Supervisão Clínica / Cursos</option>
                  <option value="Software">Software / Plataforma</option>
                  <option value="Material Clínico">Material Clínico / Testes</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="dashboard-form-actions">
                <button
                  type="button"
                  className="dashboard-secondary-button"
                  onClick={() => setModalAberto(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="dashboard-primary-button">
                  Salvar movimentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Financeiro;
