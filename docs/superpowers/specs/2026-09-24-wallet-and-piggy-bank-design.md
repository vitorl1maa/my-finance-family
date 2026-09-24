# Carteira e Cofrinho

## Objetivo

Separar o dinheiro disponível para despesas do dinheiro guardado como reserva. A tela atualmente chamada “Cofrinho” passará a se chamar “Carteira e Cofrinho” e exibirá a Carteira acima do Cofrinho.

## Regras de negócio

- A Carteira começa com saldo `R$ 0,00` e representa o dinheiro disponível para despesas.
- Fontes de renda aumentam a Carteira automaticamente.
- Criar uma despesa reduz a Carteira.
- Editar uma fonte de renda ou despesa aplica apenas a diferença entre o valor anterior e o novo valor.
- Excluir uma fonte de renda ou despesa desfaz seu impacto na Carteira.
- O Cofrinho tem saldo independente e representa dinheiro guardado.
- “Guardar” transfere dinheiro da Carteira para o Cofrinho.
- “Resgatar” transfere dinheiro do Cofrinho para a Carteira.
- Nenhuma operação pode deixar Carteira ou Cofrinho abaixo de zero.
- As transferências e ajustes de despesas/receitas devem ser atômicos no Supabase.

## Interface

- O título da tela será “Carteira e Cofrinho”.
- O banner da Carteira ficará acima do banner do Cofrinho.
- A Carteira usará `assets/images/wallet.png` como imagem de fundo, com filtro/overlay para manter o texto legível.
- O banner da Carteira exibirá saldo disponível e ações para “Guardar” e “Resgatar”.
- O banner do Cofrinho continuará usando a identidade visual atual, exibindo somente o saldo reservado.
- A lista de fontes de renda permanecerá abaixo dos dois banners.
- O estado vazio e o pull-to-refresh deverão funcionar para os dois saldos.

## Persistência e sincronização

- Criar uma tabela remota de saldo da Carteira por família, com saldo em centavos, timestamps e controle de atualização.
- Reutilizar a tabela atual de `piggy_bank_settings` para o saldo do Cofrinho.
- Criar RPCs transacionais para ajustar a Carteira, criar despesas, atualizar/excluir impactos e transferir entre Carteira e Cofrinho.
- Adicionar a tabela e operações equivalentes ao SQLite local para manter o comportamento offline já existente.
- Após uma gravação local, sincronizar com o Supabase; falhas permanecem pendentes e são tentadas no próximo refresh.

## Critérios de aceite

- Uma renda de `R$ 5.000,00` exibe `R$ 5.000,00` na Carteira e não altera o Cofrinho.
- Uma despesa de `R$ 1.000,00` reduz a Carteira para `R$ 4.000,00`.
- Guardar `R$ 500,00` exibe Carteira `R$ 3.500,00` e Cofrinho `R$ 500,00`.
- Tentar gastar ou transferir mais que o saldo disponível é bloqueado sem alterar nenhum saldo.
- Editar e excluir operações mantém os saldos consistentes após refresh e sincronização.
