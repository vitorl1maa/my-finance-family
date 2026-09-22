# Convites familiares por QR Code

## Objetivo

Permitir que o administrador convide uma pessoa para sua família por QR Code, sem e-mail. Cada usuário pode pertencer a apenas uma família.

## Regras do produto

- Somente quem tem papel `owner` pode gerar um convite.
- O QR Code expira após 60 segundos.
- O token é de uso único: após a aceitação, ele não pode ser reutilizado.
- Um usuário que já pertence a uma família não pode aceitar outro convite.
- Não haverá seletor de família ativa, porque existe somente uma associação por usuário.

## Dados e segurança

Será criada a tabela `family_invitations` com o identificador da família, hash do token, criador, data de expiração, data de aceite e usuário que aceitou. O token puro existe apenas no app do administrador para renderizar o QR; o banco armazena somente seu hash.

Funções protegidas no Supabase:

1. `create_family_invitation()` valida o papel de administrador e gera o convite.
2. `accept_family_invitation(token)` valida expiração, uso único e ausência de grupo familiar do convidado, então grava o usuário em `family_members` com papel `member`.

As políticas de acesso continuam baseadas em `family_members`, de modo que os dados passam a aparecer automaticamente após o aceite.

## Experiência no app

Na aba Família, o administrador verá a ação “Gerar QR Code”. Ao tocar nela, abre um drawer com o QR Code e uma contagem de `60` até `0` sobre uma barra de progresso. Ao expirar, o QR deixa de ser válido e o administrador pode gerar outro.

O convidado verá “Entrar em uma família”, abrirá a câmera, escaneará o código e receberá retorno de sucesso ou erro. A câmera só é usada após autorização explícita do sistema.

## Estados de erro

- QR expirado ou já utilizado: orientar a gerar um novo código.
- Usuário já vinculado a uma família: bloquear o aceite e explicar a regra.
- Não administrador: ocultar a ação de geração.
- Câmera sem permissão: explicar como liberar a permissão ou permitir colar o código manualmente.

## Verificação

- Testes de regras de expiração, uso único e vínculo único.
- Teste da contagem regressiva de 60 segundos e da barra de progresso.
- TypeScript, Biome e testes existentes.
