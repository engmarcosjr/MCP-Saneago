# Diário de Bordo — Mapeamento Lote 138

- **Data:** 2026-09-19
- **Lote:** lote-138
- **Executor:** omniclaude
- **Aplicações do Lote:** GSIV013, GSPV102, HVWV009

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila de pendências do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **GSIV013 (Pesquisa Geral):**
   - URL real: `https://www.saneago.com.br/prt/gsi/GSI013PesquisaGeral.zul`
   - Inputs: 4 inputs (`Filtro` combobox readonly, `Filtro` text, `PDF para impressão` radio, `Planilha Eletrônica` radio).
   - Botões: 4 botões na tela (`Consultar`, `Cancelar`, além de 2 botões técnicos `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (tela de pesquisa geral de solicitações de serviços com opções de exportação em PDF/XLSX sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/GSIV013.inspect.json`, `docs/apps/GSIV013.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **GSPV102 (Trâmite):**
   - URL real: `https://www.saneago.com.br/prt/gsp/GSP102TramiteProcesso.zul`
   - Inputs: 11 inputs (`Processo`, `/`, `Requerente`, `Origem`, `Origem`, `Destino`, `Destino`, `Destino`, `Transporte`, `Nº dos Volumes`, `Obs. Geral`).
   - Botões: 6 botões na tela (`OK`, `Pesquisar`, `Limpar Tela`, além de 3 botões técnicos `Sem Rotulo`).
   - Classe proposta: `possui_escrita` (tela de encaminhamento e trâmite físico/administrativo de processos com botão de efetivação OK).
   - Artefatos: `docs/mapeamento/evidencias/GSPV102.inspect.json`, `docs/apps/GSPV102.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **HVWV009 (Conta):**
   - URL real: `https://www.saneago.com.br/prt/hvw/HVW009PrestarContas.zul`
   - Inputs: 41 inputs detalhando dados da viagem, empregado, valores calculados/realizados, diárias, hospedagem, alimentação, cartões, reembolsos, adiantamentos e glosas.
   - Botões: 3 botões na tela (`Consultar`, `Cancelar`, além de 1 botão técnico `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (tela de consulta e conferência de prestação de contas de viagens a serviço sem botões de escrita na tela inicial).
   - Artefatos: `docs/mapeamento/evidencias/HVWV009.inspect.json`, `docs/apps/HVWV009.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **GSIV013 (`somente_leitura`):** Aplicação abre via menu Solicitações de Serviço -> Solicitações -> Pesquisa Geral apontando para `GSI013PesquisaGeral.zul`. Destinada à consulta de solicitações com botões de Consultar e Cancelar.
- **GSPV102 (`possui_escrita`):** Aplicação abre via menu Tramite Processos -> Trâmite -> Trâmite apontando para `GSP102TramiteProcesso.zul`. Permite preenchimento de campos de destino, transporte e volumes, efetivando o trâmite pelo botão `OK`.
- **HVWV009 (`somente_leitura`):** Aplicação abre via menu Controle de Viagens -> Prestação -> Conta apontando para `HVW009PrestarContas.zul`. Apresenta formulário analítico de consulta de prestação de contas com botões Consultar e Cancelar.

## Pendências para o Gate Humano

- Homologação da classificação para safelist (`GSIV013` e `HVWV009` para somente-leitura; `GSPV102` com escrita monitorada).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-138
Auditadas 3 apps (lote lote-138) · 3 com entrada em roteiro.json
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
