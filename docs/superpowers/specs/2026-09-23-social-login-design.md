# Login social com Google e Apple

## Objetivo

Permitir que usuários iniciem sessão ou criem uma conta no My Finance Family com Google e Apple, preservando o login por e-mail e senha.

## Experiência

- A tela de login exibe os botões sociais Google e Apple com o padrão Social Button do Reacticx.
- Ao tocar em um provedor, o app abre a autorização em navegador seguro.
- Após concluir ou cancelar, o usuário retorna a `myfinancefamily://auth/callback`.
- Um retorno bem-sucedido troca o código OAuth por sessão Supabase, atualiza o Zustand existente e libera as rotas autenticadas.
- Cancelamento, erro remoto e provedor não configurado mostram mensagens claras em português sem apagar o formulário.

## Arquitetura

- Um cliente OAuth isola a abertura de sessão com `expo-web-browser`, a criação de URL via Supabase e a troca de código com `exchangeCodeForSession`.
- A tela de callback Expo Router consome os parâmetros do deep link e conclui a troca de sessão.
- O view model de autenticação expõe estados de carregamento e falha social por provedor, evitando requisições duplicadas.
- O componente Social Button fica em `src/shared/components/base`, usando dependências já compatíveis com Expo e a estética Reacticx.

## Configuração externa

- Supabase Auth deve habilitar Google e Apple.
- O campo Redirect URLs do Supabase deve conter `myfinancefamily://auth/callback`.
- Google exige Client ID/Secret OAuth e Apple exige Service ID, Key ID, Team ID e chave privada configurados no painel do Supabase. Esses segredos não entram no repositório.
- Para Apple em produção, o bundle identifier e o retorno configurado na Apple Developer devem coincidir com o app e o Supabase.

## Critérios de aceite

- Google e Apple iniciam OAuth a partir da tela de login.
- O retorno do provedor cria ou restaura a sessão no app.
- O usuário chega ao dashboard após sucesso.
- Cancelamento e erro não travam a tela e apresentam feedback em português.
- Os botões seguem o padrão visual Social Button do Reacticx.
- E-mail e senha continuam funcionando.

## Fora de escopo

- Criação ou gestão das credenciais nos consoles Google Cloud e Apple Developer.
- Login social em provedores diferentes de Google e Apple.
