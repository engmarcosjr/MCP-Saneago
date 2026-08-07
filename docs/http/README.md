# Contratos HTTP das telas ZK — indice

Como operar as telas do portal por **HTTP puro**, sem navegador. As regras gerais do
protocolo (validas para qualquer tela) estao em [`../HTTP-ECO707-ECO709.md`](../HTTP-ECO707-ECO709.md).
Este diretorio traz uma pagina por tela.

**Nada aqui e escrito a mao.** Os docs sao gerados por `src/gerar_doc_http.js` a partir da
arvore de widgets capturada em `scratch/arvores/<APP>.html`, e verificados por
`scripts/validar_docs_http.js`. Se precisar corrigir um doc, corrija o gerador e reexecute.

## O que cada status significa

| Status | Significa | Confianca |
|---|---|---|
| `REPLICADO` | A consulta foi executada por HTTP em Node e devolveu linhas reais. Ha prova reproduzivel em `_replay_<APP>.txt`. | Pode automatizar. |
| `POSTS CAPTURADOS` | POSTs reais foram observados na tela, mas ainda nao replicados fora do navegador. | Use com verificacao. |
| `ARVORE CAPTURADA (sem POST)` | Ids, tipos ZK e colunas sao **reais** (lidos da tela), mas a sequencia de POSTs ainda **nao foi observada**. | Hipotese. Confirme antes de confiar. |

O status e **calculado** pelo gerador a partir do que existe em disco — nunca digitado.
`REPLICADO` sem o arquivo `_replay_<APP>.txt` correspondente reprova na validacao.

## As 19 telas

| Tela | Nome | Status |
|---|---|---|
| [LRS208](LRS208.md) | Consulta RA's com D.S. | **REPLICADO** |
| [ECO205](ECO205.md) | Hidrometros | **REPLICADO** |
| [ECO707](ECO707.md) | RAs por Numero de Conta | **REPLICADO** |
| [ECO709](ECO709.md) | RAs por Logradouro | **REPLICADO** |
| [ECO712](ECO712.md) | Historia do Usuario | **REPLICADO** |
| [LRS010](LRS010.md) | Distribuicao de Servico | arvore capturada · escrita |
| [LRS034](LRS034.md) | Validar Corte de Asfalto | arvore capturada |
| [LRS041](LRS041.md) | Relatorio de recomposicao asfaltica | arvore capturada |
| [LRS100](LRS100.md) | Manter estoque de Material por viatura | arvore capturada |
| [LRS105](LRS105.md) | Lancamento de servicos executados | arvore capturada · escrita |
| [LRS272](LRS272.md) | Acompanhar Atendimento | arvore capturada |
| [ECO151](ECO151.md) | Cadastro de Usuarios | arvore capturada · escrita |
| [ECO154](ECO154.md) | Usuarios por Nome | arvore capturada |
| [ECO202](ECO202.md) | Movimentacao de Hidrometro | arvore capturada · escrita |
| [ECO701](ECO701.md) | Registro de Atendimento | arvore capturada · escrita |
| [ECO708](ECO708.md) | RAs por Solicitante | arvore capturada |
| [ECO711](ECO711.md) | RA em Execucao/Executado | arvore capturada |
| [ECO731](ECO731.md) | Alteracao e Impressao de RA | arvore capturada · escrita |
| [MTG020](MTG020.md) | Consulta Fila de Relatorios PDF | arvore capturada |

## Como reproduzir

```bash
node scripts/recapturar_arvore.js            # 19 GETs, so leitura, ~30s
node src/gerar_doc_http.js                   # regera os 19 docs
node scripts/replay_http.js LRS208 numeroRA 31041602025
node scripts/validar_docs_http.js            # falha se algum id nao existir na arvore
```

## Duas armadilhas medidas na pratica

1. **O portal derruba a sessao anterior a cada novo login.** Dois processos Node consultando
   ao mesmo tempo se expulsam, e o sintoma e enganoso: *"componentes nao localizados"*, como
   se o codigo estivesse errado. Rode um de cada vez, ou reuse o mesmo `PortalHttp`.
2. **Payload errado nao da erro.** Id inexistente, tipo trocado (string num `Intbox`) ou
   `onChange` sem o `onClick` no mesmo POST fazem a tela responder a grade **vazia, em
   silencio**. Por isso `replay_http.js` trata "zero linhas" como falha e se recusa a gravar
   prova.
