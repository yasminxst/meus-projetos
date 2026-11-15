<?php

use App\Http\Controllers\AgendamentoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FinanceiroController;
use App\Http\Controllers\PacienteController;
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\ProjetoController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rotas de API do Sistema Lumina (routes/api.php)
|--------------------------------------------------------------------------
|
| Todas as rotas possuem o prefixo "/api" e respondem primariamente em JSON.
| As rotas seguem as especificações e nomenclatura definidas para o Lumina:
| - Dashboard (Indicadores e Atualizações)
| - Agenda (Geral, Diária, Eventos e Categorias)
| - Financeiro (Movimentações, Filtros e Balanço)
| - Perfil Profissional (Visualização e Edição com CRP)
| - Projetos e Pacientes
|
*/

// ==========================================
// 1. AUTENTICAÇÃO
// ==========================================
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/me', [AuthController::class, 'me']);

// ==========================================
// 2. DASHBOARD — AMBIENTE GERAL
// ==========================================
// Indicadores gerais (Pacientes ativos, Consultas hoje, Atendimentos mês e ano)
Route::get('/dashboard', [DashboardController::class, 'stats']);
Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
// Últimas atualizações da agenda (próximos, recentes e alterações)
Route::get('/dashboard/updates', [DashboardController::class, 'updates']);

// ==========================================
// 3. ATIVIDADES — AGENDA
// ==========================================
// Agenda geral (calendário mensal)
Route::get('/agenda', [AgendamentoController::class, 'index']);
// Agenda diária para data selecionada com destaque para os 3 mais próximos
Route::get('/agenda/dia', [AgendamentoController::class, 'dia']);
// Categorias disponíveis e suas cores vinculadas
Route::get('/agenda/categorias', [AgendamentoController::class, 'categorias']);
// Criação, edição e exclusão de eventos
Route::post('/agenda/eventos', [AgendamentoController::class, 'store']);
Route::put('/agenda/eventos/{agendamento}', [AgendamentoController::class, 'update']);
Route::delete('/agenda/eventos/{agendamento}', [AgendamentoController::class, 'destroy']);
// Compatibilidade com endpoints resource
Route::apiResource('agendamentos', AgendamentoController::class);

// ==========================================
// 4. FINANCEIRO
// ==========================================
// Consulta de movimentações com filtros manuais (inicia sem seleção)
Route::get('/financeiro', [FinanceiroController::class, 'index']);
// Cadastro de novas movimentações (receitas e despesas)
Route::post('/financeiro', [FinanceiroController::class, 'store']);
// Exclusão de movimentação
Route::delete('/financeiro/{movimentacao}', [FinanceiroController::class, 'destroy']);

// ==========================================
// 5. CONFIGURAÇÕES — PERFIL PROFISSIONAL
// ==========================================
Route::get('/perfil', [PerfilController::class, 'show']);
Route::put('/perfil', [PerfilController::class, 'update']);

// ==========================================
// 6. PROJETOS & PACIENTES
// ==========================================
Route::apiResource('projetos', ProjetoController::class);
Route::apiResource('pacientes', PacienteController::class);