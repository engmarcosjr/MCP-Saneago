# Diário de Bordo — Mapeamento Lote 133

- **Data:** 2026-09-19
- **Lote:** lote-133
- **Executor:** omniclaude
- **Aplicações do Lote:** BPAV005, BPAV006, BPAV373

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila de pendências do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **BPAV005 (Reporte de Atividades de Teletrabalho):**
   - URL real: `null` (inacessível/não carregou frame).
   - Inputs: 0 campos acessíveis.
   - Botões: 0 botões acessíveis.
   - Classe proposta: `bloqueada` (aplicação não localizada na busca direta e timeout ao buscar item correspondente no menu de navegação do portal; completou 3 tentativas reais de inspeção).
   - Artefatos: `docs/mapeamento/evidencias/BPAV005.inspect.json`, `docs/apps/BPAV005.md`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **BPAV006 (Painel de Empregados em Teletrabalho):**
   - URL real: `null` (inacessível/não carregou frame).
   - Inputs: 0 campos acessíveis.
   - Botões: 0 botões acessíveis.
   - Classe proposta: `bloqueada` (aplicação não localizada na busca direta e timeout ao buscar item correspondente no menu de navegação do portal; acumulou 2 tentativas reais de inspeção).
   - Artefatos: `docs/mapeamento/evidencias/BPAV006.inspect.json`, `docs/apps/BPAV006.md`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **BPAV373 (Ranking PDV):**
   - URL real: `https://www.saneago.com.br/prt/bpa/BPA373RankingPDV.zul`
   - Inputs: 0 campos interativos detectados na tela inicial.
   - Botões: 4 botões na tela (`Simular valor do PDV`, `OK`, além de botões técnicos ignorados: `Close`, `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (tela de consulta e simulação de ranking/valores de PDV sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/BPAV373.inspect.json`, `docs/apps/BPAV373.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **BPAV005 (`bloqueada`):** Aplicação não localizada na busca e inacessível via menu de navegação no perfil atual. Completou 3 tentativas reais de inspeção no portal e atinge condição de aposentadoria da fila.
- **BPAV006 (`bloqueada`):** Aplicação não localizada na busca e inacessível via menu de navegação no perfil atual. Acumulou 2 tentativas reais de inspeção no portal.
- **BPAV373 (`somente_leitura`):** Aplicação abre perfeitamente via menu Planejamento Rec Humanos -> PDV. Apresenta botões de consulta e simulação sem escrita no banco.

## Pendências para o Gate Humano

- Homologação da classificação para safelist (`BPAV373` para somente-leitura; `BPAV005` e `BPAV006` mantidas como bloqueadas no perfil atual).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-133
Auditadas 3 apps (lote lote-133) · 1 com entrada em roteiro.json
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
