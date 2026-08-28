// ProjetosSection.jsx

import ProjetoCard from './card'; 

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
          <ProjetoCard 
            altText="Projeto 1" 
          />
          <ProjetoCard 
            altText="Projeto 2" 
          />
          <ProjetoCard 
            altText="Projeto 3" 
          />
          <ProjetoCard 
            altText="Projeto 4" 
          />
        </div>
      </div>
    </section>
  );
};

export default ProjetosSection;