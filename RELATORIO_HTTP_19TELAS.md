# Mapeamento das 18 telas prioritarias — UI e HTTP

**Data:** 06/08/2026 · **Escopo:** as 18 telas mais usadas do portal ZK, mapeadas nas duas
camadas pedidas: **UI viva (Playwright)** e **HTTP direto**.

## Resultado por tela

| Tela | Nome | Doc UI (`docs/apps/`) | Contrato HTTP (`docs/http/`) |
|---|---|---|---|
| LRS208 | Consulta RA's com D.S. | ok | **REPLICADO** (207 ms) |
| ECO205 | Hidrometros | ok | **REPLICADO** (158 ms) |
| ECO707 | RAs por Numero de Conta | ok | **REPLICADO** (~130 ms) |
| ECO709 | RAs por Logradouro | ok | **REPLICADO** (434 ms, 14 linhas) |
| ECO712 | Historia do Usuario | ok | **REPLICADO** |
| LRS010 | Distribuicao de Servico | ok | arvore capturada (escrita) |
| LRS041 | Relatorio de recomposicao asfaltica | ok | arvore capturada |
| LRS100 | Manter estoque de Material por viatura | ok | arvore capturada |
| LRS105 | Lancamento de servicos executados | ok | arvore capturada (escrita) |
| LRS272 | Acompanhar Atendimento | ok | arvore capturada |
| ECO151 | Cadastro de Usuarios | ok | arvore capturada (escrita) |
| ECO154 | Usuarios por Nome | ok | arvore capturada |
| ECO202 | Movimentacao de Hidrometro | ok | arvore capturada (escrita) |
| ECO701 | Registro de Atendimento | ok (curado, fluxo E2E) | arvore capturada (escrita) |
| ECO708 | RAs por Solicitante | ok | **REPLICADO** |
| ECO711 | RA em Execucao/Executado | ok | **REPLICADO** |
| ECO731 | Alteracao e Impressao de RA | ok | arvore capturada |
| MTG020 | Consulta Fila de Relatorios PDF | ok | arvore capturada |

**7 de 18 replicadas por HTTP** com prova reproduzivel. As outras 11 tem ids, tipos ZK e
colunas de grade **reais**, mas a sequencia de POSTs ainda nao foi observada.

## O que foi entregue

**Camada UI.** `config/roteiro.json` regenerado com as **596 apps** (estava em 337 — as 259
descobertas na varredura de julho nunca tinham entregado, entao ECO151, ECO154, ECO202,
ECO205, ECO708 e ECO711 eram invisiveis para a tool `saneago_consultar_roteiro`). Os 18
`docs/apps/*.md` foram regerados a partir do `capacidades.json`, agora **sem UUID ZK** — o
uuid muda a cada abertura de tela, e documenta-lo induzia a LLM a usar um identificador que
nunca ia bater.

**Camada HTTP.** O cliente HTTP saiu de `Revisão-Contas-Esgoto` e virou modulo de primeira
classe aqui: `src/http/{portal-http,zk-tree,eco707,eco709,saneago-http}.js`. Consulta sem
navegador em ~0,2 s contra varios segundos pela UI.

**Ferramentas de reproducao** (todas idempotentes):
- `scripts/recapturar_arvore.js` — 18 GETs read-only, grava a arvore completa;
- `src/gerar_doc_http.js` — gera os docs parseando a arvore; status calculado, nunca digitado;
- `scripts/replay_http.js` — replay de consulta; trata zero linhas como falha;
- `scripts/validar_docs_http.js` — reprova doc que cite id inexistente. **515 ids conferidos, zero divergencias.**

## O que ainda falta

1. **13 telas sem contrato de POST observado.** Tem ids e tipos reais, mas o payload concreto
   e hipotese. Proximas mais faceis: ECO708 e ECO711 (mesmo padrao de macro `caixaPesquisa`
   ja resolvido no ECO709, via `resolverFilho`).
2. **As 6 telas de escrita** (LRS010, LRS105, ECO151, ECO202, ECO701, ECO731) foram apenas
   abertas e lidas. Nenhuma gravacao foi feita em producao, e o contrato de escrita por HTTP
   segue nao mapeado — de proposito.

## Nota de processo

A primeira versao destes docs foi **reprovada na auditoria e descartada**: tinha sido escrita
por cima das capturas em vez de extraida delas, e continha 42 ids inexistentes (`intbxNumeroRa`,
`btnLimpar`, `dtbxDataInicial`...) alem de 13 telas marcadas como confirmadas sem nenhum POST
capturado. O risco nao e teorico: id errado nao gera erro no ZK — a tela devolve grade vazia
em silencio, que e o pior modo de falha possivel.

A correcao nao foi reescrever os textos, e sim **tirar a escrita da mao**: hoje o doc e uma
funcao da captura, o status e derivado de arquivo em disco, e o validador reprova divergencia.
