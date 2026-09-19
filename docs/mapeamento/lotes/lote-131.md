# Diário de Bordo — Mapeamento Lote 131

- **Data:** 2026-09-19
- **Lote:** lote-131
- **Executor:** omniclaude
- **Aplicações do Lote:** PGTV910, LQAV079, BPAV004

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila de pendências do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **PGTV910 (Gastos por Periodo):**
   - URL real: `https://www.saneago.com.br/prt/pgt/PGT910RelCustVeic.jsp`
   - Inputs: 2 campos de texto (`Informe o período` editáveis: `dataInicial` e `dataFinal`).
   - Botões: 1 botão detectado na tela inicial (`Consultar`).
   - Classe proposta: `somente_leitura` (tela JSP/HTML de emissão de relatório de gastos e custos de veículos por período com botão Consultar).
   - Artefatos: `docs/mapeamento/evidencias/PGTV910.inspect.json`, `docs/apps/PGTV910.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **LQAV079 (IQA Anual):**
   - URL real: `https://www.saneago.com.br/prt/lqa/LQA079iqaAnual.jsp`
   - Inputs: 0 campos interativos detectados na tela inicial.
   - Botões: 4 botões na tela (`ok` do modal de erro, além de botões técnicos ignorados: `Close`, `Expand`, `Sem Rotulo`).
   - Classe proposta: `bloqueada` (aplicação apresenta página de erro padrão ZK ao ser aberta no ambiente).
   - Artefatos: `docs/mapeamento/evidencias/LQAV079.inspect.json`, `docs/apps/LQAV079.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **BPAV004 (Gestão de Empregados no Teletrabalho):**
   - URL real: `null` (inacessível/não carregou frame).
   - Inputs: 0 campos acessíveis.
   - Botões: 0 botões acessíveis.
   - Classe proposta: `bloqueada` (aplicação não localizada na busca direta e timeout ao buscar item correspondente no menu de navegação do portal).
   - Artefatos: `docs/mapeamento/evidencias/BPAV004.inspect.json`, `docs/apps/BPAV004.md`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **PGTV910 (`somente_leitura`):** Relatório operacional de custos de veículos por período com botão `Consultar`.
- **LQAV079 (`bloqueada`):** Aplicação gera página de erro padrão ZK ao carregar o JSP `LQA079iqaAnual.jsp`.
- **BPAV004 (`bloqueada`):** Aplicação não localizada na busca e inacessível via menu de navegação no perfil atual.

## Pendências para o Gate Humano

- Homologação da classificação para safelist (`PGTV910` para leitura; `LQAV079` e `BPAV004` mantidas como bloqueadas/erro de ambiente).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-131
Auditadas 3 apps (lote lote-131) · 2 com entrada em roteiro.json
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
