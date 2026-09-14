<?php

namespace App\Http\Controllers;

use App\Models\Paciente;
use Illuminate\Http\Request;
use App\Http\Resources\PacienteResourse;

class PacienteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
       return response()->json(paciente::all(),200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $paciente = Paciente::create($request->all());
        return response()->json($paciente, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Paciente $paciente)
    {
        $paciente = Paciente::find($paciente->id);
        return $paciente
        ? response() -> json($paciente, 200)
        : response()->json(['erro' => 'Paciente não encontrado'], 
        404);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Paciente $paciente)
    {
        $paciente =Paciente::findOrFail($paciente->id);
        $paciente->update($request->all());
        return response()->json($paciente, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Paciente $paciente)
    {
        $paciente= Paciente::findOrFail($paciente->id);
        $paciente->delete();
        return response()->json(null,204);
    }
}
