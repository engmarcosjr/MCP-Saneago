# Diário de Bordo — Mapeamento Lote 147

- **Data:** 2026-09-19
- **Lote:** lote-147
- **Executor:** omniclaude
- **Aplicações do Lote:** EAC799, EGW005, EGWV003

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **EAC799 (Atendimento):**
   - URL real: `null` (aplicação não encontrada na busca direta nem no menu de navegação do portal para o perfil atual).
   - Inputs: Nenhum campo acessível.
   - Botões: Nenhum botão acessível.
   - Colunas: Nenhuma grade de resultados acessível.
   - Classe proposta: `bloqueada` (aplicação inacessível no portal para o perfil atual — 2ª tentativa real com reinspeção confirmada).
   - Artefatos: `docs/mapeamento/evidencias/EAC799.inspect.json`, `docs/apps/EAC799.md`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **EGW005 (Resumo de Faturamento):**
   - URL real: `https://www.saneago.com.br/prt/egw/EGW005EnvioResumoFaturamento.zul`
   - Inputs: 1 campo identificado (`Conta Macro/Condomínio` text editável).
   - Botões: 2 botões de ação (`Consultar`, `Cancelar`).
   - Colunas: Nenhuma grade de resultados detectada na tela inicial.
   - Classe proposta: `somente_leitura` (consulta de resumo de faturamento por conta macro/condomínio sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/EGW005.inspect.json`, `docs/apps/EGW005.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **EGWV003 (Consumo Master por Cidade):**
   - URL real: `https://www.saneago.com.br/prt/egw/EGW003RelConsMast.jsp`
   - Inputs: 3 campos identificados (`Cidade` select editável, `Bairro` select editável, `Mês/Ano de Referência` text editável).
   - Botões: Nenhum botão detectado na tela inicial (JSP com form `frmEGC003`).
   - Colunas: Nenhuma grade de resultados detectada na tela inicial.
   - Classe proposta: `somente_leitura` (consulta de relatório de consumo das contas masters por cidade e referência sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/EGWV003.inspect.json`, `docs/apps/EGWV003.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **EAC799 (`bloqueada`):** Aplicação de atendimento comercial não localizada na busca rápida nem no menu do perfil atual. Reinspecionada para cumprimento de tentativa real.
- **EGW005 (`somente_leitura`):** Aplicação ZK de consulta de resumo de faturamento de contas macro e condomínios em Grandes Clientes Web, contendo apenas botões de consulta e cancelamento.
- **EGWV003 (`somente_leitura`):** Aplicação JSP de relatório de consumo das contas masters apontando para `EGW003RelConsMast.jsp`, sem botões de escrita.

## Pendências para o Gate Humano

- Homologação da classificação para safelist (`EGW005` e `EGWV003` como somente-leitura; `EAC799` como bloqueada).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-147
Auditadas 3 apps (lote lote-147) · 2 com entrada em roteiro.json
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
