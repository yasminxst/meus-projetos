<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('projetos', function (Blueprint $table) {
            $table->id();
            // Título do projeto ou serviço (ex: "Clínica Aurora")
            $table->string('titulo');
            // Categoria de atuação (ex: "Identidade visual", "Web design", "E-commerce")
            $table->string('categoria')->default('Geral');
            // Status de publicação no portfólio ("Publicado" ou "Rascunho")
            $table->string('status')->default('Publicado');
            // Descrição detalhada do projeto
            $table->text('descricao')->nullable();
            // Imagem de capa ou miniatura
            $table->string('imagem')->nullable();
            // Link de demonstração ou repositório
            $table->string('link')->nullable();
            // Lista de tecnologias ou tags em JSON
            $table->json('tecnologias')->nullable();
            $table->timestamps();
        });
    }

    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projetos');
    }
};
