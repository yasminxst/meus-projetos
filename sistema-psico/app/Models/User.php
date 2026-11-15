<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\HasApiTokens;

/**
 * Model User
 * 
 * Representa os usuários autenticáveis no sistema.
 * Utiliza o trait HasApiTokens do Laravel Sanctum para emissão e validação
 * segura de tokens de API (Bearer Tokens) consumidos pelo frontend.
 */
#[Fillable(['name', 'email', 'password', 'telefone', 'crp', 'bio', 'foto_perfil'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Define como certos atributos devem ser tratados ao salvar/recuperar.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed', // Garante que a senha é sempre criptografada com Bcrypt
        ];
    }
}
