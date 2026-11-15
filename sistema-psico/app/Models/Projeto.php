<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Projeto
 * 
 * Representa os projetos exibidos tanto no Dashboard administrativo quanto no Portal público.
 * Utiliza $fillable para autorizar quais campos podem ser preenchidos em massa (mass assignment).
 */
class Projeto extends Model
{
    use HasFactory;

    // Campos que podem ser preenchidos via formulários/requisições da API
    protected $fillable = [
        'titulo',
        'categoria',
        'status',
        'descricao',
        'imagem',
        'link',
        'tecnologias',
    ];

    // Converte automaticamente a coluna JSON tecnologias em array PHP ao acessar
    protected $casts = [
        'tecnologias' => 'array',
    ];
}
