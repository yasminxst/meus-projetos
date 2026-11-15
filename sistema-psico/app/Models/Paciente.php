<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    /**
     * Retorna o nome completo do paciente.
     */
    public function getNomeCompletoAttribute(): string
    {
        return trim("{$this->nome} {$this->sobrenome}");
    }
}
