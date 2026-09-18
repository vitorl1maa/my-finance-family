# Cadastro de Despesas — Especificação Técnica

## Objetivo

Construir a tela de Cadastro de Despesas do My Finance Family com uma experiência simples para registrar um gasto, associando-o a uma categoria compartilhada pela família, uma data escolhida em calendário e a conta padrão da família, sem expor seleção de conta na interface.

Esta especificação cobre a persistência no Supabase, o cache/local persistence em SQLite, o fluxo interativo no frontend, a máscara monetária BRL, a sincronização e os critérios de aceite.

## Decisões de produto

- As categorias pertencem à família, não ao usuário individual.
- Nesta primeira versão, categorias são somente pré-cadastradas.
- As categorias iniciais são: Moradia, Alimentação, Saúde e Lazer.
- Usuários não podem criar, editar, ativar, desativar ou excluir categorias pelo fluxo de despesas.
- O campo Conta não será exibido na tela.
- Toda despesa será associada automaticamente à conta padrão da família.
- A recorrência permanece visível como “Não se repete”, mas não terá comportamento de recorrência nesta entrega.
- Valores monetários são armazenados em centavos; despesas são representadas com valor negativo.
- A data informada pelo usuário é a data de ocorrência da despesa, diferente da data de criação/sincronização.

## Arquitetura

O Supabase será a fonte de verdade para famílias, membros, categorias, contas e transações sincronizadas. O SQLite continuará sendo usado como persistência local e cache para suportar o padrão offline-first já adotado pelo projeto.

O frontend será dividido em view, view-model, model e repository. A view controla apenas composição visual e eventos de interação. O view-model coordena formulário, carregamento de categorias, envio e atualização das transações. Repositories encapsulam SQLite e Supabase.

A criação de uma despesa deverá usar uma operação transacional no Supabase, preferencialmente uma RPC `create_expense`, para resolver a conta padrão e validar a categoria dentro da mesma família sem confiar em IDs fornecidos livremente pelo cliente.

## Modelo de dados no Supabase

### Categorias

```sql
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  slug text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint categories_family_slug_unique unique (family_id, slug),
  constraint categories_name_not_blank check (length(trim(name)) > 0)
);
```

Ao criar uma família, inserir as quatro categorias padrão:

```sql
insert into public.categories (family_id, name, slug)
values
  (:family_id, 'Moradia', 'moradia'),
  (:family_id, 'Alimentação', 'alimentacao'),
  (:family_id, 'Saúde', 'saude'),
  (:family_id, 'Lazer', 'lazer');
```

O seed deve ser idempotente usando a restrição `(family_id, slug)` e `on conflict do nothing` quando for executado por um trigger ou rotina de criação de família.

### Contas

A tabela de contas deve ter `family_id` e `is_default`. Deve existir no máximo uma conta padrão ativa por família:

```sql
create unique index accounts_one_default_per_family
  on public.accounts (family_id)
  where is_default = true;
```

Caso a tabela já possua contas, a migração deve escolher a conta principal existente como padrão antes de aplicar o índice. A tela não poderá editar essa escolha.

### Transações

A tabela de transações deverá manter o relacionamento contábil e substituir texto livre de categoria por relacionamento:

```sql
alter table public.transactions
  add column if not exists family_id uuid references public.families(id),
  add column if not exists category_id uuid references public.categories(id);
```

Regras da migração:

1. Preencher `family_id` a partir da conta relacionada ou do vínculo do usuário que criou o registro.
2. Mapear o texto antigo de `category` para a categoria correspondente da família por slug/nome.
3. Rejeitar registros sem categoria válida antes de tornar `category_id` obrigatório.
4. Adicionar `not null` a `family_id` e `category_id` depois da migração dos dados.
5. Manter `amount_cents bigint not null`; despesas devem ser negativas.
6. Manter `occurred_at timestamptz not null`.
7. Manter `sync_status` no banco local; o status remoto deve ser definido pela estratégia de sincronização existente.

## Segurança e RLS

As políticas devem usar `family_members` para verificar o usuário autenticado:

- leitura de categorias: somente membros da mesma família;
- leitura de contas: somente membros da mesma família;
- leitura de transações: somente membros da mesma família;
- escrita de transações: somente via RPC ou política que valide a associação familiar;
- categorias não podem ser criadas ou alteradas pelo cliente nesta primeira versão.

A RPC `create_expense` deverá receber somente:

```ts
type CreateExpenseRpcInput = {
  title: string;
  categoryId: string;
  amountCents: number;
  occurredAt: string;
};
```

O `family_id`, o `account_id` e o autor devem ser resolvidos no servidor a partir do usuário autenticado. A RPC deve:

1. validar que o valor é inteiro e maior que zero;
2. validar título não vazio;
3. validar que `occurredAt` é uma data válida;
4. identificar a família ativa do usuário;
5. validar que `categoryId` pertence à família e está ativa;
6. localizar a conta padrão da família;
7. inserir `amount_cents = -abs(amountCents)`;
8. retornar `transactionId`, `familyId`, `accountId` e `categoryId`.

## Contratos do frontend

### Modelos

```ts
type ExpenseCategory = {
  id: string;
  familyId: string;
  name: string;
  slug: string;
  isActive: boolean;
};

type CreateExpenseInput = {
  title: string;
  categoryId: string;
  amountCents: number;
  occurredAt: string;
};

type CreateExpenseResult = {
  transactionId: string;
  familyId: string;
  accountId: string;
  categoryId: string;
};
```

### Categorias

O repository deve expor `listFamilyCategories(familyId)`, retornando somente categorias ativas, ordenadas nesta ordem de apresentação:

1. Moradia
2. Alimentação
3. Saúde
4. Lazer

O view-model deve expor `categories`, `categoriesLoading`, `categoriesError` e `reloadCategories`. O resultado deve ser salvo no cache local por `familyId` para permitir abertura da tela sem conexão quando já houver dados.

### Despesa

O view-model deve expor `createExpense(input: CreateExpenseInput): Promise<CreateExpenseResult>`. A conversão do campo de valor deve ocorrer antes da chamada, usando a função comum de dinheiro do projeto.

A UI não deve enviar `accountId` nem `familyId`.

## Fluxo visual e interativo

### Ordem da tela

1. Cabeçalho com voltar, título “Nova despesa” e indicador “1 de 1”.
2. Card de valor em destaque.
3. Descrição multiline.
4. Seletor de Categoria.
5. Seletor de Data.
6. Seletor de Recorrência exibindo “Não se repete”.
7. Botão “Salvar despesa”.
8. Botão “Cancelar”.

O campo Conta/“Conta principal” não deve ser renderizado.

### Seletor de categoria

- O campo deve ser somente leitura e abrir um bottom sheet ao toque.
- O bottom sheet deve listar apenas categorias ativas carregadas para a família.
- A opção selecionada deve possuir destaque visual e indicador de seleção.
- Ao selecionar, o sheet fecha e o nome da categoria aparece no campo.
- Se as categorias estiverem carregando, mostrar estado de carregamento no sheet.
- Se ocorrer erro, mostrar mensagem e ação “Tentar novamente”.
- Se não houver categorias, desabilitar o envio e informar que não há categorias disponíveis.

### Calendário

- O campo Data deve ser somente leitura.
- Ao tocar, abrir um modal/bottom sheet de calendário.
- O calendário deve iniciar no mês da data selecionada.
- Deve permitir navegar para mês anterior e próximo mês.
- Deve destacar a data selecionada.
- Deve usar a semana iniciando no domingo, mantendo a convenção visual da tela.
- Deve aceitar datas fora do mês visível para navegação, mas destacar somente a data escolhida.
- A data inicial deve ser o dia atual do dispositivo.
- O valor visual deve usar `dd/MM/yyyy`.
- O valor enviado ao backend deve ser ISO, normalizado a partir da data local sem deslocamento acidental de dia por timezone.

### Máscara BRL

O campo deve formatar dígitos como centavos durante a digitação:

- `4` → `R$ 0,04`
- `4000` → `R$ 40,00`
- `R$ 1.234,56` colado → `R$ 1.234,56`

O formulário deve rejeitar campo vazio ou valor igual a zero. A camada de domínio deve converter o valor exibido para inteiro em centavos antes de persistir.

## Estados e erros

Estados mínimos:

- `loadingCategories`
- `categoriesError`
- `categoryPickerVisible`
- `selectedCategory`
- `datePickerVisible`
- `selectedDate`
- `isSaving`
- `saveError`

Regras:

- durante o envio, impedir duplo toque e manter o conteúdo preenchido;
- em sucesso, atualizar a lista/dashboard e retornar à tela anterior;
- em falha, manter os valores do formulário e exibir erro próximo ao botão;
- se a categoria ficar inativa antes do envio, tratar o erro da RPC e exigir nova seleção;
- se não houver conta padrão, bloquear o envio e mostrar erro de configuração da família;
- cancelamento não deve criar registro nem alterar o cache.

## Persistência local e sincronização

A migração SQLite deverá:

1. adicionar `family_id` e `category_id` ao registro local de transação;
2. manter temporariamente o texto de categoria para compatibilidade de leitura, se necessário;
3. atualizar o repository para salvar e ler `category_id`;
4. criar/atualizar o registro local como `pending` antes de sincronizar;
5. substituir o status para `synced` após retorno bem-sucedido da RPC;
6. marcar como `failed` e preservar a operação para retry quando a RPC falhar.

O dashboard poderá continuar exibindo o nome da categoria usando a associação carregada ou um snapshot local do nome para evitar telas quebradas durante sincronização.

## Estrutura de arquivos prevista

- `supabase/migrations/<timestamp>_expense_categories.sql`: tabelas, índices, seeds, RPC e RLS.
- `src/features/categories/model/expense-category.ts`: tipo e schema de categoria.
- `src/features/categories/repository/categories-repository.ts`: leitura/cache remoto e local.
- `src/features/transactions/model/transaction.ts`: `categoryId`, `familyId` e data.
- `src/features/transactions/repository/transactions-repository.ts`: leitura, criação local e sincronização.
- `src/features/transactions/view-model/use-transactions-view-model.ts`: estado e comandos de despesa.
- `src/features/transactions/components/category-picker.tsx`: bottom sheet de categorias.
- `src/features/transactions/components/expense-date-picker.tsx`: calendário mensal.
- `src/features/transactions/view/expense-new-view.tsx`: composição da tela.
- `src/shared/utils/money.ts`: máscara BRL e conversão para centavos.
- `src/shared/database/database.ts`: migração SQLite.
- `tests/money-input.test.mjs`: máscara e parsing monetário.
- `tests/expense-categories.test.mjs`: lista, ordem e seleção de categorias.
- `tests/expense-date-picker.test.mjs`: mês, data inicial e seleção.
- `tests/create-expense.test.mjs`: payload, conta padrão e erros.

## Testes

### Testes unitários

- formatar entrada monetária brasileira;
- converter `R$ 40,00` para `4000` centavos;
- rejeitar zero e campo vazio;
- ordenar categorias na ordem definida;
- ignorar categorias inativas;
- construir corretamente as semanas do calendário;
- selecionar uma data sem alterar o mês incorretamente;
- construir payload sem `accountId` e `familyId` vindos do cliente;
- aplicar valor negativo para despesa.

### Testes de integração

- carregar categorias da família autenticada;
- abrir e fechar o seletor de categorias;
- selecionar categoria e refletir o valor no formulário;
- abrir calendário e persistir a data escolhida;
- enviar despesa com conta padrão resolvida pelo backend;
- preservar o formulário após falha de rede;
- bloquear acesso a categoria de outra família via RLS.

### Verificações de projeto

```bash
node --experimental-strip-types --test tests/money-input.test.mjs tests/expense-categories.test.mjs tests/expense-date-picker.test.mjs tests/create-expense.test.mjs
npm exec tsc -- --noEmit
npx biome check .
npx expo install --check
```

## Critérios de aceite

- Usuário membro da família vê as quatro categorias iniciais da própria família.
- Usuário não consegue criar ou editar categoria nesta tela.
- Não existe campo Conta na interface.
- A despesa usa automaticamente a conta padrão da família.
- `R$ 40,00` é salvo como `-4000` centavos.
- A data escolhida no calendário é salva em `occurred_at`.
- Categoria e data são campos somente leitura com interação por seleção.
- RLS impede leitura ou escrita entre famílias diferentes.
- Falha de rede não apaga os dados digitados.
- O dashboard/lista reflete a nova transação após sucesso.
- TypeScript, Biome e testes passam.
- O fluxo funciona em Android e iOS.

## Fora de escopo

- criação, edição ou exclusão de categorias;
- seleção manual de conta;
- despesas recorrentes;
- anexos e comprovantes;
- edição de uma despesa existente;
- relatórios ou novos gráficos;
- administração de membros da família.
