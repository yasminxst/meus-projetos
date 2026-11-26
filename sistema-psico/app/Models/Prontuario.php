<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model Prontuario
 * 
 * Gerencia os registros clínicos e evoluções de sessão com sigilo profissional.
 */
class Prontuario extends Model
{
    use HasFactory;

    protected $table = 'prontuarios';

    protected $fillable = [
        'paciente_id',
        'user_id',
        'data_sessao',
        'titulo',
        'evolucao',
        'metas_terapeuticas',
        'observacoes',
    ];

    protected $casts = [
        'data_sessao' => 'date:Y-m-d',
    ];

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
