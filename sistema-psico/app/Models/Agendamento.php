<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Model Agendamento
 * 
 * Gerencia as consultas e compromissos profissionais no Lumina.
 * Conectado ao Usuário e Paciente via chave estrangeira.
 */
class Agendamento extends Model
{
    use HasFactory;

    protected $table = 'agendamentos';

    protected $fillable = [
        'user_id',
        'paciente_id',
        'recorrencia_grupo_id',
        'recorrencia_tipo',
        'recorrencia_periodo',
        'sessao_numero',
        'sessao_total',
        'nome',
        'descricao',
        'data',
        'horario_inicio',
        'horario_fim',
        'categoria',
        'tone',
        'status',
        'status_pagamento',
        'valor_sessao',
        'observacoes',
    ];

    protected $casts = [
        'data' => 'date:Y-m-d',
        'valor_sessao' => 'float',
        'sessao_numero' => 'integer',
        'sessao_total' => 'integer',
    ];

    protected $appends = [
        'horario',
        'tipo',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class);
    }

    public function movimentacaoFinanceira(): HasOne
    {
        return $this->hasOne(MovimentacaoFinanceira::class);
    }

    public function getHorarioAttribute(): string
    {
        return $this->horario_inicio ?? '';
    }

    public function setHorarioAttribute(?string $value): void
    {
        $this->attributes['horario_inicio'] = $value ?? '';
    }

    public function getTipoAttribute(): string
    {
        return $this->categoria ?? 'Sessão de terapia';
    }

    public function setTipoAttribute(?string $value): void
    {
        $this->attributes['categoria'] = $value ?? 'Sessão de terapia';
    }
}
