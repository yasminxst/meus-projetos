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
        if (!Schema::hasTable('produtos')) {
            Schema::create('produtos', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('nome');
                $table->string('tipo', 50)->default('Sessão');
                $table->text('descricao')->nullable();
                $table->decimal('preco', 10, 2)->default(0.00);
                $table->string('status', 30)->default('ativo');
                $table->string('link_acesso')->nullable();
                $table->timestamps();

                $table->index(['user_id', 'status']);
            });
        } else {
            Schema::table('produtos', function (Blueprint $table) {
                if (!Schema::hasColumn('produtos', 'user_id')) {
                    $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
                }
                if (!Schema::hasColumn('produtos', 'tipo')) {
                    $table->string('tipo', 50)->default('Sessão');
                }
                if (!Schema::hasColumn('produtos', 'descricao')) {
                    $table->text('descricao')->nullable();
                }
                if (!Schema::hasColumn('produtos', 'preco')) {
                    $table->decimal('preco', 10, 2)->default(0.00);
                }
                if (!Schema::hasColumn('produtos', 'status')) {
                    $table->string('status', 30)->default('ativo');
                }
                if (!Schema::hasColumn('produtos', 'link_acesso')) {
                    $table->string('link_acesso')->nullable();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produtos');
    }
};
