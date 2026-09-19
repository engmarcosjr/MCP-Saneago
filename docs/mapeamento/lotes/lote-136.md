# Diário de Bordo — Mapeamento Lote 136

- **Data:** 2026-09-19
- **Lote:** lote-136
- **Executor:** omniclaude
- **Aplicações do Lote:** BPAV373, GPMV003, GPMV006

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila de pendências do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **BPAV373 (Ranking PDV):**
   - URL real: `https://www.saneago.com.br/prt/bpa/BPA373RankingPDV.zul`
   - Inputs: 0 campos interativos detectados na tela inicial.
   - Botões: 4 botões na tela (`Simular valor do PDV`, `OK`, além dos botões técnicos `Close` e `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (tela de consulta e simulação de ranking/valores do PDV sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/BPAV373.inspect.json`, `docs/apps/BPAV373.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **GPMV003 (Seleciona Valvula):**
   - URL real: `https://www.saneago.com.br/prt/gpm/GPM003selManobra.jsp`
   - Inputs: 4 inputs (`GPM 003` para `codigoCidade`, `nomeCidade`, `codigoBairro`, `nomeBairro`).
   - Botões: 0 botões na tela inicial.
   - Classe proposta: `somente_leitura` (tela JSP de seleção e consulta de válvulas e manobras sem botões de persistência/escrita).
   - Artefatos: `docs/mapeamento/evidencias/GPMV003.inspect.json`, `docs/apps/GPMV003.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **GPMV006 (Área Afetada):**
   - URL real: `https://www.saneago.com.br/prt/gpm/GPM006conAreaAfe.jsp`
   - Inputs: 1 input (`GPM 006` para `codigoMnbr`, readonly).
   - Botões: 0 botões na tela inicial.
   - Classe proposta: `somente_leitura` (tela JSP de consulta de áreas afetadas por manobras de registros sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/GPMV006.inspect.json`, `docs/apps/GPMV006.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **BPAV373 (`somente_leitura`):** Aplicação abre perfeitamente via menu Planejamento Rec Humanos -> PDV. Apresenta botões de consulta e simulação sem gravação no banco.
- **GPMV003 (`somente_leitura`):** Aplicação abre via menu Painel Manobras -> Consulta -> Seleciona Valvula apontando para `GPM003selManobra.jsp`. Possui filtros de pesquisa por cidade e bairro sem botões de alteração de estado.
- **GPMV006 (`somente_leitura`):** Aplicação abre via menu Painel Manobras -> Cadastro -> Área Afetada apontando para `GPM006conAreaAfe.jsp`. Possui exibição de código de manobra e áreas afetadas sem botões de escrita.

## Pendências para o Gate Humano

- Homologação da classificação para safelist (`BPAV373`, `GPMV003` e `GPMV006` para somente-leitura).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-136
Auditadas 3 apps (lote lote-136) · 3 com entrada em roteiro.json
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
