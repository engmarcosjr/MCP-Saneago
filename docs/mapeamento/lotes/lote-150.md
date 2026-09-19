# Diário de Bordo — Mapeamento Lote 150

- **Data:** 2026-09-19
- **Lote:** lote-150
- **Executor:** omniclaude
- **Aplicações do Lote:** FGCV026, FGCV037, FGCV052

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **FGCV026 (Requisição Obras/Serviços):**
   - URL real: `https://www.saneago.com.br/prt/fgc/FGC026ConsultaRequisicao.zul`
   - Inputs: 2 campos identificados (`Número da Requisição` text editável, `Número da Requisição` text editável).
   - Botões: 3 botões de ação (`Consultar`, `Imprimir`, `Cancelar`).
   - Colunas: 10 colunas de resultado (`Referência`, `Conta`, `Análise`, `Recurso`, `Comprometido`, `Faturado`, `Executado`, `Dívida`, `Estornado`, `Comprometido - Estornado`).
   - Classe proposta: `somente_leitura` (consulta e emissão de relatório de requisições de obras e serviços sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/FGCV026.inspect.json`, `docs/apps/FGCV026.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **FGCV037 (Contratos por UO, Cidade, Forn. e Gestor):**
   - URL real: `https://www.saneago.com.br/prt/fgc/FGC037RelacaoContratos.zul`
   - Inputs: 23 campos identificados (`Unidade Organizacional` text readonly, `Unidade Organizacional` text readonly, `Cidade` text editável, `Cidade` text readonly, `Fornecedor` text editável, `Fornecedor` text readonly, `Gestor` text editável, `Gestor` text readonly, `Categoria de contrato` combobox readonly, `Modalidade da Licitação` combobox readonly, `Natureza de despesa` combobox readonly, `Período de assinatura` date editável, `a` date editável, `Período de Registro` date editável, `a` date editável, `Situação Contrato` checkbox editável, `Execução` checkbox editável, `Paralisados` checkbox editável, `Contingenciados` checkbox editável, `Rescindidos` checkbox editável, `Ordenar contratos por` combobox readonly, `e` combobox readonly, `e` combobox readonly).
   - Botões: 15 botões na evidência (2 botões de ação: `Consultar` e `Cancelar`; 13 botões ignorados `Sem Rotulo` para seletores de combobox, popups e datepicker).
   - Colunas: 17 colunas (`Ordem`, `U.O.`, `Contrato`, `Processo`, `Fornecedores`, `Descrição Objeto`, `Assinatura`, `Encerramento`, `Modalidade`, `Nat. Desp.`, `Situação`, `Gestor`, `Valor Atualizado`, `Valor Faturado`, `Valor Acréscimo`, `Valor Glosa`, `Saldo Contrato`).
   - Classe proposta: `somente_leitura` (consulta e relação de contratos por UO, cidade, fornecedor, gestor e filtros sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/FGCV037.inspect.json`, `docs/apps/FGCV037.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **FGCV052 (Orçamento de Programas):**
   - URL real: `https://www.saneago.com.br/prt/fgc/FGC052OrcamentoPrograma.zul`
   - Inputs: 2 campos identificados (`Ano` combobox readonly, `Categoria` combobox readonly).
   - Botões: 3 botões na evidência (1 botão de ação: `Consultar`; 2 botões ignorados `Sem Rotulo` para seletores de combobox).
   - Colunas: 13 colunas (`Relatório Orçamentário por Categoria`, `Código`, `Orçamento`, `Comprometido Atual`, `Saldo`, `Contratado`, `Reservado`, `Faturado`, `Acréscimo`, `Executado`, `Divida`, `Relatório de Acompanhamento Orçamentário`, `Unidade`).
   - Classe proposta: `somente_leitura` (consulta de orçamento de programas e acompanhamento orçamentário por ano e categoria sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/FGCV052.inspect.json`, `docs/apps/FGCV052.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **FGCV026 (`somente_leitura`):** Aplicação ZK de consulta e impressão de requisições de obras e serviços (`FGC026ConsultaRequisicao.zul`), contendo apenas botões de consulta, impressão e cancelamento.
- **FGCV037 (`somente_leitura`):** Aplicação ZK de consulta detalhada e relação de contratos com diversos filtros de busca (`FGC037RelacaoContratos.zul`), contendo apenas botões de consulta e cancelamento.
- **FGCV052 (`somente_leitura`):** Aplicação ZK de consulta de orçamento de programas e acompanhamento orçamentário (`FGC052OrcamentoPrograma.zul`), contendo apenas botão de consulta.

## Pendências para o Gate Humano

- Homologação das classificações propostas na safelist (`FGCV026`, `FGCV037` e `FGCV052` como `somente_leitura`).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-150
Auditadas 3 apps (lote lote-150) · 3 com entrada em roteiro.json
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
