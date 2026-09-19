# Diário de Bordo — Mapeamento Lote 161

- **Data:** 2026-09-19
- **Lote:** lote-161
- **Executor:** omniclaude
- **Aplicações do Lote:** LIG002, LIGV002, MGOV012

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações da fila do backlog da Fase 1, sem preenchimento de campos e sem cliques em botões de ação:

1. **LIG002 (Mapa Web SanSIG):**
   - URL real: Inacessível (frame não encontrado após busca no portal).
   - Inputs: 0 campos.
   - Botões: 0 botões.
   - Classe proposta: `bloqueada` (aplicação não carregou frame no portal corporativo para o perfil atual). Reinspeção real confirmada no lote.
   - Artefatos: `docs/mapeamento/evidencias/LIG002.inspect.json`, `docs/apps/LIG002.md`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **LIGV002 (Mapa Web SanSIG):**
   - URL real: Inacessível (frame não encontrado após busca e navegação via menu no portal).
   - Inputs: 0 campos.
   - Botões: 0 botões.
   - Classe proposta: `bloqueada` (aplicação não carregou frame no portal corporativo para o perfil atual). Reinspeção real confirmada no lote.
   - Artefatos: `docs/mapeamento/evidencias/LIGV002.inspect.json`, `docs/apps/LIGV002.md`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **MGOV012 (Providência - UO Responsável):**
   - URL real: `https://www.saneago.com.br/prt/mgo/MGO012Providencia.zul`
   - Inputs: 3 campos identificados (`Registro Ocorrência`, `Registro Ocorrência` [ano], `N° Encaminhamento`).
   - Botões: 3 botões na inspeção (`Consultar`, `Imprimir`, `Cancelar`).
   - Classe proposta: `somente_leitura` (consulta e impressão de providências de ouvidoria por registro de ocorrência ou número de encaminhamento sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/MGOV012.inspect.json`, `docs/apps/MGOV012.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **LIG002 (`bloqueada`):** Aplicação GIS corporativa (Mapa Web SanSIG) cujo frame não pôde ser instanciado no portal para o perfil de acesso atual.
- **LIGV002 (`bloqueada`):** Aplicação correspondente de menu para Mapa Web SanSIG cujo frame ZK/web também não carregou no portal para o perfil de acesso atual.
- **MGOV012 (`somente_leitura`):** Aplicação ZK de consulta e impressão de providências e encaminhamentos da Ouvidoria (`MGO012Providencia.zul`), contendo apenas botões de consulta/emissão (`Consultar`, `Imprimir`, `Cancelar`) e sem botões de escrita.

## Pendências para o Gate Humano

- Homologação das classificações propostas na safelist (`LIG002` e `LIGV002` como `bloqueada`; `MGOV012` como `somente_leitura`).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-161
Auditadas 3 apps (lote lote-161) · 1 com entrada em roteiro.json
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
