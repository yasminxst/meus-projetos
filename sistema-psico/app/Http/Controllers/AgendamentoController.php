<?php

namespace App\Http\Controllers;

use App\Models\Agendamento;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller de Agendamentos / Atividades (AgendamentoController)
 * 
 * Gerencia o ciclo completo dos atendimentos e compromissos profissionais:
 * - Agenda geral com calendário mensal, navegação entre meses e legenda de cores por categoria.
 * - Agenda diária com detalhes dos compromissos e destaque para os 3 mais próximos/recentes.
 * - Adição, edição e exclusão de eventos com persistência real no banco de dados.
 */
class AgendamentoController extends Controller
{
    // Categorias padrão da clínica com suas cores vinculadas
    protected array $categoriasDisponiveis = [
        ['nome' => 'Sessão de terapia', 'tone' => 'rose', 'descricao' => 'Atendimento psicoterapêutico regular'],
        ['nome' => 'Primeira consulta', 'tone' => 'green', 'descricao' => 'Acolhimento e anamnese inicial'],
        ['nome' => 'Avaliação psicológica', 'tone' => 'gold', 'descricao' => 'Aplicação de testes e avaliação diagnóstica'],
        ['nome' => 'Retorno / Acompanhamento', 'tone' => 'blue', 'descricao' => 'Reavaliação e alinhamento de conduta'],
    ];

    /**
     * Retorna a lista de categorias disponíveis com suas respectivas cores de legenda.
     */
    public function categorias(): JsonResponse
    {
        return response()->json($this->categoriasDisponiveis, 200);
    }

    /**
     * Lista os agendamentos para a Agenda Geral (mensal).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Agendamento::query()->orderBy('data', 'asc')->orderBy('horario_inicio', 'asc');

        // Filtro opcional por ano e mês
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

        // Agrupamento por data (formato { "YYYY-MM-DD": [...] } para alimentar o calendário React)
        $calendario = [];
        foreach ($agendamentos as $item) {
            $chaveData = Carbon::parse($item->data)->format('Y-m-d');
            if (! isset($calendario[$chaveData])) {
                $calendario[$chaveData] = [];
            }
            $calendario[$chaveData][] = [
                'id' => $item->id,
                'nome' => $item->nome,
                'descricao' => $item->descricao,
                'data' => $chaveData,
                'horario' => $item->horario_inicio,
                'horario_inicio' => $item->horario_inicio,
                'horario_fim' => $item->horario_fim,
                'categoria' => $item->categoria,
                'tipo' => $item->categoria,
                'tone' => $item->tone,
                'status' => $item->status,
                'observacoes' => $item->observacoes,
            ];
        }

        return response()->json([
            'lista' => $agendamentos,
            'calendario' => $calendario,
            'categorias' => $this->categoriasDisponiveis,
        ], 200);
    }

    /**
     * Retorna os detalhes da Agenda Diária para uma data específica.
     */
    public function dia(Request $request): JsonResponse
    {
        $dataStr = $request->input('data', Carbon::today()->format('Y-m-d'));
        $dataObj = Carbon::parse($dataStr)->locale('pt_BR');

        $compromissos = Agendamento::whereDate('data', $dataStr)
            ->orderBy('horario_inicio', 'asc')
            ->get();

        // Destaque para os três atendimentos mais próximos ou recentes em ordem cronológica
        $destaques = $compromissos->take(3)->values();

        return response()->json([
            'data' => $dataStr,
            'dataFormatada' => $dataObj->translatedFormat('l, d \d\e F \d\e Y'),
            'totalAgendados' => $compromissos->where('status', 'agendado')->count(),
            'totalRealizados' => $compromissos->where('status', 'realizado')->count(),
            'totalCancelados' => $compromissos->where('status', 'cancelado')->count(),
            'compromissos' => $compromissos,
            'destaques' => $destaques,
        ], 200);
    }

    /**
     * Cadastra um novo evento na agenda.
     */
    public function store(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'data' => ['required', 'date'],
            'horario_inicio' => ['required', 'string'],
            'horario_fim' => ['nullable', 'string'],
            'categoria' => ['required', 'string', 'max:100'],
            'tone' => ['nullable', 'string', 'max:50'],
            'descricao' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:agendado,realizado,cancelado'],
            'observacoes' => ['nullable', 'string'],
        ], [
            'nome.required' => 'O nome do evento ou paciente é obrigatório.',
            'data.required' => 'A data do evento é obrigatória.',
            'horario_inicio.required' => 'O horário inicial é obrigatório.',
            'categoria.required' => 'A categoria do compromisso é obrigatória.',
        ]);

        // Vincula a cor da legenda caso não seja passada explicitamente
        if (empty($dados['tone'])) {
            $mapCores = [
                'Sessão de terapia' => 'rose',
                'Primeira consulta' => 'green',
                'Avaliação psicológica' => 'gold',
                'Retorno / Acompanhamento' => 'blue',
            ];
            $dados['tone'] = $mapCores[$dados['categoria']] ?? 'rose';
        }

        if (empty($dados['status'])) {
            $dados['status'] = 'agendado';
        }

        $agendamento = Agendamento::create($dados);

        return response()->json([
            'message' => 'Alterações salvas com sucesso!',
            'agendamento' => $agendamento,
        ], 201);
    }

    /**
     * Atualiza um evento existente na agenda.
     */
    public function update(Request $request, Agendamento $agendamento): JsonResponse
    {
        $dados = $request->validate([
            'nome' => ['sometimes', 'required', 'string', 'max:255'],
            'data' => ['sometimes', 'required', 'date'],
            'horario_inicio' => ['sometimes', 'required', 'string'],
            'horario_fim' => ['nullable', 'string'],
            'categoria' => ['sometimes', 'required', 'string', 'max:100'],
            'tone' => ['nullable', 'string', 'max:50'],
            'descricao' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:agendado,realizado,cancelado'],
            'observacoes' => ['nullable', 'string'],
        ]);

        // Atualiza a cor se a categoria mudou
        if (isset($dados['categoria']) && empty($dados['tone'])) {
            $mapCores = [
                'Sessão de terapia' => 'rose',
                'Primeira consulta' => 'green',
                'Avaliação psicológica' => 'gold',
                'Retorno / Acompanhamento' => 'blue',
            ];
            $dados['tone'] = $mapCores[$dados['categoria']] ?? $agendamento->tone;
        }

        $agendamento->update($dados);

        return response()->json([
            'message' => 'Alterações salvas com sucesso!',
            'agendamento' => $agendamento,
        ], 200);
    }

    /**
     * Exclui um evento da agenda.
     */
    public function destroy(Agendamento $agendamento): JsonResponse
    {
        $agendamento->delete();

        return response()->json([
            'message' => 'Alterações salvas com sucesso!',
        ], 200);
    }
}
