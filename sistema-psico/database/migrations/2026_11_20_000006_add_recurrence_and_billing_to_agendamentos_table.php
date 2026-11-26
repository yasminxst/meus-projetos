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
        Schema::table('agendamentos', function (Blueprint $table) {
            if (!Schema::hasColumn('agendamentos', 'recorrencia_grupo_id')) {
                $table->string('recorrencia_grupo_id', 64)->nullable()->index()->after('paciente_id');
            }
            if (!Schema::hasColumn('agendamentos', 'recorrencia_tipo')) {
                $table->string('recorrencia_tipo', 30)->nullable()->default('semanal')->after('recorrencia_grupo_id');
            }
            if (!Schema::hasColumn('agendamentos', 'recorrencia_periodo')) {
                $table->string('recorrencia_periodo', 50)->nullable()->after('recorrencia_tipo');
            }
            if (!Schema::hasColumn('agendamentos', 'sessao_numero')) {
                $table->integer('sessao_numero')->nullable()->after('recorrencia_periodo');
            }
            if (!Schema::hasColumn('agendamentos', 'sessao_total')) {
                $table->integer('sessao_total')->nullable()->after('sessao_numero');
            }
            if (!Schema::hasColumn('agendamentos', 'status_pagamento')) {
                $table->string('status_pagamento', 30)->default('pendente')->after('status');
            }
            if (!Schema::hasColumn('agendamentos', 'valor_sessao')) {
                $table->decimal('valor_sessao', 10, 2)->nullable()->default(180.00)->after('status_pagamento');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agendamentos', function (Blueprint $table) {
            $cols = [
                'recorrencia_grupo_id',
                'recorrencia_tipo',
                'recorrencia_periodo',
                'sessao_numero',
                'sessao_total',
                'status_pagamento',
                'valor_sessao',
            ];
            foreach ($cols as $col) {
                if (Schema::hasColumn('agendamentos', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
