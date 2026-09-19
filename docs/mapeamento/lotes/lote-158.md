# Diário de Bordo — Mapeamento Lote 158

- **Data:** 2026-09-19
- **Lote:** lote-158
- **Executor:** omniclaude
- **Aplicações do Lote:** JAJV044, JAJV060, KRT029

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **JAJV044 (Relatório de Contas Com o Escritório):**
   - URL real: `https://www.saneago.com.br/prt/jaj/JAJ044relacaoContasComEscritorio.zul`
   - Inputs: 1 campo identificado (`Código do Escritório` combobox readonly).
   - Botões: 4 botões na inspeção (`Consultar`, `Imprimir`, `Cancelar` e botão técnico `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (consulta e emissão de relatório de relação de contas de cobrança vinculadas a escritórios jurídicos com botões Consultar, Imprimir e Cancelar).
   - Artefatos: `docs/mapeamento/evidencias/JAJV044.inspect.json`, `docs/apps/JAJV044.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **JAJV060 (Rodízio de Processos):**
   - URL real: `https://www.saneago.com.br/prt/jaj/JAJ060RodizioProcesso.zul`
   - Inputs: 6 campos identificados (`Processo Judicial` radio editável, `Guia Inicial` radio editável, `Escritório de Origem` combobox readonly, `Cidade` text editável, `Cidade` text readonly, `Cidade` checkbox editável).
   - Botões: 4 botões na inspeção (`Consultar`, `Cancelar` e botões técnicos `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (consulta e acompanhamento de rodízio de processos judiciais e guias iniciais por escritório e cidade com botões Consultar e Cancelar).
   - Artefatos: `docs/mapeamento/evidencias/JAJV060.inspect.json`, `docs/apps/JAJV060.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **KRT029 (Análise e Encaminhamento):**
   - URL real: `https://www.saneago.com.br/prt/krt/KRT028ListaAnalise.zul`
   - Inputs: 1 campo identificado (`Selecione a etapa desejada` combobox readonly).
   - Botões: 1 botão técnico na inspeção (`Sem Rotulo`).
   - Classe proposta: `somente_leitura` (consulta e listagem de processos de AVTO por etapa para análise e encaminhamento sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/KRT029.inspect.json`, `docs/apps/KRT029.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **JAJV044 (`somente_leitura`):** Aplicação ZK de relação de contas com escritório de cobrança (`JAJ044relacaoContasComEscritorio.zul`), contendo apenas botões de consulta, impressão de relatório e cancelamento (`Consultar`, `Imprimir`, `Cancelar`).
- **JAJV060 (`somente_leitura`):** Aplicação ZK de rodízio e distribuição de processos judiciais (`JAJ060RodizioProcesso.zul`), contendo botões de consulta e cancelamento (`Consultar`, `Cancelar`).
- **KRT029 (`somente_leitura`):** Aplicação ZK de listagem/análise de processos de AVTO (`KRT028ListaAnalise.zul`), contendo apenas combobox de seleção de etapa sem botões de escrita.

## Pendências para o Gate Humano

- Homologação das classificações propostas na safelist (`JAJV044`, `JAJV060` e `KRT029` como `somente_leitura`).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-158
Auditadas 3 apps (lote lote-158) · 3 com entrada em roteiro.json
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
