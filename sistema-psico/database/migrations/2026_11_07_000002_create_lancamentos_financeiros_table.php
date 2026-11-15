<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration para Lançamentos Financeiros.
 * 
 * Guarda o consolidado mensal do consultório:
 * - mês e ano de referência
 * - quantidade de atendimentos/pacientes
 * - valor cobrado por sessão
 * - total de despesas operacionais do mês
 */
return new class extends Migration
{
    /**
     * Executa a criação da tabela no banco de dados.
     */
    public function up(): void
    {
        Schema::create('lancamentos_financeiros', function (Blueprint $table) {
            $table->id();
            // Índice do mês (0 = Janeiro, 11 = Dezembro)
            $table->unsignedTinyInteger('mes');
            // Ano de referência (ex: 2026)
            $table->unsignedSmallInteger('ano')->default(2026);
            // Quantidade de atendimentos / pacientes atendidos no mês
            $table->unsignedInteger('pacientes')->default(0);
            // Valor médio cobrado por sessão em reais
            $table->decimal('valor_sessao', 10, 2)->default(180.00);
            // Total de despesas e custos no mês
            $table->decimal('despesas', 10, 2)->default(0.00);
            $table->timestamps();

            // Garante que só existe um registro por mês e ano
            $table->unique(['mes', 'ano']);
        });
    }

    /**
     * Reverte a criação da tabela.
     */
    public function down(): void
    {
        Schema::dropIfExists('lancamentos_financeiros');
    }
};
