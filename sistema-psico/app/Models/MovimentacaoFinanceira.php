<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model MovimentacaoFinanceira
 * 
 * Gerencia as entradas (receitas) e saídas (despesas) do consultório.
 * Vinculado ao usuário profissional e opcionalmente a um agendamento específico.
 */
class MovimentacaoFinanceira extends Model
{
    use HasFactory;

    protected $table = 'movimentacoes_financeiras';

    protected $fillable = [
        'user_id',
        'agendamento_id',
        'descricao',
        'tipo',
        'valor',
        'data',
        'categoria',
    ];

    protected $casts = [
        'data' => 'date:Y-m-d',
        'valor' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function agendamento(): BelongsTo
    {
        return $this->belongsTo(Agendamento::class);
    }
}
