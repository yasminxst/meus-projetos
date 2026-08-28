

const LoginSection = () => {
  return (
    <section id="Login" className="container-fluid min-vh-100 d-flex align-items-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5 col-xl-4">
            
            {/* Inferido para Padrão de Mercado: Formulário envolto em um Card centralizado */}
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body p-4 p-sm-5">
                
                {/* Cabeçalho do Card (Adicionado) */}
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-dark">Acesso ao Sistema</h2>
                  <p className="text-secondary small">Insira suas credenciais para continuar</p>
                </div>

                <form>
                  <div className="mb-4">
                    <label htmlFor="exampleInputEmail1" className="form-label fw-medium">Email</label>
                    <input 
                      type="email" 
                      className="form-control form-control-lg bg-light border-0" 
                      id="exampleInputEmail1" 
                      aria-describedby="emailHelp" 
                    />
                    <div id="emailHelp" className="form-text small">
                      Por favor, insira seu gmail
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="exampleInputPassword1" className="form-label fw-medium">Senha</label>
                    <input 
                      type="password" 
                      className="form-control form-control-lg bg-light border-0" 
                      id="exampleInputPassword1" 
                    />
                  </div>
                  
                  <div className="mb-4 form-check d-flex align-items-center">
                    <input 
                      type="checkbox" 
                      className="form-check-input mt-0 me-2" 
                      id="exampleCheck1" 
                    />
                    <label className="form-check-label text-secondary" htmlFor="exampleCheck1">
                      Ver senha
                    </label>
                  </div>
                  
                  <div className="d-grid mt-5">
                    <button type="submit" className="btn btn-primary btn-lg fw-semibold py-3">
                      Submit
                    </button>
                  </div>
                </form>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginSection;