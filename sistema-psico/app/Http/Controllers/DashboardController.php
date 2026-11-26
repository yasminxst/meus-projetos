<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\ResolvesUserContext;
use App\Models\Agendamento;
use App\Models\Paciente;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller do Dashboard Lumina (DashboardController)
 * 
 * Fornece os indicadores e notificações consolidadas do ambiente do consultório:
 * 1. Pacientes ativos (status = 'ativo' do profissional).
 * 2. Consultas agendadas para o dia atual (data = hoje, status = 'agendado').
 * 3. Agendamentos do mês (todas as consultas marcadas no mês corrente).
 * 4. Atendimentos no ano (consultas realizadas no ano corrente).
 * 5. Notificações e alertas sobre próximos horários.
 */
class DashboardController extends Controller
{
    use ResolvesUserContext;

    /**
     * Retorna os 4 indicadores e as atualizações consolidadas do Dashboard.
     */
    public function stats(Request $request): JsonResponse
    {
        $userId = $this->getTargetUserId($request);
        $hoje = Carbon::today()->format('Y-m-d');
        $mesAtual = Carbon::today()->month;
        $anoAtual = Carbon::today()->year;

        // 1. Pacientes Ativos
        $pacientesAtivos = Paciente::where('user_id', $userId)
            ->where('status', 'ativo')
            ->count();

        // 2. Consultas do dia (hoje e agendado)
        $consultasHoje = Agendamento::where('user_id', $userId)
            ->whereDate('data', $hoje)
            ->where('status', 'agendado')
            ->count();

        // 3. Agendamentos no mês corrente (total de consultas marcadas)
        $agendamentosMes = Agendamento::where('user_id', $userId)
            ->whereMonth('data', $mesAtual)
            ->whereYear('data', $anoAtual)
            ->count();

        // 4. Atendimentos realizados no ano
        $atendimentosAno = Agendamento::where('user_id', $userId)
            ->whereYear('data', $anoAtual)
            ->where('status', 'realizado')
            ->count();

        // --- ÚLTIMAS ATUALIZAÇÕES DA AGENDA ---
        $proximosAtendimentos = Agendamento::with('paciente')
            ->where('user_id', $userId)
            ->where('data', '>=', $hoje)
            ->where('status', 'agendado')
            ->orderBy('data', 'asc')
            ->orderBy('horario_inicio', 'asc')
            ->take(6)
            ->get();

        $eventosRecentes = Agendamento::with('paciente')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $alteracoesRecentes = Agendamento::with('paciente')
            ->where('user_id', $userId)
            ->orderBy('updated_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'pacientes_ativos' => $pacientesAtivos,
            'consultas_hoje' => $consultasHoje,
            'agendamentos_mes' => $agendamentosMes,
            'atendimentos_ano' => $atendimentosAno,
            'cards' => [
                [
                    'id' => 'pacientes_ativos',
                    'label' => 'Pacientes ativos',
                    'value' => (string) $pacientesAtivos,
                    'icon' => 'patients',
                    'tone' => 'rose',
                    'change' => 'Cadastrados no seu consultório',
                ],
                [
                    'id' => 'consultas_hoje',
                    'label' => 'Consultas hoje',
                    'value' => (string) $consultasHoje,
                    'icon' => 'calendar',
                    'tone' => 'gold',
                    'change' => 'Agendadas para hoje',
                ],
                [
                    'id' => 'agendamentos_mes',
                    'label' => 'Agendamentos no mês',
                    'value' => (string) $agendamentosMes,
                    'icon' => 'care',
                    'tone' => 'green',
                    'change' => 'Marcados neste mês',
                ],
                [
                    'id' => 'atendimentos_ano',
                    'label' => 'Atendimentos no ano',
                    'value' => (string) $atendimentosAno,
                    'icon' => 'annual',
                    'tone' => 'gold',
                    'change' => 'Realizados em ' . $anoAtual,
                ],
            ],
            'updates' => [
                'proximos_atendimentos' => $proximosAtendimentos,
                'eventos_recentes' => $eventosRecentes,
                'alteracoes_recentes' => $alteracoesRecentes,
            ],
        ], 200);
    }

    /**
     * Retorna os alertas de compromissos imediatos e próximos horários para o sino/notificações.
     */
    public function alertas(Request $request): JsonResponse
    {
        $userId = $this->getTargetUserId($request);
        $hoje = Carbon::today()->format('Y-m-d');
        $agoraHora = Carbon::now()->format('H:i');

        // Consultas de hoje agendadas
        $consultasHoje = Agendamento::with('paciente')
            ->where('user_id', $userId)
            ->whereDate('data', $hoje)
            ->where('status', 'agendado')
            ->orderBy('horario_inicio', 'asc')
            ->get();

        // Próxima consulta imediata (primeira após o horário atual)
        $proximaImediata = $consultasHoje->first(function ($c) use ($agoraHora) {
            return $c->horario_inicio >= $agoraHora;
        }) ?? $consultasHoje->first();

        return response()->json([
            'total_hoje' => $consultasHoje->count(),
            'proxima_consulta' => $proximaImediata,
            'alertas' => $consultasHoje,
        ], 200);
    }
}
