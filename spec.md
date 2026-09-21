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
- Nova despesa deve usar título e subtítulo alinhados à esquerda, sem seta de retorno no cabeçalho e sem o cabeçalho legado centralizado com “1 de 1” e reticências.
- O drawer de nova meta não deve exibir ícone decorativo entre o cabeçalho e o título do formulário; os ícones dos campos permanecem.
- Nova despesa deve manter o mesmo espaçamento superior das telas principais, preservando 58px antes do cabeçalho.

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
- O drawer de nova meta não apresenta ícone decorativo no corpo do cabeçalho.
- Uma meta válida aparece na lista após o salvamento.
- Dados inválidos não criam metas e apresentam mensagem de erro acessível.
- TypeScript, testes e verificações de dependências executam sem falhas novas.

## Fora do escopo

- Implementar tela de receitas.
- Alterar autenticação ou criar uma nova tela de logout.
- Persistir o novo link em backend remoto nesta etapa, caso a infraestrutura atual de metas ainda não o suporte.
- Redesenhar o conteúdo das telas além dos cabeçalhos, navegação e drawer descritos.

# Especificação funcional — CRE-12 Cofrinho

## Objetivo

Disponibilizar uma tela de Cofrinho para acompanhar o saldo consolidado e registrar as fontes de renda da família.

## Problema

O aplicativo ainda não oferece um espaço dedicado para organizar as entradas recorrentes, dificultando a visualização de onde vem o dinheiro e do valor total considerado no Cofrinho.

## Fluxo

1. A pessoa acessa “Cofrinho” pelo menu inferior.
2. A tela exibe o saldo do Cofrinho em um card com a ilustração do cofrinho como imagem de fundo e um filtro claro para preservar a leitura.
3. A pessoa pode editar manualmente o saldo exibido no card.
4. A seção “Fontes de renda” lista as fontes cadastradas, incluindo nome e valor mensal.
5. Ao tocar em “+ Registrar” ou “+ Adicionar fonte”, a pessoa abre um drawer inferior.
6. A pessoa informa o nome e o valor da fonte e salva; a nova fonte aparece na lista e atualiza o saldo consolidado.

## Regras

- “Cofrinho” deve ser uma entrada visível na navegação inferior, preservando também o acesso existente a “Despesas”.
- O card de saldo deve usar a imagem do cofrinho como background, com overlay claro harmonizado à paleta rosa da ilustração.
- O valor do saldo deve ser editável manualmente e formatado em reais.
- Nome da fonte e valor mensal são obrigatórios.
- O valor mensal deve ser maior que zero.
- O saldo consolidado inicial deve ser a soma das fontes cadastradas; a edição manual permite ajustar o valor exibido sem apagar as fontes.
- O campo de saldo deve iniciar preenchido com `R$ 0,00` e persistir a edição manual após 10 segundos sem novas alterações.
- O valor do saldo deve usar tipografia ampliada e não exibir texto auxiliar de instrução dentro do card.
- As fontes devem permanecer disponíveis após reabrir a tela no mesmo dispositivo.
- A criação deve ser local e offline-first; sincronização remota fica preparada para etapa posterior.

## Casos de erro

- Nome vazio ou composto somente por espaços: impedir o salvamento e informar que o nome é obrigatório.
- Valor vazio, inválido ou menor/igual a zero: impedir o salvamento e informar um valor válido.
- Falha ao carregar ou salvar dados locais: manter a tela utilizável, informar o problema e não descartar os dados já exibidos.
- Fechamento do drawer: descartar os dados ainda não salvos.

## Critérios de aceite

- A rota “Cofrinho” aparece na navegação e abre a nova tela.
- O card exibe a imagem do cofrinho em background com filtro claro e texto legível.
- O saldo é exibido em reais e pode ser editado manualmente.
- A lista exibe fontes de renda cadastradas com seus valores.
- “+ Registrar” e “+ Adicionar fonte” abrem um drawer funcional.
- Uma fonte válida é salva, aparece imediatamente na lista e altera o saldo consolidado.
- Dados inválidos não criam fontes e apresentam mensagens acessíveis.
- As fontes persistem localmente após desmontar e reabrir a tela.
- TypeScript, testes, checagem de dependências e diff check são executados sem falhas novas.

## Fora do escopo

- Sincronização remota das fontes com o Supabase.
- Tela de receitas separada.
- Edição ou exclusão de fontes já cadastradas.
- Alteração das regras de autenticação ou das demais telas financeiras.
