import { useEffect, useState } from "react";
import { api } from "../../../services/api";
import { useToast } from "../../../contexts/useToast";

const initialProjects = [
  { id: 1, title: "Clínica Aurora", category: "Identidade visual", status: "Publicado", updatedAt: "08 set 2026" },
  { id: 2, title: "Casa Nativa", category: "Web design", status: "Publicado", updatedAt: "02 set 2026" },
  { id: 3, title: "Ateliê Manacá", category: "E-commerce", status: "Rascunho", updatedAt: "28 ago 2026" },
];

/**
 * Componente ProjetosContent (Dashboard / Projetos)
 * 
 * Gerencia o CRUD completo dos trabalhos de portfólio.
 * Conectado à API Laravel (GET, POST, PUT, DELETE em /api/projetos).
 */
function ProjetosContent() {
  const toast = useToast();
  const [projects, setProjects] = useState(initialProjects);
  const [busca, setBusca] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Carrega os projetos salvos no banco de dados ao montar o componente
   */
  useEffect(() => {
    let isMounted = true;

    async function carregarProjetos() {
      try {
        const data = await api.getProjetos();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      } catch (error) {
        console.warn("Utilizando lista local de projetos:", error.message);
      }
    }

    carregarProjetos();

    return () => {
      isMounted = false;
    };
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  /**
   * Envia o formulário de criação ou edição para o backend Laravel
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title");
    const category = formData.get("category");
    const status = formData.get("status") || "Publicado";
    const descricao = formData.get("descricao") || "";

    if (!title || !category) {
      toast.required("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    toast.saving();

    if (editingProject) {
      try {
        const resp = await api.updateProjeto(editingProject.id, {
          title,
          category,
          status,
          descricao,
        });

        setProjects((current) =>
          current.map((p) =>
            p.id === editingProject.id ? (resp?.projeto || { ...p, title, category, status, descricao }) : p
          )
        );
        setIsModalOpen(false);
        toast.success("Alterações salvas com sucesso!");
      } catch {
        toast.error("Não foi possível salvar as alterações. Tente novamente.");
      }
    } else {
      try {
        const resp = await api.createProjeto({
          title,
          category,
          status,
          descricao,
        });

        if (resp && resp.projeto) {
          setProjects((current) => [resp.projeto, ...current]);
        }
        setIsModalOpen(false);
        toast.success("Alterações salvas com sucesso!");
      } catch {
        toast.error("Não foi possível salvar as alterações. Tente novamente.");
      }
    }

    setLoading(false);
  };

  /**
   * Remove o projeto do banco de dados e da listagem
   */
  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente remover este projeto?")) {
      return;
    }

    toast.saving();

    try {
      await api.deleteProjeto(id);
      setProjects((current) => current.filter((p) => p.id !== id));
      toast.success("Alterações salvas com sucesso!");
    } catch {
      toast.error("Não foi possível salvar as alterações. Tente novamente.");
    }
  };

  // Filtragem em tempo real pelo campo de busca
  const projetosFiltrados = projects.filter((p) =>
    (p.title || "").toLowerCase().includes(busca.toLowerCase()) ||
    (p.category || "").toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <>
      <div className="dashboard-page-heading">
        <div>
          <span className="dashboard-kicker">Conteúdo</span>
          <h2>Projetos</h2>
          <p>Apresente os trabalhos que fazem parte da sua história.</p>
        </div>
        <button className="dashboard-primary-button" type="button" onClick={openCreateModal}>
          <i className="bi bi-plus-lg" aria-hidden="true" />
          Novo projeto
        </button>
      </div>

      <section className="dashboard-panel dashboard-projects-panel">
        <div className="dashboard-table-toolbar">
          <div className="dashboard-search">
            <i className="bi bi-search" aria-hidden="true" />
            <input 
              placeholder="Buscar projeto por título ou categoria" 
              aria-label="Buscar projeto" 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Projeto</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Atualizado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {projetosFiltrados.map((project) => (
                <tr key={project.id}>
                  <td>
                    <div className="dashboard-project-name">
                      <span>{(project.title || "P").charAt(0).toUpperCase()}</span>
                      <strong>{project.title}</strong>
                    </div>
                  </td>
                  <td>{project.category}</td>
                  <td>
                    <span className={`dashboard-status ${project.status === "Publicado" ? "published" : "draft"}`}>
                      <i aria-hidden="true" />
                      {project.status}
                    </span>
                  </td>
                  <td>{project.updatedAt || "Recente"}</td>
                  <td>
                    <div className="dashboard-row-actions">
                      <button type="button" aria-label={`Editar ${project.title}`} onClick={() => openEditModal(project)}>
                        <i className="bi bi-pencil" aria-hidden="true" />
                        <span>Editar</span>
                      </button>
                      <button type="button" aria-label={`Excluir ${project.title}`} onClick={() => handleDelete(project.id)}>
                        <i className="bi bi-trash3" aria-hidden="true" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <div
          className="dashboard-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && setIsModalOpen(false)}
        >
          <div className="dashboard-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
            <div className="dashboard-panel-heading">
              <div>
                <span className="dashboard-kicker">Gerenciar Conteúdo</span>
                <h2 id="project-modal-title">{editingProject ? "Editar projeto" : "Novo projeto"}</h2>
              </div>
              <button className="dashboard-close-button" type="button" onClick={() => setIsModalOpen(false)} aria-label="Fechar">
                <i className="bi bi-x-lg" aria-hidden="true" />
              </button>
            </div>

            <form className="dashboard-form" onSubmit={handleSubmit}>
              <div className="dashboard-form-group">
                <label htmlFor="project-title">Título do trabalho</label>
                <input
                  id="project-title"
                  name="title"
                  defaultValue={editingProject ? editingProject.title : ""}
                  placeholder="Ex: Clínica Aurora"
                  required
                />
              </div>

              <div className="dashboard-form-group">
                <label htmlFor="project-category">Categoria</label>
                <input
                  id="project-category"
                  name="category"
                  defaultValue={editingProject ? editingProject.category : ""}
                  placeholder="Ex: Identidade visual, Web design, Social Media"
                  required
                />
              </div>

              <div className="dashboard-form-group">
                <label htmlFor="project-status">Status de Publicação</label>
                <select
                  id="project-status"
                  name="status"
                  defaultValue={editingProject ? editingProject.status : "Publicado"}
                  className="form-select"
                >
                  <option value="Publicado">Publicado (Visível no Portal)</option>
                  <option value="Rascunho">Rascunho (Apenas no Dashboard)</option>
                </select>
              </div>

              <div className="dashboard-form-actions">
                <button
                  type="button"
                  className="dashboard-secondary-button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="dashboard-primary-button" disabled={loading}>
                  {loading ? "Salvando..." : (editingProject ? "Salvar alterações" : "Criar projeto")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ProjetosContent;
