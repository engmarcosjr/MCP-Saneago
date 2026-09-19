# Diário de Bordo — Mapeamento Lote 124

- **Data:** 2026-09-19
- **Lote:** lote-124
- **Executor:** omniclaude
- **Aplicações do Lote:** ECO815, ECO808, ECO811

---

## O que foi feito

Reinspeção real e inventário em lote das 3 aplicações da fila da Fase 1 através do portal com Playwright:

1. **ECO815 (Coletânea de Diretrizes Comerciais):**
   - Tentativa de abertura e busca no portal corporativo.
   - Aplicação não localizada na busca de tela ou inacessível no portal ZK para o perfil atual (`url_real: null`).
   - Classe proposta: `bloqueada`.
   - Evidência gravada em `docs/mapeamento/evidencias/ECO815.inspect.json`, ficha atualizada em `docs/apps/ECO815.md`, registrada na safelist e isenta de roteiro. Declarada `reinspecao_confirmada: true` no log por manter a indisponibilidade.

2. **ECO808 (Áreas de Inf. dos Reservatórios):**
   - Reabertura e inspeção da tela real no portal.
   - URL real: `https://www.saneago.com.br/prt/eco/ECO808AreaInfRes.jsp`
   - Tela legada JSP informativa ("Escritórios de Cobrança"), sem campos interativos de entrada e sem botões de ação na tela inicial.
   - Classe proposta: `sem_campos_confirmado`.
   - Evidência atualizada em `docs/mapeamento/evidencias/ECO808.inspect.json`, ficha atualizada em `docs/apps/ECO808.md`, roteiro em `config/roteiro.json` e safelist em `docs/SAFELIST_LEITURA.md`.

3. **ECO811 (Doc. do Macroprocesso de Comercialização):**
   - Reabertura e inspeção da tela real no portal.
   - URL real: `https://www.saneago.com.br/prt/eco/ECO811IT.jsp`
   - Tela legada JSP informativa ("Instruções de Trabalho"), sem campos interativos de entrada e sem botões de ação na tela inicial.
   - Classe proposta: `sem_campos_confirmado`.
   - Evidência atualizada em `docs/mapeamento/evidencias/ECO811.inspect.json`, ficha atualizada em `docs/apps/ECO811.md`, roteiro em `config/roteiro.json` e safelist em `docs/SAFELIST_LEITURA.md`. Declarada `reinspecao_confirmada: true` após verificação idêntica da página estática JSP.

## Decisões Tomadas e Classes Propostas

- **ECO815 (`bloqueada`):** Não abriu / frame não encontrado para o perfil atual.
- **ECO808 (`sem_campos_confirmado`):** Tela JSP informativa confirmada sem botões de ação nem campos.
- **ECO811 (`sem_campos_confirmado`):** Tela JSP informativa confirmada sem botões de ação nem campos.

## Pendências para o Gate Humano

- Homologação das propostas para safelist da Fase 2.
- Aplicações `sem_campos_confirmado` e `bloqueada` acumulam a 3ª tentativa real de inspeção para aposentadoria pelo backlog.

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-124
Auditadas 3 apps (lote lote-124) · 2 com entrada em roteiro.json
0 divergências.

$ npm test
# tests 89
# suites 0
# pass 89
# fail 0
# cancelled 0
# skipped 0
# todo 0
```
