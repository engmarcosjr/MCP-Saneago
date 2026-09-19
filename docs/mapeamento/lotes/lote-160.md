# Diário de Bordo — Mapeamento Lote 160

- **Data:** 2026-09-19
- **Lote:** lote-160
- **Executor:** omniclaude
- **Aplicações do Lote:** LENV146, LIG002, LIGV002

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações da fila do backlog da Fase 1, sem preenchimento de campos e sem cliques em botões de ação:

1. **LENV146 (Controle de Interrupção de Energia):**
   - URL real: `https://www.saneago.com.br/prt/len/LEN146ControleInterrupcaoEnergia.zul`
   - Inputs: 6 campos identificados (`Período`, `a`, `Cidade`, `Cidade` [descrição readonly], `Unidade Operacional`, `Unidade Operacional` [descrição readonly]).
   - Botões: 7 botões na inspeção (`Relatório`, `Planilha`, `Cancelar` e botões técnicos auxiliares `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (emissão de relatório e exportação de planilha de controle de interrupção de energia elétrica sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/LENV146.inspect.json`, `docs/apps/LENV146.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **LIG002 (Mapa Web SanSIG):**
   - URL real: Inacessível (frame não encontrado após busca no portal).
   - Inputs: 0 campos.
   - Botões: 0 botões.
   - Classe proposta: `bloqueada` (aplicação não carregou frame no portal corporativo para o perfil atual).
   - Artefatos: `docs/mapeamento/evidencias/LIG002.inspect.json`, `docs/apps/LIG002.md`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **LIGV002 (Mapa Web SanSIG):**
   - URL real: Inacessível (frame não encontrado após busca e navegação via menu no portal).
   - Inputs: 0 campos.
   - Botões: 0 botões.
   - Classe proposta: `bloqueada` (aplicação não carregou frame no portal corporativo para o perfil atual).
   - Artefatos: `docs/mapeamento/evidencias/LIGV002.inspect.json`, `docs/apps/LIGV002.md`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **LENV146 (`somente_leitura`):** Aplicação ZK de emissão de relatórios e exportação de planilhas de controle de interrupção de energia (`LEN146ControleInterrupcaoEnergia.zul`), contendo apenas botões de emissão/consulta (`Relatório`, `Planilha`, `Cancelar`) e sem botões de escrita.
- **LIG002 (`bloqueada`):** Aplicação GIS corporativa (Mapa Web SanSIG) cujo frame não pôde ser instanciado no portal para o perfil de acesso atual.
- **LIGV002 (`bloqueada`):** Aplicação correspondente de menu para Mapa Web SanSIG cujo frame ZK/web também não carregou no portal para o perfil de acesso atual.

## Pendências para o Gate Humano

- Homologação das classificações propostas na safelist (`LENV146` como `somente_leitura`; `LIG002` e `LIGV002` como `bloqueada`).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-160
Auditadas 3 apps (lote lote-160) · 1 com entrada em roteiro.json
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
