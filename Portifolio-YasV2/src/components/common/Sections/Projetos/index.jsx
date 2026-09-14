// ProjetosSection.jsx

import ProjetoCard from './card'; 

const projetos = [
  {
   
   
    titulo: "Identidade visual",
    descricao: "Criação de uma identidade visual marcante e alinhada ao posicionamento da marca.",
  },
  {
    
  
    titulo: "Social Media ",
    descricao: "Planejamento e criação de conteúdos para fortalecer a presença digital da sua marca.",
  },
  {
    
  
    titulo: "Secretária Virtual",
    descricao: "Você descansa enquanto eu cuido do seu administrativo e a agenda",
  },
  {
    
   
    titulo: "Criação de Portifólios WEB e PDF",
    descricao: "Interfaces responsivas e funcionais para transformar ideias em experiências digitais.",
  },
];

const ProjetosSection = () => {
  return (
    <section id="Projetos" className="container-fluid bg-light py-5">
      <div className="container">
        {/* Cabeçalho da Seção (Inferido para Padrão de Mercado) */}
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-dark">Meus trabalhos</h2>
          <p className="lead text-secondary">Conheça mais sobre meus serviços</p>
        </div>

        {/* Grid Reorganizado com row-cols e responsividade */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {projetos.map((projeto) => (
            <ProjetoCard key={projeto.titulo} {...projeto} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjetosSection;