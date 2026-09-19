# Pacote de trabalho — Mapeamento Fase 1, um lote

> Prompt reutilizável a cada lote.
>
> **Modelo:** `gemini-3.7-flash-medium[1m]`. O sufixo `[1m]` não é decoração — sem ele o
> Claude Code não reconhece o modelo no catálogo, assume janela de 200k e o auto-compact
> corta o contexto no meio do lote. Lançado via `omniclaude -p "$(cat docs/mapeamento/PROMPT_LOTE.md)"`.
> Ver `docs/historico/PLANO_MAPEAMENTO.md` §4 para o comando completo de lançamento.

## Contexto

Você está no repositório MCP-Saneago. Leia, nesta ordem, antes de agir:

1. `.claude/commands/mapear.md` — **a especificação completa do que fazer. Ela prevalece
   sobre este resumo em qualquer divergência.**
2. `docs/historico/PLANO_MAPEAMENTO.md` — por que este trabalho existe e onde ele para.
3. `CLAUDE.md` — as convenções do projeto, em especial as de nº 6 a 10.

## Tarefa

Execute **um lote** da Fase 1 do mapeamento: 3 aplicações da fila, inventariadas a partir
da tela real do portal, **sem clicar em nada**. Produza ficha, entrada de roteiro, linha
de safelist, evidência bruta, linha de auditoria e diário do lote.

**Nomeie o lote no formato `lote-NNN`** (três dígitos, sequencial), nada além disso.
O `AUDITORIA.jsonl` já acumulou 123 grafias diferentes do campo `lote` — `lote-01`,
`22`, `2026-09-08-lote-16` — e isso inutilizou o filtro `--lote`. Consulte a última
linha do log para saber o próximo número.

**Commite o lote ao terminar**, com a mensagem `docs(mapeamento): lote NNN -- COD1,
COD2, COD3`. A regra anterior era o revisor commitar; onze dias de trabalho ficaram
fora do git por causa dela. Commite você, e deixe o revisor auditar o commit.

Ao terminar as três, **pare**.

## Regras

- **NÃO fazer push.** Commitar o próprio lote, sim (ver a seção Tarefa); push nunca.
- **NÃO tocar em arquivo fora do repositório.**
- **NÃO modificar `src/`.** A Fase 1 escreve apenas em `docs/`, `config/roteiro.json` e
  `docs/mapeamento/evidencias/`. Se encontrar bug real em `src/`, **documente no diário
  e não conserte**: já aconteceu duas vezes de um lote alterar `src/session.js` e
  `src/portal.js` de passagem, e mudança em módulo compartilhado precisa de revisão
  própria, não de carona num lote de mapeamento.
- **NÃO clicar em nenhum botão, NÃO preencher nenhum campo.** Nem "Consultar".
- **Nenhuma tool de escrita.** As flags `SANEAGO_ALLOW_*_WRITE` estão em `0` por ambiente;
  qualquer tentativa de escrita vai falhar por design. Não tente contornar — registre como
  pendência para o gate humano.
- **Não afirme nada que a evidência não mostre** — nem na ficha, nem no `motivo`, nem na
  safelist, nem no diário. É verificado por script (C2 e C7).
- Se algum comando for barrado por permissão, **não contorne**: registre como pendência.
- Se a sessão do portal expirar no meio do lote, **pare imediatamente** e reporte.

## Provas obrigatórias

Rode e cole comando + saída na seção "Verificação e Auditoria" do diário do lote:

```bash
node -e "require('./config/roteiro.json')"
node scripts/auditar-mapeamento.js --lote lote-NNN
npm test
```

`auditar-mapeamento.js` tem de sair com **0 divergências no seu lote** e `npm test` com
**0 falhas** (linha de base: 89/89). Se não conseguir zerar, **não maquie**: registre a
divergência literal como pendência no diário e pare.

## Saída

Ao terminar, escreva o diário em `docs/mapeamento/lotes/lote-NNN.md`: o que foi feito, decisões, a saída dos
três comandos acima, e as pendências. Máximo uma página.

## Formato da ficha — não invente um novo

As fichas existem hoje em três formatos porque cada trecho do loop inventou o seu, e
o verificador ficou cego em 75 delas até ser consertado. **Use o formato de
`docs/apps/ECOV413.md`** e não crie variações de cabeçalho de seção (`## Campos e
Filtros da Tela`, `## Botões Disponíveis`). Se achar que o formato precisa mudar,
registre no diário e pare — mudança de formato é decisão do revisor, não do lote.

## PII — as telas preenchem o usuário logado

Várias telas (BPA*, BAPV*, LRS*, ECO151) trazem nome completo, matrícula, CPF, PIS e
CTPS de quem está logado. **Não versione isso.** Ao gravar a evidência, substitua o
`valor_atual` desses campos por `[REDIGIDO]` — a estrutura da tela é o que importa,
o conteúdo não. Convenção 5 do `CLAUDE.md`.

## Aposentadoria — três tentativas e a app sai da fila

Uma app classificada `bloqueada` ou `sem_campos_confirmado` volta à fila até acumular
**três tentativas reais**. Na terceira, ela é aposentada e não aparece mais.

"Tentativa real" significa **ter reaberto a tela naquele lote**. Reusar a evidência de
um lote anterior não conta — e a auditoria detecta (checagem C10, que compara o `ts` da
sua entrada com a data do arquivo de evidência). Foi o que aconteceu no lote-123:
`ECO808`, `ECO811` e `ECO815` foram "processadas" sem abrir nada, apoiadas em evidência
de onze dias antes.

Se o reuso for deliberado e justificado, declare `"reusa_evidencia": true` na entrada do
JSONL e explique no diário. Sem isso, a entrada conta como divergência e a app volta
para a fila — o carimbo não encurta o caminho.
