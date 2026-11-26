<?php

namespace Database\Seeders;

use App\Models\Agendamento;
use App\Models\LancamentoFinanceiro;
use App\Models\MovimentacaoFinanceira;
use App\Models\Paciente;
use App\Models\Produto;
use App\Models\Prontuario;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

/**
 * Seeder Principal do Sistema Lumina
 * 
 * Popula a base de dados com dados realistas para ambiente de desenvolvimento:
 * - Usuário Administrador (Yasmin) e Psicólogo de teste (Dr. Marcos)
 * - Pacientes vinculados aos profissionais
 * - Agendamentos vinculados a pacientes
 * - Prontuários e evoluções clínicas
 * - Movimentações financeiras
 * - Produtos e serviços
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $hoje = Carbon::today()->format('Y-m-d');
        $amanha = Carbon::tomorrow()->format('Y-m-d');
        $mesAtual = Carbon::today()->month;
        $anoAtual = Carbon::today()->year;

        // 1. Usuário Administrador
        $admin = User::updateOrCreate(
            ['email' => 'yasmin@lumina.com'],
            [
                'name' => 'Yasmin Teixeira',
                'password' => 'senha123',
                'role' => 'admin',
                'is_active' => true,
                'telefone' => '(11) 98765-4321',
                'crp' => '06/184920',
                'bio' => 'Psicóloga Clínica e Administradora do sistema, especialista em TCC.',
                'foto_perfil' => null,
            ]
        );

        // 2. Psicólogo de demonstração
        $psicologo = User::updateOrCreate(
            ['email' => 'psicologo@lumina.com'],
            [
                'name' => 'Dr. Marcos Silveira',
                'password' => 'senha123',
                'role' => 'psicologo',
                'is_active' => true,
                'telefone' => '(11) 97123-4567',
                'crp' => '06/192834',
                'bio' => 'Psicólogo Clínico com ênfase em Psicanálise e atendimento a adolescentes.',
                'foto_perfil' => null,
            ]
        );

        // 3. Pacientes da Yasmin (Admin/Psicóloga)
        $pacientesData = [
            ['nome' => 'Beatriz', 'sobrenome' => 'Lima', 'status' => 'ativo', 'telefone' => '(11) 99123-4567', 'email' => 'beatriz.lima@email.com'],
            ['nome' => 'Raquel', 'sobrenome' => 'Santos', 'status' => 'ativo', 'telefone' => '(11) 99234-5678', 'email' => 'raquel.santos@email.com'],
            ['nome' => 'Jhonatan', 'sobrenome' => 'Henrique', 'status' => 'ativo', 'telefone' => '(11) 99345-6789', 'email' => 'jhonatan.h@email.com'],
            ['nome' => 'Mariana', 'sobrenome' => 'Alves', 'status' => 'ativo', 'telefone' => '(11) 99456-7890', 'email' => 'mariana.alves@email.com'],
            ['nome' => 'Lucas', 'sobrenome' => 'Martins', 'status' => 'ativo', 'telefone' => '(11) 99567-8901', 'email' => 'lucas.martins@email.com'],
            ['nome' => 'Camila', 'sobrenome' => 'Ferreira', 'status' => 'ativo', 'telefone' => '(11) 99678-9012', 'email' => 'camila.f@email.com'],
            ['nome' => 'Renato', 'sobrenome' => 'Carvalho', 'status' => 'inativo', 'telefone' => '(11) 99789-0123', 'email' => 'renato.c@email.com'],
            ['nome' => 'Sofia', 'sobrenome' => 'Mendes', 'status' => 'inativo', 'telefone' => '(11) 99890-1234', 'email' => 'sofia.m@email.com'],
        ];

        $pacientesCriados = [];
        foreach ($pacientesData as $p) {
            $paciente = Paciente::updateOrCreate(
                ['email' => $p['email']],
                array_merge($p, ['user_id' => $admin->id])
            );
            $pacientesCriados[$p['nome']] = $paciente;
        }

        // 4. Agendamentos
        // Consultas de Hoje (agendadas)
        Agendamento::updateOrCreate(
            ['data' => $hoje, 'horario_inicio' => '09:00', 'user_id' => $admin->id],
            [
                'paciente_id' => $pacientesCriados['Beatriz']->id,
                'nome' => 'Beatriz Lima',
                'horario_fim' => '09:50',
                'categoria' => 'Sessão de terapia',
                'tone' => 'rose',
                'status' => 'agendado',
                'descricao' => 'Atendimento semanal regular de TCC.',
                'observacoes' => 'Trabalhar técnicas de regulação emocional e ansiedade.',
            ]
        );

        Agendamento::updateOrCreate(
            ['data' => $hoje, 'horario_inicio' => '11:00', 'user_id' => $admin->id],
            [
                'paciente_id' => $pacientesCriados['Raquel']->id,
                'nome' => 'Raquel Santos',
                'horario_fim' => '11:50',
                'categoria' => 'Primeira consulta',
                'tone' => 'green',
                'status' => 'agendado',
                'descricao' => 'Acolhimento inicial e anamnese.',
                'observacoes' => 'Paciente encaminhada por indicação médica.',
            ]
        );

        Agendamento::updateOrCreate(
            ['data' => $hoje, 'horario_inicio' => '14:30', 'user_id' => $admin->id],
            [
                'paciente_id' => $pacientesCriados['Jhonatan']->id,
                'nome' => 'Jhonatan Henrique',
                'horario_fim' => '15:20',
                'categoria' => 'Sessão de terapia',
                'tone' => 'rose',
                'status' => 'agendado',
                'descricao' => 'Acompanhamento psicoterápico quinzenal.',
            ]
        );

        // Consulta de amanhã
        Agendamento::updateOrCreate(
            ['data' => $amanha, 'horario_inicio' => '10:00', 'user_id' => $admin->id],
            [
                'paciente_id' => $pacientesCriados['Mariana']->id,
                'nome' => 'Mariana Alves',
                'horario_fim' => '10:50',
                'categoria' => 'Avaliação psicológica',
                'tone' => 'gold',
                'status' => 'agendado',
            ]
        );

        // Atendimentos realizados este mês para cálculo correto das métricas
        for ($dia = 1; $dia <= 12; $dia++) {
            $dataRealizada = Carbon::create($anoAtual, $mesAtual, min($dia * 2, 28))->format('Y-m-d');
            Agendamento::updateOrCreate(
                ['data' => $dataRealizada, 'horario_inicio' => '16:00', 'user_id' => $admin->id],
                [
                    'paciente_id' => $pacientesCriados['Lucas']->id,
                    'nome' => 'Lucas Martins',
                    'horario_fim' => '16:50',
                    'categoria' => 'Retorno / Acompanhamento',
                    'tone' => 'blue',
                    'status' => 'realizado',
                ]
            );
        }

        // 5. Prontuários Clínicos
        Prontuario::updateOrCreate(
            ['paciente_id' => $pacientesCriados['Beatriz']->id, 'user_id' => $admin->id, 'data_sessao' => Carbon::now()->subDays(7)->format('Y-m-d')],
            [
                'titulo' => 'Sessão #4 - Reestruturação Cognitiva',
                'evolucao' => 'Paciente demonstrou bom engajamento na tarefa de registro de pensamentos automáticos. Identificamos distorções como catastrofização.',
                'metas_terapeuticas' => 'Continuar diário de pensamentos e treino de respiração diafragmática.',
                'observacoes' => 'Sem ideação suicida ou risco iminente. Humor eutímico.',
            ]
        );

        // 6. Movimentações Financeiras
        $movimentacoes = [
            ['descricao' => 'Sessão de Terapia - Beatriz Lima', 'tipo' => 'receita', 'valor' => 180.00, 'categoria' => 'Atendimentos', 'data' => $hoje],
            ['descricao' => 'Primeira Consulta - Raquel Santos', 'tipo' => 'receita', 'valor' => 200.00, 'categoria' => 'Atendimentos', 'data' => $hoje],
            ['descricao' => 'Aluguel do Consultório - Mês Corrente', 'tipo' => 'despesa', 'valor' => 850.00, 'categoria' => 'Consultório', 'data' => Carbon::create($anoAtual, $mesAtual, 5)->format('Y-m-d')],
            ['descricao' => 'Supervisão Clínica TCC', 'tipo' => 'despesa', 'valor' => 250.00, 'categoria' => 'Cursos / Supervisão', 'data' => Carbon::create($anoAtual, $mesAtual, 10)->format('Y-m-d')],
        ];

        foreach ($movimentacoes as $mov) {
            MovimentacaoFinanceira::updateOrCreate(
                ['descricao' => $mov['descricao'], 'data' => $mov['data'], 'user_id' => $admin->id],
                array_merge($mov, ['user_id' => $admin->id])
            );
        }

        // 7. Produtos e Serviços
        $produtos = [
            [
                'nome' => 'Guia Prático de Ansiedade e Regulação Emocional',
                'tipo' => 'E-book',
                'descricao' => 'Material digital ilustrado com exercícios práticos para controle de ansiedade.',
                'preco' => 49.90,
                'status' => 'ativo',
                'link_acesso' => 'https://lumina.com/materiais/guia-ansiedade',
            ],
            [
                'nome' => 'Mentoria para Psicólogos Recém-formados',
                'tipo' => 'Mentoria',
                'descricao' => 'Programa de 4 encontros individuais com orientação de casos clínicos e posicionamento ético.',
                'preco' => 600.00,
                'status' => 'ativo',
                'link_acesso' => null,
            ],
            [
                'nome' => 'Workshop: Saúde Mental no Trabalho',
                'tipo' => 'Palestra',
                'descricao' => 'Palestra corporativa interativa com foco em prevenção do Burnout.',
                'preco' => 1200.00,
                'status' => 'ativo',
                'link_acesso' => null,
            ],
        ];

        foreach ($produtos as $prod) {
            Produto::updateOrCreate(
                ['nome' => $prod['nome'], 'user_id' => $admin->id],
                array_merge($prod, ['user_id' => $admin->id])
            );
        }
    }
}
