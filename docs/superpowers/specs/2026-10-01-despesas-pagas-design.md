# Despesas pendentes e pagas

## Objetivo

Permitir que cada despesa seja registrada como pendente e só afete a carteira e os totais financeiros quando a família confirmar que ela foi paga.

## Decisões aprovadas

- Toda despesa nova começa com status `pending`.
- Todas as despesas existentes passam a `pending` na migração.
- Apenas despesas `paid` reduzem a carteira e compõem os totais mensais.
- `occurredAt` continua sendo a data prevista ou vencimento; `paidAt` registra o pagamento efetivo.
- O mês de uma despesa paga é determinado por `paidAt`.
- Na lista de despesas, tocar a linha abre detalhes; o lápis abre edição.

## Modelo de dados

Adicionar às transações:

- `payment_status`: `pending` ou `paid`, com padrão `pending`.
- `paid_at`: data/hora opcional, preenchida quando o status for `paid`.

O tipo `Transaction`, o banco SQLite e o banco Supabase terão os mesmos campos. A migration remota define `pending` para os registros atuais. A migration SQLite aumenta a versão do banco e preenche o status em registros locais existentes. O SQLite também guarda `sync_operation` apenas localmente (`create`, `update` ou `mark_paid`) para que um pagamento offline seja repetido como pagamento, e não recriado como uma nova despesa.

## Regras financeiras

Criar, editar ou excluir uma despesa pendente não modifica o saldo da carteira. Marcar uma despesa pendente como paga reduz o saldo uma única vez. Uma despesa paga editada ou excluída atualiza o saldo conforme a diferença de valor ou remoção. Uma despesa paga não pode ser debitada novamente ao sincronizar.

Os cálculos de saldo de despesas, dashboard, gráficos e distribuição por categoria usarão apenas despesas pagas, agrupadas pelo mês de `paidAt`. Despesas pendentes permanecem visíveis na lista, mas não entram nesses valores.

## Interface

Na lista de despesas, cada linha terá uma tag `PENDENTE` ou `PAGA` ao lado do nome. O toque no corpo da linha abre o modal de detalhes. Um botão de lápis no lado direito da linha abre o formulário de edição e impede a abertura do modal. O avatar do criador deixa de ser exibido nessa lista para liberar esse espaço.

O modal de detalhes de uma despesa pendente oferece a ação `Marcar como paga`. Ao confirmar, a ação usa a data atual como `paidAt`, atualiza a lista e fecha ou atualiza o modal. Para uma despesa paga, o modal exibe `Paga em <data>` e não oferece nova cobrança.

## Sincronização e falhas

A confirmação de pagamento é escrita primeiro no SQLite com `syncStatus: pending`. Quando houver sessão, o app chama uma RPC remota específica para marcar a despesa como paga; se houver falha de rede, o registro local continua pendente de sincronização e a próxima recarga tenta enviá-lo novamente. Erros remotos mostram uma mensagem acionável, sem perder o estado local.

## Supabase

Uma migration adiciona as colunas, inicializa registros atuais como pendentes e atualiza as RPCs que listam, criam, editam e sincronizam despesas para devolver os novos campos. Uma RPC protegida `mark_family_expense_paid` valida a associação do usuário à família, aceita somente despesas pendentes e registra `paid_at` no servidor.

## Testes

- Tipo e mapeamento remoto preservam status e data de pagamento.
- Registros existentes e despesas novas começam pendentes.
- Marcar como paga atualiza status, data e saldo exatamente uma vez.
- Cálculos mensais ignoram pendentes e usam `paidAt` para pagas.
- A lista distingue toque no conteúdo, que abre detalhes, de toque no lápis, que abre edição.
- Fluxos locais pendentes de sincronização não duplicam o débito após reconexão.
