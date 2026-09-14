import { Link } from "react-router";

const overviewCards = [
	{ label: "Pacientes Ativos", value: "12", icon: "bi-kanban", tone: "rose" },
	{ label: "Consultas hoje", value: "5", icon: "bi-graph-up-arrow", tone: "gold" },
	{ label: "Atendimentos do mês", value: "45", change: "+5 esse mês", icon: "bi-chat-left-text", tone: "green" },
];

function DashboardHome() {
	return (
		<div className="dashboard-page">
			<div className="dashboard-page-heading">
				<div>
					<span className="dashboard-kicker">Terça-feira, 08 de setembro</span>
					<h1>Bom dia, Yasmin<span>.</span></h1>
					<p>Acompanhe o que está acontecendo no seu workspace.</p>
				</div>
				<Link className="dashboard-primary-button" to="/dashboard/projetos">
					<i className="bi bi-plus-lg" aria-hidden="true" /> Novo projeto
				</Link>
			</div>

			<div className="dashboard-stat-grid">
				{overviewCards.map((card) => (
					<article className="dashboard-stat-card" key={card.label}>
						<div className={`dashboard-stat-icon ${card.tone}`}><i className={`bi ${card.icon}`} aria-hidden="true" /></div>
						<div>
							<span>{card.label}</span>
							<strong>{card.value}</strong>
							<small><i className="bi bi-arrow-up-right" aria-hidden="true" /> {card.change}</small>
						</div>
					</article>
				))}
			</div>

			<div className="dashboard-overview-grid">
				<section className="dashboard-panel dashboard-progress-panel">
					<div className="dashboard-panel-heading">
						<div>
							<span className="dashboard-kicker">Financeiro</span>
							<h2>O quanto seu negócio está evoluindo?</h2>
						</div>
						<button className="dashboard-more-button" type="button" aria-label="Mais opções"><i className="bi bi-three-dots" /></button>
					</div>
					<div className="dashboard-chart-placeholder">
						<div className="dashboard-chart-labels"><span>Atendimentos</span><strong>549</strong></div>
						<div className="dashboard-chart-bars" aria-label="Gráfico de visitas dos últimos seis meses">
							{[35, 48, 42, 68, 56, 82, 72, 94].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}
						</div>
						<div className="dashboard-chart-months"><span>Mai</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Set</span></div>
					</div>
				</section>

				<section className="dashboard-panel dashboard-activity-panel">
					<div className="dashboard-panel-heading">
						<div><span className="dashboard-kicker">Próximas consultas</span><h2>Últimas atualizações</h2></div>
						<Link to="/dashboard/projetos">Ver tudo</Link>
					</div>
					<div className="dashboard-activity-list">
						<div><span className="dashboard-activity-dot rose" /><p><strong>Beatriz Lima</strong><small>9:00</small></p></div>
						<div><span className="dashboard-activity-dot gold" /><p><strong>Raquel Santos</strong><small> 10:00</small></p></div>
						<div><span className="dashboard-activity-dot green" /><p><strong>Jhonatan Henrique</strong><small>11:00</small></p></div>
					</div>
				</section>
			</div>
		</div>
	);
}

export default DashboardHome;
