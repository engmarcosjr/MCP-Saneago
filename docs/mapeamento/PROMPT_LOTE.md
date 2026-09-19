# Pacote de trabalho — Mapeamento Fase 1, um lote

> Prompt reutilizável a cada lote. Lançado via `omniclaude -p "$(cat docs/mapeamento/PROMPT_LOTE.md)"`.
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

**Este lote (lote-02) começa reinspecionando três apps do piloto**, cuja evidência foi
gravada antes de a tool passar a devolver `url_real` e por isso não é auditável:
`ECOV413`, `ECO010`, `ECO162`. Regrave a evidência das três, acrescente uma linha **nova**
no `AUDITORIA.jsonl` para cada (o log é append-only — não edite as linhas antigas), e se
a classe de alguma mudar, declare o campo `corrige`. Só depois disso siga a fila normal.

Ao terminar as três, **pare**. Não avance para a fila até o revisor conferir.

## Regras

- **NÃO commitar, NÃO fazer push.** O revisor commita.
- **NÃO tocar em arquivo fora do repositório.**
- **NÃO modificar `src/`.** A Fase 1 escreve apenas em `docs/`, `config/roteiro.json` e
  `docs/mapeamento/evidencias/`. Se encontrar bug real em `src/`, **documente no diário
  e não conserte** — o piloto já alterou `src/session.js` e `src/portal.js` fora de escopo,
  e isso está pendente de revisão separada.
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
node scripts/auditar-mapeamento.js --lote lote-02
npm test
```

`auditar-mapeamento.js` tem de sair com **0 divergências no seu lote** e `npm test` com
**0 falhas** (linha de base: 80/80). Se não conseguir zerar, **não maquie**: registre a
divergência literal como pendência no diário e pare.

## Saída

Ao terminar, escreva `RELATORIO_LOTE02.md` na raiz: o que foi feito, decisões, a saída dos
três comandos acima, e as pendências. Máximo uma página.
