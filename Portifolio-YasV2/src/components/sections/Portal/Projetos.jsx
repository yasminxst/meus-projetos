import { useEffect, useState } from "react";
import { api } from "../../../services/api";
import ProjetoCard from "./ProjetoCard";

const initialProjetos = [
  {
    titulo: "Identidade visual",
    descricao: "Criação de uma identidade visual marcante e alinhada ao posicionamento da marca.",
  },
  {
    titulo: "Social Media",
    descricao: "Planejamento e criação de conteúdos para fortalecer a presença digital da sua marca.",
  },
  {
    titulo: "Secretária Virtual",
    descricao: "Você descansa enquanto eu cuido do seu administrativo e a agenda.",
  },
  {
    titulo: "Criação de Portfólios WEB e PDF",
    descricao: "Interfaces responsivas e funcionais para transformar ideias em experiências digitais.",
  },
];

/**
 * Seção de Projetos do Portal Público
 * 
 * Conectada ao backend Laravel para exibir em tempo real os projetos marcados como "Publicado".
 */
const ProjetosSection = () => {
  const [listaProjetos, setListaProjetos] = useState(initialProjetos);

  useEffect(() => {
    let isMounted = true;

    async function carregarProjetosPublicados() {
      try {
        // Traz do backend somente projetos com status "Publicado"
        const data = await api.getProjetos(true);
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const formatados = data.map((item) => ({
            titulo: item.title || item.titulo,
            descricao: item.descricao || item.category || "Projeto em destaque no portfólio.",
          }));
          setListaProjetos(formatados);
        }
      } catch (error) {
        console.warn("Utilizando catálogo local para a vitrine pública:", error.message);
      }
    }

    carregarProjetosPublicados();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="Projetos" className="container-fluid bg-light py-5">
      <div className="container">
        {/* Cabeçalho da Seção */}
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-dark">Meus trabalhos</h2>
          <p className="lead text-secondary">Conheça mais sobre meus serviços e projetos</p>
        </div>

        {/* Grid Responsivo com cards */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {listaProjetos.map((projeto, index) => (
            <ProjetoCard key={`${projeto.titulo}-${index}`} {...projeto} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjetosSection;