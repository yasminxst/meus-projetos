<?php

namespace App\Http\Controllers;

use App\Models\Agendamento;
use App\Models\Paciente;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller do Dashboard Lumina (DashboardController)
 * 
 * Fornece os dados consolidados do ambiente geral do consultório:
 * 1. Pacientes ativos (status = 'ativo' no cadastro de pacientes).
 * 2. Consultas agendadas para o dia atual (status = 'agendado' e data = hoje).
 * 3. Atendimentos realizados no mês (status = 'realizado' no mês corrente).
 * 4. Total de atendimentos realizados no ano (status = 'realizado' no ano corrente).
 * 
 * E a seção de últimas atualizações:
 * - Próximos atendimentos (ordem cronológica futura).
 * - Eventos adicionados recentemente.
 * - Alterações recentes na agenda.
 */
class DashboardController extends Controller
{
    /**
     * Retorna os indicadores e as atualizações consolidadas do Dashboard.
     */
    public function stats(Request $request): JsonResponse
    {
        $hoje = Carbon::today()->format('Y-m-d');
        $mesAtual = Carbon::today()->month;
        $anoAtual = Carbon::today()->year;

        // 1. Pacientes Ativos (regra: apenas status = 'ativo')
        $pacientesAtivos = Paciente::where('status', 'ativo')->count();

        // 2. Consultas agendadas para o dia atual (apenas status = 'agendado')
        $consultasHoje = Agendamento::whereDate('data', $hoje)
            ->where('status', 'agendado')
            ->count();

        // 3. Atendimentos realizados no mês (apenas status = 'realizado', cancelados não contam!)
        $atendimentosMes = Agendamento::whereMonth('data', $mesAtual)
            ->whereYear('data', $anoAtual)
            ->where('status', 'realizado')
            ->count();

        // 4. Total de atendimentos realizados no ano (apenas status = 'realizado')
        $atendimentosAno = Agendamento::whereYear('data', $anoAtual)
            ->where('status', 'realizado')
            ->count();

        // --- ÚLTIMAS ATUALIZAÇÕES DA AGENDA ---

        // A. Próximos atendimentos a partir de hoje em ordem cronológica
        $proximosAtendimentos = Agendamento::where('data', '>=', $hoje)
            ->where('status', 'agendado')
            ->orderBy('data', 'asc')
            ->orderBy('horario_inicio', 'asc')
            ->take(5)
            ->get();

        // B. Eventos adicionados recentemente (últimos criados)
        $eventosRecentes = Agendamento::latest('created_at')
            ->take(5)
            ->get();

        // C. Alterações recentes na agenda (últimos modificados)
        $alteracoesRecentes = Agendamento::latest('updated_at')
            ->take(5)
            ->get();

        return response()->json([
            'indicadores' => [
                'pacientes_ativos' => $pacientesAtivos,
                'consultas_hoje' => $consultasHoje,
                'atendimentos_mes' => $atendimentosMes,
                'atendimentos_ano' => $atendimentosAno,
            ],
            // Formato amigável em cards para compatibilidade visual direta
            'cards' => [
                [
                    'id' => 'pacientes_ativos',
                    'label' => 'Pacientes Ativos',
                    'value' => (string) $pacientesAtivos,
                    'icon' => 'patients',
                    'tone' => 'rose',
                    'change' => 'Cadastrados no consultório',
                ],
                [
                    'id' => 'consultas_hoje',
                    'label' => 'Consultas Hoje',
                    'value' => (string) $consultasHoje,
                    'icon' => 'calendar',
                    'tone' => 'gold',
                    'change' => 'Agendadas para hoje',
                ],
                [
                    'id' => 'atendimentos_mes',
                    'label' => 'Atendimentos no Mês',
                    'value' => (string) $atendimentosMes,
                    'icon' => 'care',
                    'tone' => 'green',
                    'change' => 'Realizados este mês',
                ],
                [
                    'id' => 'atendimentos_ano',
                    'label' => 'Atendimentos no Ano',
                    'value' => (string) $atendimentosAno,
                    'icon' => 'annual',
                    'tone' => 'gold',
                    'change' => 'Total realizado em ' . $anoAtual,
                ],
            ],
            'ultimas_atualizacoes' => [
                'proximos_atendimentos' => $proximosAtendimentos,
                'eventos_recentes' => $eventosRecentes,
                'alteracoes_recentes' => $alteracoesRecentes,
            ],
        ], 200);
    }

    /**
     * Endpoint específico para as últimas atualizações da agenda.
     */
    public function updates(): JsonResponse
    {
        $hoje = Carbon::today()->format('Y-m-d');

        return response()->json([
            'proximos_atendimentos' => Agendamento::where('data', '>=', $hoje)
                ->where('status', 'agendado')
                ->orderBy('data', 'asc')
                ->orderBy('horario_inicio', 'asc')
                ->take(6)
                ->get(),
            'eventos_recentes' => Agendamento::latest('created_at')->take(6)->get(),
            'alteracoes_recentes' => Agendamento::latest('updated_at')->take(6)->get(),
        ], 200);
    }
}
