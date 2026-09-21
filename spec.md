# Tela de transações

## Objetivo

Permitir que a família consulte, em uma única tela, as transações financeiras já registradas, encontrando rapidamente uma despesa ou receita por descrição ou categoria.

## Problema

A aplicação possui registros de transações, mas a tela atual não apresenta o histórico de forma alinhada ao protótipo e usa itens de exemplo em vez dos registros reais. Isso limita o acompanhamento das movimentações da família.

## Fluxo

1. Ao acessar a aba **Transações**, a pessoa usuária vê o título, uma frase curta de apoio e um campo de busca.
2. O aplicativo apresenta as transações disponíveis, da mais recente para a mais antiga, agrupadas em **HOJE**, **ONTEM** ou pela data correspondente para registros anteriores.
3. Cada transação mostra ícone, descrição, tipo e categoria, além do valor com sinal e cor que indiquem despesa ou receita.
4. Ao digitar no campo de busca, a lista é filtrada por descrição e categoria, sem exigir uma ação adicional.
5. Quando uma despesa é salva pelo fluxo já existente, ela passa a aparecer na lista de transações.

## Regras

- A tela não possui botão de adição de transação.
- O cadastro de receitas não faz parte desta entrega.
- Despesas e receitas existentes devem ser exibidas na lista.
- A busca não diferencia letras maiúsculas de minúsculas e considera descrição e categoria.
- Despesas devem exibir valor negativo em vermelho; receitas, valor positivo em verde.
- A ordenação deve priorizar as transações mais recentes.
- As informações apresentadas devem pertencer somente à família da pessoa usuária autenticada.

## Casos de erro

- Sem transações: informar que ainda não há transações registradas.
- Busca sem resultado: informar que nenhuma transação foi encontrada.
- Falha ao obter transações: exibir mensagem compreensível e uma ação para tentar novamente.
- Sem conexão: manter disponíveis os dados de transações já existentes no dispositivo e informar a indisponibilidade de atualização quando aplicável.

## Critérios de aceite

- A tela segue a hierarquia visual do protótipo fornecido: título, texto de apoio, campo de busca e lista agrupada por data.
- Não é exibido botão “+” na tela.
- A lista apresenta registros reais disponíveis para a família autenticada, ordenados do mais recente para o mais antigo.
- A busca encontra registros por descrição e categoria, sem diferenciar maiúsculas e minúsculas.
- Cada registro identifica corretamente despesa ou receita por texto, sinal, cor e valor.
- A tela apresenta estados claros de carregamento, ausência de dados, busca sem resultado e falha de carregamento.
- Uma nova despesa salva pelo fluxo existente fica disponível na listagem.
- O histórico já salvo no dispositivo continua visível quando não houver conexão.

## Fora do escopo

- Cadastro, edição ou exclusão de receitas.
- Cadastro, edição ou exclusão de transações diretamente pela tela de transações.
- Filtros por período, conta, valor ou categoria além da busca textual.
- Alterações nas regras de categorias, contas, metas ou autenticação.
