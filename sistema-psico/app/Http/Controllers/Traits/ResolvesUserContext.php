<?php

namespace App\Http\Controllers\Traits;

use App\Models\User;
use Illuminate\Http\Request;

trait ResolvesUserContext
{
    /**
     * Retorna o ID do usuário efetivo para as consultas.
     * Se o usuário logado for 'admin' e enviar o cabeçalho 'X-Impersonate-User-Id',
     * consulta os dados como se fosse aquele psicólogo.
     */
    protected function getTargetUserId(Request $request): int
    {
        $user = $request->user();
        if (!$user) {
            return 1; // Fallback se não autenticado (ex: testes sem token)
        }

        $impersonateId = $request->header('X-Impersonate-User-Id');
        if ($user->isAdmin() && !empty($impersonateId) && is_numeric($impersonateId)) {
            $targetUser = User::find((int) $impersonateId);
            if ($targetUser) {
                return (int) $targetUser->id;
            }
        }

        return (int) $user->id;
    }

    /**
     * Retorna o usuário efetivo.
     */
    protected function getTargetUser(Request $request): ?User
    {
        $targetId = $this->getTargetUserId($request);
        return User::find($targetId) ?? $request->user();
    }
}
