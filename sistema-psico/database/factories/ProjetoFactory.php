<?php

namespace Database\Factories;

use App\Models\Projeto;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Projeto>
 */
class ProjetoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'titulo' => fake()->sentence(3),
            'descricao' => fake()->paragraph(),
            'imagem' => fake()->imageUrl(640, 480, 'projects', true),
            'link' => fake()->url(),
            'tecnologias' => json_encode(fake()->words(4)), 
        ];
    }
}