# Guia de Deploy no Render: Sistema Psico (Lumina)

Este guia orienta o processo de deploy do monorepo no Render em 3 passos simples, utilizando **Render Web Service (Docker)** para o back-end e **Render Static Site** para o front-end.

## Método 1: Deploy com 1 Clique via Blueprint (Recomendado)

O repositório já inclui o arquivo `render.yaml` (Infrastructure as Code):

1. Acesse o [Render Dashboard](https://dashboard.render.com/).
2. Clique no botão **New +** e selecione **Blueprint**.
3. Conecte o seu repositório `meus-projetos`.
4. O Render detectará automaticamente o arquivo `render.yaml` e criará juntos:
   - O banco de dados **PostgreSQL** (`lumina-postgres`).
   - O serviço **Docker** da API (`sistema-psico-api`) com as variáveis de ambiente e conexões já preenchidas.
   - O site estático do front-end (`lumina-portal`).
5. Clique em **Apply** e aguarde o deploy automático ser concluído.

---

## Método 2: Criação Manual dos Serviços (Passo a Passo)

### 1. Criar o Banco de Dados PostgreSQL no Render

1. Acesse o painel do [Render Dashboard](https://dashboard.render.com/).
2. Clique no botão **New +** e selecione **PostgreSQL**.
3. Preencha os dados:
   - **Name**: `lumina-postgres`
   - **Database**: `lumina`
   - **User**: `lumina_user`
   - **Region**: Selecione a região mais próxima (ex: *Oregon (US West)* ou *Ohio (US East)*).
   - **Plan**: *Free*.
4. Clique em **Create Database**.
5. Após a criação, na página de detalhes do banco, copie o valor do campo **Internal Database URL** (ex: `postgresql://lumina_user:...@dpg-...-a:5432/lumina`).

---

## 2. Deploy do Back-end (Render Web Service via Docker)

1. No Render Dashboard, clique em **New +** e selecione **Web Service**.
2. Conecte o seu repositório Git (`meus-projetos`).
3. Configure as opções básicas:
   - **Name**: `sistema-psico-api` (ou nome de sua preferência)
   - **Region**: Mesma região selecionada para o banco de dados.
   - **Root Directory**: `sistema-psico` *(Muito importante: apontar para a pasta do back-end!)*
   - **Environment**: **Docker**
   - **Plan**: *Free*
4. Na seção **Environment Variables** (Variáveis de Ambiente), adicione:
   | Chave | Valor |
   |---|---|
   | `DATABASE_URL` | *(Cole a Internal Database URL do PostgreSQL obtida no Passo 1)* |
   | `DB_CONNECTION` | `pgsql` |
   | `APP_ENV` | `production` |
   | `APP_DEBUG` | `false` |
   | `APP_KEY` | `base64:U/rxrOujiTAWuEt4RtYD4Dwjx7NyRfWfLp4zyXJyzRc=` |
   | `RUN_SEEDER` | `true` *(executa na primeira vez para criar os usuários e dados iniciais)* |
5. Clique em **Deploy Web Service**.
6. O Render fará o build da imagem Docker (instalando extensões PHP, Nginx, Composer), executará as migrações automaticamente pelo script de entrypoint e iniciará a API.
7. Copie a URL pública gerada para a API (ex: `https://sistema-psico-api.onrender.com`).

---

## 3. Deploy do Front-end (Render Static Site)

1. No Render Dashboard, clique em **New +** e selecione **Static Site**.
2. Conecte o mesmo repositório Git (`meus-projetos`).
3. Configure os campos:
   - **Name**: `lumina-portal` (ou nome de sua preferência)
   - **Root Directory**: `Portifolio-YasV2` *(Muito importante: apontar para a pasta do front-end!)*
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Na seção **Environment Variables**, adicione:
   | Chave | Valor |
   |---|---|
   | `VITE_API_URL` | `https://sistema-psico-api.onrender.com/api` *(URL da sua API criada no Passo 2 com o sufixo /api)* |
5. Na aba **Redirects / Rewrites** (para suporte ao React Router SPA):
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
6. Clique em **Create Static Site**.

---

## 4. Credenciais de Acesso Inicial

- **Administrador**:
  - E-mail: `yasmin@lumina.com`
  - Senha: `senha123`
  - *Acesso completo: Dashboard, Agenda, Financeiro, Produtos, Gestão de Psicólogos e Visão por Perspectiva.*
- **Psicólogo**:
  - E-mail: `psicologo@lumina.com`
  - Senha: `senha123`
