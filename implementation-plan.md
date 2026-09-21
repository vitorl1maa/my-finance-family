# Plano de implementação — issues CRE-6, CRE-7, CRE-9, CRE-10 e CRE-11

1. Remover o item e a rota “Mais” do layout de tabs.
2. Expor `expense-new` como item “Despesas” com `BanknoteArrowUp`.
3. Alinhar a composição do drawer de metas ao padrão de Recorrência.
4. Adicionar o campo de link do produto/serviço ao modelo e ao formulário de metas.
5. Preservar validação de nome/valor, criar testes de regressão e atualizar documentação da esteira.
6. Executar QA: testes, TypeScript, Expo dependency check, diff check e revisão visual estática dos critérios.
7. Corrigir o cabeçalho legado de Nova despesa, substituindo o título centralizado por título/subtítulo alinhados e retorno acessível.
8. Remover o ícone decorativo do drawer de nova meta sem alterar os ícones funcionais dos campos.
9. Padronizar o espaçamento superior de Nova despesa com o respiro vertical das demais páginas.
10. Remover a seta de retorno do cabeçalho de Nova despesa, mantendo o cancelamento no final do formulário.

Decisão recomendada: fazer a menor alteração compatível com o protótipo, reutilizando o formulário e a navegação existentes; não introduzir backend novo nem worktree.

# Plano de implementação — CRE-12 Cofrinho

1. Modelar fonte de renda e ampliar a migração SQLite para persistência local offline-first.
2. Criar repositório, store e view-model para carregar fontes, inserir novas fontes e calcular o saldo consolidado.
3. Implementar a tela Cofrinho conforme o Pencil: card com imagem de fundo e overlay rosa claro, saldo editável, lista de fontes e estados vazio/erro.
4. Implementar o drawer de registro com validação acessível de nome e valor.
5. Adicionar Cofrinho à navegação inferior preservando a rota Despesas existente.
6. Adicionar testes para validação, formatação e cálculo do saldo; executar TypeScript, testes, Expo dependency check e diff check.
7. Registrar o resultado no Linear e concluir a issue somente após o QA.

Decisão recomendada: manter cinco entradas na navegação (Início, Transações, Metas, Despesas e Cofrinho), pois remover Despesas quebraria uma funcionalidade já entregue; aplicar o protótipo visual do Pencil ao novo destino.

# Ajuste de input — CRE-12

1. Persistir o saldo manual em uma tabela local própria do Cofrinho.
2. Inicializar o campo com `R$ 0,00` e salvar alterações somente após 10 segundos sem digitação.
3. Aumentar a tipografia do saldo e remover a instrução auxiliar do card.
4. Validar persistência, TypeScript, testes e diff check.

# Plano de implementação — CRE-14, CRE-15 e CRE-16

1. Substituir a barra curva por uma barra flutuante cápsula com estados ativo/inativo e acessibilidade.
2. Criar o componente de boas-vindas com a imagem local aprovada e substituir o banner antigo do Dashboard.
3. Criar rota protegida de editar perfil, conectar o avatar do Dashboard e usar o updateUser do Supabase com debounce de 10 segundos.
4. Implementar logout, visibilidade da senha e estados de salvamento/erro sem botão manual.
5. Executar TypeScript, testes, Biome, Expo dependency check e diff check; atualizar Linear após QA.

# Plano de implementação — Estado vazio do Cofrinho no Dashboard

1. Remover a criação automática de fontes fictícias no carregamento do Cofrinho.
2. Criar o estado vazio determinístico e o banner com ilustração, texto e ação para adicionar fonte.
3. Renderizar o banner apenas após o carregamento e somente quando não houver fontes persistidas.
4. Cobrir a regra de exibição com teste automatizado e executar TypeScript, testes, Biome e diff check.
