<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model LancamentoFinanceiro
 * 
 * Gerencia o controle financeiro mensal.
 * Inclui atributos calculados para lucro bruto e lucro líquido de forma automática.
 */
class LancamentoFinanceiro extends Model
{
    use HasFactory;

    protected $table = 'lancamentos_financeiros';

    protected $fillable = [
        'mes',
        'ano',
        'pacientes',
        'valor_sessao',
        'despesas',
    ];

    protected $casts = [
        'mes' => 'integer',
        'ano' => 'integer',
        'pacientes' => 'integer',
        'valor_sessao' => 'float',
        'despesas' => 'float',
    ];

    // Atributos dinâmicos adicionados automaticamente ao serializar para JSON
    protected $appends = [
        'lucro_bruto',
        'lucro_liquido',
    ];

    /**
     * Calcula o Lucro Bruto: Pacientes * Valor por Sessão
     */
    public function getLucroBrutoAttribute(): float
    {
        return round($this->pacientes * $this->valor_sessao, 2);
    }

    /**
     * Calcula o Lucro Líquido: Lucro Bruto - Despesas
     */
    public function getLucroLiquidoAttribute(): float
    {
        return round($this->lucro_bruto - $this->despesas, 2);
    }
}
