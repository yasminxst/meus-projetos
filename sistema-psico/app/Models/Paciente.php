<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Model Paciente
 * 
 * Representa os pacientes atendidos pelo consultório psicológico.
 * Contém o status ('ativo' ou 'inativo') utilizado para cálculo dos indicadores do Dashboard.
 */
class Paciente extends Model
{
    use HasFactory;

    protected $table = 'pacientes';

    protected $fillable = [
        'user_id',
        'nome',
        'sobrenome',
        'status',
        'telefone',
        'email',
        'endereco',
        'data_nascimento',
    ];

    protected $casts = [
        'data_nascimento' => 'date',
    ];

    protected $appends = ['nome_completo'];

    /**
     * Retorna o nome completo do paciente.
     */
    public function getNomeCompletoAttribute(): string
    {
        return trim("{$this->nome} {$this->sobrenome}");
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function agendamentos(): HasMany
    {
        return $this->hasMany(Agendamento::class);
    }

    public function prontuarios(): HasMany
    {
        return $this->hasMany(Prontuario::class)->orderBy('data_sessao', 'desc');
    }
}
