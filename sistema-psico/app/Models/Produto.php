<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model Produto
 * 
 * Gerencia os produtos e serviços ofertados pelo profissional:
 * Cursos, E-books, Palestras, Mentorias, Pacotes de Sessões, etc.
 */
class Produto extends Model
{
    use HasFactory;

    protected $table = 'produtos';

    protected $fillable = [
        'user_id',
        'nome',
        'tipo',
        'descricao',
        'preco',
        'status',
        'link_acesso',
    ];

    protected $casts = [
        'preco' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
