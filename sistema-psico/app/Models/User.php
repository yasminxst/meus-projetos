<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Model User
 * 
 * Representa os usuários autenticáveis no sistema (Administrador ou Psicólogo).
 * Utiliza o trait HasApiTokens do Laravel Sanctum para emissão e validação
 * segura de tokens de API (Bearer Tokens) consumidos pelo frontend.
 */
#[Fillable(['name', 'email', 'password', 'role', 'is_active', 'telefone', 'crp', 'bio', 'foto_perfil'])]
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
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isPsicologo(): bool
    {
        return $this->role === 'psicologo';
    }

    public function pacientes(): HasMany
    {
        return $this->hasMany(Paciente::class);
    }

    public function agendamentos(): HasMany
    {
        return $this->hasMany(Agendamento::class);
    }

    public function movimentacoesFinanceiras(): HasMany
    {
        return $this->hasMany(MovimentacaoFinanceira::class);
    }

    public function prontuarios(): HasMany
    {
        return $this->hasMany(Prontuario::class);
    }

    public function produtos(): HasMany
    {
        return $this->hasMany(Produto::class);
    }
}
