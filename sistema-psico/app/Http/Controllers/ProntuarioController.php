<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\ResolvesUserContext;
use App\Models\Paciente;
use App\Models\Prontuario;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller de Prontuários e Evoluções Clínicas
 * 
 * Registra o histórico terapêutico e anotações confidenciais das sessões dos pacientes.
 */
class ProntuarioController extends Controller
{
    use ResolvesUserContext;

    /**
     * Lista todos os registros de prontuário de um paciente.
     */
    public function index(Request $request, Paciente $paciente): JsonResponse
    {
        $userId = $this->getTargetUserId($request);

        $prontuarios = Prontuario::where('paciente_id', $paciente->id)
            ->where('user_id', $userId)
            ->orderBy('data_sessao', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'paciente' => $paciente,
            'total' => $prontuarios->count(),
            'prontuarios' => $prontuarios,
        ], 200);
    }

    /**
     * Registra nova evolução clínica.
     */
    public function store(Request $request, Paciente $paciente): JsonResponse
    {
        $userId = $this->getTargetUserId($request);

        $validated = $request->validate([
            'titulo' => ['nullable', 'string', 'max:255'],
            'data_sessao' => ['required', 'date'],
            'evolucao' => ['required', 'string'],
            'metas_terapeuticas' => ['nullable', 'string'],
            'observacoes' => ['nullable', 'string'],
        ], [
            'data_sessao.required' => 'A data da sessão é obrigatória.',
            'evolucao.required' => 'O texto da evolução clínica é obrigatório.',
        ]);

        $prontuario = Prontuario::create([
            'paciente_id' => $paciente->id,
            'user_id' => $userId,
            'data_sessao' => $validated['data_sessao'],
            'titulo' => $validated['titulo'] ?? ('Evolução - ' . Carbon::parse($validated['data_sessao'])->format('d/m/Y')),
            'evolucao' => $validated['evolucao'],
            'metas_terapeuticas' => $validated['metas_terapeuticas'] ?? null,
            'observacoes' => $validated['observacoes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Evolução registrada com sucesso!',
            'prontuario' => $prontuario,
        ], 201);
    }

    /**
     * Atualiza um registro existente de prontuário.
     */
    public function update(Request $request, Prontuario $prontuario): JsonResponse
    {
        $validated = $request->validate([
            'titulo' => ['nullable', 'string', 'max:255'],
            'data_sessao' => ['sometimes', 'required', 'date'],
            'evolucao' => ['sometimes', 'required', 'string'],
            'metas_terapeuticas' => ['nullable', 'string'],
            'observacoes' => ['nullable', 'string'],
        ]);

        $prontuario->update($validated);

        return response()->json([
            'message' => 'Evolução atualizada com sucesso!',
            'prontuario' => $prontuario,
        ], 200);
    }

    /**
     * Exclui uma evolução clínica.
     */
    public function destroy(Prontuario $prontuario): JsonResponse
    {
        $prontuario->delete();

        return response()->json([
            'message' => 'Registro excluído com sucesso.',
        ], 200);
    }
}
