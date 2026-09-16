# My Finance Family — contas e despesas compartilhadas

## Objetivo

Permitir que membros de uma mesma família cadastrem e consultem contas e despesas compartilhadas, com suporte offline-first no app React Native e sincronização segura com o Supabase.

## Modelo de dados no Supabase

### `families`

- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `created_by uuid not null references auth.users(id)`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `family_members`

- `family_id uuid not null references families(id) on delete cascade`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `role text not null default 'member' check (role in ('owner', 'member'))`
- `joined_at timestamptz not null default now()`
- primary key: (`family_id`, `user_id`)

### `accounts`

- `id uuid primary key default gen_random_uuid()`
- `family_id uuid not null references families(id) on delete cascade`
- `name text not null`
- `institution text`
- `kind text not null check (kind in ('checking', 'savings', 'cash', 'credit'))`
- `opening_balance_cents bigint not null default 0`
- `balance_cents bigint not null default 0`
- `created_by uuid not null references auth.users(id)`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `archived_at timestamptz`

### `categories`

- `id uuid primary key default gen_random_uuid()`
- `family_id uuid not null references families(id) on delete cascade`
- `name text not null`
- `created_by uuid not null references auth.users(id)`
- `created_at timestamptz not null default now()`
- unique: (`family_id`, `name`)

### `expenses`

- `id uuid primary key default gen_random_uuid()`
- `family_id uuid not null references families(id) on delete cascade`
- `account_id uuid not null references accounts(id)`
- `category_id uuid references categories(id)`
- `description text not null`
- `amount_cents bigint not null check (amount_cents > 0)`
- `expense_date date not null default current_date`
- `recurrence text not null default 'none' check (recurrence in ('none', 'weekly', 'monthly', 'yearly'))`
- `created_by uuid not null references auth.users(id)`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `deleted_at timestamptz`

## Segurança

Uma função SQL `is_family_member(target_family_id uuid)` será criada como `security definer` para centralizar a verificação de pertencimento. As tabelas `families`, `family_members`, `accounts`, `categories` e `expenses` terão RLS habilitado.

- Membros podem consultar dados da própria família.
- Membros podem criar contas, categorias e despesas para a própria família.
- O campo `created_by` será preenchido pelo app com `auth.uid()` no banco por default/trigger e não será confiado ao cliente.
- Apenas `owner` poderá remover a família ou gerenciar membros; convites ficam fora do primeiro incremento.

Um trigger em `auth.users` criará uma família inicial e sua associação `owner` no primeiro cadastro. O fluxo de convite será implementado em uma etapa posterior, sem bloquear o compartilhamento entre os membros já provisionados.

## Fluxo das telas

### Cadastro de conta

Rota modal `account-new` acessada pelos botões `Nova conta` do Dashboard e de Contas.

Campos:

- Nome da conta — obrigatório.
- Instituição — opcional.
- Tipo — Conta principal, Poupança, Carteira ou Cartão.
- Saldo inicial — moeda BRL, armazenada em centavos.

Ao salvar, a conta é escrita primeiro no SQLite com `sync_status = 'pending'`, atualiza o Zustand imediatamente e entra na fila de sincronização. Com conexão, o repositório envia o registro ao Supabase e marca como sincronizado.

### Cadastro de despesa

Rota modal `expense-new` acessada pelos botões `Nova despesa` do Dashboard e de Movimentações.

Campos:

- Valor — obrigatório e maior destaque visual.
- Descrição — obrigatório.
- Categoria — obrigatória, selecionada entre categorias da família.
- Conta — obrigatória, selecionada entre contas ativas da família.
- Data — obrigatória, iniciando em hoje.
- Recorrência — opcional, iniciando em “Não se repete”.

Ao salvar, a despesa é escrita primeiro no SQLite e a conta relacionada é atualizada localmente. A sincronização remota mantém o mesmo `id` idempotente e atualiza o saldo da conta em uma operação transacional no Supabase.

## Offline-first

- SQLite continua sendo a fonte imediata de leitura para o app.
- Registros locais usam UUIDs gerados no cliente e `sync_status` (`pending`, `synced`, `failed`).
- A sincronização será acionada por mutação e reconexão, com retry controlado pelo TanStack Query.
- Falhas de rede não impedem o cadastro; a tela informa que o item será sincronizado depois.
- Conflitos serão resolvidos inicialmente por `updated_at` mais recente; edição colaborativa avançada fica fora do primeiro incremento.

## Critérios de aceite

- Um usuário autenticado consegue criar a família inicial e ver suas contas/despesas.
- Um segundo membro associado à mesma família consegue ver e criar registros compartilhados.
- Usuários de famílias diferentes não conseguem ler ou alterar os registros uns dos outros.
- O cadastro funciona sem conexão e os dados ficam visíveis imediatamente no Dashboard.
- Os botões `Nova conta` e `Nova despesa` abrem as telas corretas.
- Valores monetários são persistidos em centavos e exibidos em BRL.
- TypeScript, bundle Android e validação das políticas RLS passam antes da entrega.
