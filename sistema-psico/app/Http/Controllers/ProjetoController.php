<?php

namespace App\Http\Controllers;

use App\Models\projeto;
use Illuminate\Http\Request;
use App\Http\Resources\ProjetoResource;

class ProjetoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $limit = $request ->input('limit',3);
        //Buscamos os dados mais recentes registrados respeitando o lumite definido pelo usuário, tendo por padrão 5 requisicoes
        $projetos = Projeto::latest()->take($limit) -> get();
        return ProjetoResource::collection($projetos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
         $projeto = Projeto::create($request->all());
        return response()->json($projeto, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Projeto $projeto)
    {
         $projeto = Projeto::find($projeto->id);
        return $projeto
        ? response()->json($projeto,200)
        : response()->json(['erro' => 'Projeto não achaado'],404);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, projeto $projeto)
    {
        $projeto =Projeto::findOrFail($projeto->id);
        $projeto->update($request->all());
        return response()->json($projeto, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(projeto $projeto)
    {
        $projeto = Projeto::findOrFail($projeto->id);
        $projeto->delete();
        return response()->json(null,204);
    }
}