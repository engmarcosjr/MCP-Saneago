# Diário de Bordo — Mapeamento Lote 165

- **Data:** 2026-09-19
- **Lote:** lote-165
- **Executor:** omniclaude
- **Aplicações do Lote:** MGOV050, MTGV008, MTGV020

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações da fila do backlog da Fase 1, sem preenchimento de campos e sem cliques em botões de ação:

1. **MGOV050 (Painel Estatístico Ouvidoria):**
   - URL real: Inacessível (frame não encontrado após busca e navegação via menu no portal corporativo).
   - Inputs: 0 campos.
   - Botões: 0 botões.
   - Classe proposta: `bloqueada` (aplicação não carregou frame no portal corporativo para o perfil atual — 3ª tentativa real concluída).
   - Artefatos: `docs/mapeamento/evidencias/MGOV050.inspect.json`, `docs/apps/MGOV050.md`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **MTGV008 (Consultar Remessas Capturadas):**
   - URL real: `https://www.saneago.com.br/prt/mtg/MTG008ConsultarRemessasCapturadas.zul`
   - Inputs: 10 campos (filtros radio por Leitura, Retidas, Entrega Alternativa; Distrito editável e readonly; Grupo; Referência; filtros radio Capturados, Disponíveis e Todos).
   - Botões: 4 botões na inspeção (2 de ação: `Consultar`, `Cancelar`; 2 botões técnicos ZK ignorados: `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (consulta e listagem de remessas capturadas por distrito, grupo e referência sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/MTGV008.inspect.json`, `docs/apps/MTGV008.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **MTGV020 (Consulta Fila de Relatórios PDF):**
   - URL real: `https://www.saneago.com.br/prt/mtg/MTG020RelatorioUsuarioVirtual.zul`
   - Inputs: 4 campos (`Nome do Arquivo`, `Data Inicial`, `Data Final`, `.PDF`).
   - Botões: 19 botões na inspeção (4 de ação: `Filtrar`, `Limpar Filtros`, `Atualizar`, `Excluir Selecionados`; 15 botões técnicos/linha/paginação ZK ignorados: `Sem Rotulo`).
   - Classe proposta: `possui_escrita` (presença do botão acionável `Excluir Selecionados` que executa exclusão de arquivos de relatórios).
   - Artefatos: `docs/mapeamento/evidencias/MTGV020.inspect.json`, `docs/apps/MTGV020.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **MGOV050 (`bloqueada`):** Painel estatístico da Ouvidoria cujo frame não pôde ser instanciado no portal para o perfil de acesso atual (3ª tentativa real registrada, apta à aposentadoria no backlog).
- **MTGV008 (`somente_leitura`):** Aplicação de consulta de remessas capturadas (`MTG008ConsultarRemessasCapturadas.zul`), contendo apenas os botões de ação `Consultar` e `Cancelar`, sem botões de gravação ou escrita na tela inicial.
- **MTGV020 (`possui_escrita`):** Aplicação de gerenciamento da fila de relatórios PDF (`MTG020RelatorioUsuarioVirtual.zul`), contendo o botão `Excluir Selecionados`, exigindo classificação preventiva de escrita (`possui_escrita`).

## Pendências para o Gate Humano

- Homologação das classificações propostas na safelist (`MGOV050` como `bloqueada`; `MTGV008` como `somente_leitura`; `MTGV020` como `possui_escrita`).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-165
Auditadas 3 apps (lote lote-165) · 2 com entrada em roteiro.json
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
