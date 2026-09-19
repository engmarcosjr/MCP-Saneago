# Diário de Bordo — Mapeamento Lote 154

- **Data:** 2026-09-19
- **Lote:** lote-154
- **Executor:** omniclaude
- **Aplicações do Lote:** GPMV016, GPMV020, GSIV007

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **GPMV016 (Paralisação/Intermitência):**
   - URL real: `https://www.saneago.com.br/prt/gpm/GPM016ParalizacaoIntermitencia.zul`
   - Inputs: 4 campos identificados (`Período da Previsão de Início`, `a`, `Distrito` editável e `Distrito` readonly).
   - Botões: 5 botões na inspeção (`Consultar`, `Cancelar` e 3 botões internos de apoio com rótulo `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (consulta de paralisação e intermitência no fornecimento por período de previsão e distrito sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/GPMV016.inspect.json`, `docs/apps/GPMV016.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **GPMV020 (Consulta Registro a Ser Fechado):**
   - URL real: `https://www.saneago.com.br/prt/gpm/GPM020pesValvula.jsp`
   - Inputs: 5 campos identificados sob o rótulo `GPM 020` (`codigoCidade`, `nomeCidade`, `codigoBairro`, `nomeBairro`, `numeroQuadra`).
   - Botões: 0 botões na tela inicial.
   - Classe proposta: `somente_leitura` (consulta e pesquisa de válvulas e registros a serem fechados por cidade, bairro e quadra sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/GPMV020.inspect.json`, `docs/apps/GPMV020.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **GSIV007 (Abertura de Solicitação):**
   - URL real: `https://www.saneago.com.br/prt/gsi/GSI007AberturaSolicitacaoUsuario.zul`
   - Inputs: 11 campos identificados (`Número da Solicitação`, `Solicitante` [redigido], `U.O. Solicitante`, `Serviço`, `Telefone Contato` [redigido], `Descrição`, `Anexo`).
   - Botões: 5 botões na inspeção (`Incluir`, `Cancelar` e 3 botões internos com rótulo `Sem Rotulo`).
   - Classe proposta: `possui_escrita` (abertura e cadastro de solicitação de serviço do usuário com botão Incluir e formulário de dados cadastrais).
   - Artefatos: `docs/mapeamento/evidencias/GSIV007.inspect.json`, `docs/apps/GSIV007.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **GPMV016 (`somente_leitura`):** Aplicação ZK de consulta e acompanhamento de paralisações e intermitências (`GPM016ParalizacaoIntermitencia.zul`), contendo apenas botões de consulta e cancelamento.
- **GPMV020 (`somente_leitura`):** Aplicação JSP de consulta e pesquisa de válvulas/registros para fechamento (`GPM020pesValvula.jsp`), sem botões de alteração de estado.
- **GSIV007 (`possui_escrita`):** Aplicação ZK de formulário para inclusão de nova solicitação interna (`GSI007AberturaSolicitacaoUsuario.zul`), classificada como escrita devido à presença do botão de ação `Incluir`.

## Pendências para o Gate Humano

- Homologação das classificações propostas na safelist (`GPMV016` e `GPMV020` como `somente_leitura`, `GSIV007` como `possui_escrita`).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-154
Auditadas 3 apps (lote lote-154) · 3 com entrada em roteiro.json
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
