# Diário de Bordo — Mapeamento Lote 145

- **Data:** 2026-09-19
- **Lote:** lote-145
- **Executor:** omniclaude
- **Aplicações do Lote:** BTWV001, BTWV055, BTWV057

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **BTWV001 (Pedido):**
   - URL real: `https://www.saneago.com.br/prt/btw/BTW001Treinamento.zul`
   - Inputs: 2 campos identificados (`Número do Pedido` text editável, `Número do Pedido` readonly text).
   - Botões: 3 botões de ação (`Consultar`, `Novo Pedido`, `Cancelar`) e 1 botão técnico ignorado (`Sem Rotulo` de busca e lookup ZK pareado ao campo de pedido).
   - Colunas: Nenhuma grade de resultados detectada na tela inicial.
   - Classe proposta: `possui_escrita` (consulta e cadastro de pedidos de treinamento corporativo com botão de ação `Novo Pedido`).
   - Artefatos: `docs/mapeamento/evidencias/BTWV001.inspect.json`, `docs/apps/BTWV001.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **BTWV055 (Avaliação de Eficácia do Treinamento):**
   - URL real: `https://www.saneago.com.br/prt/btw/BTW055AvalEficac.jsp`
   - Inputs: 4 campos identificados (`Matrícula` text editável, `Matrícula` readonly text de nome do empregado, `Treinamento` readonly text de código do treinamento, `Treinamento` readonly text de nome do treinamento).
   - Botões: Nenhum botão detectado na tela inicial (JSP com form `frmBTW055`).
   - Colunas: Nenhuma grade de resultados detectada na tela inicial.
   - Classe proposta: `somente_leitura` (consulta de avaliação de eficácia de treinamento por matrícula e curso sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/BTWV055.inspect.json`, `docs/apps/BTWV055.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **BTWV057 (Consulta Cronograma de Treinamento):**
   - URL real: `https://www.saneago.com.br/prt/btw/BTW057ConsCronog.jsp`
   - Inputs: 4 campos identificados (`U.O` readonly text de código [V0011], `U.O` readonly text de descrição [SUPERV. DIST. SERV. ESTAT. E. M. AP. TEC.-ANÁPOLIS], `Ano` text editável, `Ano` checkbox editável de exibição de UOs inferiores).
   - Botões: Nenhum botão detectado na tela inicial (JSP com form `frmBTW057`).
   - Colunas: Nenhuma grade de resultados detectada na tela inicial.
   - Classe proposta: `somente_leitura` (consulta de cronograma anual de treinamento por unidade organizacional e ano sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/BTWV057.inspect.json`, `docs/apps/BTWV057.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **BTWV001 (`possui_escrita`):** Aplicação de pedidos de treinamento corporativo apontando para `BTW001Treinamento.zul` com botão de escrita `Novo Pedido`.
- **BTWV055 (`somente_leitura`):** Aplicação JSP de consulta de avaliação de eficácia de treinamentos apontando para `BTW055AvalEficac.jsp`, sem botões de escrita.
- **BTWV057 (`somente_leitura`):** Aplicação JSP de consulta de cronograma anual de cursos por UO apontando para `BTW057ConsCronog.jsp`, sem botões de escrita.

## Pendências para o Gate Humano

- Homologação da classificação para safelist (`BTWV001` como possui_escrita; `BTWV055` e `BTWV057` como somente-leitura).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-145
Auditadas 3 apps (lote lote-145) · 3 com entrada em roteiro.json
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
