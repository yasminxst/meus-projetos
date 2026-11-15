<?php

namespace App\Http\Controllers;

use App\Models\MovimentacaoFinanceira;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller Financeiro Lumina (FinanceiroController)
 * 
 * Gerencia as movimentações financeiras reais (receitas e despesas) do consultório:
 * - Filtros estritos: Inicializa sem seleção e só carrega dados após escolha manual do usuário (Mês, Ano, Período).
 * - Histórico dos últimos meses.
 * - Cálculo consolidado de receitas, despesas e saldo real.
 * - Cadastro e exclusão de movimentações manuais com persistência no banco SQLite.
 */
class FinanceiroController extends Controller
{
    /**
     * Consulta as movimentações financeiras respeitando a regra estrita de filtros.
     * Se nenhum filtro for enviado, retorna filtros_aplicados = false.
     */
    public function index(Request $request): JsonResponse
    {
        $mes = $request->input('mes'); // 0 a 11 ou 1 a 12
        $ano = $request->input('ano'); // Ex: 2026
        $periodo = $request->input('periodo'); // 'mes', 'trimestre', 'semestre', 'ano', 'tudo'

        // Regra estrita: Se o usuário não selecionou nenhum filtro, não carrega dados automaticamente
        if ($mes === null && $ano === null && empty($periodo)) {
            return response()->json([
                'filtros_aplicados' => false,
                'mensagem' => 'Nenhum filtro selecionado. Selecione o mês, ano ou período desejado para consultar.',
                'receitas' => 0,
                'despesas' => 0,
                'saldo' => 0,
                'movimentacoes' => [],
                'historico' => [],
            ], 200);
        }

        $query = MovimentacaoFinanceira::query()->orderBy('data', 'desc')->orderBy('id', 'desc');

        // Filtro por Ano
        if (! empty($ano)) {
            $query->whereYear('data', (int) $ano);
        }

        // Filtro por Mês (se informado)
        if ($mes !== null && $mes !== '') {
            $mesInt = (int) $mes;
            // Se o front enviar zero-indexed (0 a 11), converte para 1 a 12
            if ($request->boolean('zero_indexed', false)) {
                $mesInt += 1;
            }
            $query->whereMonth('data', $mesInt);
        }

        // Filtro por Período
        if ($periodo === 'trimestre') {
            $mesRef = $mes !== null ? ((int) $mes) : Carbon::now()->month;
            $inicioTrimestre = max(1, $mesRef - 2);
            $query->whereMonth('data', '>=', $inicioTrimestre)->whereMonth('data', '<=', $mesRef);
        } elseif ($periodo === 'semestre') {
            $mesRef = $mes !== null ? ((int) $mes) : Carbon::now()->month;
            $inicioSemestre = max(1, $mesRef - 5);
            $query->whereMonth('data', '>=', $inicioSemestre)->whereMonth('data', '<=', $mesRef);
        }

        $movimentacoes = $query->get();

        // Cálculos reais com base nos registros do banco
        $receitas = (float) $movimentacoes->where('tipo', 'receita')->sum('valor');
        $despesas = (float) $movimentacoes->where('tipo', 'despesa')->sum('valor');
        $saldo = round($receitas - $despesas, 2);

        // Histórico mensal agrupado dos últimos meses para visualização gráfica
        $nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        $historico = [];

        // Monta os últimos 6 meses com base nas movimentações encontradas
        for ($m = 1; $m <= 12; $m++) {
            $recMes = (float) MovimentacaoFinanceira::whereMonth('data', $m)
                ->when($ano, fn ($q) => $q->whereYear('data', (int) $ano))
                ->where('tipo', 'receita')
                ->sum('valor');

            $despMes = (float) MovimentacaoFinanceira::whereMonth('data', $m)
                ->when($ano, fn ($q) => $q->whereYear('data', (int) $ano))
                ->where('tipo', 'despesa')
                ->sum('valor');

            if ($recMes > 0 || $despMes > 0 || ($mes !== null && ((int) $mes) === $m)) {
                $historico[] = [
                    'mesNumero' => $m,
                    'mes' => $nomesMeses[$m - 1],
                    'receitas' => $recMes,
                    'despesas' => $despMes,
                    'saldo' => round($recMes - $despMes, 2),
                ];
            }
        }

        return response()->json([
            'filtros_aplicados' => true,
            'filtros' => [
                'mes' => $mes,
                'ano' => $ano,
                'periodo' => $periodo,
            ],
            'receitas' => $receitas,
            'despesas' => $despesas,
            'saldo' => $saldo,
            'total_movimentacoes' => $movimentacoes->count(),
            'movimentacoes' => $movimentacoes,
            'historico' => $historico,
        ], 200);
    }

    /**
     * Cadastra uma nova movimentação financeira (Receita ou Despesa).
     */
    public function store(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'descricao' => ['required', 'string', 'max:255'],
            'tipo' => ['required', 'in:receita,despesa'],
            'valor' => ['required', 'numeric', 'min:0.01'],
            'data' => ['required', 'date'],
            'categoria' => ['required', 'string', 'max:100'],
        ], [
            'descricao.required' => 'A descrição da movimentação é obrigatória.',
            'tipo.required' => 'O tipo (receita ou despesa) é obrigatório.',
            'valor.required' => 'O valor é obrigatório.',
            'valor.min' => 'O valor deve ser maior que zero.',
            'data.required' => 'A data da movimentação é obrigatória.',
            'categoria.required' => 'A categoria é obrigatória.',
        ]);

        $movimentacao = MovimentacaoFinanceira::create($dados);

        return response()->json([
            'message' => 'Alterações salvas com sucesso!',
            'movimentacao' => $movimentacao,
        ], 201);
    }

    /**
     * Remove uma movimentação financeira pelo ID.
     */
    public function destroy(MovimentacaoFinanceira $movimentacao): JsonResponse
    {
        $movimentacao->delete();

        return response()->json([
            'message' => 'Alterações salvas com sucesso!',
        ], 200);
    }
}
