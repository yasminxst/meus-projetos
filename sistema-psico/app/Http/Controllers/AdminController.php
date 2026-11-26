<?php

namespace App\Http\Controllers;

use App\Models\Agendamento;
use App\Models\MovimentacaoFinanceira;
use App\Models\Paciente;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Controller Administrativo (AdminController)
 * 
 * Funcionalidades exclusivas do Administrador:
 * - Gestão de profissionais/psicólogos cadastrados.
 * - Suporte à alternância de perfil / visualização na perspectiva de outro usuário.
 * - Estatísticas consolidadas da clínica.
 */
class AdminController extends Controller
{
    /**
     * Lista todos os psicólogos cadastrados na clínica.
     */
    public function psicologos(Request $request): JsonResponse
    {
        $psicologos = User::withCount(['pacientes', 'agendamentos', 'produtos'])
            ->orderBy('role', 'asc')
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'email', 'role', 'is_active', 'crp', 'telefone', 'created_at']);

        return response()->json([
            'total' => $psicologos->count(),
            'psicologos' => $psicologos,
        ], 200);
    }

    /**
     * Cadastra um novo psicólogo na clínica.
     */
    public function storePsicologo(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'crp' => ['nullable', 'string', 'max:50'],
            'telefone' => ['nullable', 'string', 'max:50'],
            'role' => ['nullable', 'in:admin,psicologo'],
        ], [
            'name.required' => 'O nome do profissional é obrigatório.',
            'email.required' => 'O e-mail é obrigatório.',
            'email.unique' => 'Este e-mail já está cadastrado no sistema.',
            'password.required' => 'A senha temporária é obrigatória.',
        ]);

        $psicologo = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'psicologo',
            'is_active' => true,
            'crp' => $validated['crp'] ?? null,
            'telefone' => $validated['telefone'] ?? null,
        ]);

        return response()->json([
            'message' => 'Psicólogo cadastrado com sucesso!',
            'psicologo' => $psicologo,
        ], 201);
    }

    /**
     * Ativa ou desativa a conta de um psicólogo.
     */
    public function toggleStatus(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'Você não pode desativar seu próprio usuário administrador.',
            ], 422);
        }

        $user->is_active = !$user->is_active;
        $user->save();

        $statusMsg = $user->is_active ? 'ativada' : 'desativada';

        return response()->json([
            'message' => "Conta do profissional {$user->name} {$statusMsg} com sucesso.",
            'is_active' => $user->is_active,
        ], 200);
    }

    /**
     * Estatísticas gerais consolidadas de toda a clínica.
     */
    public function estatisticasGerais(): JsonResponse
    {
        $hoje = Carbon::today()->format('Y-m-d');
        $anoAtual = Carbon::today()->year;

        $totalPsicologos = User::where('role', 'psicologo')->where('is_active', true)->count();
        $totalPacientes = Paciente::where('status', 'ativo')->count();
        $consultasHojeTotal = Agendamento::whereDate('data', $hoje)->count();
        $receitasAnoClinica = MovimentacaoFinanceira::whereYear('data', $anoAtual)->where('tipo', 'receita')->sum('valor');

        return response()->json([
            'total_psicologos_ativos' => $totalPsicologos,
            'total_pacientes_ativos' => $totalPacientes,
            'consultas_hoje_total' => $consultasHojeTotal,
            'receitas_ano_clinica' => (float) $receitasAnoClinica,
        ], 200);
    }
}
