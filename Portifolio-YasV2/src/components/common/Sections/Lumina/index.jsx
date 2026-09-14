

export default function LuminaSection() {


  return (
    <div className="lumina-page bg-light min-vh-100 text-dark">
      {}
      

      {}
      <section id="inicio" className="py-5 position-relative overflow-hidden bg-white border-bottom">
        <div className="container py-lg-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              
              <h1 className="display-4 fw-bold mb-4 lh-sm text-dark">
                A organização que <span className=" px-1 rounded">ilumina</span> sua prática!
              </h1>
              <p className="lead text-muted mb-4">
                A Lumina foi desenvolvida para ajudar profissionais a organizarem prontuários, acompanharem a evolução dos pacientes e gerenciarem sua rotina clínica com mais leveza e segurança.
              </p>
              <div className="d-flex flex-wrap gap-3 mb-5">
                <a href="/login" className="btn  btn-lg px-4 rounded-pill shadow">
                  Cadastre-se<i className="bi bi-arrow-right ms-2"></i>
                </a>
                
              </div>
            </div>
            <div className="col-lg-6">
              <div className="position-relative">
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-dark lumina-preview">
                  <img 
                    src="/Screenshot 2026-09-04 100901.png" 
                    alt="Dashboard Preview" 
                    className="img-fluid w-100 object-fit-cover"
                  />
                </div>
                {/* Floating card element matching reference */}
                <div className="position-absolute bottom-0 end-0 translate-middle-y me-n4 d-none d-sm-block">
                  <div className="card border-0 shadow-lg p-3 rounded-4 bg-white lumina-security-card">
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
            <div className=" border px-4 py-2 rounded-pill fw-semibold shadow-sm d-flex align-items-center gap-2">
              <i className="bi bi-calendar-check"></i> Agenda
            </div>
            <div className="border px-4 py-2 rounded-pill fw-semibold shadow-sm d-flex align-items-center gap-2">
              <i className="bi bi-graph-up-arrow"></i> Evolução Clínica
            </div>
            <div className="border px-4 py-2 rounded-pill fw-semibold shadow-sm d-flex align-items-center gap-2">
              <i className="bi bi-people"></i> Cadastro de Pacientes
            </div>
            <div className=" border px-4 py-2 rounded-pill fw-semibold shadow-sm d-flex align-items-center gap-2">
              <i className="bi bi-journal-medical"></i> Prontuários
            </div>
          </div>
        </div>
      </section>

      {}
  
      {}
     

      {}
     
    </div>
  );
}