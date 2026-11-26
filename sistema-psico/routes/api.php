<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AgendamentoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FinanceiroController;
use App\Http\Controllers\PacienteController;
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\ProdutoController;
use App\Http\Controllers\ProjetoController;
use App\Http\Controllers\ProntuarioController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rotas de API do Sistema Lumina (routes/api.php)
|--------------------------------------------------------------------------
*/

// ==========================================
// 1. ROTAS PÚBLICAS
// ==========================================
Route::post('/login', [AuthController::class, 'login']);

// Health check para Render
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'app' => 'Lumina API'], 200);
});

// ==========================================
// 2. ROTAS PROTEGIDAS (AUTH SANCTUM)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    // Autenticação & Sessão
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Ajustes da Conta (Psicólogo & Admin)
    Route::put('/conta/senha', [AuthController::class, 'atualizarSenha']);
    Route::put('/conta/email', [AuthController::class, 'atualizarEmail']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'stats']);
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/updates', [DashboardController::class, 'stats']);
    Route::get('/dashboard/alertas', [DashboardController::class, 'alertas']);

    // Agenda (Mensal, Semanal e Diária + Recorrência)
    Route::get('/agenda', [AgendamentoController::class, 'index']);
    Route::get('/agenda/semana', [AgendamentoController::class, 'semana']);
    Route::get('/agenda/dia', [AgendamentoController::class, 'dia']);
    Route::get('/agenda/categorias', [AgendamentoController::class, 'categorias']);
    Route::post('/agenda/eventos', [AgendamentoController::class, 'store']);
    Route::post('/agenda/recorrencia', [AgendamentoController::class, 'criarRecorrencia']);
    Route::post('/agenda/eventos/{agendamento}/prontuario', [AgendamentoController::class, 'registrarProntuario']);
    Route::put('/agenda/eventos/{agendamento}', [AgendamentoController::class, 'update']);
    Route::delete('/agenda/eventos/{agendamento}', [AgendamentoController::class, 'destroy']);
    Route::apiResource('agendamentos', AgendamentoController::class);

    // Financeiro & Relatórios
    Route::get('/financeiro', [FinanceiroController::class, 'index']);
    Route::post('/financeiro', [FinanceiroController::class, 'store']);
    Route::get('/financeiro/exportar', [FinanceiroController::class, 'exportarCsv']);
    Route::get('/financeiro/recibo/{agendamento}', [FinanceiroController::class, 'recibo']);
    Route::delete('/financeiro/{movimentacao}', [FinanceiroController::class, 'destroy']);

    // Perfil Profissional
    Route::get('/perfil', [PerfilController::class, 'show']);
    Route::put('/perfil', [PerfilController::class, 'update']);

    // Pacientes & Prontuários
    Route::apiResource('pacientes', PacienteController::class);
    Route::get('/pacientes/{paciente}/prontuarios', [ProntuarioController::class, 'index']);
    Route::post('/pacientes/{paciente}/prontuarios', [ProntuarioController::class, 'store']);
    Route::put('/prontuarios/{prontuario}', [ProntuarioController::class, 'update']);
    Route::delete('/prontuarios/{prontuario}', [ProntuarioController::class, 'destroy']);

    // Produtos e Serviços
    Route::apiResource('produtos', ProdutoController::class);

    // Projetos (mantido para retrocompatibilidade)
    Route::apiResource('projetos', ProjetoController::class);

    // ==========================================
    // 3. ROTAS EXCLUSIVAS DO ADMINISTRADOR
    // ==========================================
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/psicologos', [AdminController::class, 'psicologos']);
        Route::post('/admin/psicologos', [AdminController::class, 'storePsicologo']);
        Route::put('/admin/psicologos/{user}/toggle-status', [AdminController::class, 'toggleStatus']);
        Route::get('/admin/estatisticas-gerais', [AdminController::class, 'estatisticasGerais']);
    });
});