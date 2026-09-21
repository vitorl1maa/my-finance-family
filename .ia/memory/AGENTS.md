
# Regras do projeto My Finance Family

Este arquivo define o contexto e as regras de trabalho para agentes que atuarem neste projeto. As instruções específicas do usuário têm prioridade sobre estas regras; em seguida vêm as instruções deste arquivo e, por fim, as convenções gerais do repositório.

## Objetivo do produto

O My Finance Family é um aplicativo de controle financeiro familiar. A experiência deve ser simples, acolhedora e confiável, permitindo acompanhar contas, transações, metas e o orçamento da família mesmo sem conexão com a internet.

## Stack obrigatória

- Usar React Native com Expo SDK 57.
- Usar TypeScript.
- Usar Expo Router para navegação baseada em arquivos.
- Usar Zustand para estado global e gerenciamento dos view models.
- Seguir MVVM: telas cuidam da apresentação, view models coordenam estado e ações, repositories abstraem persistência e models definem os dados.
- Usar SQLite local como base principal para dados do domínio.
- Usar Supabase para autenticação, incluindo e-mail/senha e login social.
- Antes de escrever código Expo, consultar a documentação versionada do SDK 57: https://docs.expo.dev/versions/v57.0.0/.

## Arquitetura e offline-first

- O aplicativo deve funcionar offline para leitura e escrita das informações financeiras essenciais.
- A UI não deve depender de uma chamada de rede para renderizar dados já persistidos localmente.
- Toda escrita de domínio deve passar por um repository e ser persistida localmente antes de qualquer sincronização remota.
- A sincronização com o Supabase deve ser tratada como processo separado, resiliente a falhas, repetível e seguro contra duplicação.
- Estados de sincronização devem ser explícitos quando necessário: pendente, sincronizado, erro e conflito.
- Não colocar SQL, chamadas HTTP ou regras de negócio diretamente nos componentes de tela.
- Manter as dependências de infraestrutura substituíveis por interfaces pequenas e tipadas.

## Organização do código

- Organizar funcionalidades em `src/features/<feature>`.
- Preferir os diretórios `model`, `repository`, `store` e `view-model` dentro de cada feature quando eles forem necessários.
- Manter providers fora de `app/` para que o Expo Router não os interprete como rotas.
- Todo arquivo dentro de `app/` deve ser uma rota válida, um layout ou um arquivo especial reconhecido pelo Expo Router.
- Evitar arquivos ou abstrações genéricas sem uso concreto.
- Reutilizar tokens compartilhados de `src/shared/theme` para cores, espaçamento e tipografia.

## Design e prototipação

- Criar ou revisar o protótipo no Pencil antes de implementar uma tela nova, quando o fluxo exigir decisão visual.
- Usar os mocks fornecidos como referência visual principal para cor, hierarquia, espaçamento, cartões e navegação.
- Preservar a linguagem visual baseada em preto, branco, cinza e verde-limão. Não introduzir azul ou gradientes azuis.
- Os componentes `Conta principal` e `Poupança` devem usar fundo branco e borda cinza.
- Priorizar tipografia forte em títulos, alto contraste, cantos arredondados e espaçamento generoso, mantendo a aparência dos mocks.
- Validar o layout no Pencil e no dispositivo/emulador; corrigir clipping, overflow, sobreposição e áreas de toque insuficientes.

## Autenticação

- Implementar autenticação por Supabase, com e-mail/senha e provedores sociais.
- Nunca colocar URL, chave, segredo ou token privado diretamente no código-fonte.
- Variáveis públicas do Supabase devem ser fornecidas por configuração de ambiente; secrets devem permanecer fora do repositório.
- O fluxo deve contemplar login, criação de conta, recuperação de acesso, carregamento de sessão e logout.
- A tela de criação de conta deve coletar, no mínimo, nome, sobrenome e telefone, além dos campos necessários para autenticação.
- Tratar estados de carregamento, erro, sessão expirada e ausência de conexão de forma visível e compreensível.

## Qualidade e validação

- Não criar componentes com mais de 300 linhas. Dividir responsabilidades em componentes menores, hooks, view models ou módulos de domínio quando o limite for atingido.
- Evitar `if` aninhado. Preferir guard clauses para encerrar condições inválidas no início e Strategy Pattern quando houver várias variações de comportamento ou condicionais extensas. Usar exceções apenas quando a falha precisar ser propagada ou diagnosticada.
- Evitar `useEffect` desnecessário: não usá-lo para cálculos derivados, sincronização de estado que pode ocorrer no handler de um evento ou lógica que possa ser expressa diretamente durante a renderização. Isolar efeitos reais em hooks ou view models bem definidos.
- Evitar `any`. Preferir tipos explícitos, `unknown` com narrowing, genéricos ou unions discriminadas. Um uso inevitável de `any` deve ser local, justificado e não se espalhar pela API do módulo.
- Usar lazy loading quando houver benefício real de desempenho, como rotas, telas ou módulos pesados carregados sob demanda. Não aplicar lazy loading indiscriminadamente a componentes pequenos nem prejudicar a experiência com carregamentos perceptíveis.
- Antes de concluir uma alteração, executar pelo menos `npm exec tsc -- --noEmit` e `npx expo install --check`.
- Adicionar ou atualizar testes para regras de negócio, repositories e view models quando houver comportamento novo.
- Testar especialmente reinício do app, modo avião, gravação local, navegação entre rotas e recuperação após falha de sincronização.
- Não considerar uma tarefa concluída apenas porque o bundler iniciou: verificar também a tela e os logs do runtime.
- Investigar a causa raiz de warnings e erros; não silenciar mensagens do Expo Router ou do React sem justificativa.

Referências de estilo: [Strategy Pattern](https://medium.com/mulheres-de-produto/o-que-%C3%A9-strategy-pattern-e-quando-usar-2fc3bcb4873), [guard clauses](https://dev.to/clintwinter/use-guard-clauses-for-cleaner-code-3ap7), [uso criterioso de `useEffect`](https://medium.com/@olliedoesdev/how-to-avoid-making-the-same-useeffect-mistakes-as-me-7f9d20eaaafd) e [lazy loading no React Native](https://medium.com/@andrea.pacchioniap/lazy-loading-with-react-native-961112a5f078).

## Git e entrega

- Inspecionar `git status` e o diff antes de editar para não sobrescrever trabalho existente.
- Não criar, usar ou solicitar worktrees. Realizar alterações sempre no checkout atual do projeto.
- Fazer commits pequenos, focados e com mensagens no imperativo, por exemplo: `feat: add offline accounts repository`.
- Não usar comandos destrutivos como `git reset --hard` ou `git checkout --` sem autorização explícita.
- Nunca commitar `.env`, tokens, credenciais, bancos locais de desenvolvimento ou outros dados sensíveis.
- Na conclusão, informar arquivos alterados, validações executadas, limitações conhecidas e o hash do commit quando houver commit.

## Forma de trabalho do agente

### Leitura obrigatória deste arquivo

- Ler este `AGENTS.md` integralmente antes de implementar, corrigir, refatorar ou revisar qualquer código do projeto.
- Considerar as regras deste arquivo durante o planejamento, a implementação e a validação; não consultar apenas após concluir a alteração.
- Confirmar no início da execução que o arquivo foi lido e, na entrega, informar qualquer regra relevante que tenha influenciado a solução.
- Se uma regra deste arquivo estiver desatualizada, conflitante ou impedir uma implementação segura, interromper a alteração e sinalizar o conflito antes de prosseguir.

### Esteira obrigatória de agentes

- Antes de analisar, planejar, implementar, revisar ou responder qualquer demanda do projeto, consultar e aplicar a esteira definida em `.ia/`.
- Para novas funcionalidades e mudanças de comportamento, seguir obrigatoriamente a sequência: Product Owner (`.ia/AGENTS/po.md`) → Engenheiro Senior (`.ia/AGENTS/senior-dev.md`) → QA (`.ia/AGENTS/qa.md`).
- Executar a esteira de forma autônoma, avançando para a próxima etapa assim que a etapa atual estiver concluída. Não solicitar aprovações intermediárias para especificação, plano ou implementação.
- O Product Owner deve produzir ou atualizar `spec.md` antes do planejamento técnico. O Engenheiro Senior deve criar `implementation-plan.md`, implementar a especificação e encaminhar o resultado ao QA. O QA deve avaliar a implementação e o plano antes da conclusão.
- Quando houver opções de solução e uma alternativa for recomendada, escolher automaticamente a alternativa recomendada e registrar de forma objetiva a decisão e a justificativa. Só interromper para pedir orientação quando não houver recomendação segura, a decisão alterar materialmente o escopo solicitado ou for necessária nova autorização externa.
- Para correções, usar o prompt e os papéis correspondentes em `.ia/` antes de alterar código.
- Em caso de conflito entre esta esteira e uma instrução específica da pessoa usuária, a instrução da pessoa usuária prevalece.

1. Entender o pedido e verificar o estado atual do projeto antes de alterar arquivos.
2. Para mudanças de produto ou comportamento, esclarecer a intenção e registrar uma decisão curta quando houver ambiguidade relevante.
3. Consultar a documentação oficial da versão das dependências que influenciam a implementação.
4. Implementar a menor mudança coerente com a arquitetura existente.
5. Validar código, fluxo e aparência proporcionalmente ao risco da mudança.
6. Relatar o resultado de maneira objetiva, sem afirmar que algo foi testado quando não foi.
