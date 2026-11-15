<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model MovimentacaoFinanceira
 * 
 * Gerencia as entradas (receitas) e saídas (despesas) do consultório.
 * Não é gerado automaticamente a partir de consultas, respeitando a separação
 * estrita de regras de negócio entre a Agenda e o Financeiro.
 */
class MovimentacaoFinanceira extends Model
{
    use HasFactory;

    protected $table = 'movimentacoes_financeiras';

    protected $fillable = [
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
}
