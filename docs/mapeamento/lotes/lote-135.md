# Diário de Bordo — Mapeamento Lote 135

- **Data:** 2026-09-19
- **Lote:** lote-135
- **Executor:** omniclaude
- **Aplicações do Lote:** BPAV373, GPMV001, GPMV002

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila de pendências do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **BPAV373 (Ranking PDV):**
   - URL real: `https://www.saneago.com.br/prt/bpa/BPA373RankingPDV.zul`
   - Inputs: 0 campos interativos detectados na tela inicial.
   - Botões: 4 botões na tela (`Simular valor do PDV`, `OK`, além dos botões técnicos `Close` e `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (tela de consulta e simulação de ranking/valores do PDV sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/BPAV373.inspect.json`, `docs/apps/BPAV373.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **GPMV001 (Manobra de Registros):**
   - URL real: `https://www.saneago.com.br/prt/gpm/GPM001AberturaOcorrencia.zul`
   - Inputs: 16 inputs (`Código da Manobra`, `Serviço`, `Unidade Responsável`, `Cidade`, `Bairro`, `Reservatório`, `Previsão de Início`, `a`, `Abertas`, `Fechadas`, `Todas`).
   - Botões: 8 botões na tela (`Consultar`, `Cancelar`, além de 6 botões técnicos `Sem Rotulo` em combo/datepicker).
   - Colunas: 17 colunas de resultado (`Manobra`, `Serviço`, `Un. Responsável`, `Cidade`, `Reservatório`, `Bairro`, `Logradouro`, etc.).
   - Classe proposta: `somente_leitura` (tela de consulta e visualização de aberturas de ocorrências e manobras sem botões de persistência/escrita).
   - Artefatos: `docs/mapeamento/evidencias/GPMV001.inspect.json`, `docs/apps/GPMV001.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **GPMV002 (Manobra):**
   - URL real: `https://www.saneago.com.br/prt/gpm/GPM001AberturaOcorrencia.zul`
   - Inputs: 16 inputs (`Código da Manobra`, `Serviço`, `Unidade Responsável`, `Cidade`, `Bairro`, `Reservatório`, `Previsão de Início`, `a`, `Abertas`, `Fechadas`, `Todas`).
   - Botões: 8 botões na tela (`Consultar`, `Cancelar`, além de 6 botões técnicos `Sem Rotulo` em combo/datepicker).
   - Colunas: 17 colunas de resultado (`Manobra`, `Serviço`, `Un. Responsável`, `Cidade`, `Reservatório`, `Bairro`, `Logradouro`, etc.).
   - Classe proposta: `somente_leitura` (tela de consulta e acompanhamento de manobras sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/GPMV002.inspect.json`, `docs/apps/GPMV002.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **BPAV373 (`somente_leitura`):** Aplicação abre perfeitamente via menu Planejamento Rec Humanos -> PDV. Apresenta botões de consulta e simulação sem gravação no banco.
- **GPMV001 (`somente_leitura`):** Aplicação abre via menu Painel Manobras -> Cadastro -> Manobra de Registros apontando para `GPM001AberturaOcorrencia.zul`. Possui filtros de pesquisa e botões `Consultar` e `Cancelar`.
- **GPMV002 (`somente_leitura`):** Aplicação abre via menu Painel Manobras -> Cadastro -> Manobra apontando para a mesma tela `GPM001AberturaOcorrencia.zul`. Possui filtros e botões de consulta e cancelamento.

## Pendências para o Gate Humano

- Homologação da classificação para safelist (`BPAV373`, `GPMV001` e `GPMV002` para somente-leitura).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-135
Auditadas 3 apps (lote lote-135) · 3 com entrada em roteiro.json
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
