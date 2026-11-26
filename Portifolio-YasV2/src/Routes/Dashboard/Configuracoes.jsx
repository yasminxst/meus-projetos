import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { api } from "../../services/api";
import { useToast } from "../../contexts/useToast";
import ProdutosContent from "../../components/sections/Dashboard/Produtos";
import AdminConfig from "../../components/sections/Dashboard/AdminConfig";

/**
 * Componente de Configurações do Lumina
 * 
 * Abas:
 * 1. Perfil Profissional (Nome, Foto, E-mail, Telefone, CRP, Bio)
 * 2. Ajustes da Conta (Alteração de Senha e E-mail de Acesso)
 * 3. Área de Produtos & Serviços (Cursos, E-books, Mentorias, Pacotes)
 * 4. Configurações Administrativas (Exclusivo Admin: Gestão de Psicólogos e Visão por Perspectiva)
 */
function DashboardConfiguracoes() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const abaAtiva = tabParam || "perfil";

  // Identifica papel do usuário logado
  const userRaw = sessionStorage.getItem("lumina-user");
  const userObj = userRaw ? JSON.parse(userRaw) : { role: "admin" };
  const isAdmin = userObj.role === "admin";

  // Estado do formulário de Perfil Profissional
  const [perfil, setPerfil] = useState({
    name: "Yasmin Teixeira",
    email: "yasmin@lumina.com",
    telefone: "(11) 98765-4321",
    crp: "06/184920",
    bio: "Psicóloga Clínica especialista em TCC.",
    foto_perfil: "",
  });

  // Estado do formulário de Ajustes da Conta
  const [formSenha, setFormSenha] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [novoEmail, setNovoEmail] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function carregarPerfil() {
      try {
        const data = await api.getPerfil();
        if (isMounted && data) {
          setPerfil((prev) => ({
            ...prev,
            name: data.name || prev.name,
            email: data.email || prev.email,
            telefone: data.telefone || prev.telefone,
            crp: data.crp || prev.crp,
            bio: data.bio || prev.bio,
            foto_perfil: data.foto_perfil || prev.foto_perfil,
          }));
          setNovoEmail(data.email || "");
        }
      } catch (err) {
        console.warn("Utilizando dados locais de perfil:", err.message);
      } finally {
        if (isMounted) setCarregando(false);
      }
    }

    carregarPerfil();

    return () => {
      isMounted = false;
    };
  }, []);

  const selecionarAba = (aba) => {
    if (aba === "perfil") {
      setSearchParams({});
      return;
    }
    setSearchParams({ tab: aba });
  };

  const handleSalvarPerfil = async (event) => {
    if (event) event.preventDefault();
    if (!perfil.name.trim() || !perfil.email.trim()) {
      toast.required("Preencha todos os campos obrigatórios.");
      return;
    }

    setSalvando(true);
    toast.saving();

    try {
      const resp = await api.updatePerfil(perfil);
      toast.success("Perfil atualizado com sucesso!");

      if (resp && resp.perfil) {
        const usuarioAtual = {
          ...userObj,
          name: resp.perfil.name,
          email: resp.perfil.email,
        };
        sessionStorage.setItem("lumina-user", JSON.stringify(usuarioAtual));
      }
    } catch {
      toast.error("Não foi possível salvar o perfil.");
    } finally {
      setSalvando(false);
    }
  };

  const handleAlterarSenha = async (e) => {
    e.preventDefault();
    if (formSenha.password !== formSenha.password_confirmation) {
      toast.error("A confirmação de senha não confere.");
      return;
    }

    setSalvando(true);
    toast.saving();
    try {
      await api.atualizarSenha(formSenha);
      toast.success("Senha alterada com sucesso!");
      setFormSenha({ current_password: "", password: "", password_confirmation: "" });
    } catch (err) {
      toast.error(err.message || "Erro ao alterar senha.");
    } finally {
      setSalvando(false);
    }
  };

  const handleAlterarEmail = async (e) => {
    e.preventDefault();
    if (!novoEmail.trim()) {
      toast.required("Informe o novo e-mail.");
      return;
    }

    setSalvando(true);
    toast.saving();
    try {
      await api.atualizarEmail(novoEmail);
      toast.success("E-mail de acesso atualizado com sucesso!");
      setPerfil((prev) => ({ ...prev, email: novoEmail }));
    } catch (err) {
      toast.error(err.message || "Erro ao atualizar e-mail.");
    } finally {
      setSalvando(false);
    }
  };

  const handleAlterarFoto = () => {
    const url = window.prompt("Insira a URL da nova imagem de perfil:", perfil.foto_perfil || "");
    if (url !== null) {
      setPerfil((prev) => ({ ...prev, foto_perfil: url }));
    }
  };

  return (
    <div className="dashboard-page">
      {/* Cabeçalho */}
      <div className="dashboard-page-heading">
        <div>
          <span className="dashboard-kicker">Workspace Profissional</span>
          <h1>Configurações do Sistema</h1>
          <p>Gerencie perfil, segurança da conta, produtos e opções administrativas.</p>
        </div>
        {abaAtiva === "perfil" && (
          <button
            className="dashboard-primary-button"
            type="button"
            onClick={handleSalvarPerfil}
            disabled={salvando || carregando}
          >
            <i className="bi bi-check2" aria-hidden="true" />
            {salvando ? "Salvando..." : "Salvar perfil"}
          </button>
        )}
      </div>

      {/* ABAS DE NAVEGAÇÃO */}
      <div className="dashboard-settings-tabs" role="tablist" aria-label="Seções de configurações">
        <button
          className={abaAtiva === "perfil" ? "is-selected" : ""}
          type="button"
          onClick={() => selecionarAba("perfil")}
        >
          <i className="bi bi-person" aria-hidden="true" /> Perfil profissional
        </button>

        <button
          className={abaAtiva === "conta" ? "is-selected" : ""}
          type="button"
          onClick={() => selecionarAba("conta")}
        >
          <i className="bi bi-shield-check" aria-hidden="true" /> Ajustes da conta
        </button>

        <button
          className={abaAtiva === "produtos" ? "is-selected" : ""}
          type="button"
          onClick={() => selecionarAba("produtos")}
        >
          <i className="bi bi-box-seam" aria-hidden="true" /> Área de produtos
        </button>

        {isAdmin && (
          <button
            className={abaAtiva === "admin" ? "is-selected" : ""}
            type="button"
            onClick={() => selecionarAba("admin")}
          >
            <i className="bi bi-sliders2-vertical" aria-hidden="true" /> Configurações administrativas
          </button>
        )}
      </div>

      {/* 1. ABA PERFIL PROFISSIONAL */}
      {abaAtiva === "perfil" && (
        <section className="dashboard-panel dashboard-settings-form">
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-kicker">Identificação Profissional</span>
              <h2>Perfil do Psicólogo</h2>
            </div>
          </div>

          <div className="dashboard-form-avatar">
            {perfil.foto_perfil ? (
              <img
                src={perfil.foto_perfil}
                alt={perfil.name}
                className="dashboard-avatar large"
                style={{ objectFit: "cover", width: "64px", height: "64px", borderRadius: "50%" }}
              />
            ) : (
              <span className="dashboard-avatar large">
                {perfil.name ? perfil.name.charAt(0).toUpperCase() : "Y"}
              </span>
            )}
            <div>
              <strong>Foto de perfil</strong>
              <p>Imagem para exibição no sistema e na ficha de atendimento.</p>
            </div>
            <button
              className="dashboard-secondary-button"
              type="button"
              onClick={handleAlterarFoto}
            >
              Alterar foto
            </button>
          </div>

          <form onSubmit={handleSalvarPerfil}>
            <div className="dashboard-form-grid">
              <label>
                Nome completo *
                <input
                  type="text"
                  required
                  value={perfil.name}
                  onChange={(e) => setPerfil({ ...perfil, name: e.target.value })}
                  placeholder="Seu nome completo"
                />
              </label>

              <label>
                E-mail profissional *
                <input
                  type="email"
                  required
                  value={perfil.email}
                  onChange={(e) => setPerfil({ ...perfil, email: e.target.value })}
                  placeholder="exemplo@lumina.com"
                />
              </label>

              <label>
                Telefone de contato
                <input
                  type="text"
                  value={perfil.telefone}
                  onChange={(e) => setPerfil({ ...perfil, telefone: e.target.value })}
                  placeholder="(11) 98765-4321"
                />
              </label>

              <label>
                Registro Profissional (CRP)
                <input
                  type="text"
                  value={perfil.crp}
                  onChange={(e) => setPerfil({ ...perfil, crp: e.target.value })}
                  placeholder="06/184920"
                />
              </label>

              <label className="full-width">
                Informações profissionais / Bio
                <textarea
                  rows="4"
                  value={perfil.bio}
                  onChange={(e) => setPerfil({ ...perfil, bio: e.target.value })}
                  placeholder="Abordagens terapêuticas, especialidades e público-alvo."
                />
              </label>
            </div>

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="dashboard-primary-button" disabled={salvando}>
                <i className="bi bi-check2 me-1" />
                {salvando ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 2. ABA AJUSTES DA CONTA */}
      {abaAtiva === "conta" && (
        <div style={{ display: "grid", gap: "24px", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          {/* Alterar E-mail */}
          <section className="dashboard-panel" style={{ padding: "24px" }}>
            <span className="dashboard-kicker">Acesso ao Sistema</span>
            <h2 style={{ fontSize: "1.1rem", marginBottom: "8px", color: "var(--dashboard-ink)" }}>
              E-mail de Login
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--dashboard-muted)", marginBottom: "20px" }}>
              Atualize o endereço de e-mail utilizado para autenticar no sistema.
            </p>

            <form onSubmit={handleAlterarEmail}>
              <label style={{ display: "block", marginBottom: "16px", fontSize: "0.85rem" }}>
                <span>Novo endereço de e-mail *</span>
                <input
                  type="email"
                  required
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--dashboard-line)", marginTop: "4px" }}
                />
              </label>
              <button type="submit" className="dashboard-primary-button" disabled={salvando}>
                Atualizar e-mail
              </button>
            </form>
          </section>

          {/* Alterar Senha */}
          <section className="dashboard-panel" style={{ padding: "24px" }}>
            <span className="dashboard-kicker">Segurança</span>
            <h2 style={{ fontSize: "1.1rem", marginBottom: "8px", color: "var(--dashboard-ink)" }}>
              Alterar Senha
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--dashboard-muted)", marginBottom: "20px" }}>
              Escolha uma senha forte com no mínimo 6 caracteres.
            </p>

            <form onSubmit={handleAlterarSenha}>
              <label style={{ display: "block", marginBottom: "12px", fontSize: "0.85rem" }}>
                <span>Senha atual *</span>
                <input
                  type="password"
                  required
                  value={formSenha.current_password}
                  onChange={(e) => setFormSenha({ ...formSenha, current_password: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--dashboard-line)", marginTop: "4px" }}
                />
              </label>

              <label style={{ display: "block", marginBottom: "12px", fontSize: "0.85rem" }}>
                <span>Nova senha *</span>
                <input
                  type="password"
                  required
                  value={formSenha.password}
                  onChange={(e) => setFormSenha({ ...formSenha, password: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--dashboard-line)", marginTop: "4px" }}
                />
              </label>

              <label style={{ display: "block", marginBottom: "16px", fontSize: "0.85rem" }}>
                <span>Confirme a nova senha *</span>
                <input
                  type="password"
                  required
                  value={formSenha.password_confirmation}
                  onChange={(e) => setFormSenha({ ...formSenha, password_confirmation: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--dashboard-line)", marginTop: "4px" }}
                />
              </label>

              <button type="submit" className="dashboard-primary-button" disabled={salvando}>
                Salvar nova senha
              </button>
            </form>
          </section>
        </div>
      )}

      {/* 3. ABA ÁREA DE PRODUTOS */}
      {abaAtiva === "produtos" && (
        <section className="dashboard-panel" style={{ padding: "24px" }}>
          <ProdutosContent />
        </section>
      )}

      {/* 4. ABA CONFIGURAÇÕES ADMINISTRATIVAS (EXCLUSIVA ADMIN) */}
      {abaAtiva === "admin" && isAdmin && (
        <section className="dashboard-panel" style={{ padding: "24px" }}>
          <AdminConfig />
        </section>
      )}
    </div>
  );
}

export default DashboardConfiguracoes;