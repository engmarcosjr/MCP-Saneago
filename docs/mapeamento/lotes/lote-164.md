# Diário de Bordo — Mapeamento Lote 164

- **Data:** 2026-09-19
- **Lote:** lote-164
- **Executor:** omniclaude
- **Aplicações do Lote:** MGOV050, MTG001, MTGV001

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações da fila do backlog da Fase 1, sem preenchimento de campos e sem cliques em botões de ação:

1. **MGOV050 (Painel Estatístico Ouvidoria):**
   - URL real: Inacessível (frame não encontrado após busca e navegação via menu no portal corporativo).
   - Inputs: 0 campos.
   - Botões: 0 botões.
   - Classe proposta: `bloqueada` (aplicação não carregou frame no portal corporativo para o perfil atual).
   - Artefatos: `docs/mapeamento/evidencias/MGOV050.inspect.json`, `docs/apps/MGOV050.md`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **MTG001 (Capturar Remessa):**
   - URL real: `https://www.saneago.com.br/prt/mtg/MTG001CapturarRemessa.zul`
   - Inputs: 2 campos (`Distrito` editável e `Distrito` readonly).
   - Botões: 3 botões na inspeção (2 de ação: `Consultar`, `Cancelar`; 1 botão técnico ZK ignorado: `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (consulta e listagem de arquivos de remessa para captura por distrito sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/MTG001.inspect.json`, `docs/apps/MTG001.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **MTGV001 (Capturar Remessa):**
   - URL real: `https://www.saneago.com.br/prt/mtg/MTG001CapturarRemessa.zul`
   - Inputs: 2 campos (`Distrito` editável e `Distrito` readonly).
   - Botões: 3 botões na inspeção (2 de ação: `Consultar`, `Cancelar`; 1 botão técnico ZK ignorado: `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (consulta e listagem de arquivos de remessa para captura por distrito sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/MTGV001.inspect.json`, `docs/apps/MTGV001.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **MGOV050 (`bloqueada`):** Painel estatístico da Ouvidoria cujo frame não pôde ser instanciado no portal para o perfil de acesso atual (2ª tentativa real registrada).
- **MTG001 (`somente_leitura`):** Aplicação de consulta e captura de remessas (`MTG001CapturarRemessa.zul`), contendo apenas os botões de ação `Consultar` e `Cancelar`, sem botões de gravação ou escrita na tela inicial.
- **MTGV001 (`somente_leitura`):** Variante de menu apontando para a mesma interface ZUL (`MTG001CapturarRemessa.zul`), contendo apenas `Consultar` e `Cancelar`, sem botões de escrita na tela inicial.

## Pendências para o Gate Humano

- Homologação das classificações propostas na safelist (`MGOV050` como `bloqueada`; `MTG001` e `MTGV001` como `somente_leitura`).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-164
Auditadas 3 apps (lote lote-164) · 2 com entrada em roteiro.json
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
