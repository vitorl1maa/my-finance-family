# Tela de transações — Plano de implementação

> **Para agentes:** execute as tarefas na ordem, mantendo os testes verdes a cada tarefa. A etapa de QA deve ler este plano e `spec.md` antes de aprovar a entrega.

**Objetivo:** exibir o histórico familiar de transações em uma tela pesquisável, com persistência local e atualização pelo Supabase.

**Arquitetura:** a tela lê primeiro o SQLite por meio do repositório de transações e mantém o resultado no store Zustand. Um repositório remoto consulta o Supabase sob as políticas RLS existentes; seu resultado é gravado localmente e substitui o estado em memória. O view model coordena carga, atualização, busca e estados de interface; a tela permanece apenas com apresentação.

**Stack:** Expo SDK 57, React Native, TypeScript, Expo SQLite, Supabase, Zustand, date-fns, lucide-react-native e `node:test`.

**Especificação:** `spec.md`

## Restrições globais

- Usar SQLite como fonte local primária e renderizar dados locais antes de qualquer rede.
- Toda escrita de transação deve persistir localmente antes de sincronizar com o Supabase.
- A leitura remota deve usar o cliente Supabase autenticado e as políticas RLS; não incluir `family_id` fornecido pela UI.
- Não incluir cadastro de receitas, botão “+”, filtros de período ou edição/exclusão.
- Reutilizar os tokens de `src/shared/theme`; manter o componente de tela abaixo de 300 linhas.
- A busca deve ignorar maiúsculas/minúsculas e considerar título e categoria.
- Validar com testes, `npm exec tsc -- --noEmit`, `npm run check`, `npx expo install --check`, revisão de segurança e teste visual no emulador/dispositivo.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
| --- | --- |
| `src/features/transactions/model/transaction-list.ts` | Busca textual, ordenação e agrupamento cronológico puros. |
| `src/features/transactions/repository/transactions-repository.ts` | Leitura e escrita idempotente do cache SQLite. |
| `src/features/transactions/repository/transactions-remote-repository.ts` | Leitura e criação remotas encapsuladas no Supabase. |
| `src/features/transactions/view-model/use-transactions-view-model.ts` | Coordena cache, sincronização, estado e criação de despesa. |
| `src/features/transactions/view/transactions-view.tsx` | Interface da tela e seus estados de carregamento, erro e vazio. |
| `app/(tabs)/transactions.tsx` | Rota fina que renderiza `TransactionsView`. |
| `tests/transaction-list.test.mjs` | Regras de busca, ordenação e agrupamento. |
| `tests/transactions-repository.test.mjs` | Contrato de persistência e reconciliação local. |

### Tarefa 1: Criar as regras puras da lista

**Arquivos:**

- Criar: `src/features/transactions/model/transaction-list.ts`
- Criar: `tests/transaction-list.test.mjs`

**Interfaces:**

- Produz `filterTransactions(transactions: Transaction[], query: string): Transaction[]`.
- Produz `groupTransactionsByDay(transactions: Transaction[], referenceDate: Date): TransactionDayGroup[]`, onde `TransactionDayGroup` contém `{ id: string; label: string; transactions: Transaction[] }`.

- [ ] Escrever testes para localizar `Supermercado` por “merc”, localizar categoria `Alimentação` por “alimen”, ignorar capitalização, ordenar por `occurredAt` decrescente e agrupar datas em `HOJE`, `ONTEM` e `dd 'de' MMMM` em pt-BR.

```js
const visible = filterTransactions(transactions, "ALIMEN");
assert.deepEqual(visible.map(({ id }) => id), ["market"]);
assert.equal(groups[0].label, "HOJE");
assert.equal(groups[1].label, "ONTEM");
```

- [ ] Executar `node --test tests/transaction-list.test.mjs` e confirmar falha por módulo inexistente.
- [ ] Implementar funções puras usando `date-fns` (`isToday`, `isYesterday`, `format`) e `ptBR`; normalizar o termo com `trim().toLocaleLowerCase("pt-BR")` e ordenar uma cópia para não mutar o store.
- [ ] Executar novamente `node --test tests/transaction-list.test.mjs` e confirmar aprovação.
- [ ] Commitar: `feat: add transaction list rules`.

### Tarefa 2: Completar o cache SQLite e a reconciliação

**Arquivos:**

- Modificar: `src/features/transactions/repository/transactions-repository.ts`
- Criar: `tests/transactions-repository.test.mjs`

**Interfaces:**

- Produz `upsertTransactions(db: SQLiteDatabase, transactions: Transaction[]): Promise<void>`.
- Produz `replaceTransaction(db: SQLiteDatabase, previousId: string, transaction: Transaction): Promise<void>`.
- `listTransactions(db)` continua retornando `Promise<Transaction[]>` em ordem decrescente.

- [ ] Escrever testes com uma implementação fake de `SQLiteDatabase` que registre chamadas para validar que `upsertTransactions` usa parâmetros, persiste `familyId`, `categoryId`, `recurrenceRule` e `syncStatus`, e que `replaceTransaction` remove o registro pendente somente após inserir o registro sincronizado.
- [ ] Executar `node --test tests/transactions-repository.test.mjs` e confirmar falha antes da implementação.
- [ ] Implementar `upsertTransactions` com `INSERT ... ON CONFLICT(id) DO UPDATE`, sempre usando placeholders `?`; envolver a sequência de substituição em `withTransactionAsync`, inserindo o registro remoto e removendo `previousId` na mesma transação.
- [ ] Manter `listTransactions` selecionando todas as colunas do modelo, sem interpolar valores de entrada em SQL.
- [ ] Executar `node --test tests/transactions-repository.test.mjs` e confirmar aprovação.
- [ ] Commitar: `feat: persist transaction cache`.

### Tarefa 3: Encapsular leitura e criação remotas

**Arquivos:**

- Criar: `src/features/transactions/repository/transactions-remote-repository.ts`
- Modificar: `src/features/transactions/view-model/use-transactions-view-model.ts`

**Interfaces:**

- Produz `listRemoteTransactions(): Promise<Transaction[]>`.
- Produz `createRemoteExpense(payload: CreateExpensePayload): Promise<Transaction>`.
- `createExpense(input)` primeiro persiste uma transação local `pending`; em seguida tenta `createRemoteExpense`; em caso de sucesso substitui a pendente pelo registro remoto `synced`; em falha de rede mantém a pendente e não descarta a despesa.

- [ ] Criar o repositório remoto com `supabase.from("transactions").select(...)` ordenado por `occurred_at` e com mapeamento explícito entre campos snake_case e `Transaction`.
- [ ] Implementar a criação remota usando a RPC existente `create_expense`; após receber seu `transaction_id`, buscar o registro recém-criado pelo id para obter todos os campos exibíveis. Propagar apenas erros remotos normalizados para o view model.
- [ ] No view model, obter `db` com `useSQLiteContext`; no carregamento inicial, chamar `listTransactions(db)` e preencher o store antes de iniciar a atualização remota.
- [ ] Ao atualizar remotamente, gravar o resultado com `upsertTransactions`, então substituir o store pelo cache atualizado. Se falhar, preservar os itens do SQLite, preencher uma mensagem de atualização indisponível e disponibilizar `reloadTransactions`.
- [ ] Ao criar despesa, gerar um id local explícito, montar o `Transaction` pendente, gravá-lo com `upsertTransactions` e atualizar o store antes da RPC. Em sucesso, chamar `replaceTransaction`; em falha, manter o registro pendente e permitir que a tela de cadastro retorne normalmente.
- [ ] Remover o array `initialTransactions` de demonstração; o estado inicial do store será vazio até a leitura do cache.
- [ ] Atualizar ou criar testes unitários para o view model ou extrair a coordenação assíncrona para funções testáveis, cobrindo: cache primeiro, atualização bem-sucedida, falha remota preservando cache e criação de despesa offline.
- [ ] Executar `node --test tests/*.test.mjs` e confirmar aprovação.
- [ ] Commitar: `feat: sync transactions from Supabase`.

### Tarefa 4: Construir a tela conforme o protótipo

**Arquivos:**

- Criar: `src/features/transactions/view/transactions-view.tsx`
- Modificar: `app/(tabs)/transactions.tsx`

**Interfaces:**

- `TransactionsView` consome apenas `useTransactionsViewModel()` e `transaction-list.ts`.
- A rota exporta `TransactionsScreen` que retorna `<TransactionsView />`.

- [ ] Implementar cabeçalho com “Transações” e “Acompanhe tudo que entra e sai”; não renderizar botão de adição.
- [ ] Adicionar `TextInput` com ícone `Search`, `accessibilityLabel="Buscar transações"` e texto de apoio que informa busca por descrição ou categoria. Passar seu valor para `filterTransactions` durante a renderização, sem efeito ou consulta de rede.
- [ ] Exibir grupos retornados por `groupTransactionsByDay`, com ícone de categoria/tipo, título, metadado `Despesa · {categoria}` ou `Receita · {categoria}`, e moeda formatada. Usar vermelho para negativos e verde para positivos.
- [ ] Implementar estados: indicador acessível enquanto o cache inicial carrega; vazio sem busca; vazio específico para busca; aviso de falha de atualização acompanhado do botão “Tentar novamente”. Dados locais devem continuar renderizados diante do aviso.
- [ ] Usar `SafeAreaView`/insets e `ScrollView` ou `FlatList` com espaçamento que não fique sob a barra de abas; seguir cores e tipografia de `src/shared/theme` e o mock fornecido.
- [ ] Verificar que o arquivo permanece abaixo de 300 linhas; extrair `TransactionRow` e `TransactionListState` caso necessário.
- [ ] Executar `npm exec tsc -- --noEmit` e `npm run check`.
- [ ] Commitar: `feat: build transactions screen`.

### Tarefa 5: Validação integrada, segurança e QA

**Arquivos:**

- Modificar quando necessário: `spec.md`, `implementation-plan.md` e os testes acima para refletir a implementação final.

- [ ] Executar `node --test tests/*.test.mjs`, `npm exec tsc -- --noEmit`, `npm run check` e `npx expo install --check`; corrigir somente falhas relacionadas à mudança.
- [ ] Realizar revisão de segurança do diff: confirmar que consultas SQLite usam placeholders, que `family_id` nunca vem da UI, que o Supabase usa a sessão autenticada/RLS e que erros não expõem tokens, chaves ou dados financeiros de outra família.
- [ ] Abrir a tela em emulador ou dispositivo e registrar evidências de: cache carregado sem rede, erro de atualização sem apagar a lista, busca por título e categoria, grupos de hoje/ontem/data, valores positivos/negativos e ausência de botão “+”. Verificar áreas de toque, contraste e clipping da barra de abas.
- [ ] Encaminhar `spec.md`, este plano e o diff para o agente QA (`.ia/AGENTS/qa.md`), tratar problemas encontrados e repetir as validações afetadas.
- [ ] Commitar: `test: cover transactions flow`.

## Auto-revisão do plano

- Cobertura da especificação: tarefas 1 e 4 atendem busca, agrupamento, visual e estados; tarefas 2 e 3 atendem cache, sincronização, família autenticada e nova despesa; tarefa 5 valida erros, offline, segurança e acessibilidade.
- Sem lacunas ou placeholders: receitas permanecem somente de leitura, e criação/edição/filtros adicionais são excluídos.
- Consistência de interfaces: `Transaction` é o contrato único entre cache, remoto, store, regras de lista e UI; `reloadTransactions` é exposto pelo view model e usado na interface de erro.
