# Login social com Supabase

O aplicativo abre o retorno de autenticação no deep link abaixo:

```text
myfinancefamily://auth/callback
```

## Configuração comum

No painel do Supabase, abra **Authentication > URL Configuration** e inclua o endereço acima em **Redirect URLs**. Mantenha também a URL principal do ambiente em **Site URL**.

As chaves usadas pelo aplicativo continuam sendo somente `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Segredos de provedores OAuth não devem entrar no repositório, no `.env` do Expo, nem no bundle do app.

## Google

1. No [Google Cloud Console](https://console.cloud.google.com/), crie ou selecione um cliente OAuth 2.0 para Web.
2. Em **Authorized redirect URIs**, adicione a callback mostrada na tela de configuração do provedor Google no Supabase. Ela usa o domínio do projeto Supabase e termina em `/auth/v1/callback`.
3. Copie o **Client ID** e o **Client Secret** para **Authentication > Providers > Google** no Supabase e habilite o provedor.

## Apple

1. No [Apple Developer](https://developer.apple.com/account/), configure o identificador de serviço para Sign in with Apple.
2. Cadastre a callback do projeto Supabase (terminada em `/auth/v1/callback`) como Return URL.
3. Em **Authentication > Providers > Apple** no Supabase, informe o **Service ID**, **Team ID**, **Key ID** e a chave privada `.p8` associada a Sign in with Apple; depois habilite o provedor.

Não faça commit do conteúdo da chave `.p8`, do Client Secret do Google ou de qualquer token gerado por esses provedores.

## Validação

Após habilitar os dois provedores, abra a tela de login no aplicativo e teste os botões **Continuar com Google** e **Continuar com Apple**. Ao concluir a autenticação, o retorno deve abrir o app em `myfinancefamily://auth/callback` e direcionar para a área autenticada.
