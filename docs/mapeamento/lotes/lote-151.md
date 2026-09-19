# Diário de Bordo — Mapeamento Lote 151

- **Data:** 2026-09-19
- **Lote:** lote-151
- **Executor:** omniclaude
- **Aplicações do Lote:** FGIV005, FGQ006, FGQ010

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações da fila do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **FGIV005 (Consulta de documentos digitalizados):**
   - URL real: `null` (não foi possível encontrar o frame da aplicação após busca e menu no portal).
   - Inputs: 0 campos acessíveis.
   - Botões: 0 botões acessíveis.
   - Classe proposta: `bloqueada` (aplicação não localizada na busca rápida nem no frame da aplicação no portal para o perfil atual).
   - Artefatos: `docs/mapeamento/evidencias/FGIV005.inspect.json`, `docs/apps/FGIV005.md`, safelist em `docs/SAFELIST_LEITURA.md`. Não entra em `config/roteiro.json`.

2. **FGQ006 (Tratar NC):**
   - URL real: `https://www.saneago.com.br/prt/fgq/FGQ006CadastroRACP.zul`
   - Inputs: 2 campos identificados (`Número` text editável, `Ano` text editável).
   - Botões: 2 botões de ação (`Consultar`, `Cancelar`).
   - Classe proposta: `somente_leitura` (consulta e acompanhamento de cadastro e trâmites de RACP no tratamento de não conformidades por número e ano sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/FGQ006.inspect.json`, `docs/apps/FGQ006.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **FGQ010 (Auditor):**
   - URL real: `https://www.saneago.com.br/prt/fgq/FGQ010Auditor.zul`
   - Inputs: 2 campos identificados (`Auditor` text editável, `Auditor` text readonly).
   - Botões: 3 botões na evidência (2 botões de ação: `Consultar` e `Cancelar`; 1 botão ignorado `Sem Rotulo` para o acionador de busca/lookup).
   - Classe proposta: `somente_leitura` (consulta e pesquisa de cadastro de auditores internos e de sistemas de gestão sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/FGQ010.inspect.json`, `docs/apps/FGQ010.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **FGIV005 (`bloqueada`):** Aplicação de consulta de documentos digitalizados que não abriu o frame no portal corporativo no perfil atual. Registrada como bloqueada e aguarda novas tentativas ou desativação.
- **FGQ006 (`somente_leitura`):** Aplicação ZK de consulta de ações corretivas e preventivas / RACP (`FGQ006CadastroRACP.zul`), contendo apenas botões de consulta e cancelamento.
- **FGQ010 (`somente_leitura`):** Aplicação ZK de consulta cadastral de auditores (`FGQ010Auditor.zul`), contendo apenas botões de consulta e cancelamento.

## Pendências para o Gate Humano

- Homologação das classificações propostas na safelist (`FGQ006` e `FGQ010` como `somente_leitura`; `FGIV005` como `bloqueada`).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-151
Auditadas 3 apps (lote lote-151) · 2 com entrada em roteiro.json
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
