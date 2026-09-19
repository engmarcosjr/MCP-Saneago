# Diário de Bordo — Mapeamento Lote 167

- **Data:** 2026-09-19
- **Lote:** lote-167
- **Executor:** omniclaude
- **Aplicações do Lote:** AGD001, AGDV001, BAP004

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações da fila do backlog da Fase 1, sem preenchimento de campos e sem cliques em botões de ação:

1. **AGD001 (Consulta de RDs):**
   - URL real: `https://www.saneago.com.br/prt/agd/AGD001ConsultaRDs.zul`
   - Inputs: 5 campos (`Tipo de Documento`, `Número`, `Assunto`, `Data de Criação`, `a`).
   - Botões: 5 botões na inspeção (2 de ação: `Consultar`, `Limpar`; 3 botões técnicos ZK ignorados: `Sem Rotulo`).
   - Colunas do resultado: `Número`, `Interessado`, `Assunto`, `Assunto Complementar`, `Conclusão`, `Download`.
   - Classe proposta: `somente_leitura` (consulta e visualização de Resoluções de Diretoria e atos normativos sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/AGD001.inspect.json`, `docs/apps/AGD001.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **AGDV001 (Consulta de RDs):**
   - URL real: `https://www.saneago.com.br/prt/agd/AGD001ConsultaRDs.zul`
   - Inputs: 5 campos (`Tipo de Documento`, `Número`, `Assunto`, `Data de Criação`, `a`).
   - Botões: 5 botões na inspeção (2 de ação: `Consultar`, `Limpar`; 3 botões técnicos ZK ignorados: `Sem Rotulo`).
   - Colunas do resultado: `Número`, `Interessado`, `Assunto`, `Assunto Complementar`, `Conclusão`, `Download`.
   - Classe proposta: `somente_leitura` (consulta e visualização de Resoluções de Diretoria e atos normativos sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/AGDV001.inspect.json`, `docs/apps/AGDV001.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **BAP004 (Atualização CTPS):**
   - URL real: `https://www.saneago.com.br/prt/bap/BAP004AtualizarCTPS.zul`
   - Inputs: 3 campos (`Empregado` editável, `Empregado` readonly, `Informações após data`).
   - Botões: 4 botões na inspeção (2 de ação: `Consultar`, `Cancelar`; 2 botões técnicos ZK ignorados: `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (consulta de histórico e atualizações de CTPS por empregado e data de corte sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/BAP004.inspect.json`, `docs/apps/BAP004.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **AGD001 (`somente_leitura`):** Aplicação de consulta de Resoluções de Diretoria (`AGD001ConsultaRDs.zul`), contendo apenas os botões de ação `Consultar` e `Limpar`, sem botões de gravação ou escrita na tela inicial.
- **AGDV001 (`somente_leitura`):** Variação de menu que abre a mesma tela ZK (`AGD001ConsultaRDs.zul`), contendo apenas os botões de ação `Consultar` e `Limpar`, sem botões de escrita.
- **BAP004 (`somente_leitura`):** Aplicação de consulta de atualizações de CTPS (`BAP004AtualizarCTPS.zul`), contendo apenas os botões de ação `Consultar` e `Cancelar`, sem botões de alteração cadastral ou persistência na tela inicial.

## Pendências para o Gate Humano

- Homologação das classificações propostas na safelist (`AGD001`, `AGDV001` e `BAP004` como `somente_leitura`).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-167
Auditadas 3 apps (lote lote-167) · 3 com entrada em roteiro.json
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
