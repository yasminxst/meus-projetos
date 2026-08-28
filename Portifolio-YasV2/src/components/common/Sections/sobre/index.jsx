

const SobreSection = () => {
  return (
    <section id="Sobre" className="min-vh-100 bg-white d-flex align-items-center py-5">
      <div className="container py-lg-5">
        <div className="row align-items-center g-5">
          
          {/* Coluna da Imagem (Reorganizada para a esquerda - Padrão de Mercado para seção 'Sobre') */}
          <div className="col-12 col-lg-5 text-center">
            <img 
              src="https://placehold.co/1900x800" 
              alt="Foto com o meu nome centralizado" 
              className="img-fluid rounded-4 shadow-lg object-fit-cover"
            />
          </div>

          {/* Coluna de Texto (Reorganizada para a direita) */}
          <div className="col-12 col-lg-7 text-center text-lg-start px-lg-4">
            <h1 className="display-5 fw-bold text-dark mb-1">
              Prazer, meu nome é:
            </h1>
            <h2 className="display-6 fw-semibold text-primary mb-4">
              Yasmin Teixeira
            </h2>
            <p className="lead text-secondary mb-5 lh-base">
              Elevo a autoridade digital da sua marca. No Social Media, assumo a estratégia e criação de conteúdo, devolvendo o seu tempo. No Desenvolvimento Web, crio portfólios interativos que funcionam como vitrines de alto padrão. Sua imagem impecável antes mesmo do primeiro contato.
            </p>
            
            <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3">
              <button type="button" className="btn btn-primary btn-lg px-5 py-3 fw-semibold shadow-sm">
                Entre em contato
              </button>
              <button type="button" className="btn btn-outline-dark btn-lg px-5 py-3 fw-semibold shadow-sm">
                Saber Mais
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default SobreSection;