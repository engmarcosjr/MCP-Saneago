# Diário de Bordo — Mapeamento Lote 149

- **Data:** 2026-09-19
- **Lote:** lote-149
- **Executor:** omniclaude
- **Aplicações do Lote:** EGWV313, FGC028, FGCV025

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **EGWV313 (Consumo e Faturamento Individualizados):**
   - URL real: `https://www.saneago.com.br/prt/egw/EGW313ConsumoFaturadoIndividualizado.zul`
   - Inputs: 4 campos identificados (`Mês/Ano de Faturamento` date editável, `Conta` text editável, `Cidade` text editável, `Cidade` text readonly).
   - Botões: 4 botões na evidência (2 botões de ação: `Consultar` e `Cancelar`; 2 botões ignorados `Sem Rotulo` correspondentes a abertura de calendário e seletor).
   - Colunas: 14 colunas de resultado (`Número da Conta`, `Nome`, `CONTA`, `CLIENTE`, `Nº`, `LOTE`, `QUADRA`, `COMPLEMENTO`, `TIPO LIGAÇÃO`, `HIDRÔMETRO`, `CONSUMO MEDIDO NA LIGAÇÃO`, `CONSUMO FATURADO NA LIGAÇÃO`, `TOTAL MEDIDO NA CONTA`, `TOTAL FATURADO NA CONTA`).
   - Classe proposta: `somente_leitura` (consulta de consumo e faturamento individualizados por mês de faturamento, conta e cidade sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/EGWV313.inspect.json`, `docs/apps/EGWV313.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **FGC028 (Fornecedor):**
   - URL real: `https://www.saneago.com.br/prt/fgc/FGC028ConsultaFornecedor.zul`
   - Inputs: 2 campos identificados (`Código` text editável, `Código` text readonly).
   - Botões: 4 botões na evidência (3 botões de ação: `Consultar`, `Imprimir`, `Cancelar`; 1 botão ignorado `Sem Rotulo` para seletor auxiliar).
   - Colunas: 1 coluna (`Representante Legal`).
   - Classe proposta: `somente_leitura` (consulta e emissão de ficha de fornecedor e representante legal por código sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/FGC028.inspect.json`, `docs/apps/FGC028.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **FGCV025 (Consulta Processo Licitatório):**
   - URL real: `https://www.saneago.com.br/prt/fgc/FGC025ConsultaProcessoLicitatorio.zul`
   - Inputs: 2 campos identificados (`Processo` text editável, `Processo` text editável).
   - Botões: 3 botões de ação (`Consultar`, `Imprimir`, `Cancelar`).
   - Colunas: 2 colunas (`Código`, `Nome`).
   - Classe proposta: `somente_leitura` (consulta e emissão de relatório de processos licitatórios sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/FGCV025.inspect.json`, `docs/apps/FGCV025.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **EGWV313 (`somente_leitura`):** Aplicação ZK de consulta detalhada de consumo e faturamento individualizados de grandes clientes (`EGW313ConsumoFaturadoIndividualizado.zul`), contendo apenas botões de consulta e cancelamento.
- **FGC028 (`somente_leitura`):** Aplicação ZK de consulta e impressão de cadastro de fornecedores no sistema de contratos (`FGC028ConsultaFornecedor.zul`), contendo apenas botões de consulta, impressão e cancelamento.
- **FGCV025 (`somente_leitura`):** Aplicação ZK de consulta e impressão de processos licitatórios (`FGC025ConsultaProcessoLicitatorio.zul`), contendo apenas botões de consulta, impressão e cancelamento.

## Pendências para o Gate Humano

- Homologação das classificações propostas na safelist (`EGWV313`, `FGC028` e `FGCV025` como `somente_leitura`).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-149
Auditadas 3 apps (lote lote-149) · 3 com entrada em roteiro.json
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
