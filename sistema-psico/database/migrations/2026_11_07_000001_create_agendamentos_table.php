<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration para a tabela de Agendamentos / Eventos da Agenda.
 * 
 * Suporta o gerenciamento completo dos atendimentos do psicólogo:
 * - Agenda geral (calendário mensal e legenda por cores/categorias)
 * - Agenda diária (detalhes, horários de início e término, status)
 * - Distinção entre consultas agendadas, realizadas e canceladas
 */
return new class extends Migration
{
    /**
     * Executa a criação da tabela no banco de dados.
     */
    public function up(): void
    {
        Schema::create('agendamentos', function (Blueprint $table) {
            $table->id();
            // Data do agendamento (YYYY-MM-DD)
            $table->date('data');
            // Nome do evento ou paciente
            $table->string('nome');
            // Descrição opcional do compromisso
            $table->text('descricao')->nullable();
            // Horário inicial do atendimento (ex: "14:00")
            $table->string('horario_inicio', 10);
            // Horário final do atendimento (ex: "15:00")
            $table->string('horario_fim', 10)->nullable();
            // Categoria do compromisso (ex: "Sessão de terapia", "Avaliação psicológica", "Primeira consulta", "Retorno")
            $table->string('categoria')->default('Sessão de terapia');
            // Identificação visual vinculada à legenda de cores ("rose", "gold", "green", "blue")
            $table->string('tone', 20)->default('rose');
            // Estado do atendimento: 'agendado', 'realizado', 'cancelado'
            $table->string('status', 30)->default('agendado');
            // Anotações ou observações adicionais opcionais
            $table->text('observacoes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverte a criação da tabela.
     */
    public function down(): void
    {
        Schema::dropIfExists('agendamentos');
    }
};
