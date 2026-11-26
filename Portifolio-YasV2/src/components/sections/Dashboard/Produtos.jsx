import { useEffect, useState } from "react";
import { api } from "../../../services/api";
import { useToast } from "../../../contexts/useToast";

const categoriasProduto = [
  "Curso",
  "E-book",
  "Palestra",
  "Mentoria",
  "Pacote de Sessões",
  "Outro",
];

function ProdutosContent() {
  const toast = useToast();
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    tipo: "E-book",
    preco: 0,
    descricao: "",
    status: "ativo",
    link_acesso: "",
  });

  const carregarProdutos = async () => {
    setLoading(true);
    try {
      const data = await api.getProdutos();
      if (Array.isArray(data)) {
        setProdutos(data);
      }
    } catch (err) {
      console.warn("Falha ao buscar produtos:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const openCreateModal = () => {
    setEditingProduto(null);
    setFormData({
      nome: "",
      tipo: "E-book",
      preco: 0,
      descricao: "",
      status: "ativo",
      link_acesso: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduto(prod);
    setFormData({
      nome: prod.nome || "",
      tipo: prod.tipo || "E-book",
      preco: prod.preco || 0,
      descricao: prod.descricao || "",
      status: prod.status || "ativo",
      link_acesso: prod.link_acesso || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      toast.required("O nome do produto é obrigatório.");
      return;
    }

    toast.saving();
    try {
      if (editingProduto) {
        await api.updateProduto(editingProduto.id, formData);
        toast.success("Produto atualizado com sucesso!");
      } else {
        await api.createProduto(formData);
        toast.success("Produto cadastrado com sucesso!");
      }
      setIsModalOpen(false);
      carregarProdutos();
    } catch {
      toast.error("Erro ao salvar produto. Tente novamente.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente remover este produto/serviço?")) return;
    toast.saving();
    try {
      await api.deleteProduto(id);
      toast.success("Produto excluído com sucesso!");
      carregarProdutos();
    } catch {
      toast.error("Erro ao excluir produto.");
    }
  };

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (p.tipo && p.tipo.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div style={{ marginTop: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.15rem", margin: 0, color: "var(--dashboard-ink)" }}>
            Produtos & Serviços Ofertados
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--dashboard-muted)" }}>
            Gerencie e-books, mentorias, palestras, cursos e pacotes do seu portfólio.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="search"
            placeholder="Buscar produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{
              padding: "7px 12px",
              borderRadius: "8px",
              border: "1px solid var(--dashboard-line)",
              fontSize: "0.82rem",
            }}
          />
          <button
            type="button"
            className="dashboard-primary-button"
            onClick={openCreateModal}
          >
            <i className="bi bi-plus-lg me-1" /> Novo produto
          </button>
        </div>
      </div>

      {/* Grade de Produtos */}
      {loading ? (
        <p style={{ color: "var(--dashboard-muted)", fontSize: "0.85rem" }}>Carregando produtos...</p>
      ) : produtosFiltrados.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {produtosFiltrados.map((prod) => (
            <div
              key={prod.id}
              style={{
                background: "#fff",
                border: "1px solid var(--dashboard-line)",
                borderRadius: "12px",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: "var(--dashboard-background)",
                      color: "var(--dashboard-accent)",
                    }}
                  >
                    {prod.tipo}
                  </span>
                  <span
                    className={`badge-status ${prod.status}`}
                    style={{ fontSize: "0.7rem", textTransform: "capitalize" }}
                  >
                    {prod.status}
                  </span>
                </div>

                <strong style={{ fontSize: "1rem", color: "var(--dashboard-ink)", display: "block" }}>
                  {prod.nome}
                </strong>
                <p style={{ fontSize: "0.8rem", color: "var(--dashboard-muted)", margin: "8px 0" }}>
                  {prod.descricao || "Sem descrição informada."}
                </p>
              </div>

              <div style={{ borderTop: "1px solid var(--dashboard-line)", paddingTop: "12px", marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <small style={{ color: "var(--dashboard-muted)", fontSize: "0.72rem" }}>Valor</small>
                  <strong style={{ display: "block", color: "var(--dashboard-ink)", fontSize: "1.05rem" }}>
                    {Number(prod.preco || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </strong>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => openEditModal(prod)}
                    className="dashboard-secondary-button"
                    style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                    title="Editar"
                  >
                    <i className="bi bi-pencil" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(prod.id)}
                    className="dashboard-secondary-button"
                    style={{ padding: "4px 8px", fontSize: "0.8rem", color: "#c94a4a" }}
                    title="Excluir"
                  >
                    <i className="bi bi-trash3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px 16px", background: "#fff", borderRadius: "12px", border: "1px dashed var(--dashboard-line)" }}>
          <i className="bi bi-box-seam" style={{ fontSize: "2rem", color: "var(--dashboard-muted)" }} />
          <p style={{ marginTop: "10px", color: "var(--dashboard-muted)", fontSize: "0.85rem" }}>
            Nenhum produto ou serviço cadastrado ainda.
          </p>
        </div>
      )}

      {/* Modal de Cadastro / Edição */}
      {isModalOpen && (
        <div className="agenda-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="agenda-modal" onClick={(e) => e.stopPropagation()}>
            <div className="agenda-modal-header">
              <div>
                <span className="dashboard-kicker">Produtos & Serviços</span>
                <h2>{editingProduto ? "Editar produto" : "Cadastrar novo produto"}</h2>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                <span>Nome do Produto / Serviço *</span>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: E-book de Ansiedade e Autocuidado"
                />
              </label>

              <div className="agenda-form-grid">
                <label>
                  <span>Categoria / Tipo *</span>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  >
                    {categoriasProduto.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Preço (R$) *</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                  />
                </label>
              </div>

              <div className="agenda-form-grid">
                <label>
                  <span>Status</span>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="rascunho">Rascunho</option>
                  </select>
                </label>

                <label>
                  <span>Link de Acesso / Material (opcional)</span>
                  <input
                    type="url"
                    value={formData.link_acesso}
                    onChange={(e) => setFormData({ ...formData, link_acesso: e.target.value })}
                    placeholder="https://..."
                  />
                </label>
              </div>

              <label>
                <span>Descrição detalhada</span>
                <textarea
                  rows="3"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva o conteúdo do produto, público-alvo ou formato de entrega."
                />
              </label>

              <div className="agenda-modal-footer">
                <button
                  type="button"
                  className="dashboard-secondary-button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="dashboard-primary-button">
                  Salvar produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProdutosContent;
