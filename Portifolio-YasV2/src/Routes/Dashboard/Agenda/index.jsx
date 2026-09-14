import { useMemo, useState } from "react";
import "./agenda.css";

const pacientes = {
	"2026-09-10": [
		{ horario: "14:00", nome: "Beatriz Lima", tipo: "Sessão de terapia", tone: "rose" },
		{ horario: "15:00", nome: "Raquel Santos", tipo: "Sessão de terapia", tone: "gold" },
		{ horario: "16:00", nome: "Jhonatan Henrique", tipo: "Sessão de terapia", tone: "green" },
	],
	"2026-09-11": [
		{ horario: "09:00", nome: "Mariana Alves", tipo: "Sessão de terapia", tone: "rose" },
		{ horario: "10:30", nome: "Lucas Martins", tipo: "Sessão de terapia", tone: "gold" },
	],
};

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

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function formatDateKey(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

function Agenda() {
	const hoje = new Date(2026, 8, 10);

	const [mesAtual, setMesAtual] = useState(hoje.getMonth());
	const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());
	const [diaSelecionado, setDiaSelecionado] = useState(hoje);
	const [modalAberto, setModalAberto] = useState(false);

	const [novoEvento, setNovoEvento] = useState({
		titulo: "",
		data: formatDateKey(hoje),
		horario: "",
		tipo: "Consulta",
	});

	const eventos = useMemo(() => {
		return {
			...pacientes,
		};
	}, []);

	const primeiroDia = new Date(anoAtual, mesAtual, 1);
	const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);

	const diasDoMes = [];

	for (let i = 0; i < primeiroDia.getDay(); i++) {
		diasDoMes.push(null);
	}

	for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
		diasDoMes.push(new Date(anoAtual, mesAtual, dia));
	}

	const selecionarMesAnterior = () => {
		if (mesAtual === 0) {
			setMesAtual(11);
			setAnoAtual(anoAtual - 1);
		} else {
			setMesAtual(mesAtual - 1);
		}
	};

	const selecionarProximoMes = () => {
		if (mesAtual === 11) {
			setMesAtual(0);
			setAnoAtual(anoAtual + 1);
		} else {
			setMesAtual(mesAtual + 1);
		}
	};

	const selecionarHoje = () => {
		setMesAtual(hoje.getMonth());
		setAnoAtual(hoje.getFullYear());
		setDiaSelecionado(hoje);
	};

	const eventosDoDia = eventos[formatDateKey(diaSelecionado)] || [];

	const handleSubmit = (event) => {
		event.preventDefault();

		if (!novoEvento.titulo || !novoEvento.data || !novoEvento.horario) {
			return;
		}

		console.log("Novo evento:", novoEvento);

		setModalAberto(false);

		setNovoEvento({
			titulo: "",
			data: formatDateKey(diaSelecionado),
			horario: "",
			tipo: "Consulta",
		});
	};

	return (
		<div className="agenda-page">

			{/* CABEÇALHO */}
			<div className="agenda-page-heading">
				<div>
					<span className="dashboard-kicker">Organização</span>
					<h1>Minha agenda<span>.</span></h1>
					<p>Visualize seus atendimentos e organize seus compromissos.</p>
				</div>

				<button
					className="dashboard-primary-button"
					type="button"
					onClick={() => setModalAberto(true)}
				>
					<i className="bi bi-plus-lg" aria-hidden="true" />
					Adicionar evento
				</button>
			</div>

			{/* CONTEÚDO PRINCIPAL */}
			<div className="agenda-layout">

				{/* CALENDÁRIO */}
				<section className="dashboard-panel agenda-calendar-panel">

					<div className="agenda-calendar-header">
						<div>
							<span className="dashboard-kicker">Calendário</span>
							<h2>
								{meses[mesAtual]} {anoAtual}
							</h2>
						</div>

						<div className="agenda-calendar-actions">
							<button
								type="button"
								onClick={selecionarHoje}
								className="agenda-today-button"
							>
								Hoje
							</button>

							<button
								type="button"
								onClick={selecionarMesAnterior}
								aria-label="Mês anterior"
							>
								<span className="agenda-chevron agenda-chevron-left" aria-hidden="true" />
							</button>

							<button
								type="button"
								onClick={selecionarProximoMes}
								aria-label="Próximo mês"
							>
								<span className="agenda-chevron agenda-chevron-right" aria-hidden="true" />
							</button>
						</div>
					</div>

					<div className="agenda-calendar">

						<div className="agenda-weekdays">
							{diasSemana.map((dia) => (
								<span key={dia}>{dia}</span>
							))}
						</div>

						<div className="agenda-days">
							{diasDoMes.map((dia, index) => {
								if (!dia) {
									return (
										<div
											className="agenda-day empty"
											key={`empty-${index}`}
										/>
									);
								}

								const data = formatDateKey(dia);
								const selecionado =
									formatDateKey(diaSelecionado) === data;

								const isHoje =
									formatDateKey(hoje) === data;

								const possuiEventos =
									eventos[data]?.length > 0;

								return (
									<button
										type="button"
										key={data}
										className={`agenda-day ${
											selecionado ? "selected" : ""
										} ${isHoje ? "today" : ""}`}
										onClick={() => setDiaSelecionado(dia)}
									>
										<span className="agenda-day-number">
											{dia.getDate()}
										</span>

										{possuiEventos && (
											<span className="agenda-event-dots">
												{eventos[data]
													.slice(0, 3)
													.map((evento, index) => (
														<span
															key={index}
															className={`agenda-event-dot ${evento.tone}`}
														/>
													))}
											</span>
										)}
									</button>
								);
							})}
						</div>

					</div>
				</section>

				{/* PACIENTES DO DIA */}
				<aside className="dashboard-panel agenda-patients-panel">

					<div className="dashboard-panel-heading">
						<div>
							<span className="dashboard-kicker">
								{diaSelecionado.toLocaleDateString("pt-BR", {
									weekday: "long",
								})}
							</span>

							<h2>
								{diaSelecionado.getDate()} de{" "}
								{meses[diaSelecionado.getMonth()].toLowerCase()}
							</h2>
						</div>

						<button
							className="dashboard-more-button"
							type="button"
							onClick={() => setModalAberto(true)}
							aria-label="Adicionar evento"
						>
							<i className="bi bi-plus-lg" />
						</button>
					</div>

					<div className="agenda-patients-count">
						<strong>{eventosDoDia.length}</strong>
						<span>
							{eventosDoDia.length === 1
								? "atendimento hoje"
								: "atendimentos hoje"}
						</span>
					</div>

					<div className="agenda-patient-list">

						{eventosDoDia.length > 0 ? (
							eventosDoDia.map((paciente, index) => (
								<div
									className="agenda-patient"
									key={`${paciente.nome}-${index}`}
								>
									<div className={`agenda-patient-icon ${paciente.tone}`}>
										<i className="bi bi-person" />
									</div>

									<div className="agenda-patient-info">
										<strong>{paciente.nome}</strong>
										<span>{paciente.tipo}</span>
									</div>

									<div className="agenda-patient-time">
										{paciente.horario}
									</div>
								</div>
							))
						) : (
							<div className="agenda-empty">
								<div>
									<i className="bi bi-calendar2-check" />
								</div>

								<strong>Nenhum atendimento</strong>

								<span>
									Não há pacientes agendados para este dia.
								</span>
							</div>
						)}

					</div>

					<button
						className="agenda-add-small"
						type="button"
						onClick={() => setModalAberto(true)}
					>
						<i className="bi bi-plus-lg" />
						Novo evento
					</button>

				</aside>
			</div>

			{/* MODAL */}
			{modalAberto && (
				<div
					className="agenda-modal-overlay"
					role="presentation"
					onMouseDown={() => setModalAberto(false)}
				>
					<div
						className="agenda-modal"
						role="dialog"
						aria-modal="true"
						aria-labelledby="agenda-modal-title"
						onMouseDown={(event) => event.stopPropagation()}
					>
						<div className="agenda-modal-header">
							<div>
								<span className="dashboard-kicker">
									Novo compromisso
								</span>
								<h2 id="agenda-modal-title">Adicionar evento</h2>
							</div>

							<button
								type="button"
								onClick={() => setModalAberto(false)}
								aria-label="Fechar"
							>
								<i className="bi bi-x-lg" />
							</button>
						</div>

						<form onSubmit={handleSubmit}>

							<label>
								<span>Nome do evento</span>
								<input
									type="text"
									required
									placeholder="Ex.: Sessão com Beatriz"
									value={novoEvento.titulo}
									onChange={(event) =>
										setNovoEvento({
											...novoEvento,
											titulo: event.target.value,
										})
									}
								/>
							</label>

							<div className="agenda-form-grid">

								<label>
									<span>Data</span>
									<input
										type="date"
										required
										value={novoEvento.data}
										onChange={(event) =>
											setNovoEvento({
												...novoEvento,
												data: event.target.value,
											})
										}
									/>
								</label>

								<label>
									<span>Horário</span>
									<input
										type="time"
										required
										value={novoEvento.horario}
										onChange={(event) =>
											setNovoEvento({
												...novoEvento,
												horario: event.target.value,
											})
										}
									/>
								</label>

							</div>

							<label>
								<span>Tipo de evento</span>

								<select
									value={novoEvento.tipo}
									onChange={(event) =>
										setNovoEvento({
											...novoEvento,
											tipo: event.target.value,
										})
									}
								>
									<option>Consulta</option>
									<option>Reunião</option>
									<option>Retorno</option>
									<option>Outro</option>
								</select>
							</label>

							<div className="agenda-modal-footer">
								<button
									type="button"
									className="agenda-cancel-button"
									onClick={() => setModalAberto(false)}
								>
									Cancelar
								</button>

								<button
									type="submit"
									className="dashboard-primary-button"
								>
									<i className="bi bi-check-lg" />
									Salvar evento
								</button>
							</div>

						</form>
					</div>
				</div>
			)}

		</div>
	);
}

export default Agenda;