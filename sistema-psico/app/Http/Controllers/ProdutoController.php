<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\ResolvesUserContext;
use App\Models\Produto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller de Produtos e Serviços do Psicólogo
 * 
 * Gerencia a área de produtos: cursos, e-books, palestras, mentorias e pacotes de sessões.
 */
class ProdutoController extends Controller
{
    use ResolvesUserContext;

    /**
     * Lista os produtos e serviços do profissional.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $this->getTargetUserId($request);

        $produtos = Produto::where('user_id', $userId)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($produtos, 200);
    }

    /**
     * Cadastra um novo produto ou serviço.
     */
    public function store(Request $request): JsonResponse
    {
        $userId = $this->getTargetUserId($request);

        $validated = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'tipo' => ['required', 'string', 'max:50'],
            'descricao' => ['nullable', 'string'],
            'preco' => ['required', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:ativo,inativo,rascunho'],
            'link_acesso' => ['nullable', 'string', 'max:500'],
        ], [
            'nome.required' => 'O nome do produto/serviço é obrigatório.',
            'tipo.required' => 'Selecione a categoria do produto.',
            'preco.required' => 'Informe o preço do produto.',
            'preco.min' => 'O preço deve ser zero ou positivo.',
        ]);

        $validated['user_id'] = $userId;
        $validated['status'] = $validated['status'] ?? 'ativo';

        $produto = Produto::create($validated);

        return response()->json([
            'message' => 'Produto cadastrado com sucesso!',
            'produto' => $produto,
        ], 201);
    }

    /**
     * Atualiza um produto.
     */
    public function update(Request $request, Produto $produto): JsonResponse
    {
        $validated = $request->validate([
            'nome' => ['sometimes', 'required', 'string', 'max:255'],
            'tipo' => ['sometimes', 'required', 'string', 'max:50'],
            'descricao' => ['nullable', 'string'],
            'preco' => ['sometimes', 'required', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:ativo,inativo,rascunho'],
            'link_acesso' => ['nullable', 'string', 'max:500'],
        ]);

        $produto->update($validated);

        return response()->json([
            'message' => 'Produto atualizado com sucesso!',
            'produto' => $produto,
        ], 200);
    }

    /**
     * Remove um produto.
     */
    public function destroy(Produto $produto): JsonResponse
    {
        $produto->delete();

        return response()->json([
            'message' => 'Produto removido com sucesso.',
        ], 200);
    }
}
