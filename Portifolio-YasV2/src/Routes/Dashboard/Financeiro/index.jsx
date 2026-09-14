import { useMemo, useState } from "react";
import "./financeiro.css";

const meses = [
	"Janeiro",
	"Fevereiro",
	"Março",
	"Abril",
	"Maio",
	"Junho",
	"Julho",
	"Agosto",
	"Setembro",
	"Outubro",
	"Novembro",
	"Dezembro",
];

const dadosIniciais = meses.map((mes, index) => ({
	id: index,
	mes,
	pacientes: [18, 22, 25, 20, 28, 31, 24, 29, 34, 27, 22, 19][index],
	valorSessao: 180,
	despesas: [620, 740, 810, 680, 920, 980, 760, 850, 1_020, 880, 720, 650][index],
}));

const formatarMoeda = (valor) =>
	valor.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
		maximumFractionDigits: 0,
	});

const calcularResumo = (mes) => {
	const lucroBruto = mes.pacientes * mes.valorSessao;
	return {
		lucroBruto,
		lucroLiquido: lucroBruto - mes.despesas,
	};
};

function Financeiro() {
	const [mesSelecionado, setMesSelecionado] = useState(8);
	const [dadosMensais, setDadosMensais] = useState(dadosIniciais);
	const [configuracao, setConfiguracao] = useState(dadosIniciais[8]);

	const mesAtual = dadosMensais[mesSelecionado];

	const resumos = useMemo(
		() => dadosMensais.map((mes) => ({ ...mes, ...calcularResumo(mes) })),
		[dadosMensais],
	);

	const resumoAtual = resumos[mesSelecionado];
	const maiorLucroBruto = Math.max(...resumos.map((mes) => mes.lucroBruto), 1);
	const totalPacientes = dadosMensais.reduce(
		(total, mes) => total + mes.pacientes,
		0,
	);
	const totalBruto = resumos.reduce((total, mes) => total + mes.lucroBruto, 0);
	const totalLiquido = resumos.reduce((total, mes) => total + mes.lucroLiquido, 0);

	const selecionarMes = (index) => {
		setMesSelecionado(index);
		setConfiguracao(dadosMensais[index]);
	};

	const atualizarConfiguracao = (campo, valor) => {
		setConfiguracao((anterior) => ({
			...anterior,
			[campo]: Math.max(0, Number(valor)),
		}));
	};

	const salvarConfiguracao = (event) => {
		event.preventDefault();
		setDadosMensais((anteriores) =>
			anteriores.map((mes) =>
				mes.id === mesSelecionado ? { ...configuracao, id: mes.id, mes: mes.mes } : mes,
			),
		);
	};

	const alterarPacientes = (quantidade) => {
		const pacientes = Math.max(0, configuracao.pacientes + quantidade);
		atualizarConfiguracao("pacientes", pacientes);
		setDadosMensais((anteriores) =>
			anteriores.map((mes) =>
				mes.id === mesSelecionado ? { ...mes, pacientes } : mes,
			),
		);
	};

	return (
		<div className="dashboard-page financeiro-page">
			<div className="financeiro-page-heading">
				<div>
					<span className="dashboard-kicker">Gestão</span>
					<h1>Visão financeira<span>.</span></h1>
					<p>Acompanhe seus atendimentos, receitas e resultado mensal.</p>
				</div>

				<div className="financeiro-period-control">
					<label htmlFor="financeiro-periodo">Mês em análise</label>
					<select
						id="financeiro-periodo"
						value={mesSelecionado}
						onChange={(event) => selecionarMes(Number(event.target.value))}
					>
						{meses.map((mes, index) => (
							<option key={mes} value={index}>{mes} 2026</option>
						))}
					</select>
				</div>
			</div>

			<section className="financeiro-stat-grid" aria-label="Resumo financeiro">
				<article className="financeiro-stat-card">
					<div className="financeiro-stat-icon" aria-hidden="true">R$</div>
					<div>
						<span>Lucro líquido acumulado</span>
						<strong>{formatarMoeda(totalLiquido)}</strong>
						<small>Receita menos despesas registradas</small>
					</div>
				</article>

				<article className="financeiro-stat-card">
					<div className="financeiro-stat-icon" aria-hidden="true">↗</div>
					<div>
						<span>Lucro bruto acumulado</span>
						<strong>{formatarMoeda(totalBruto)}</strong>
						<small>Valor total das sessões</small>
					</div>
				</article>

				<article className="financeiro-stat-card">
					<div className="financeiro-stat-icon" aria-hidden="true">#</div>
					<div>
						<span>Pacientes atendidos</span>
						<strong>{totalPacientes}</strong>
						<small>Atendimentos registrados no ano</small>
					</div>
				</article>
			</section>

			<div className="financeiro-main-grid">
				<section className="financeiro-panel">
					<div className="financeiro-panel-heading">
						<div>
							<span className="dashboard-kicker">Desempenho</span>
							<h2>Lucro bruto por mês</h2>
							<p>Selecione um mês para editar seus dados.</p>
						</div>
						<strong className="financeiro-month-total">
							{formatarMoeda(resumoAtual.lucroBruto)}
						</strong>
					</div>

					<div className="financeiro-chart" aria-label="Gráfico de lucro bruto mensal">
						{resumos.map((mes) => (
							<div
								className={`financeiro-chart-column${mes.id === mesSelecionado ? " is-selected" : ""}`}
								key={mes.id}
							>
								<span className="financeiro-chart-value">{formatarMoeda(mes.lucroBruto)}</span>
								<div className="financeiro-chart-track">
									<div
										className="financeiro-chart-bar"
										style={{ height: `${Math.max(4, (mes.lucroBruto / maiorLucroBruto) * 100)}%` }}
										aria-hidden="true"
									/>
								</div>
								<button type="button" onClick={() => selecionarMes(mes.id)}>
									{mes.mes.slice(0, 3)}
								</button>
							</div>
						))}
					</div>

					<div className="financeiro-month-summary">
						<div><span>Lucro bruto</span><strong>{formatarMoeda(resumoAtual.lucroBruto)}</strong></div>
						<div><span>Despesas</span><strong>{formatarMoeda(mesAtual.despesas)}</strong></div>
						<div><span>Lucro líquido</span><strong>{formatarMoeda(resumoAtual.lucroLiquido)}</strong></div>
					</div>
				</section>

				<section className="financeiro-panel financeiro-control-panel">
					<div className="financeiro-panel-heading">
						<div>
							<span className="dashboard-kicker">Configuração mensal</span>
							<h2>{mesAtual.mes}</h2>
						</div>
					</div>
					<p className="financeiro-control-copy">
						Atualize os atendimentos, o valor de cada sessão e as despesas do período.
					</p>

					<form className="financeiro-form" onSubmit={salvarConfiguracao}>
						<label htmlFor="financeiro-pacientes">Pacientes atendidos</label>
						<div className="financeiro-stepper">
							<button type="button" onClick={() => alterarPacientes(-1)} aria-label="Excluir atendimento">−</button>
							<input
								id="financeiro-pacientes"
								type="number"
								min="0"
								value={configuracao.pacientes}
								onChange={(event) => atualizarConfiguracao("pacientes", event.target.value)}
							/>
							<button type="button" onClick={() => alterarPacientes(1)} aria-label="Adicionar atendimento">+</button>
						</div>

						<div className="financeiro-form-grid">
							<label htmlFor="financeiro-sessao">
								Valor da sessão
								<input
									id="financeiro-sessao"
									type="number"
									min="0"
									step="10"
									value={configuracao.valorSessao}
									onChange={(event) => atualizarConfiguracao("valorSessao", event.target.value)}
								/>
							</label>
							<label htmlFor="financeiro-despesas">
								Despesas do mês
								<input
									id="financeiro-despesas"
									type="number"
									min="0"
									step="10"
									value={configuracao.despesas}
									onChange={(event) => atualizarConfiguracao("despesas", event.target.value)}
								/>
							</label>
						</div>

						<div className="financeiro-actions">
							<button className="financeiro-danger-button" type="button" onClick={() => alterarPacientes(-1)}>
								Excluir atendimento
							</button>
							<button className="dashboard-primary-button" type="submit">
								Adicionar / salvar
							</button>
						</div>
					</form>
				</section>
			</div>

			<section className="financeiro-panel financeiro-table-panel">
				<div className="financeiro-panel-heading" style={{ padding: "25px 24px 0", marginBottom: 8 }}>
					<div>
						<span className="dashboard-kicker">Acompanhamento</span>
						<h2>Resumo mensal</h2>
					</div>
				</div>
				<div className="financeiro-table-wrap">
					<table className="financeiro-table">
						<thead>
							<tr><th>Mês</th><th>Pacientes</th><th>Valor da sessão</th><th>Lucro bruto</th><th>Lucro líquido</th><th>Ação</th></tr>
						</thead>
						<tbody>
							{resumos.map((mes) => (
								<tr className={mes.id === mesSelecionado ? "financeiro-selected-row" : ""} key={mes.id}>
									<td><strong>{mes.mes}</strong></td>
									<td>{mes.pacientes}</td>
									<td>{formatarMoeda(mes.valorSessao)}</td>
									<td>{formatarMoeda(mes.lucroBruto)}</td>
									<td className={mes.lucroLiquido >= 0 ? "financeiro-positive" : "financeiro-negative"}>{formatarMoeda(mes.lucroLiquido)}</td>
									  <td><button className="financeiro-row-action" type="button" onClick={() => selecionarMes(mes.id)}>Configurar</button></td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
}

export default Financeiro;
