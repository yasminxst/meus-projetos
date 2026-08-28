
const HeroSection = () => {
  return (
    <section className="position-relative min-vh-100 d-flex align-items-center overflow-hidden bg-dark">
      {/* Imagem configurada como background cover usando classes utilitárias do Bootstrap 5.3 */}
      <img 
        src="https://placehold.co/2000x800" 
        alt="Banner principal cobrindo toda a secao hero como um fundo" 
        className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover opacity-50 z-0" 
      />
      
      {/* Padrão de Mercado: Container com conteúdo sobreposto centralizado */}
      <div className="container position-relative z-1 text-center text-white py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <h1 className="display-3 fw-bold mb-4">
              Yasmin Teixeira
            </h1>
            <p className="lead mb-5 fw-medium">
              Meu trabalho destaca o seu!
            </p>
            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
              <button type="button" className="btn btn-primary btn-lg px-5 py-3 fw-semibold">
                Entre em contato
              </button>
              <button type="button" className="btn btn-outline-light btn-lg px-5 py-3 fw-semibold">
                Saber Mais
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;