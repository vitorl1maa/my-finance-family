# Especificação funcional — issues abertas do Product Board

## Objetivo

Alinhar a navegação e os fluxos visuais do aplicativo ao protótipo aprovado e concluir o fluxo de criação de metas.

## Problema

A navegação ainda exibe a tela “Mais”, a ação de despesas não está representada como uma entrada clara do menu, e o drawer de nova meta não contém todos os campos definidos no protótipo nem segue completamente o padrão visual do drawer de recorrência.

## Fluxo

1. A pessoa navega pelo menu inferior entre Início, Transações, Metas e Despesas.
2. “Mais” não aparece como tela nem como item do menu.
3. Ao abrir Despesas, a pessoa acessa o formulário de nova despesa, identificado pelo ícone `banknote-arrow-up` e pelo rótulo “Despesas”.
4. Na tela Metas, a pessoa toca no botão “+” e vê um drawer inferior com título, descrição, botão de fechar e campos de nova meta.
5. A pessoa informa nome, link do produto ou serviço, valor-alvo e prazo opcional; ao salvar, a nova meta aparece na lista.

## Regras

- A navegação inferior deve conter somente Início, Transações, Metas e Despesas.
- O item Despesas deve usar o ícone `BanknoteArrowUp` e o rótulo “Despesas”.
- O drawer de metas deve preservar o padrão de superfície, título, descrição, fechar e botão de ação do drawer de Recorrência.
- Nome e valor-alvo são obrigatórios; valor-alvo deve ser maior que zero.
- Link do produto/serviço e prazo são opcionais.
- A meta criada inicia com valor acumulado zero e status pendente de sincronização.
- O padrão visual de cabeçalho deve ser mantido nas telas de Metas, Transações e Nova despesa.

## Casos de erro

- Nome vazio ou somente espaços: impedir o salvamento e informar que nome e valor-alvo são necessários.
- Valor-alvo vazio, inválido ou igual a zero: impedir o salvamento e informar valor-alvo inválido.
- Link preenchido: preservar o texto informado sem bloquear a criação por ausência de validação de URL nesta etapa.
- Fechamento do drawer: descartar os dados ainda não salvos e retornar à lista.

## Critérios de aceite

- O menu inferior não exibe “Mais” e não registra a rota de configurações.
- O menu exibe “Despesas” com `BanknoteArrowUp` e abre o formulário de nova despesa.
- O cabeçalho de Metas segue o protótipo com título, subtítulo e botão “+”.
- O drawer de nova meta apresenta título, descrição, fechar, nome, link, valor-alvo, prazo e ação “Criar meta”.
- Uma meta válida aparece na lista após o salvamento.
- Dados inválidos não criam metas e apresentam mensagem de erro acessível.
- TypeScript, testes e verificações de dependências executam sem falhas novas.

## Fora do escopo

- Implementar tela de receitas.
- Alterar autenticação ou criar uma nova tela de logout.
- Persistir o novo link em backend remoto nesta etapa, caso a infraestrutura atual de metas ainda não o suporte.
- Redesenhar o conteúdo das telas além dos cabeçalhos, navegação e drawer descritos.
