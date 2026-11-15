<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Agendamento
 * 
 * Gerencia as consultas e compromissos profissionais no Lumina.
 * Permite diferenciar consultas agendadas, realizadas e canceladas,
 * além de armazenar horários de início e fim e categorias com legenda de cores.
 */
class Agendamento extends Model
{
    use HasFactory;

    protected $table = 'agendamentos';

    protected $fillable = [
        'nome',
        'descricao',
        'data',
        'horario_inicio',
        'horario_fim',
        'categoria',
        'tone',
        'status',
        'observacoes',
    ];

    protected $casts = [
        'data' => 'date:Y-m-d',
    ];

    protected $appends = [
        'horario',
        'tipo',
    ];

    /**
     * Alias para compatibilidade: $agendamento->horario retorna horario_inicio.
     */
    public function getHorarioAttribute(): string
    {
        return $this->horario_inicio ?? '';
    }

    public function setHorarioAttribute(?string $value): void
    {
        $this->attributes['horario_inicio'] = $value ?? '';
    }

    /**
     * Alias para compatibilidade: $agendamento->tipo retorna categoria.
     */
    public function getTipoAttribute(): string
    {
        return $this->categoria ?? 'Sessão de terapia';
    }

    public function setTipoAttribute(?string $value): void
    {
        $this->attributes['categoria'] = $value ?? 'Sessão de terapia';
    }
}
