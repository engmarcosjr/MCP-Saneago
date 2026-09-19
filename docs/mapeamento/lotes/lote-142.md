# Diário de Bordo — Mapeamento Lote 142

- **Data:** 2026-09-19
- **Lote:** lote-142
- **Executor:** omniclaude
- **Aplicações do Lote:** MTG006, MTGV002, MTGV006

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **MTG006 (Andamento Geral):**
   - URL real: `https://www.saneago.com.br/prt/mtg/MTG006AndamentoGeral.zul`
   - Inputs: 13 campos interativos (radios de tipo de processamento: `Leitura`, `Retidas`, `Entrega Alternativa`; data de `Referência`; textboxes de `Grupo` e `Distrito`; radios de situação: `Todos`, `Abertos`, `Fechado`, `Processando`, `Processado`, `Atrasados`).
   - Botões: 3 botões de ação (`Consultar`, `Imprimir`, `Cancelar`) e 3 botões ignorados (`Sem Rotulo` para abertura de calendário/pesquisa e submit ZK).
   - Colunas: 8 colunas de grade (`Código`, `Cidade`, `Grupo`, `Situação`, `Data e Hora`, `Sequencial`, `Contas Retornadas`, `Contas Pendentes`).
   - Classe proposta: `somente_leitura` (consulta e emissão de relatório sobre andamento de arquivos sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/MTG006.inspect.json`, `docs/apps/MTG006.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **MTGV002 (Enviar Retorno):**
   - URL real: `https://www.saneago.com.br/prt/mtg/MTG002EnviarRetorno.zul`
   - Inputs: 1 campo interativo de upload de arquivo (`Entrega Alternativas`).
   - Botões: 1 botão de ação (`Adicionar arquivo(s) de retorno`) e 1 botão ignorado (`Sem Rotulo` submit).
   - Colunas: 8 colunas de grade (`Sequenciais Esperados`, `Distrito`, `Leitura/Reaviso`, `Retidas`, `Entrega Alternativas`, `Nome do Arquivo`, `Status / Erro`, `Ação`).
   - Classe proposta: `possui_escrita` (tela com upload/submissão de arquivos de retorno de leitura/faturamento).
   - Artefatos: `docs/mapeamento/evidencias/MTGV002.inspect.json`, `docs/apps/MTGV002.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **MTGV006 (Andamento Geral):**
   - URL real: `https://www.saneago.com.br/prt/mtg/MTG006AndamentoGeral.zul`
   - Inputs: 13 campos interativos idênticos ao MTG006 (`Leitura`, `Retidas`, `Entrega Alternativa`, `Referência`, `Grupo`, `Distrito`, `Todos`, `Abertos`, `Fechado`, `Processando`, `Processado`, `Atrasados`).
   - Botões: 3 botões de ação (`Consultar`, `Imprimir`, `Cancelar`) e 3 botões ignorados (`Sem Rotulo`).
   - Colunas: 8 colunas de grade idênticas ao MTG006.
   - Classe proposta: `somente_leitura` (mesma aplicação ZK acessada via menu Transmissao Rec.Arquivos -> Relatório -> Andamento Geral sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/MTGV006.inspect.json`, `docs/apps/MTGV006.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **MTG006 (`somente_leitura`):** Aplicação de acompanhamento de transmissão de arquivos de campo (leitura, retidas e entrega alternativa). Apresenta filtros de período, distrito e situação com botões exclusivos de consulta e impressão.
- **MTGV002 (`possui_escrita`):** Aplicação de upload de arquivos de retorno. Possui input do tipo `file` e botão para carregar arquivos que alteram o estado do processamento.
- **MTGV006 (`somente_leitura`):** Rota de menu alternativa apontando para a mesma tela `MTG006AndamentoGeral.zul`.

## Pendências para o Gate Humano

- Homologação da classificação para safelist (`MTG006` e `MTGV006` para somente-leitura; `MTGV002` como possui_escrita).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-142
Auditadas 3 apps (lote lote-142) · 3 com entrada em roteiro.json
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
