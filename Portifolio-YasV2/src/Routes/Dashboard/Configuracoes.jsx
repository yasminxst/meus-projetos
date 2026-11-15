import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { api } from "../../services/api";
import { useToast } from "../../contexts/useToast";
import ProjetosContent from "../../components/sections/Dashboard/Projetos";

/**
 * Componente de Configurações do Lumina
 * 
 * Estrutura simplificada conforme as diretrizes do sistema:
 * - Mantém: Perfil Profissional (Nome, Foto, E-mail, Telefone, CRP, Bio) e Configurações de Projetos.
 * - Removeu completamente: Configurações de Notificações e Configurações de Aparência.
 * - Integrado ao sistema de confirmação de salvamento (Toast).
 */
function DashboardConfiguracoes() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const abaAtiva = searchParams.get("tab") === "projetos" ? "projetos" : "perfil";

  // Estado do formulário de Perfil Profissional
  const [perfil, setPerfil] = useState({
    name: "Yasmin Teixeira",
    email: "yasmin@lumina.com",
    telefone: "(11) 98765-4321",
    crp: "06/184920",
    bio: "Psicóloga Clínica especialista em Terapia Cognitivo-Comportamental (TCC), com foco no acolhimento de jovens e adultos.",
    foto_perfil: "",
  });

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  /**
   * Carrega os dados reais do perfil profissional da API
   */
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

  /**
   * Salva os dados do perfil profissional com validação e Toast
   */
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
      toast.success("Alterações salvas com sucesso!");

      // Atualiza o usuário na sessão para sincronizar com a barra lateral
      if (resp && resp.perfil) {
        const usuarioAtual = {
          name: resp.perfil.name,
          email: resp.perfil.email,
        };
        sessionStorage.setItem("lumina-user", JSON.stringify(usuarioAtual));
      }
    } catch {
      toast.error("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  /**
   * Simula alteração rápida de foto de perfil
   */
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
          <h1>Configurações</h1>
          <p>Gerencie seus dados profissionais e informações dos projetos.</p>
        </div>
        {abaAtiva === "perfil" && (
          <button
            className="dashboard-primary-button"
            type="button"
            onClick={handleSalvarPerfil}
            disabled={salvando || carregando}
          >
            <i className="bi bi-check2" aria-hidden="true" />
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        )}
      </div>

      {/* ABAS SIMPLIFICADAS: MANTÉM APENAS PERFIL PROFISSIONAL E PROJETOS */}
      <div className="dashboard-settings-tabs" role="tablist" aria-label="Seções de configurações">
        <button
          className={abaAtiva === "perfil" ? "is-selected" : ""}
          type="button"
          role="tab"
          aria-selected={abaAtiva === "perfil"}
          onClick={() => selecionarAba("perfil")}
        >
          <i className="bi bi-person" aria-hidden="true" /> Perfil profissional
        </button>

        <button
          className={abaAtiva === "projetos" ? "is-selected" : ""}
          type="button"
          role="tab"
          aria-selected={abaAtiva === "projetos"}
          onClick={() => selecionarAba("projetos")}
        >
          <i className="bi bi-kanban" aria-hidden="true" /> Configurações dos projetos
        </button>
      </div>

      {/* CONTEÚDO DA ABA ATIVA */}
      {abaAtiva === "projetos" ? (
        <section className="dashboard-settings-projects" role="tabpanel">
          <ProjetosContent />
        </section>
      ) : (
        <section className="dashboard-panel dashboard-settings-form" role="tabpanel">
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-kicker">Identificação Profissional</span>
              <h2>Perfil do Psicólogo</h2>
            </div>
          </div>

          {/* Foto de Perfil */}
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
              <p>Imagem JPG ou PNG para exibição no sistema e atendimento.</p>
            </div>
            <button
              className="dashboard-secondary-button"
              type="button"
              onClick={handleAlterarFoto}
            >
              Alterar foto
            </button>
          </div>

          {/* Formulário com Nome, E-mail, Telefone, CRP e Informações Profissionais */}
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
                  placeholder="Breve descrição da sua atuação, abordagens terapêuticas e público-alvo."
                />
              </label>
            </div>

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                className="dashboard-primary-button"
                disabled={salvando}
              >
                <i className="bi bi-check2" aria-hidden="true" />
                {salvando ? "Salvando alterações..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

export default DashboardConfiguracoes;