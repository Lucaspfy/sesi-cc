# Pack For You — Sistema de Gestão Interna

Sistema web interno para gestão de compras, ordens de manutenção, budgets por centro de custo e reserva de salas de reunião.

---

## Funcionalidades

| Módulo | Descrição |
|---|---|
| **Ordens de Compra (OC)** | Criação de OCs com múltiplos itens, valor unitário × quantidade, cotações por item e controle de status |
| **Orçamentos / Cotações** | Até 3 cotações por item, seleção de vencedor, comparativo de preços |
| **Centros de Custo (CC)** | Hierarquia em árvore com N níveis, seleção apenas de folhas nas OCs |
| **Budget Mensal** | Definição de orçamento previsto por CC e período, com validação hierárquica (filho não ultrapassa pai) |
| **Visão Gerencial** | Tabela previsto × realizado por CC, com drill-down e indicadores de utilização |
| **Ordens de Manutenção (OM)** | Abertura, acompanhamento e encerramento de ordens de manutenção |
| **Salas de Reunião** | Calendário (dia / semana / mês), reservas com detecção de conflito de horário |
| **Configurações** | CRUD de usuários com perfis e senhas criptografadas; CRUD de salas (somente Gestão) |
| **Backup & Restore** | Exportação e importação completa dos dados em JSON |

---

## Perfis de Acesso

| Perfil | Abas disponíveis |
|---|---|
| **Gestão** | Todas (Estruturação, Gerencial, Acompanhamento, BI, Salas, Manutenção, Configurações) |
| **Compras** | Gerencial, Acompanhamento, BI, Salas, Manutenção |
| **Estoque** | Acompanhamento, Salas, Manutenção |
| **Produção** | Acompanhamento, Salas, Manutenção |

Apenas o perfil **Gestão** pode criar salas de reunião e acessar Configurações.  
Reservas só podem ser editadas/canceladas pelo próprio criador ou por Gestão.

---

## Stack Técnica

- **Frontend**: SPA em `index.html` único — HTML + CSS + JavaScript puros (sem frameworks)
- **Backend**: [Vercel Serverless Functions](https://vercel.com/docs/functions) (`/api/`)
- **Banco de dados**: [Supabase](https://supabase.com/) — tabela `app_data` (key/value JSONB)
- **Sincronização em tempo real**: Supabase Realtime (`postgres_changes`)
- **Segurança de senhas**: `bcryptjs` via `/api/auth`
- **Hospedagem**: Vercel (deploy automático via GitHub)

---

## Estrutura de Arquivos

```
├── index.html          # Aplicação completa (HTML + CSS + JS)
├── vercel.json         # Roteamento Vercel
├── package.json        # Dependência: bcryptjs
└── api/
    ├── auth.js         # Hash e verificação de senhas (bcrypt)
    └── eris.js         # Proxy para API ERIS (aguardando credenciais)
```

---

## Configuração — Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No **SQL Editor**, execute:

```sql
-- Criar tabela de dados
create table app_data (
  key  text primary key,
  data jsonb
);

-- Desabilitar RLS (acesso controlado pela chave anon no frontend)
alter table app_data disable row level security;

-- Habilitar Realtime
alter publication supabase_realtime add table app_data;
```

3. Em **Settings → API**, copie a **Project URL** e a **anon public key**
4. Substitua os valores no `index.html`:

```js
const SB_URL = 'https://SEU-PROJETO.supabase.co/rest/v1';
const SB_KEY = 'SUA-ANON-KEY';
```

---

## Configuração — Vercel

1. Faça push do repositório para o GitHub
2. No painel da Vercel, conecte o repositório e clique em **Deploy**
3. Nenhuma variável de ambiente é necessária para o funcionamento básico

> **Integração ERIS (opcional):** Para ativar o proxy de API, adicione as variáveis `ERIS_API_URL` e `ERIS_API_KEY` nas configurações de **Environment Variables** da Vercel.

---

## Primeiro Acesso

Ao abrir o sistema pela primeira vez, um usuário padrão é criado automaticamente:

| Campo | Valor |
|---|---|
| Login | `admin` |
| Senha | `admin123` |
| Perfil | Gestão |

> **Altere a senha imediatamente** em Configurações → Usuários → Editar.

Os Centros de Custo e Salas de Reunião iniciais também são populados automaticamente no primeiro acesso.

---

## Banco de Dados — Modelo

Todos os dados trafegam em uma única tabela `app_data` com chave/valor:

| `key` | Conteúdo |
|---|---|
| `cc` | Array de Centros de Custo |
| `bud` | Budgets mensais por CC |
| `oc` | Ordens de Compra |
| `orc` | Cotações por item de OC |
| `users` | Usuários (senhas em bcrypt) |
| `om` | Ordens de Manutenção |
| `reservas` | Reservas de salas |
| `salas` | Salas de reunião cadastradas |

---

## Sincronização em Tempo Real

O sistema usa **Supabase Realtime** via WebSocket. Qualquer alteração feita em um navegador ou computador reflete automaticamente em todos os outros usuários logados, sem necessidade de atualizar a página.

---

## Segurança

- Senhas armazenadas com **bcrypt** (salt 12)
- Senhas legadas (texto puro) são migradas automaticamente para bcrypt no primeiro login
- Autenticação feita exclusivamente no servidor (`/api/auth`)
- Controle de acesso por perfil em todas as abas e ações

---

## Licença

Uso interno — Pack For You © 2025
