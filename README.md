# agents-azure-imex

Monitor pessoal para acompanhar cards do Azure DevOps no fluxo IMEX e evitar que pequenos detalhes passem batido.

## V1

A primeira entrega é o comando:

```bash
npm run monitor
```

Ele autentica no Azure DevOps com um PAT local, busca os Work Items atribuídos ao usuário configurado e separa os cards pelos status do fluxo.

Saída esperada:

```text
Azure IMEX Monitor

Disponível para Dev
- US 23450 — Ajustar fechamento do caixa

Disponível para Revisão de Código
- Nenhum item encontrado

Realizando Revisão de Código
- US 23410 — Aguardando sua revisão

Testando
- Nenhum item encontrado

Pronto para Release
- US 23190 — Verificar solicitação de cherry-pick
```

## Configuração

Crie um arquivo `.env` local a partir do exemplo:

```bash
cp .env.example .env
```

Preencha:

```env
AZURE_ORGANIZATION=metanetsistema
AZURE_PROJECT=Metanet
AZURE_USER_EMAIL=seu-email-da-imex
AZURE_PAT=seu-token-local
```

Não envie o PAT para o GitHub.

Se os nomes dos status no Azure forem diferentes, ajuste:

```env
AZURE_FLOW_STATUSES=Disponível para Dev,Disponível para Revisão de Código,Realizando Revisão de Código,Testando,Pronto para Release
```

## Desenvolvimento

Instale as dependências:

```bash
npm install
```

Execute o monitor:

```bash
npm run monitor
```

Cheque o TypeScript:

```bash
npm run check
```

## Próximos passos

- Validar a resposta real do Azure DevOps.
- Refinar a regra de "cards relacionados a você" caso precise incluir revisor, autor ou comentários.
- Adicionar regras de PR, rebase, retrabalho e pipeline.
- Adicionar execução automática e notificações do Debian.
