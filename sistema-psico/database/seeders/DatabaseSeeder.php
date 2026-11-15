<?php

namespace Database\Seeders;

use App\Models\Agendamento;
use App\Models\LancamentoFinanceiro;
use App\Models\MovimentacaoFinanceira;
use App\Models\Paciente;
use App\Models\Projeto;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

/**
 * Seeder Principal do Sistema Lumina
 * 
 * Popula a base de dados SQLite com dados completos e realistas para:
 * - Perfil profissional com CRP, telefone e bio
 * - Pacientes com status 'ativo' e 'inativo'
 * - Agendamentos com status 'agendado', 'realizado' e 'cancelado'
 * - Movimentações financeiras (receitas e despesas individuais)
 * - Projetos do portfólio
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $hoje = Carbon::today()->format('Y-m-d');
        $mesAtual = Carbon::today()->month;
        $anoAtual = Carbon::today()->year;

        // 1. Usuário Administrador com Perfil Profissional
        User::updateOrCreate(
            ['email' => 'yasmin@lumina.com'],
            [
                'name' => 'Yasmin Teixeira',
                'password' => 'senha123',
                'telefone' => '(11) 98765-4321',
                'crp' => '06/184920',
                'bio' => 'Psicóloga Clínica especialista em Terapia Cognitivo-Comportamental (TCC), dedicada ao acolhimento de jovens e adultos com empatia e propósito.',
                'foto_perfil' => null,
            ]
        );

        // 2. Pacientes (ativos e inativos para validação da regra de negócio)
        $pacientes = [
            ['nome' => 'Beatriz', 'sobrenome' => 'Lima', 'status' => 'ativo', 'telefone' => '(11) 99123-4567', 'email' => 'beatriz.lima@email.com'],
            ['nome' => 'Raquel', 'sobrenome' => 'Santos', 'status' => 'ativo', 'telefone' => '(11) 99234-5678', 'email' => 'raquel.santos@email.com'],
            ['nome' => 'Jhonatan', 'sobrenome' => 'Henrique', 'status' => 'ativo', 'telefone' => '(11) 99345-6789', 'email' => 'jhonatan.h@email.com'],
            ['nome' => 'Mariana', 'sobrenome' => 'Alves', 'status' => 'ativo', 'telefone' => '(11) 99456-7890', 'email' => 'mariana.alves@email.com'],
            ['nome' => 'Lucas', 'sobrenome' => 'Martins', 'status' => 'ativo', 'telefone' => '(11) 99567-8901', 'email' => 'lucas.martins@email.com'],
            ['nome' => 'Camila', 'sobrenome' => 'Ferreira', 'status' => 'ativo', 'telefone' => '(11) 99678-9012', 'email' => 'camila.f@email.com'],
            ['nome' => 'Renato', 'sobrenome' => 'Carvalho', 'status' => 'inativo', 'telefone' => '(11) 99789-0123', 'email' => 'renato.c@email.com'],
            ['nome' => 'Sofia', 'sobrenome' => 'Mendes', 'status' => 'inativo', 'telefone' => '(11) 99890-1234', 'email' => 'sofia.m@email.com'],
        ];

        foreach ($pacientes as $p) {
            Paciente::firstOrCreate(
                ['nome' => $p['nome'], 'sobrenome' => $p['sobrenome']],
                $p
            );
        }

        // 3. Agendamentos na Agenda
        // Consultas para hoje (agendadas)
        Agendamento::firstOrCreate(
            ['data' => $hoje, 'horario_inicio' => '09:00', 'nome' => 'Beatriz Lima'],
            [
                'horario_fim' => '09:50',
                'categoria' => 'Sessão de terapia',
                'tone' => 'rose',
                'status' => 'agendado',
                'descricao' => 'Sessão semanal de acompanhamento - foco em ansiedade.',
            ]
        );

        Agendamento::firstOrCreate(
            ['data' => $hoje, 'horario_inicio' => '10:30', 'nome' => 'Raquel Santos'],
            [
                'horario_fim' => '11:20',
                'categoria' => 'Primeira consulta',
                'tone' => 'green',
                'status' => 'agendado',
                'descricao' => 'Anamnese inicial e alinhamento de objetivos terapêuticos.',
            ]
        );

        Agendamento::firstOrCreate(
            ['data' => $hoje, 'horario_inicio' => '14:00', 'nome' => 'Jhonatan Henrique'],
            [
                'horario_fim' => '14:50',
                'categoria' => 'Avaliação psicológica',
                'tone' => 'gold',
                'status' => 'agendado',
                'descricao' => 'Aplicação de escala de humor e inventário de sintomas.',
            ]
        );

        // Atendimentos realizados neste mês (para alimentar indicador de realizados)
        $dataPassada1 = Carbon::today()->subDays(2)->format('Y-m-d');
        Agendamento::firstOrCreate(
            ['data' => $dataPassada1, 'horario_inicio' => '15:00', 'nome' => 'Mariana Alves'],
            [
                'horario_fim' => '15:50',
                'categoria' => 'Sessão de terapia',
                'tone' => 'rose',
                'status' => 'realizado',
                'descricao' => 'Sessão realizada com sucesso.',
            ]
        );

        $dataPassada2 = Carbon::today()->subDays(4)->format('Y-m-d');
        Agendamento::firstOrCreate(
            ['data' => $dataPassada2, 'horario_inicio' => '16:00', 'nome' => 'Lucas Martins'],
            [
                'horario_fim' => '16:50',
                'categoria' => 'Retorno / Acompanhamento',
                'tone' => 'blue',
                'status' => 'realizado',
                'descricao' => 'Reavaliação mensal de metas.',
            ]
        );

        // Atendimento cancelado (NÃO deve entrar na contagem de realizados)
        Agendamento::firstOrCreate(
            ['data' => $dataPassada1, 'horario_inicio' => '17:00', 'nome' => 'Renato Carvalho'],
            [
                'horario_fim' => '17:50',
                'categoria' => 'Sessão de terapia',
                'tone' => 'rose',
                'status' => 'cancelado',
                'descricao' => 'Paciente cancelou com aviso prévio por motivo de viagem.',
            ]
        );

        // Mais atendimentos realizados ao longo do ano
        for ($i = 1; $i <= 5; $i++) {
            $dataMesAnterior = Carbon::today()->subMonths(1)->day(max(1, $i * 4))->format('Y-m-d');
            Agendamento::firstOrCreate(
                ['data' => $dataMesAnterior, 'horario_inicio' => "1{$i}:00", 'nome' => "Paciente Histórico {$i}"],
                [
                    'horario_fim' => "1{$i}:50",
                    'categoria' => 'Sessão de terapia',
                    'tone' => 'rose',
                    'status' => 'realizado',
                ]
            );
        }

        // Consultas futuras na semana que vem
        $dataFutura = Carbon::today()->addDays(3)->format('Y-m-d');
        Agendamento::firstOrCreate(
            ['data' => $dataFutura, 'horario_inicio' => '11:00', 'nome' => 'Camila Ferreira'],
            [
                'horario_fim' => '11:50',
                'categoria' => 'Sessão de terapia',
                'tone' => 'rose',
                'status' => 'agendado',
                'descricao' => 'Continuidade do plano terapêutico.',
            ]
        );

        // 4. Movimentações Financeiras (Receitas e Despesas Reais)
        $movimentacoes = [
            // Mês atual
            ['descricao' => 'Sessão de Psicoterapia - Beatriz Lima', 'tipo' => 'receita', 'valor' => 180.00, 'data' => $hoje, 'categoria' => 'Atendimentos'],
            ['descricao' => 'Primeira Consulta - Raquel Santos', 'tipo' => 'receita', 'valor' => 200.00, 'data' => $hoje, 'categoria' => 'Atendimentos'],
            ['descricao' => 'Avaliação Psicológica - Jhonatan Henrique', 'tipo' => 'receita', 'valor' => 350.00, 'data' => $hoje, 'categoria' => 'Atendimentos'],
            ['descricao' => 'Aluguel de Consultório (Sublocação)', 'tipo' => 'despesa', 'valor' => 650.00, 'data' => Carbon::today()->startOfMonth()->format('Y-m-d'), 'categoria' => 'Consultório'],
            ['descricao' => 'Plataforma de Prontuário Eletrônico', 'tipo' => 'despesa', 'valor' => 89.90, 'data' => Carbon::today()->startOfMonth()->addDays(5)->format('Y-m-d'), 'categoria' => 'Software'],
            ['descricao' => 'Supervisão Clínica Mensal', 'tipo' => 'despesa', 'valor' => 250.00, 'data' => Carbon::today()->startOfMonth()->addDays(10)->format('Y-m-d'), 'categoria' => 'Supervisão'],
            // Mês anterior
            ['descricao' => 'Pacote Mensal - Beatriz Lima', 'tipo' => 'receita', 'valor' => 720.00, 'data' => Carbon::today()->subMonths(1)->day(5)->format('Y-m-d'), 'categoria' => 'Atendimentos'],
            ['descricao' => 'Atendimentos Clínicos - Mariana Alves', 'tipo' => 'receita', 'valor' => 540.00, 'data' => Carbon::today()->subMonths(1)->day(12)->format('Y-m-d'), 'categoria' => 'Atendimentos'],
            ['descricao' => 'Aluguel de Sala de Atendimento', 'tipo' => 'despesa', 'valor' => 650.00, 'data' => Carbon::today()->subMonths(1)->day(5)->format('Y-m-d'), 'categoria' => 'Consultório'],
            ['descricao' => 'Materiais Lúdicos e de Testes', 'tipo' => 'despesa', 'valor' => 160.00, 'data' => Carbon::today()->subMonths(1)->day(18)->format('Y-m-d'), 'categoria' => 'Material Clínico'],
        ];

        foreach ($movimentacoes as $mov) {
            MovimentacaoFinanceira::firstOrCreate(
                ['descricao' => $mov['descricao'], 'data' => $mov['data'], 'valor' => $mov['valor']],
                $mov
            );
        }

        // 5. Projetos do Portfólio & Dashboard
        $projetos = [
            [
                'titulo' => 'Clínica Aurora',
                'categoria' => 'Identidade visual',
                'status' => 'Publicado',
                'descricao' => 'Criação de uma identidade visual acolhedora e alinhada ao posicionamento ético e profissional da clínica.',
            ],
            [
                'titulo' => 'Casa Nativa',
                'categoria' => 'Web design',
                'status' => 'Publicado',
                'descricao' => 'Interfaces responsivas e acessíveis para transformar ideias em experiências digitais humanizadas.',
            ],
            [
                'titulo' => 'Ateliê Manacá',
                'categoria' => 'E-commerce',
                'status' => 'Rascunho',
                'descricao' => 'Planejamento e estruturação de loja digital e catálogo de produtos terapêuticos.',
            ],
            [
                'titulo' => 'Secretária Virtual',
                'categoria' => 'Administrativo',
                'status' => 'Publicado',
                'descricao' => 'Organização de rotinas, controle de agendamentos e prontuários para psicólogos.',
            ],
        ];

        foreach ($projetos as $proj) {
            Projeto::firstOrCreate(['titulo' => $proj['titulo']], $proj);
        }
    }
}
