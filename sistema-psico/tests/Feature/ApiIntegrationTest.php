<?php

use App\Models\Agendamento;
use App\Models\MovimentacaoFinanceira;
use App\Models\Paciente;
use App\Models\User;
use Carbon\Carbon;

beforeEach(function () {
    User::firstOrCreate(
        ['email' => 'yasmin@lumina.com'],
        [
            'name' => 'Yasmin Teixeira',
            'password' => 'senha123',
            'crp' => '06/184920',
            'telefone' => '(11) 98765-4321',
            'bio' => 'Psicóloga Clínica',
        ]
    );

    // Cria pacientes ativos e inativo
    Paciente::firstOrCreate(['nome' => 'Ana', 'sobrenome' => 'Silva'], ['status' => 'ativo']);
    Paciente::firstOrCreate(['nome' => 'Carlos', 'sobrenome' => 'Eduardo'], ['status' => 'ativo']);
    Paciente::firstOrCreate(['nome' => 'Paula', 'sobrenome' => 'Fernandes'], ['status' => 'inativo']);

    // Cria agendamentos de teste
    $hoje = Carbon::today()->format('Y-m-d');
    Agendamento::firstOrCreate(
        ['data' => $hoje, 'horario_inicio' => '09:00', 'nome' => 'Consulta Hoje Teste'],
        [
            'horario_fim' => '09:50',
            'categoria' => 'Sessão de terapia',
            'tone' => 'rose',
            'status' => 'agendado',
        ]
    );

    Agendamento::firstOrCreate(
        ['data' => $hoje, 'horario_inicio' => '10:00', 'nome' => 'Consulta Realizada Teste'],
        [
            'horario_fim' => '10:50',
            'categoria' => 'Sessão de terapia',
            'tone' => 'rose',
            'status' => 'realizado',
        ]
    );
});

test('permite login com credenciais validas e retorna token sanctum', function () {
    $response = $this->postJson('/api/login', [
        'email' => 'yasmin@lumina.com',
        'password' => 'senha123',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'message',
            'token',
            'user' => ['id', 'name', 'email'],
        ]);
});

test('dashboard retorna os 4 indicadores reais e ultimas atualizacoes', function () {
    $response = $this->getJson('/api/dashboard');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'indicadores' => [
                'pacientes_ativos',
                'consultas_hoje',
                'atendimentos_mes',
                'atendimentos_ano',
            ],
            'cards',
            'ultimas_atualizacoes' => [
                'proximos_atendimentos',
                'eventos_recentes',
                'alteracoes_recentes',
            ],
        ]);

    // Verifica que pacientes inativos não são contabilizados como ativos
    $indicadores = $response->json('indicadores');
    expect($indicadores['pacientes_ativos'])->toBeGreaterThanOrEqual(2);
});

test('agenda retorna lista, calendario agrupado e categorias com legenda', function () {
    $response = $this->getJson('/api/agenda');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'lista',
            'calendario',
            'categorias',
        ]);
});

test('agenda dia retorna data formatada, compromissos e destaques', function () {
    $hoje = Carbon::today()->format('Y-m-d');
    $response = $this->getJson("/api/agenda/dia?data={$hoje}");

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data',
            'dataFormatada',
            'totalAgendados',
            'compromissos',
            'destaques',
        ]);
});

test('permite criar, editar e excluir evento na agenda', function () {
    // 1. Criar
    $create = $this->postJson('/api/agenda/eventos', [
        'nome' => 'Mariana Alves Teste',
        'data' => Carbon::tomorrow()->format('Y-m-d'),
        'horario_inicio' => '14:00',
        'horario_fim' => '15:00',
        'categoria' => 'Primeira consulta',
        'descricao' => 'Paciente primeira vez',
    ]);

    $create->assertStatus(201)
        ->assertJsonPath('message', 'Alterações salvas com sucesso!');

    $eventoId = $create->json('agendamento.id');

    // 2. Editar
    $update = $this->putJson("/api/agenda/eventos/{$eventoId}", [
        'status' => 'realizado',
        'descricao' => 'Atendimento finalizado com sucesso.',
    ]);

    $update->assertStatus(200)
        ->assertJsonPath('agendamento.status', 'realizado');

    // 3. Excluir
    $delete = $this->deleteJson("/api/agenda/eventos/{$eventoId}");
    $delete->assertStatus(200)
        ->assertJsonPath('message', 'Alterações salvas com sucesso!');
});

test('financeiro exige filtros manuais e inicia sem selecao', function () {
    // Sem filtros
    $semFiltro = $this->getJson('/api/financeiro');
    $semFiltro->assertStatus(200)
        ->assertJsonPath('filtros_aplicados', false);

    // Com filtros aplicados manualmente
    $comFiltro = $this->getJson('/api/financeiro?ano=2026&mes=8&periodo=mes');
    $comFiltro->assertStatus(200)
        ->assertJsonPath('filtros_aplicados', true)
        ->assertJsonStructure([
            'filtros_aplicados',
            'receitas',
            'despesas',
            'saldo',
            'movimentacoes',
            'historico',
        ]);
});

test('permite cadastrar e excluir movimentacao financeira', function () {
    $create = $this->postJson('/api/financeiro', [
        'descricao' => 'Consulta Psicológica Teste',
        'tipo' => 'receita',
        'valor' => 190.00,
        'data' => Carbon::today()->format('Y-m-d'),
        'categoria' => 'Atendimentos',
    ]);

    $create->assertStatus(201)
        ->assertJsonPath('message', 'Alterações salvas com sucesso!');

    $movId = $create->json('movimentacao.id');

    $delete = $this->deleteJson("/api/financeiro/{$movId}");
    $delete->assertStatus(200);
});

test('permite consultar e atualizar perfil profissional com crp e telefone', function () {
    $show = $this->getJson('/api/perfil');
    $show->assertStatus(200)
        ->assertJsonStructure([
            'id', 'name', 'email', 'telefone', 'crp', 'bio',
        ]);

    $update = $this->putJson('/api/perfil', [
        'name' => 'Yasmin Teixeira Santos',
        'email' => 'yasmin@lumina.com',
        'telefone' => '(11) 98765-0000',
        'crp' => '06/999999',
        'bio' => 'Bio atualizada com sucesso',
    ]);

    $update->assertStatus(200)
        ->assertJsonPath('message', 'Alterações salvas com sucesso!')
        ->assertJsonPath('perfil.crp', '06/999999');
});
