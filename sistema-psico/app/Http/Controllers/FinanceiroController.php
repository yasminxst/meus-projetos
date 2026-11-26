<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\ResolvesUserContext;
use App\Models\Agendamento;
use App\Models\MovimentacaoFinanceira;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Controller Financeiro Lumina (FinanceiroController)
 * 
 * Gerencia as movimentações financeiras reais (receitas e despesas) do consultório:
 * - Filtros estritos por Mês, Ano e Período vinculados ao usuário.
 * - Cálculo consolidado de receitas, despesas e saldo real.
 * - Cadastro e exclusão de movimentações manuais com persistência real.
 * - Exportação de relatórios em CSV/Excel e emissão de recibos clínicos individuais.
 */
class FinanceiroController extends Controller
{
    use ResolvesUserContext;

    /**
     * Consulta as movimentações financeiras respeitando a regra estrita de filtros.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $this->getTargetUserId($request);
        $mes = $request->input('mes');
        $ano = $request->input('ano');
        $periodo = $request->input('periodo');

        // Se o usuário não selecionou nenhum filtro, não carrega dados automaticamente
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

        $query = MovimentacaoFinanceira::where('user_id', $userId)
            ->orderBy('data', 'desc')
            ->orderBy('id', 'desc');

        if (! empty($ano)) {
            $query->whereYear('data', (int) $ano);
        }

        if ($mes !== null && $mes !== '') {
            $mesInt = (int) $mes;
            if ($request->boolean('zero_indexed', false)) {
                $mesInt += 1;
            }
            $query->whereMonth('data', $mesInt);
        }

        if (! empty($periodo) && empty($mes)) {
            $hoje = Carbon::today();
            switch ($periodo) {
                case 'mes':
                    $query->whereMonth('data', $hoje->month)->whereYear('data', $hoje->year);
                    break;
                case 'trimestre':
                    $query->where('data', '>=', $hoje->copy()->subMonths(3)->startOfDay()->format('Y-m-d'));
                    break;
                case 'semestre':
                    $query->where('data', '>=', $hoje->copy()->subMonths(6)->startOfDay()->format('Y-m-d'));
                    break;
                case 'ano':
                    $query->whereYear('data', (int) ($ano ?: $hoje->year));
                    break;
            }
        }

        $movimentacoes = $query->get();

        $receitas = (float) $movimentacoes->where('tipo', 'receita')->sum('valor');
        $despesas = (float) $movimentacoes->where('tipo', 'despesa')->sum('valor');
        $saldo = round($receitas - $despesas, 2);

        $historico = [];
        $anoBase = (int) ($ano ?: Carbon::today()->year);
        $mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        for ($m = 1; $m <= 12; $m++) {
            $recMes = (float) MovimentacaoFinanceira::where('user_id', $userId)
                ->whereYear('data', $anoBase)
                ->whereMonth('data', $m)
                ->where('tipo', 'receita')
                ->sum('valor');

            $despMes = (float) MovimentacaoFinanceira::where('user_id', $userId)
                ->whereYear('data', $anoBase)
                ->whereMonth('data', $m)
                ->where('tipo', 'despesa')
                ->sum('valor');

            if ($recMes > 0 || $despMes > 0 || $m <= Carbon::today()->month) {
                $historico[] = [
                    'mes' => $m,
                    'nome' => $mesesNomes[$m - 1],
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
     * Cadastra uma nova movimentação financeira vinculada ao usuário.
     */
    public function store(Request $request): JsonResponse
    {
        $userId = $this->getTargetUserId($request);

        $dados = $request->validate([
            'descricao' => ['required', 'string', 'max:255'],
            'tipo' => ['required', 'in:receita,despesa'],
            'valor' => ['required', 'numeric', 'min:0.01'],
            'data' => ['required', 'date'],
            'categoria' => ['required', 'string', 'max:100'],
            'agendamento_id' => ['nullable', 'exists:agendamentos,id'],
        ], [
            'descricao.required' => 'A descrição da movimentação é obrigatória.',
            'tipo.required' => 'O tipo (receita ou despesa) é obrigatório.',
            'valor.required' => 'O valor é obrigatório.',
            'valor.min' => 'O valor deve ser maior que zero.',
            'data.required' => 'A data da movimentação é obrigatória.',
            'categoria.required' => 'A categoria é obrigatória.',
        ]);

        $dados['user_id'] = $userId;

        $movimentacao = MovimentacaoFinanceira::create($dados);

        return response()->json([
            'message' => 'Alterações salvas com sucesso!',
            'movimentacao' => $movimentacao,
        ], 201);
    }

    public function destroy(MovimentacaoFinanceira $movimentacao): JsonResponse
    {
        $movimentacao->delete();

        return response()->json([
            'message' => 'Alterações salvas com sucesso!',
        ], 200);
    }

    /**
     * Exporta o relatório de movimentações filtradas em formato CSV/Excel tabular.
     */
    public function exportarCsv(Request $request): StreamedResponse
    {
        $userId = $this->getTargetUserId($request);
        $mes = $request->input('mes');
        $ano = $request->input('ano');
        $periodo = $request->input('periodo');

        $query = MovimentacaoFinanceira::where('user_id', $userId)
            ->orderBy('data', 'asc');

        if (!empty($ano)) {
            $query->whereYear('data', (int) $ano);
        }
        if ($mes !== null && $mes !== '') {
            $query->whereMonth('data', (int) $mes);
        }

        $movimentacoes = $query->get();

        $nomeArquivo = 'relatorio_financeiro_' . date('Y_m_d_His') . '.csv';

        return response()->streamDownload(function () use ($movimentacoes) {
            $output = fopen('php://output', 'w');
            // UTF-8 BOM para garantir acentos corretos no Microsoft Excel
            fputs($output, "\xEF\xBB\xBF");
            fputcsv($output, ['Identificador', 'Descricao', 'Tipo', 'Categoria', 'Data', 'Valor (R$)'], ';');

            foreach ($movimentacoes as $m) {
                fputcsv($output, [
                    '#' . $m->id,
                    $m->descricao,
                    $m->tipo === 'receita' ? 'Receita' : 'Despesa',
                    $m->categoria,
                    Carbon::parse($m->data)->format('d/m/Y'),
                    number_format($m->valor, 2, ',', '.'),
                ], ';');
            }

            fclose($output);
        }, $nomeArquivo, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Gera os dados e layout do Recibo Clínico de atendimento para impressão / PDF.
     */
    public function recibo(Request $request, Agendamento $agendamento): JsonResponse
    {
        $agendamento->load(['paciente', 'user']);
        $user = $agendamento->user ?? $request->user();

        $valor = $agendamento->valor_sessao ?: 180.00;
        $dataAtendimento = $agendamento->data ? Carbon::parse($agendamento->data)->format('d/m/Y') : Carbon::today()->format('d/m/Y');

        return response()->json([
            'recibo_numero' => str_pad((string) $agendamento->id, 6, '0', STR_PAD_LEFT),
            'paciente_nome' => $agendamento->nome,
            'paciente_cpf' => $agendamento->paciente?->cpf ?? 'Não informado',
            'valor' => $valor,
            'valor_formatado' => 'R$ ' . number_format($valor, 2, ',', '.'),
            'servico' => $agendamento->categoria ?: 'Atendimento Psicoterápico',
            'data_atendimento' => $dataAtendimento,
            'data_emissao' => Carbon::now()->format('d/m/Y'),
            'profissional_nome' => $user->name,
            'profissional_crp' => $user->crp ?? '06/184920',
            'profissional_email' => $user->email,
            'declaracao' => "Recebi de {$agendamento->nome} a importância de R$ " . number_format($valor, 2, ',', '.') . " referente a serviços de {$agendamento->categoria} realizados em {$dataAtendimento}.",
        ], 200);
    }
}
