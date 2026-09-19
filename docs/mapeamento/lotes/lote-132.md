# Diário de Bordo — Mapeamento Lote 132

- **Data:** 2026-09-19
- **Lote:** lote-132
- **Executor:** omniclaude
- **Aplicações do Lote:** LQAV079, BPAV004, BPAV005

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila de pendências do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **LQAV079 (IQA Anual):**
   - URL real: `https://www.saneago.com.br/prt/lqa/LQA079iqaAnual.jsp`
   - Inputs: 0 campos interativos detectados na tela inicial.
   - Botões: 4 botões na tela (`ok` do modal de erro, além de botões técnicos ignorados: `Close`, `Expand`, `Sem Rotulo`).
   - Classe proposta: `bloqueada` (aplicação apresenta página de erro padrão ZK ao ser aberta no ambiente).
   - Artefatos: `docs/mapeamento/evidencias/LQAV079.inspect.json`, `docs/apps/LQAV079.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **BPAV004 (Gestão de Empregados no Teletrabalho):**
   - URL real: `null` (inacessível/não carregou frame).
   - Inputs: 0 campos acessíveis.
   - Botões: 0 botões acessíveis.
   - Classe proposta: `bloqueada` (aplicação não localizada na busca direta e timeout ao buscar item correspondente no menu de navegação do portal; acumulou 3 tentativas reais de inspeção).
   - Artefatos: `docs/mapeamento/evidencias/BPAV004.inspect.json`, `docs/apps/BPAV004.md`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **BPAV005 (Reporte de Atividades de Teletrabalho):**
   - URL real: `null` (inacessível/não carregou frame).
   - Inputs: 0 campos acessíveis.
   - Botões: 0 botões acessíveis.
   - Classe proposta: `bloqueada` (aplicação não localizada na busca direta e timeout ao buscar item correspondente no menu de navegação do portal).
   - Artefatos: `docs/mapeamento/evidencias/BPAV005.inspect.json`, `docs/apps/BPAV005.md`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **LQAV079 (`bloqueada`):** Aplicação gera página de erro padrão ZK ao carregar o JSP `LQA079iqaAnual.jsp`. Acumulou 3 tentativas reais de inspeção no portal.
- **BPAV004 (`bloqueada`):** Aplicação não localizada na busca e inacessível via menu de navegação no perfil atual. Acumulou 3 tentativas reais de inspeção no portal (aposentada da fila de pendências pelo backlog).
- **BPAV005 (`bloqueada`):** Aplicação não localizada na busca e inacessível via menu de navegação no perfil atual. Acumulou 2 tentativas reais de inspeção no portal.

## Pendências para o Gate Humano

- Homologação da classificação para safelist (`LQAV079`, `BPAV004` e `BPAV005` mantidas como bloqueadas/erro de ambiente).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-132
Auditadas 3 apps (lote lote-132) · 1 com entrada em roteiro.json
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
