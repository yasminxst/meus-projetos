<?php

namespace App\Http\Controllers;

use App\Models\Projeto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller de Projetos (ProjetoController)
 * 
 * Gerencia o catálogo de projetos/serviços da Yasmin.
 * É consumido em dois locais fundamentais:
 * 1. No Portal Público: Para exibir os trabalhos e serviços aos visitantes/clientes.
 * 2. No Dashboard Privado: Para criar novos projetos, alterar status (Publicado/Rascunho) ou excluir.
 */
class ProjetoController extends Controller
{
    /**
     * Retorna a lista de projetos.
     * Suporta filtro opcional para retornar apenas os "Publicados" para o portal público.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Projeto::query()->orderBy('id', 'desc');

        // Se o frontend solicitar apenas projetos publicados (ex: para a vitrine pública)
        if ($request->boolean('publicados_apenas', false)) {
            $query->where('status', 'Publicado');
        }

        $projetos = $query->get()->map(function ($projeto) {
            return [
                'id' => $projeto->id,
                // Padronização compatível com os nomes usados no React
                'title' => $projeto->titulo,
                'titulo' => $projeto->titulo,
                'category' => $projeto->categoria,
                'categoria' => $projeto->categoria,
                'status' => $projeto->status,
                'descricao' => $projeto->descricao,
                'imagem' => $projeto->imagem,
                'link' => $projeto->link,
                'tecnologias' => $projeto->tecnologias,
                'updatedAt' => $projeto->updated_at ? $projeto->updated_at->format('d M Y') : 'Recente',
                'created_at' => $projeto->created_at,
            ];
        });

        return response()->json($projetos, 200);
    }

    /**
     * Cadastra um novo projeto no banco de dados.
     */
    public function store(Request $request): JsonResponse
    {
        // Aceita tanto chaves em português quanto em inglês para flexibilidade do front
        $titulo = $request->input('title') ?? $request->input('titulo');
        $categoria = $request->input('category') ?? $request->input('categoria', 'Geral');
        $status = $request->input('status', 'Rascunho');
        $descricao = $request->input('descricao') ?? $request->input('description');
        $imagem = $request->input('imagem') ?? $request->input('image');
        $link = $request->input('link');

        if (! $titulo) {
            return response()->json(['message' => 'O título do projeto é obrigatório.'], 422);
        }

        $projeto = Projeto::create([
            'titulo' => $titulo,
            'categoria' => $categoria,
            'status' => $status,
            'descricao' => $descricao,
            'imagem' => $imagem,
            'link' => $link,
        ]);

        return response()->json([
            'message' => 'Projeto criado com sucesso!',
            'projeto' => [
                'id' => $projeto->id,
                'title' => $projeto->titulo,
                'titulo' => $projeto->titulo,
                'category' => $projeto->categoria,
                'categoria' => $projeto->categoria,
                'status' => $projeto->status,
                'descricao' => $projeto->descricao,
                'updatedAt' => 'Agora',
            ],
        ], 201);
    }

    /**
     * Exibe os detalhes de um projeto específico.
     */
    public function show(Projeto $projeto): JsonResponse
    {
        return response()->json($projeto, 200);
    }

    /**
     * Atualiza dados de um projeto existente.
     */
    public function update(Request $request, Projeto $projeto): JsonResponse
    {
        $titulo = $request->input('title') ?? $request->input('titulo', $projeto->titulo);
        $categoria = $request->input('category') ?? $request->input('categoria', $projeto->categoria);
        $status = $request->input('status', $projeto->status);
        $descricao = $request->input('descricao', $projeto->descricao);
        $link = $request->input('link', $projeto->link);

        $projeto->update([
            'titulo' => $titulo,
            'categoria' => $categoria,
            'status' => $status,
            'descricao' => $descricao,
            'link' => $link,
        ]);

        return response()->json([
            'message' => 'Projeto atualizado com sucesso!',
            'projeto' => [
                'id' => $projeto->id,
                'title' => $projeto->titulo,
                'titulo' => $projeto->titulo,
                'category' => $projeto->categoria,
                'categoria' => $projeto->categoria,
                'status' => $projeto->status,
                'descricao' => $projeto->descricao,
                'updatedAt' => $projeto->updated_at->format('d M Y'),
            ],
        ], 200);
    }

    /**
     * Remove um projeto do banco de dados.
     */
    public function destroy(Projeto $projeto): JsonResponse
    {
        $projeto->delete();

        return response()->json([
            'message' => 'Projeto removido com sucesso!',
        ], 200);
    }
}