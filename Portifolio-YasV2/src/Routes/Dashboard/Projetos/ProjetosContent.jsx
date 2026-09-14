import { useState } from "react";

const initialProjects = [
  { id: 1, title: "Clínica Aurora", category: "Identidade visual", status: "Publicado", updatedAt: "08 set 2026" },
  { id: 2, title: "Casa Nativa", category: "Web design", status: "Publicado", updatedAt: "02 set 2026" },
  { id: 3, title: "Ateliê Manacá", category: "E-commerce", status: "Rascunho", updatedAt: "28 ago 2026" },
];

function ProjetosContent() {
  const [projects, setProjects] = useState(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const openCreateModal = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title");
    const category = formData.get("category");

    if (editingProject) {
      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === editingProject.id
            ? { ...project, title, category }
            : project,
        ),
      );
    } else {
      setProjects((currentProjects) => [
        { id: Date.now(), title, category, status: "Rascunho", updatedAt: "Agora" },
        ...currentProjects,
      ]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== id),
    );
  };

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
            <input placeholder="Buscar projeto" aria-label="Buscar projeto" />
          </div>
          <button className="dashboard-filter-button" type="button">
            <i className="bi bi-sliders" aria-hidden="true" />
            Filtrar
          </button>
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
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <div className="dashboard-project-name">
                      <span>{project.title.charAt(0)}</span>
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
                  <td>{project.updatedAt}</td>
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
                <span className="dashboard-kicker">Projeto</span>
                <h2 id="project-modal-title">{editingProject ? "Editar projeto" : "Novo projeto"}</h2>
              </div>
              <button className="dashboard-close-button" type="button" onClick={() => setIsModalOpen(false)} aria-label="Fechar">
                <i className="bi bi-x-lg" aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="dashboard-form-grid">
              <label>
                Nome do projeto
                <input name="title" defaultValue={editingProject?.title ?? ""} required />
              </label>
              <label>
                Categoria
                <input name="category" defaultValue={editingProject?.category ?? ""} required />
              </label>
              <label className="full-width">
                Descrição
                <textarea name="description" placeholder="Conte um pouco sobre o projeto..." />
              </label>
              <div className="dashboard-modal-actions">
                <button className="dashboard-secondary-button" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button className="dashboard-primary-button" type="submit">
                  {editingProject ? "Salvar projeto" : "Adicionar projeto"}
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
