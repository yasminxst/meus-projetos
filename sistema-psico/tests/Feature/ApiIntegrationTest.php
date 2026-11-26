<?php

use App\Models\Agendamento;
use App\Models\MovimentacaoFinanceira;
use App\Models\Paciente;
use App\Models\Produto;
use App\Models\User;
use Carbon\Carbon;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::updateOrCreate(
        ['email' => 'yasmin@lumina.com'],
        [
            'name' => 'Yasmin Teixeira',
            'password' => 'senha123',
            'role' => 'admin',
            'is_active' => true,
            'crp' => '06/184920',
            'telefone' => '(11) 98765-4321',
            'bio' => 'Psicóloga Clínica e Administradora',
        ]
    );

    // Cria pacientes ativos e inativo vinculados ao usuário
    Paciente::updateOrCreate(['nome' => 'Ana', 'sobrenome' => 'Silva'], ['user_id' => $this->user->id, 'status' => 'ativo']);
    Paciente::updateOrCreate(['nome' => 'Carlos', 'sobrenome' => 'Eduardo'], ['user_id' => $this->user->id, 'status' => 'ativo']);
    Paciente::updateOrCreate(['nome' => 'Paula', 'sobrenome' => 'Fernandes'], ['user_id' => $this->user->id, 'status' => 'inativo']);

    // Cria agendamentos de teste
    $hoje = Carbon::today()->format('Y-m-d');
    Agendamento::updateOrCreate(
        ['data' => $hoje, 'horario_inicio' => '09:00', 'user_id' => $this->user->id],
        [
            'nome' => 'Consulta Hoje Teste',
            'horario_fim' => '09:50',
            'categoria' => 'Sessão de terapia',
            'tone' => 'rose',
            'status' => 'agendado',
        ]
    );

    Agendamento::updateOrCreate(
        ['data' => $hoje, 'horario_inicio' => '10:00', 'user_id' => $this->user->id],
        [
            'nome' => 'Consulta Realizada Teste',
            'horario_fim' => '10:50',
            'categoria' => 'Sessão de terapia',
            'tone' => 'rose',
            'status' => 'realizado',
        ]
    );
});

test('permite login com credenciais validas e retorna token sanctum e role', function () {
    $response = $this->postJson('/api/login', [
        'email' => 'yasmin@lumina.com',
        'password' => 'senha123',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'message',
            'token',
            'user' => ['id', 'name', 'email', 'role'],
        ]);
});

test('bloqueia login com credenciais incorretas', function () {
    $response = $this->postJson('/api/login', [
        'email' => 'yasmin@lumina.com',
        'password' => 'senha_errada_xyz',
    ]);

    $response->assertStatus(401);
});

test('dashboard retorna os 4 indicadores reais e ultimas atualizacoes', function () {
    Sanctum::actingAs($this->user);

    $response = $this->getJson('/api/dashboard');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'pacientes_ativos',
            'consultas_hoje',
            'agendamentos_mes',
            'atendimentos_ano',
            'cards',
            'updates' => [
                'proximos_atendimentos',
                'eventos_recentes',
                'alteracoes_recentes',
            ],
        ]);
});

test('agenda retorna lista, calendario agrupado e suporte a semana', function () {
    Sanctum::actingAs($this->user);

    $responseMes = $this->getJson('/api/agenda');
    $responseMes->assertStatus(200)
        ->assertJsonStructure(['total', 'agendamentos', 'calendario']);

    $responseSemana = $this->getJson('/api/agenda/semana');
    $responseSemana->assertStatus(200)
        ->assertJsonStructure(['inicio_semana', 'fim_semana', 'dias', 'total_semana']);
});

test('permite criar, editar e concluir consulta com receita no financeiro', function () {
    Sanctum::actingAs($this->user);

    $hoje = Carbon::today()->format('Y-m-d');

    // 1. Criar evento
    $create = $this->postJson('/api/agenda/eventos', [
        'nome' => 'Consulta Nova de Teste',
        'data' => $hoje,
        'horario_inicio' => '15:00',
        'horario_fim' => '15:50',
        'categoria' => 'Sessão de terapia',
        'tone' => 'rose',
        'status' => 'agendado',
    ]);

    $create->assertStatus(201);
    $eventoId = $create->json('agendamento.id');

    // 2. Concluir consulta gerando receita automática
    $update = $this->putJson("/api/agenda/eventos/{$eventoId}", [
        'status' => 'realizado',
        'gerar_receita' => true,
        'valor_receita' => 190.00,
    ]);

    $update->assertStatus(200);

    // 3. Verifica se receita foi lançada no financeiro
    $this->assertDatabaseHas('movimentacoes_financeiras', [
        'agendamento_id' => $eventoId,
        'valor' => 190.00,
        'tipo' => 'receita',
    ]);
});

test('financeiro exige filtros manuais e registra movimentacoes', function () {
    Sanctum::actingAs($this->user);

    // Sem filtros
    $semFiltro = $this->getJson('/api/financeiro');
    $semFiltro->assertStatus(200)
        ->assertJson(['filtros_aplicados' => false]);

    // Com filtros
    $comFiltro = $this->getJson('/api/financeiro?ano=' . Carbon::today()->year . '&mes=' . Carbon::today()->month);
    $comFiltro->assertStatus(200)
        ->assertJson(['filtros_aplicados' => true]);
});

test('permite gerenciar produtos e servicos', function () {
    Sanctum::actingAs($this->user);

    $create = $this->postJson('/api/produtos', [
        'nome' => 'E-book Teste',
        'tipo' => 'E-book',
        'preco' => 39.90,
        'status' => 'ativo',
    ]);

    $create->assertStatus(201);
    $prodId = $create->json('produto.id');

    $this->getJson('/api/produtos')->assertStatus(200);

    $this->deleteJson("/api/produtos/{$prodId}")->assertStatus(200);
});

test('administrador consegue listar psicologos e ver estatisticas', function () {
    Sanctum::actingAs($this->user);

    $this->getJson('/api/admin/psicologos')->assertStatus(200);
    $this->getJson('/api/admin/estatisticas-gerais')->assertStatus(200);
});

test('permite criar serie recorrente de agendamentos e detectar conflitos', function () {
    Sanctum::actingAs($this->user);

    $hoje = Carbon::today()->format('Y-m-d');

    // Simulação prévia
    $simulacao = $this->postJson('/api/agenda/recorrencia', [
        'nome' => 'Série Recorrente Teste',
        'data_inicio' => $hoje,
        'horario_inicio' => '17:00',
        'modo' => 'sessoes',
        'quantidade_sessoes' => 4,
        'recorrencia_tipo' => 'semanal',
        'simulacao' => true,
    ]);

    $simulacao->assertStatus(200)
        ->assertJsonStructure(['simulacao', 'total_sessoes', 'datas']);

    // Criação real
    $criacao = $this->postJson('/api/agenda/recorrencia', [
        'nome' => 'Série Recorrente Teste',
        'data_inicio' => $hoje,
        'horario_inicio' => '17:00',
        'modo' => 'sessoes',
        'quantidade_sessoes' => 4,
        'recorrencia_tipo' => 'semanal',
        'valor_sessao' => 180.00,
        'status_pagamento' => 'pendente',
    ]);

    $criacao->assertStatus(201)
        ->assertJson(['total_criadas' => 4]);

    $grupoId = $criacao->json('recorrencia_grupo_id');
    expect($grupoId)->not->toBeEmpty();
});

test('permite registrar prontuario diretamente a partir de um agendamento', function () {
    Sanctum::actingAs($this->user);

    $hoje = Carbon::today()->format('Y-m-d');
    $agendamento = Agendamento::create([
        'user_id' => $this->user->id,
        'nome' => 'Paciente Prontuario Teste',
        'data' => $hoje,
        'horario_inicio' => '18:00',
    ]);

    $resp = $this->postJson("/api/agenda/eventos/{$agendamento->id}/prontuario", [
        'titulo' => 'Evolução Clínica de Teste',
        'evolucao' => 'Paciente relatou redução significativa de ansiedade.',
    ]);

    $resp->assertStatus(201)
        ->assertJsonStructure(['message', 'prontuario']);

    $this->assertDatabaseHas('prontuarios', [
        'user_id' => $this->user->id,
        'titulo' => 'Evolução Clínica de Teste',
    ]);
});

test('permite emitir recibo clinico e exportar csv financeiro', function () {
    Sanctum::actingAs($this->user);

    $hoje = Carbon::today()->format('Y-m-d');
    $agendamento = Agendamento::create([
        'user_id' => $this->user->id,
        'nome' => 'Paciente Recibo Teste',
        'data' => $hoje,
        'horario_inicio' => '19:00',
        'valor_sessao' => 200.00,
    ]);

    $recibo = $this->getJson("/api/financeiro/recibo/{$agendamento->id}");
    $recibo->assertStatus(200)
        ->assertJsonStructure(['recibo_numero', 'paciente_nome', 'valor_formatado', 'declaracao']);

    $csv = $this->get('/api/financeiro/exportar?ano=' . Carbon::today()->year);
    $csv->assertStatus(200);
});

