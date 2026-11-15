<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration para Movimentações Financeiras (Receitas e Despesas).
 * 
 * Armazena cada lançamento financeiro individual realizado pelo usuário,
 * garantindo histórico de movimentações, categorias e cálculo de saldo.
 */
return new class extends Migration
{
    /**
     * Executa a criação da tabela no banco de dados.
     */
    public function up(): void
    {
        Schema::create('movimentacoes_financeiras', function (Blueprint $table) {
            $table->id();
            // Descrição da movimentação (ex: "Sessão de Terapia - Beatriz", "Aluguel da Sala", "Supervisão Clínica")
            $table->string('descricao');
            // Tipo de movimentação: 'receita' ou 'despesa'
            $table->enum('tipo', ['receita', 'despesa']);
            // Valor monetário em reais (decimal 10 dígitos com 2 casas decimais)
            $table->decimal('valor', 10, 2);
            // Data da movimentação (YYYY-MM-DD)
            $table->date('data');
            // Categoria (ex: "Atendimentos", "Consultório", "Cursos / Supervisão", "Material Clínico", "Outros")
            $table->string('categoria')->default('Atendimentos');
            $table->timestamps();
        });
    }

    /**
     * Reverte a criação da tabela.
     */
    public function down(): void
    {
        Schema::dropIfExists('movimentacoes_financeiras');
    }
};
