# Diário de Bordo — Mapeamento Lote 143

- **Data:** 2026-09-19
- **Lote:** lote-143
- **Executor:** omniclaude
- **Aplicações do Lote:** S0072, BAP002, BAPV002

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **S0072 (SUPER. DE RECURSOS HUMANOS):**
   - URL real: `https://www.saneago.com.br/prt/msi/MSI003Organograma.zul`
   - Inputs: Nenhum campo interativo na tela inicial.
   - Botões: 1 botão de ação (`Ver localização no Mapa`) e 1 botão técnico ignorado (`Sem Rotulo` submit ZK).
   - Colunas: Nenhuma grade de resultados.
   - Classe proposta: `somente_leitura` (exibição de organograma e localização no mapa corporativo sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/S0072.inspect.json`, `docs/apps/S0072.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **BAP002 (Contracheque):**
   - URL real: `https://www.saneago.com.br/prt/bap/BAP002ContraCheque.zul`
   - Inputs: 4 campos identificados (`Empregado` readonly matrícula [REDIGIDO], `Empregado` readonly nome [REDIGIDO], `Tipo de cálculo` readonly combobox, `Referência` readonly combobox).
   - Botões: 2 botões de ação (`Consultar`, `Cancelar`) e 2 botões técnicos ignorados (`Sem Rotulo` abridores de combobox).
   - Colunas: Nenhuma grade de resultados visível na tela inicial antes da consulta.
   - Classe proposta: `somente_leitura` (consulta de demonstrativo de pagamento/contracheque por tipo de cálculo e referência sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/BAP002.inspect.json`, `docs/apps/BAP002.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **BAPV002 (Contracheque):**
   - URL real: `https://www.saneago.com.br/prt/bap/BAP002ContraCheque.zul`
   - Inputs: 4 campos idênticos ao BAP002 (`Empregado` readonly matrícula [REDIGIDO], `Empregado` readonly nome [REDIGIDO], `Tipo de cálculo` readonly combobox, `Referência` readonly combobox).
   - Botões: 2 botões de ação (`Consultar`, `Cancelar`) e 2 botões técnicos ignorados (`Sem Rotulo` abridores de combobox).
   - Colunas: Nenhuma grade de resultados visível na tela inicial antes da consulta.
   - Classe proposta: `somente_leitura` (mesma aplicação ZK acessada via menu Administração Pessoal -> Consulta -> Contracheque sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/BAPV002.inspect.json`, `docs/apps/BAPV002.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **S0072 (`somente_leitura`):** Aplicação de organograma institucional da Superintendência de Recursos Humanos, apontando para `MSI003Organograma.zul`. Possui apenas visualização e botão de mapa.
- **BAP002 (`somente_leitura`):** Aplicação de consulta de contracheque de empregados com campos de seleção de folha/cálculo e referência com botões exclusivos de consulta e cancelamento. PII redigida nas evidências.
- **BAPV002 (`somente_leitura`):** Rota de menu corporativo que aponta para a mesma tela `BAP002ContraCheque.zul`.

## Pendências para o Gate Humano

- Homologação da classificação para safelist (`S0072`, `BAP002` e `BAPV002` como somente-leitura).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-143
Auditadas 3 apps (lote lote-143) · 3 com entrada em roteiro.json
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
