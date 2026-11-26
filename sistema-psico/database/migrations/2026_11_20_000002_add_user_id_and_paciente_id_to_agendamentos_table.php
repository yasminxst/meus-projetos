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
            if (!Schema::hasColumn('agendamentos', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('agendamentos', 'paciente_id')) {
                $table->foreignId('paciente_id')->nullable()->after('user_id')->constrained('pacientes')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agendamentos', function (Blueprint $table) {
            if (Schema::hasColumn('agendamentos', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn(['user_id']);
            }
            if (Schema::hasColumn('agendamentos', 'paciente_id')) {
                $table->dropForeign(['paciente_id']);
                $table->dropColumn(['paciente_id']);
            }
        });
    }
};
