import { useSearchParams } from "react-router";
import ProjetosContent from "../Projetos/ProjetosContent";

function DashboardConfiguracoes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const abaAtiva = searchParams.get("tab") === "projetos" ? "projetos" : "perfil";

  const selecionarAba = (aba) => {
    if (aba === "perfil") {
      setSearchParams({});
      return;
    }

    setSearchParams({ tab: aba });
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-heading">
        <div>
          <span className="dashboard-kicker">Workspace</span>
          <h1>Configurações</h1>
          <p>Gerencie as informações que aparecem no seu portfólio.</p>
        </div>
        <button className="dashboard-primary-button" type="button"><i className="bi bi-check2" aria-hidden="true" /> Salvar alterações</button>
      </div>

      <div className="dashboard-settings-tabs" role="tablist" aria-label="Seções de configurações">
        <button
          className={abaAtiva === "perfil" ? "is-selected" : ""}
          type="button"
          role="tab"
          aria-selected={abaAtiva === "perfil"}
          onClick={() => selecionarAba("perfil")}
        >
          <i className="bi bi-person" aria-hidden="true" /> Perfil público
        </button>
        <button
          className={abaAtiva === "projetos" ? "is-selected" : ""}
          type="button"
          role="tab"
          aria-selected={abaAtiva === "projetos"}
          onClick={() => selecionarAba("projetos")}
        >
          <i className="bi bi-kanban" aria-hidden="true" /> Projetos
        </button>
        <button type="button" role="tab" aria-selected="false">
          <i className="bi bi-palette" aria-hidden="true" /> Aparência
        </button>
        <button type="button" role="tab" aria-selected="false">
          <i className="bi bi-bell" aria-hidden="true" /> Notificações
        </button>
      </div>

      {abaAtiva === "projetos" ? (
        <section className="dashboard-settings-projects" role="tabpanel">
          <ProjetosContent />
        </section>
      ) : (
        <section className="dashboard-panel dashboard-settings-form" role="tabpanel">
          <div className="dashboard-panel-heading"><div><span className="dashboard-kicker">Informações básicas</span><h2>Perfil público</h2></div></div>
          <div className="dashboard-form-avatar"><span className="dashboard-avatar large">Y</span><div><strong>Imagem de perfil</strong><p>JPG ou PNG de até 2 MB.</p></div><button className="dashboard-secondary-button" type="button">Alterar imagem</button></div>
          <div className="dashboard-form-grid">
            <label>Nome completo<input defaultValue="Yasmin Teixeira" /></label>
            <label>E-mail profissional<input defaultValue="yasmin@lumina.com" type="email" /></label>
            <label className="full-width">Descrição curta<textarea defaultValue="Designer e desenvolvedora apaixonada por criar experiências digitais com propósito." /></label>
          </div>
        </section>
      )}
    </div>
  );
}

export default DashboardConfiguracoes;