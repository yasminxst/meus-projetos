<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\ResolvesUserContext;
use App\Models\Paciente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PacienteController extends Controller
{
    use ResolvesUserContext;

    /**
     * Lista os pacientes do profissional ativo.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $this->getTargetUserId($request);

        $pacientes = Paciente::where('user_id', $userId)
            ->with(['agendamentos' => function ($q) {
                $q->latest()->take(3);
            }])
            ->orderBy('nome', 'asc')
            ->get();

        return response()->json($pacientes, 200);
    }

    /**
     * Cadastra um novo paciente.
     */
    public function store(Request $request): JsonResponse
    {
        $userId = $this->getTargetUserId($request);

        $validated = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'sobrenome' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:ativo,inativo'],
            'telefone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'endereco' => ['nullable', 'string', 'max:255'],
            'data_nascimento' => ['nullable', 'date'],
        ]);

        $validated['user_id'] = $userId;
        $validated['sobrenome'] = $validated['sobrenome'] ?? '';
        $validated['status'] = $validated['status'] ?? 'ativo';

        $paciente = Paciente::create($validated);

        return response()->json($paciente, 201);
    }

    /**
     * Exibe o paciente com histórico e prontuários.
     */
    public function show(Request $request, Paciente $paciente): JsonResponse
    {
        $paciente->load(['agendamentos' => function ($q) {
            $q->orderBy('data', 'desc')->orderBy('horario_inicio', 'desc');
        }, 'prontuarios']);

        return response()->json($paciente, 200);
    }

    /**
     * Atualiza dados do paciente.
     */
    public function update(Request $request, Paciente $paciente): JsonResponse
    {
        $validated = $request->validate([
            'nome' => ['sometimes', 'required', 'string', 'max:255'],
            'sobrenome' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:ativo,inativo'],
            'telefone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'endereco' => ['nullable', 'string', 'max:255'],
            'data_nascimento' => ['nullable', 'date'],
        ]);

        $paciente->update($validated);

        return response()->json($paciente, 200);
    }

    /**
     * Remove um paciente.
     */
    public function destroy(Paciente $paciente): JsonResponse
    {
        $paciente->delete();

        return response()->json(null, 204);
    }
}
