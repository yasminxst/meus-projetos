<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Controller de Autenticação (AuthController)
 * 
 * Responsável por gerenciar o ciclo de vida do login e acesso ao sistema.
 * Utiliza o Laravel Sanctum para fornecer tokens de acesso seguros para o React.
 */
class AuthController extends Controller
{
    /**
     * Realiza o login do usuário.
     * 
     * Fluxo:
     * 1. Valida se email e senha foram enviados no formato correto.
     * 2. Localiza o usuário no banco de dados pelo email.
     * 3. Compara a senha enviada com o hash criptografado usando Hash::check.
     * 4. Gera um Bearer Token com Sanctum e devolve em JSON para o frontend.
     */
    public function login(Request $request): JsonResponse
    {
        // Validação simples dos dados da requisição
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required' => 'O campo e-mail é obrigatório.',
            'email.email' => 'Por favor, informe um e-mail válido.',
            'password.required' => 'A senha é obrigatória.',
        ]);

        // Busca o usuário no banco
        $user = User::where('email', $credentials['email'])->first();

        // Se o usuário não existir ou a senha estiver incorreta
        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Credenciais inválidas. Verifique seu e-mail e senha.',
            ], 401);
        }

        // Remove tokens antigos do mesmo usuário (boa prática de segurança)
        $user->tokens()->delete();

        // Gera um novo token de acesso
        $token = $user->createToken('frontend-access-token')->plainTextToken;

        return response()->json([
            'message' => 'Login realizado com sucesso!',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
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
            'user' => $user,
        ], 200);
    }

    /**
     * Encerra a sessão e revoga o token de acesso ativo.
     */
    public function logout(Request $request): JsonResponse
    {
        // Exclui o token que fez a requisição atual
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Sessão encerrada com sucesso.',
        ], 200);
    }
}
