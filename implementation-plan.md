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

Decisão recomendada: fazer a menor alteração compatível com o protótipo, reutilizando o formulário e a navegação existentes; não introduzir backend novo nem worktree.
