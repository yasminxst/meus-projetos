

export default function LuminaSection() {


  return (
    <div className="bg-light min-vh-100 text-dark">
      {}
      

      {}
      <section id="inicio" className="py-5 position-relative overflow-hidden bg-white border-bottom">
        <div className="container py-lg-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-semibold mb-3">
                <i className="bi bi-sparkles me-1"></i> Gestão Clínica Inteligente
              </span>
              <h1 className="display-4 fw-bold mb-4 lh-sm text-dark">
                A organização que <span className="text-success bg-success-subtle px-1 rounded">ilumina</span> sua prática!
              </h1>
              <p className="lead text-muted mb-4">
                A Lumina foi desenvolvida para ajudar profissionais a organizarem prontuários, acompanharem a evolução dos pacientes e gerenciarem sua rotina clínica com mais leveza e segurança.
              </p>
              <div className="d-flex flex-wrap gap-3 mb-5">
                <button className="btn btn-success btn-lg px-4 rounded-pill shadow">
                  Começar Gratuitamente <i className="bi bi-arrow-right ms-2"></i>
                </button>
                
              </div>
            </div>
            <div className="col-lg-6">
              <div className="position-relative">
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-dark">
                  <img 
                    src="https://placehold.co/700x450/2c4a3e/ffffff?text=Lumina+Dashboard+Preview" 
                    alt="Dashboard Preview" 
                    className="img-fluid w-100 object-fit-cover"
                  />
                </div>
                {/* Floating card element matching reference */}
                <div className="position-absolute bottom-0 end-0 translate-middle-y me-n4 d-none d-sm-block">
                  <div className="card border-0 shadow-lg p-3 rounded-4 bg-white" style={{ maxWidth: '240px' }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-success-subtle p-2 rounded-circle text-success">
                        <i className="bi bi-shield-check fs-5"></i>
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold small">Prontuário Seguro</h6>
                        <small className="text-muted fs-7">Criptografia ponta a ponta</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="py-5 bg-light border-bottom">
        <div className="container text-center py-3">
          <h2 className="h4 fw-bold mb-4 text-secondary">Tudo que você precisa, em um só lugar</h2>
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-3">
            <div className="bg-success-subtle text-success border border-success-subtle px-4 py-2 rounded-pill fw-semibold shadow-sm d-flex align-items-center gap-2">
              <i className="bi bi-calendar-check"></i> Agenda
            </div>
            <div className="bg-success-subtle text-success border border-success-subtle px-4 py-2 rounded-pill fw-semibold shadow-sm d-flex align-items-center gap-2">
              <i className="bi bi-graph-up-arrow"></i> Evolução Clínica
            </div>
            <div className="bg-success-subtle text-success border border-success-subtle px-4 py-2 rounded-pill fw-semibold shadow-sm d-flex align-items-center gap-2">
              <i className="bi bi-people"></i> Cadastro de Pacientes
            </div>
            <div className="bg-success-subtle text-success border border-success-subtle px-4 py-2 rounded-pill fw-semibold shadow-sm d-flex align-items-center gap-2">
              <i className="bi bi-journal-medical"></i> Prontuários
            </div>
          </div>
        </div>
      </section>

      {}
      <section id="recursos" className="py-5 bg-white">
        <div className="container py-lg-5">
          <div className="text-center mx-auto mb-5" style={{ maxWidth: '700px' }}>
            <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-semibold mb-2">Recursos Poderosos</span>
            <h2 className="fw-bold display-6">Projetado para otimizar o seu tempo clínico</h2>
            <p className="text-muted">Ferramentas intuitivas criadas com foco na experiência do profissional de saúde mental.</p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100 rounded-4 p-4 bg-light">
                <div className="card-body p-0">
                  <div className="bg-success text-white p-3 rounded-4 d-inline-block mb-4 shadow-sm">
                    <i className="bi bi-calendar-event fs-4"></i>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Agenda Integrada</h3>
                  <p className="text-muted mb-0">
                    Gerencie seus horários, envie lembretes automáticos via WhatsApp e evite faltas com confirmação prévia.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100 rounded-4 p-4 bg-light">
                <div className="card-body p-0">
                  <div className="bg-success text-white p-3 rounded-4 d-inline-block mb-4 shadow-sm">
                    <i className="bi bi-file-earmark-medical fs-4"></i>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Prontuário Eletrônico</h3>
                  <p className="text-muted mb-0">
                    Anotações seguras e estruturadas em conformidade com as normas do Conselho Federal de Psicologia.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100 rounded-4 p-4 bg-light">
                <div className="card-body p-0">
                  <div className="bg-success text-white p-3 rounded-4 d-inline-block mb-4 shadow-sm">
                    <i className="bi bi-graph-up fs-4"></i>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Evolução Gráfica</h3>
                  <p className="text-muted mb-0">
                    Acompanhe o progresso terapêutico através de gráficos de evolução claros e relatórios detalhados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="py-5 bg-success text-white">
        <div className="container py-4 text-center">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h2 className="fw-bold display-6 mb-3">Pronto para transformar sua clínica?</h2>
              <p className="lead mb-4 text-white-50">
                Junte-se a centenas de profissionais que já otimizaram seus atendimentos com a Lumina.
              </p>
              <button className="btn btn-light btn-lg px-5 rounded-pill fw-bold text-success shadow">
               Entre em contato <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {}
     
    </div>
  );
}