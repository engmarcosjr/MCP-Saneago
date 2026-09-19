# Diário de Bordo — Mapeamento Lote 137

- **Data:** 2026-09-19
- **Lote:** lote-137
- **Executor:** omniclaude
- **Aplicações do Lote:** GPMV010, GSIV005, GSIV006

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila de pendências do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **GPMV010 (Registro Fechado):**
   - URL real: `https://www.saneago.com.br/prt/gpm/GPM010conManobra.jsp`
   - Inputs: 2 inputs (`GPM 010` para `codigoCidade` e `nomeCidade`).
   - Botões: 0 botões na tela inicial.
   - Classe proposta: `somente_leitura` (tela JSP de consulta de manobras de registros fechados sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/GPMV010.inspect.json`, `docs/apps/GPMV010.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **GSIV005 (Solicitações):**
   - URL real: `https://www.saneago.com.br/prt/gsi/GSI005SolicitacoesUsuario.zul`
   - Inputs: 3 inputs (`Intervalo`, `até`, `Situação`).
   - Botões: 7 botões na tela (`Pesquisar`, `Limpar`, `Nova Solicitação`, `Cancelar`, além de 3 botões técnicos `Sem Rotulo`).
   - Classe proposta: `possui_escrita` (contém botão de criação/abertura de `Nova Solicitação`).
   - Artefatos: `docs/mapeamento/evidencias/GSIV005.inspect.json`, `docs/apps/GSIV005.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **GSIV006 (Escolha de Serviço):**
   - URL real: `https://www.saneago.com.br/prt/gsi/GSI006EscolhaServicoSolicitacao.zul`
   - Inputs: 0 campos interativos detectados na tela inicial.
   - Botões: 17 botões na tela (14 categorias de serviços internos, `Nova Solicitacao`, `Cancelar` e 1 botão técnico `Sem Rotulo`).
   - Classe proposta: `possui_escrita` (tela de seleção de categoria e disparo do fluxo de `Nova Solicitacao`).
   - Artefatos: `docs/mapeamento/evidencias/GSIV006.inspect.json`, `docs/apps/GSIV006.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **GPMV010 (`somente_leitura`):** Aplicação abre via menu Painel Manobras -> Consulta -> Registro Fechado apontando para `GPM010conManobra.jsp`. Apresenta filtros por cidade sem botões de persistência/escrita.
- **GSIV005 (`possui_escrita`):** Aplicação abre via menu Solicitações de Serviço -> Solicitações -> Solicitações apontando para `GSI005SolicitacoesUsuario.zul`. Apresenta botão ativo de `Nova Solicitação` para cadastro/abertura de chamados.
- **GSIV006 (`possui_escrita`):** Aplicação abre via menu Solicitações de Serviço -> Solicitações -> Escolha de Serviço apontando para `GSI006EscolhaServicoSolicitacao.zul`. Permite a escolha de serviço e avanço com o botão `Nova Solicitacao`.

## Pendências para o Gate Humano

- Homologação da classificação para safelist (`GPMV010` para somente-leitura; `GSIV005` e `GSIV006` com escrita monitorada).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-137
Auditadas 3 apps (lote lote-137) · 3 com entrada em roteiro.json
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
