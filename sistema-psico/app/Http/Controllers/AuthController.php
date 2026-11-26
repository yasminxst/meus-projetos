<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

/**
 * Controller de Autenticação e Conta (AuthController)
 * 
 * Gerencia o ciclo de autenticação, perfil e ajustes de conta do profissional.
 */
class AuthController extends Controller
{
    /**
     * Realiza o login do usuário e retorna token Sanctum com role e perfil.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required' => 'O campo e-mail é obrigatório.',
            'email.email' => 'Por favor, informe um e-mail válido.',
            'password.required' => 'A senha é obrigatória.',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Credenciais inválidas. Verifique seu e-mail e senha.',
            ], 401);
        }

        if (isset($user->is_active) && !$user->is_active) {
            return response()->json([
                'message' => 'Esta conta foi desativada pelo administrador.',
            ], 403);
        }

        // Remove tokens antigos do mesmo usuário
        $user->tokens()->delete();

        // Gera novo token
        $token = $user->createToken('frontend-access-token')->plainTextToken;

        return response()->json([
            'message' => 'Login realizado com sucesso!',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ?? 'psicologo',
                'crp' => $user->crp,
                'telefone' => $user->telefone,
                'bio' => $user->bio,
                'foto_perfil' => $user->foto_perfil,
            ],
        ], 200);
    }

    /**
     * Retorna os dados do usuário atualmente logado.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ?? 'psicologo',
                'crp' => $user->crp,
                'telefone' => $user->telefone,
                'bio' => $user->bio,
                'foto_perfil' => $user->foto_perfil,
            ],
        ], 200);
    }

    /**
     * Encerra a sessão e revoga o token de acesso ativo.
     */
    public function logout(Request $request): JsonResponse
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Sessão encerrada com sucesso.',
        ], 200);
    }

    /**
     * Atualização de senha (Ajustes da Conta).
     */
    public function atualizarSenha(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'current_password.required' => 'Informe a senha atual.',
            'password.required' => 'Informe a nova senha.',
            'password.min' => 'A nova senha deve ter no mínimo 6 caracteres.',
            'password.confirmed' => 'A confirmação de senha não confere.',
        ]);

        if (! Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'A senha atual informada está incorreta.',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Senha atualizada com sucesso!',
        ], 200);
    }

    /**
     * Atualização do e-mail de acesso (Ajustes da Conta).
     */
    public function atualizarEmail(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'email' => ['required', 'email', 'unique:users,email,' . $user->id],
        ], [
            'email.required' => 'Informe o novo endereço de e-mail.',
            'email.email' => 'Informe um e-mail válido.',
            'email.unique' => 'Este e-mail já está sendo utilizado por outro usuário.',
        ]);

        $user->update([
            'email' => $validated['email'],
        ]);

        return response()->json([
            'message' => 'E-mail de acesso atualizado com sucesso!',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ], 200);
    }
}
