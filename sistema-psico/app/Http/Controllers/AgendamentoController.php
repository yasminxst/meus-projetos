<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\ResolvesUserContext;
use App\Models\Agendamento;
use App\Models\MovimentacaoFinanceira;
use App\Models\Paciente;
use App\Models\Prontuario;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Controller de Agendamentos / Atividades (AgendamentoController)
 * 
 * Gerencia a agenda do consultório Lumina:
 * - Visualização Mensal e Semanal com dias da semana.
 * - Gerenciamento de Séries Recorrentes (sessões ou período semanal/quinzenal).
 * - Detecção inteligente de conflitos de horários em consultas recorrentes.
 * - Ações em lote ou individuais em séries (escopo: 'individual' vs 'futuras').
 * - Conexão direta com Prontuário Clínico e Módulo Financeiro.
 */
class AgendamentoController extends Controller
{
    use ResolvesUserContext;

    protected array $categoriasDisponiveis = [
        ['nome' => 'Sessão de terapia', 'tone' => 'rose', 'descricao' => 'Atendimento psicoterapêutico regular'],
        ['nome' => 'Primeira consulta', 'tone' => 'green', 'descricao' => 'Acolhimento e anamnese inicial'],
        ['nome' => 'Avaliação psicológica', 'tone' => 'gold', 'descricao' => 'Aplicação de testes e avaliação diagnóstica'],
        ['nome' => 'Retorno / Acompanhamento', 'tone' => 'blue', 'descricao' => 'Reavaliação e alinhamento de conduta'],
    ];

    public function categorias(): JsonResponse
    {
        return response()->json($this->categoriasDisponiveis, 200);
    }

    /**
     * Lista os agendamentos para a Agenda Geral (mensal).
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $this->getTargetUserId($request);

        $query = Agendamento::with('paciente')
            ->where('user_id', $userId)
            ->orderBy('data', 'asc')
            ->orderBy('horario_inicio', 'asc');

        if ($request->filled('ano')) {
            $query->whereYear('data', (int) $request->input('ano'));
        }
        if ($request->filled('mes')) {
            $mes = (int) $request->input('mes');
            if ($request->boolean('zero_indexed', false)) {
                $mes += 1;
            }
            $query->whereMonth('data', $mes);
        }

        $agendamentos = $query->get();

        $calendario = [];
        foreach ($agendamentos as $item) {
            $chaveData = Carbon::parse($item->data)->format('Y-m-d');
            if (! isset($calendario[$chaveData])) {
                $calendario[$chaveData] = [];
            }
            $calendario[$chaveData][] = $item;
        }

        return response()->json([
            'total' => $agendamentos->count(),
            'agendamentos' => $agendamentos,
            'calendario' => $calendario,
        ], 200);
    }

    /**
     * Retorna a agenda da semana (7 dias) com todos os atendimentos mapeados.
     */
    public function semana(Request $request): JsonResponse
    {
        $userId = $this->getTargetUserId($request);
        $dataRef = $request->input('data') ? Carbon::parse($request->input('data')) : Carbon::today();

        // Início da semana (Segunda-feira) e término (Domingo)
        $inicioSemana = $dataRef->copy()->startOfWeek(Carbon::MONDAY);
        $fimSemana = $dataRef->copy()->endOfWeek(Carbon::SUNDAY);

        $agendamentos = Agendamento::with('paciente')
            ->where('user_id', $userId)
            ->whereBetween('data', [$inicioSemana->format('Y-m-d'), $fimSemana->format('Y-m-d')])
            ->orderBy('data', 'asc')
            ->orderBy('horario_inicio', 'asc')
            ->get();

        $dias = [];
        $nomesDias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

        for ($i = 0; $i < 7; $i++) {
            $diaAtual = $inicioSemana->copy()->addDays($i);
            $chaveData = $diaAtual->format('Y-m-d');

            $eventosDoDia = $agendamentos->filter(function ($item) use ($chaveData) {
                return Carbon::parse($item->data)->format('Y-m-d') === $chaveData;
            })->values();

            $dias[] = [
                'data' => $chaveData,
                'dia_numero' => $diaAtual->day,
                'dia_semana_nome' => $nomesDias[$i],
                'dia_semana_curto' => substr($nomesDias[$i], 0, 3),
                'is_hoje' => $diaAtual->isToday(),
                'total' => $eventosDoDia->count(),
                'compromissos' => $eventosDoDia,
            ];
        }

        return response()->json([
            'inicio_semana' => $inicioSemana->format('Y-m-d'),
            'fim_semana' => $fimSemana->format('Y-m-d'),
            'dias' => $dias,
            'total_semana' => $agendamentos->count(),
        ], 200);
    }

    /**
     * Retorna os agendamentos do dia selecionado.
     */
    public function dia(Request $request): JsonResponse
    {
        $userId = $this->getTargetUserId($request);
        $data = $request->input('data', Carbon::today()->format('Y-m-d'));
        $dataCarbon = Carbon::parse($data);

        $compromissos = Agendamento::with('paciente')
            ->where('user_id', $userId)
            ->whereDate('data', $data)
            ->orderBy('horario_inicio', 'asc')
            ->get();

        $destaques = $compromissos->take(3)->values();

        return response()->json([
            'data' => $data,
            'dataFormatada' => $dataCarbon->locale('pt_BR')->translatedFormat('l, d \d\e F'),
            'totalAgendados' => $compromissos->count(),
            'compromissos' => $compromissos,
            'destaques' => $destaques,
        ], 200);
    }

    /**
     * Salva novo agendamento avulso.
     */
    public function store(Request $request): JsonResponse
    {
        $userId = $this->getTargetUserId($request);

        $validated = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'data' => ['required', 'date'],
            'horario_inicio' => ['required', 'string'],
            'horario_fim' => ['nullable', 'string'],
            'categoria' => ['nullable', 'string'],
            'tone' => ['nullable', 'string'],
            'status' => ['nullable', 'string'],
            'status_pagamento' => ['nullable', 'string'],
            'valor_sessao' => ['nullable', 'numeric'],
            'descricao' => ['nullable', 'string'],
            'observacoes' => ['nullable', 'string'],
            'paciente_id' => ['nullable', 'exists:pacientes,id'],
        ]);

        $pacienteId = $validated['paciente_id'] ?? null;

        // Se não foi enviado paciente_id, vincula por nome ou cria
        if (!$pacienteId && !empty($validated['nome'])) {
            $partes = explode(' ', trim($validated['nome']), 2);
            $nomeP = $partes[0];
            $sobrenomeP = $partes[1] ?? '';

            $paciente = Paciente::firstOrCreate(
                ['user_id' => $userId, 'nome' => $nomeP, 'sobrenome' => $sobrenomeP],
                ['status' => 'ativo']
            );
            $pacienteId = $paciente->id;
        }

        $agendamento = Agendamento::create([
            'user_id' => $userId,
            'paciente_id' => $pacienteId,
            'nome' => $validated['nome'],
            'data' => $validated['data'],
            'horario_inicio' => $validated['horario_inicio'],
            'horario_fim' => $validated['horario_fim'] ?? null,
            'categoria' => $validated['categoria'] ?? 'Sessão de terapia',
            'tone' => $validated['tone'] ?? 'rose',
            'status' => $validated['status'] ?? 'agendado',
            'status_pagamento' => $validated['status_pagamento'] ?? 'pendente',
            'valor_sessao' => $validated['valor_sessao'] ?? 180.00,
            'descricao' => $validated['descricao'] ?? null,
            'observacoes' => $validated['observacoes'] ?? null,
        ]);

        $agendamento->load('paciente');

        return response()->json([
            'message' => 'Agendamento criado com sucesso!',
            'agendamento' => $agendamento,
        ], 201);
    }

    /**
     * Criação de Sessões Recorrentes (Por N sessões ou por Período de tempo).
     * Mantém o padrão de horário e dia da semana.
     */
    public function criarRecorrencia(Request $request): JsonResponse
    {
        $userId = $this->getTargetUserId($request);

        $validated = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'data_inicio' => ['required', 'date'],
            'horario_inicio' => ['required', 'string'],
            'horario_fim' => ['nullable', 'string'],
            'categoria' => ['nullable', 'string'],
            'tone' => ['nullable', 'string'],
            'observacoes' => ['nullable', 'string'],
            'paciente_id' => ['nullable', 'exists:pacientes,id'],
            'recorrencia_tipo' => ['nullable', 'in:semanal,quinzenal'],
            'modo' => ['required', 'in:sessoes,periodo'],
            'quantidade_sessoes' => ['nullable', 'integer', 'min:2', 'max:52'],
            'periodo_meses' => ['nullable', 'integer', 'min:1', 'max:24'],
            'valor_sessao' => ['nullable', 'numeric'],
            'status_pagamento' => ['nullable', 'string'],
            'simulacao' => ['nullable', 'boolean'],
            'ignorar_conflitos' => ['nullable', 'boolean'],
        ]);

        $pacienteId = $validated['paciente_id'] ?? null;
        if (!$pacienteId && !empty($validated['nome'])) {
            $partes = explode(' ', trim($validated['nome']), 2);
            $nomeP = $partes[0];
            $sobrenomeP = $partes[1] ?? '';

            $paciente = Paciente::firstOrCreate(
                ['user_id' => $userId, 'nome' => $nomeP, 'sobrenome' => $sobrenomeP],
                ['status' => 'ativo']
            );
            $pacienteId = $paciente->id;
        }

        $dataInicial = Carbon::parse($validated['data_inicio']);
        $tipo = $validated['recorrencia_tipo'] ?? 'semanal';
        $intervaloDias = ($tipo === 'quinzenal') ? 14 : 7;

        // Calcula as datas da série
        $datasCalculadas = [];
        if ($validated['modo'] === 'sessoes') {
            $totalSessoes = (int) ($validated['quantidade_sessoes'] ?? 4);
            for ($i = 0; $i < $totalSessoes; $i++) {
                $datasCalculadas[] = $dataInicial->copy()->addDays($i * $intervaloDias);
            }
        } else {
            $meses = (int) ($validated['periodo_meses'] ?? 1);
            $dataLimite = $dataInicial->copy()->addMonths($meses);
            $dataCursor = $dataInicial->copy();
            while ($dataCursor->lte($dataLimite)) {
                $datasCalculadas[] = $dataCursor->copy();
                $dataCursor->addDays($intervaloDias);
            }
            $totalSessoes = count($datasCalculadas);
        }

        // Verifica conflitos com compromissos existentes
        $conflitos = [];
        $datasFormatadas = [];

        foreach ($datasCalculadas as $idx => $d) {
            $dataStr = $d->format('Y-m-d');
            $conflito = Agendamento::where('user_id', $userId)
                ->whereDate('data', $dataStr)
                ->where('horario_inicio', $validated['horario_inicio'])
                ->where('status', '!=', 'cancelado')
                ->first();

            $itemData = [
                'sessao_numero' => $idx + 1,
                'data' => $dataStr,
                'dia_semana' => $d->locale('pt_BR')->translatedFormat('l'),
                'dataFormatada' => $d->format('d/m/Y'),
                'horario_inicio' => $validated['horario_inicio'],
                'tem_conflito' => (bool) $conflito,
                'conflito_com' => $conflito ? "{$conflito->nome} ({$conflito->categoria})" : null,
            ];

            if ($conflito) {
                $conflitos[] = $itemData;
            }
            $datasFormatadas[] = $itemData;
        }

        // Se for simulação ou se houver conflito e o usuário não autorizou ignorar
        if ($request->boolean('simulacao') || (!empty($conflitos) && !$request->boolean('ignorar_conflitos'))) {
            return response()->json([
                'simulacao' => true,
                'total_sessoes' => count($datasCalculadas),
                'datas' => $datasFormatadas,
                'total_conflitos' => count($conflitos),
                'conflitos' => $conflitos,
                'mensagem' => count($conflitos) > 0
                    ? 'Foram identificados horários conflitantes na série de datas. Revise ou confirme para continuar.'
                    : 'Todas as datas da série estão livres e prontas para agendamento.',
            ], 200);
        }

        // Cria a série de agendamentos no banco
        $grupoId = 'rec_' . Str::uuid()->toString();
        $agendamentosCriados = [];

        foreach ($datasCalculadas as $idx => $d) {
            $agendamento = Agendamento::create([
                'user_id' => $userId,
                'paciente_id' => $pacienteId,
                'recorrencia_grupo_id' => $grupoId,
                'recorrencia_tipo' => $tipo,
                'recorrencia_periodo' => $validated['modo'] === 'sessoes' ? "{$totalSessoes}_sessoes" : "{$validated['periodo_meses']}_meses",
                'sessao_numero' => $idx + 1,
                'sessao_total' => $totalSessoes,
                'nome' => $validated['nome'],
                'data' => $d->format('Y-m-d'),
                'horario_inicio' => $validated['horario_inicio'],
                'horario_fim' => $validated['horario_fim'] ?? null,
                'categoria' => $validated['categoria'] ?? 'Sessão de terapia',
                'tone' => $validated['tone'] ?? 'rose',
                'status' => 'agendado',
                'status_pagamento' => $validated['status_pagamento'] ?? 'pendente',
                'valor_sessao' => $validated['valor_sessao'] ?? 180.00,
                'observacoes' => $validated['observacoes'] ?? null,
            ]);

            $agendamentosCriados[] = $agendamento;
        }

        return response()->json([
            'message' => "Série recorrente com {$totalSessoes} consultas agendada com sucesso!",
            'recorrencia_grupo_id' => $grupoId,
            'total_criadas' => count($agendamentosCriados),
            'sessoes' => $agendamentosCriados,
        ], 201);
    }

    /**
     * Atualiza agendamento e opcionalmente estende as alterações para as futuras da série.
     */
    public function update(Request $request, Agendamento $agendamento): JsonResponse
    {
        $userId = $this->getTargetUserId($request);

        $validated = $request->validate([
            'nome' => ['sometimes', 'required', 'string'],
            'data' => ['sometimes', 'required', 'date'],
            'horario_inicio' => ['sometimes', 'required', 'string'],
            'horario_fim' => ['nullable', 'string'],
            'categoria' => ['nullable', 'string'],
            'tone' => ['nullable', 'string'],
            'status' => ['nullable', 'string'],
            'status_pagamento' => ['nullable', 'string'],
            'valor_sessao' => ['nullable', 'numeric'],
            'descricao' => ['nullable', 'string'],
            'observacoes' => ['nullable', 'string'],
            'paciente_id' => ['nullable', 'exists:pacientes,id'],
            'gerar_receita' => ['nullable', 'boolean'],
            'valor_receita' => ['nullable', 'numeric'],
            'escopo' => ['nullable', 'in:individual,futuras'],
        ]);

        $statusAnterior = $agendamento->status;
        $novoStatus = $validated['status'] ?? $agendamento->status;
        $escopo = $validated['escopo'] ?? 'individual';

        // Atualização em lote se o usuário solicitou atualizar esta e as futuras
        if ($escopo === 'futuras' && !empty($agendamento->recorrencia_grupo_id)) {
            $camposLote = array_filter([
                'horario_inicio' => $validated['horario_inicio'] ?? null,
                'horario_fim' => $validated['horario_fim'] ?? null,
                'categoria' => $validated['categoria'] ?? null,
                'tone' => $validated['tone'] ?? null,
                'valor_sessao' => $validated['valor_sessao'] ?? null,
                'observacoes' => $validated['observacoes'] ?? null,
            ]);

            if (!empty($camposLote)) {
                Agendamento::where('recorrencia_grupo_id', $agendamento->recorrencia_grupo_id)
                    ->where('user_id', $userId)
                    ->where('data', '>=', $agendamento->data)
                    ->update($camposLote);
            }
        }

        $agendamento->update($validated);

        // Conexão entre módulos: Gerar receita no financeiro ao marcar como realizado
        if ($novoStatus === 'realizado' && ($request->boolean('gerar_receita') || ($statusAnterior !== 'realizado' && $request->filled('gerar_receita') && $request->boolean('gerar_receita')))) {
            $valorReceita = $request->input('valor_receita', $agendamento->valor_sessao ?: 180.00);

            MovimentacaoFinanceira::firstOrCreate(
                [
                    'agendamento_id' => $agendamento->id,
                    'user_id' => $userId,
                ],
                [
                    'descricao' => 'Consulta: ' . $agendamento->nome,
                    'tipo' => 'receita',
                    'valor' => $valorReceita,
                    'data' => $agendamento->data,
                    'categoria' => 'Atendimentos',
                ]
            );

            $agendamento->status_pagamento = 'pago';
            $agendamento->save();
        }

        $agendamento->load('paciente');

        return response()->json([
            'message' => $escopo === 'futuras'
                ? 'Agendamento e sessões futuras da série atualizados com sucesso!'
                : 'Agendamento atualizado com sucesso!',
            'agendamento' => $agendamento,
        ], 200);
    }

    /**
     * Exclui agendamento (individual ou todas as futuras da série).
     */
    public function destroy(Request $request, Agendamento $agendamento): JsonResponse
    {
        $userId = $this->getTargetUserId($request);
        $escopo = $request->input('escopo', 'individual');

        if ($escopo === 'futuras' && !empty($agendamento->recorrencia_grupo_id)) {
            $removidos = Agendamento::where('recorrencia_grupo_id', $agendamento->recorrencia_grupo_id)
                ->where('user_id', $userId)
                ->where('data', '>=', $agendamento->data)
                ->delete();

            return response()->json([
                'message' => "Esta e outras {$removidos} consultas futuras da série foram removidas.",
                'removidos' => $removidos,
            ], 200);
        }

        $agendamento->delete();

        return response()->json([
            'message' => 'Agendamento removido com sucesso.',
        ], 200);
    }

    /**
     * Registra anotação ou evolução clínica no Prontuário diretamente da consulta.
     */
    public function registrarProntuario(Request $request, Agendamento $agendamento): JsonResponse
    {
        $userId = $this->getTargetUserId($request);

        $validated = $request->validate([
            'evolucao' => ['required', 'string'],
            'titulo' => ['nullable', 'string', 'max:255'],
            'metas_terapeuticas' => ['nullable', 'string'],
            'observacoes' => ['nullable', 'string'],
        ], [
            'evolucao.required' => 'O texto da evolução clínica é obrigatório.',
        ]);

        $pacienteId = $agendamento->paciente_id;
        if (!$pacienteId) {
            $partes = explode(' ', trim($agendamento->nome), 2);
            $nomeP = $partes[0];
            $sobrenomeP = $partes[1] ?? '';

            $paciente = Paciente::firstOrCreate(
                ['user_id' => $userId, 'nome' => $nomeP, 'sobrenome' => $sobrenomeP],
                ['status' => 'ativo']
            );
            $pacienteId = $paciente->id;
            $agendamento->paciente_id = $pacienteId;
            $agendamento->save();
        }

        $dataSessao = $agendamento->data ? Carbon::parse($agendamento->data)->format('Y-m-d') : Carbon::today()->format('Y-m-d');
        $sessaoInfo = $agendamento->sessao_numero ? " (Sessão #{$agendamento->sessao_numero})" : '';

        $prontuario = Prontuario::create([
            'paciente_id' => $pacienteId,
            'user_id' => $userId,
            'data_sessao' => $dataSessao,
            'titulo' => $validated['titulo'] ?? ("Evolução Clínica{$sessaoInfo} - " . Carbon::parse($dataSessao)->format('d/m/Y')),
            'evolucao' => $validated['evolucao'],
            'metas_terapeuticas' => $validated['metas_terapeuticas'] ?? null,
            'observacoes' => $validated['observacoes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Evolução clínica registrada no prontuário com sucesso!',
            'prontuario' => $prontuario,
        ], 201);
    }

    public function show(Agendamento $agendamento): JsonResponse
    {
        $agendamento->load('paciente');

        $prontuariosRecentes = [];
        if ($agendamento->paciente_id) {
            $prontuariosRecentes = Prontuario::where('paciente_id', $agendamento->paciente_id)
                ->orderBy('data_sessao', 'desc')
                ->take(3)
                ->get();
        }

        return response()->json([
            'agendamento' => $agendamento,
            'prontuarios_recentes' => $prontuariosRecentes,
        ], 200);
    }
}
