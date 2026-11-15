import { useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../../services/api";
import "../Portal/lumina.css";

const Login = () => {
  const navigate = useNavigate();

  // Estados controlados para o formulário
  const [email, setEmail] = useState("yasmin@lumina.com");
  const [password, setPassword] = useState("senha123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Processa o login conectando com o backend Laravel (POST /api/login).
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // Envia as credenciais para o backend via Sanctum
      await api.login(email, password);
      // Redireciona para o Dashboard administrativo
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(
        error.message || "Não foi possível conectar ao servidor. Verifique se o backend está ativo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="Login" className="lumina-page container-fluid min-vh-100 d-flex align-items-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5 col-xl-4">
            
            {/* Card de Login Centralizado */}
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body p-4 p-sm-5">
                
                {/* Cabeçalho */}
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-dark">Acesso ao Sistema</h2>
                  <p className="text-secondary small">Insira suas credenciais para continuar</p>
                </div>

                {/* Exibição de mensagem de erro amigável */}
                {errorMessage && (
                  <div className="alert alert-danger small py-2 text-center mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2" />
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="inputEmail" className="form-label fw-medium">E-mail</label>
                    <input 
                      type="email" 
                      className="form-control form-control-lg bg-light border-0" 
                      id="inputEmail" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu-email@lumina.com"
                      required
                    />
                    <div className="form-text small text-muted">
                      Conta padrão de demonstração: <code>yasmin@lumina.com</code>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="inputPassword" className="form-label fw-medium">Senha</label>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="form-control form-control-lg bg-light border-0" 
                      id="inputPassword" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <div className="form-text small text-muted">
                      Senha padrão: <code>senha123</code>
                    </div>
                  </div>
                  
                  <div className="mb-4 form-check d-flex align-items-center">
                    <input 
                      type="checkbox" 
                      className="form-check-input mt-0 me-2" 
                      id="checkShowPassword" 
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                    />
                    <label className="form-check-label text-secondary small" htmlFor="checkShowPassword">
                      Mostrar senha
                    </label>
                  </div>
                  
                  <div className="d-grid mt-4">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg fw-semibold py-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          Conectando...
                        </>
                      ) : (
                        "Entrar no Dashboard"
                      )}
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

export default Login;