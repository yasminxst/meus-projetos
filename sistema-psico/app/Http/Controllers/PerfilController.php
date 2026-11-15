<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller de Perfil Profissional (PerfilController)
 * 
 * Gerencia as informações cadastrais e profissionais do psicólogo no Lumina:
 * - Nome completo
 * - E-mail de contato profissional
 * - Telefone profissional
 * - Registro Profissional (CRP)
 * - Informações profissionais / bio
 * - Foto de perfil (URL ou Base64)
 */
class PerfilController extends Controller
{
    /**
     * Retorna os dados do perfil profissional atual.
     */
    public function show(Request $request): JsonResponse
    {
        // Se autenticado via Sanctum utiliza o usuário logado; caso contrário, utiliza o usuário padrão
        $user = $request->user() ?? User::where('email', 'yasmin@lumina.com')->first() ?? User::first();

        if (! $user) {
            return response()->json(['message' => 'Usuário não encontrado.'], 404);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'telefone' => $user->telefone ?? '(11) 98765-4321',
            'crp' => $user->crp ?? '06/184920',
            'bio' => $user->bio ?? 'Psicóloga Clínica especialista em Terapia Cognitivo-Comportamental (TCC), com foco no acolhimento de jovens e adultos.',
            'foto_perfil' => $user->foto_perfil,
        ], 200);
    }

    /**
     * Atualiza os dados do perfil profissional.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::where('email', 'yasmin@lumina.com')->first() ?? User::first();

        if (! $user) {
            return response()->json(['message' => 'Usuário não encontrado.'], 404);
        }

        $dados = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'telefone' => ['nullable', 'string', 'max:50'],
            'crp' => ['nullable', 'string', 'max:50'],
            'bio' => ['nullable', 'string'],
            'foto_perfil' => ['nullable', 'string'],
        ], [
            'name.required' => 'O campo Nome é obrigatório.',
            'email.required' => 'O campo E-mail é obrigatório.',
            'email.email' => 'Informe um e-mail válido.',
        ]);

        $user->update($dados);

        return response()->json([
            'message' => 'Alterações salvas com sucesso!',
            'perfil' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'telefone' => $user->telefone,
                'crp' => $user->crp,
                'bio' => $user->bio,
                'foto_perfil' => $user->foto_perfil,
            ],
        ], 200);
    }
}
