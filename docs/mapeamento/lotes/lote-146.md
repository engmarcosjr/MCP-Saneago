# Diário de Bordo — Mapeamento Lote 146

- **Data:** 2026-09-19
- **Lote:** lote-146
- **Executor:** omniclaude
- **Aplicações do Lote:** BTWV062, D4030, EAC799

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **BTWV062 (Treinamento por Empregado):**
   - URL real: `https://www.saneago.com.br/prt/btw/BTW062TreinEmp.jsp`
   - Inputs: 5 campos identificados (`Empregado` text editável, `Empregado` readonly text de nome, `Periodo` text editável de data inicial, `Periodo` text editável de data final, `Periodo` checkbox editável de pedidos).
   - Botões: Nenhum botão detectado na tela inicial (JSP com form `frmBTW062`).
   - Colunas: Nenhuma grade de resultados detectada na tela inicial.
   - Classe proposta: `somente_leitura` (consulta de treinamentos por empregado e período sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/BTWV062.inspect.json`, `docs/apps/BTWV062.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **D4030 (COMISSÃO INTERNA DE PREVENÇÃO DE ACIDENTES - DCO02):**
   - URL real: `https://www.saneago.com.br/prt/msi/MSI003Organograma.zul`
   - Inputs: Nenhum campo detectado na tela inicial.
   - Botões: 1 botão de ação (`Ver localização no Mapa`) e 1 botão técnico ignorado (`Sem Rotulo` submit).
   - Colunas: Nenhuma grade de resultados detectada na tela inicial.
   - Classe proposta: `somente_leitura` (consulta de organograma e localização no mapa da CIPA DCO02 sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/D4030.inspect.json`, `docs/apps/D4030.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **EAC799 (Atendimento):**
   - URL real: `null` (aplicação não encontrada na busca direta nem no menu de navegação do portal para o perfil atual).
   - Inputs: Nenhum campo acessível.
   - Botões: Nenhum botão acessível.
   - Colunas: Nenhuma grade de resultados acessível.
   - Classe proposta: `bloqueada` (aplicação inacessível no portal para o perfil atual).
   - Artefatos: `docs/mapeamento/evidencias/EAC799.inspect.json`, `docs/apps/EAC799.md`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **BTWV062 (`somente_leitura`):** Aplicação JSP de consulta de treinamentos por empregado apontando para `BTW062TreinEmp.jsp`, sem botões de escrita.
- **D4030 (`somente_leitura`):** Aplicação ZK de consulta de organograma e localização no mapa apontando para `MSI003Organograma.zul`, sem botões de escrita.
- **EAC799 (`bloqueada`):** Aplicação de atendimento comercial não localizada na busca nem no menu do perfil atual.

## Pendências para o Gate Humano

- Homologação da classificação para safelist (`BTWV062` e `D4030` como somente-leitura; `EAC799` como bloqueada).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-146
Auditadas 3 apps (lote lote-146) · 2 com entrada em roteiro.json
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
