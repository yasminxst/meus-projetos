<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PacienteResourse extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
         return [
            'id' => $this->id,
            'nome' => $this -> nome, 
            'text' => $this -> descricao,
            'endereco' => $this -> text,
            'nascimento' => $this -> link,
            'linkText' => 'Acessar',

            'tech' => is_string($this -> tecnologias) ? json_decode($this -> tecnologias) : $this -> tecnologias,



        ];
    }
}
