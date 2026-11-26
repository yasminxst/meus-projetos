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
        Schema::table('pacientes', function (Blueprint $table) {
            if (!Schema::hasColumn('pacientes', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            }
        });

        Schema::table('movimentacoes_financeiras', function (Blueprint $table) {
            if (!Schema::hasColumn('movimentacoes_financeiras', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('movimentacoes_financeiras', 'agendamento_id')) {
                $table->foreignId('agendamento_id')->nullable()->after('user_id')->constrained('agendamentos')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('movimentacoes_financeiras', function (Blueprint $table) {
            if (Schema::hasColumn('movimentacoes_financeiras', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn(['user_id']);
            }
            if (Schema::hasColumn('movimentacoes_financeiras', 'agendamento_id')) {
                $table->dropForeign(['agendamento_id']);
                $table->dropColumn(['agendamento_id']);
            }
        });

        Schema::table('pacientes', function (Blueprint $table) {
            if (Schema::hasColumn('pacientes', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn(['user_id']);
            }
        });
    }
};
