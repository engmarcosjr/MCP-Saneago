# Diário de Bordo — Mapeamento Lote 152

- **Data:** 2026-09-19
- **Lote:** lote-152
- **Executor:** omniclaude
- **Aplicações do Lote:** FGQ018, FGQ022, FGQ024

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **FGQ018 (Relatório Geral):**
   - URL real: `https://www.saneago.com.br/prt/fgq/FGQ018RelatorioGeralRNC.zul`
   - Inputs: 2 campos identificados (`Número` text editável, `Ano` text editável).
   - Botões: 2 botões de ação (`Imprimir`, `Cancelar`).
   - Classe proposta: `somente_leitura` (emissão e relatório geral de Não Conformidades (RNC) por número e ano sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/FGQ018.inspect.json`, `docs/apps/FGQ018.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **FGQ022 (Histórico Auditor):**
   - URL real: `https://www.saneago.com.br/prt/fgq/FGQ022HistoricoAuditor.zul`
   - Inputs: 2 campos identificados (`Auditor` text editável, `Auditor` text readonly).
   - Botões: 3 botões na evidência (2 botões de ação: `Consultar` e `Cancelar`; 1 botão ignorado `Sem Rotulo` para o acionador de busca/lookup).
   - Classe proposta: `somente_leitura` (consulta de histórico de auditorias por código ou matrícula do auditor sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/FGQ022.inspect.json`, `docs/apps/FGQ022.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **FGQ024 (Documentos por UO):**
   - URL real: `https://www.saneago.com.br/prt/fgq/FGQ024docUO.zul`
   - Inputs: 2 campos identificados (`UO` text editável, `UO` text readonly).
   - Botões: 3 botões na evidência (2 botões de ação: `Consultar` e `Cancelar`; 1 botão ignorado `Sem Rotulo` para o acionador de busca/lookup).
   - Classe proposta: `somente_leitura` (consulta e relação de documentos vinculados por unidade organizacional sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/FGQ024.inspect.json`, `docs/apps/FGQ024.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **FGQ018 (`somente_leitura`):** Aplicação ZK de emissão e impressão de relatório geral de registros de não conformidades (`FGQ018RelatorioGeralRNC.zul`), contendo apenas botões de impressão e cancelamento.
- **FGQ022 (`somente_leitura`):** Aplicação ZK de consulta de histórico de atuações de auditores (`FGQ022HistoricoAuditor.zul`), contendo apenas botões de consulta e cancelamento.
- **FGQ024 (`somente_leitura`):** Aplicação ZK de consulta de documentos por unidade organizacional (`FGQ024docUO.zul`), contendo apenas botões de consulta e cancelamento.

## Pendências para o Gate Humano

- Homologação das classificações propostas na safelist (`FGQ018`, `FGQ022` e `FGQ024` como `somente_leitura`).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-152
Auditadas 3 apps (lote lote-152) · 3 com entrada em roteiro.json
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
