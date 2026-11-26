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
        Schema::create('prontuarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained('pacientes')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('data_sessao');
            $table->string('titulo')->default('Evolução de Sessão');
            $table->text('evolucao'); // Conteúdo confidencial das anotações da sessão
            $table->text('metas_terapeuticas')->nullable();
            $table->text('observacoes')->nullable();
            $table->timestamps();

            $table->index(['paciente_id', 'data_sessao']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prontuarios');
    }
};
