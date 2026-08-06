# Índice dos Contratos HTTP das 19 Telas Prioritárias Saneago

Este diretório contém os contratos de interações por **POST /prt/zkau** (HTTP puro) para as 19 telas prioritárias do sistema ZK Intranet Saneago.

> ⚠️ **Aviso de Integridade Auditada**: Todos os documentos neste diretório são **gerados deterministicamente por script** (`src/gerar_doc_http.js`) a partir das capturas brutas em `scratch/zkau_<APP>.txt`. Nenhum ID ou contrato foi inventado.

## Tabela Geral de Telas e Status

| Código | Nome da Tela | URL ZK | Natureza | Status HTTP |
|---|---|---|---|---|
| [LRS010](./LRS010.md) | Distribuição de Serviço | `https://www.saneago.com.br/prt/lrs/LRS010DistribuicaoServico.zul` | **ESCRITA** | **ARVORE CAPTURADA (sem POST)** |
| [LRS034](./LRS034.md) | Validar Corte de Asfalto | `https://www.saneago.com.br/prt/lrs/LRS034ValidaRaCorteAsfalto.zul` | **CONSULTA** | **ARVORE CAPTURADA (sem POST)** |
| [LRS041](./LRS041.md) | Relatório de recomposição asfáltica | `https://www.saneago.com.br/prt/lrs/LRS041RelatorioRecomposicaoAsfaltica.zul` | **CONSULTA** | **ARVORE CAPTURADA (sem POST)** |
| [LRS100](./LRS100.md) | Manter estoque de Material por viatura | `https://www.saneago.com.br/prt/lrs/LRS100ManterEstoqueMaterialPorViatura.zul` | **CONSULTA** | **ARVORE CAPTURADA (sem POST)** |
| [LRS105](./LRS105.md) | Lançamento de serviços executados | `https://www.saneago.com.br/prt/lrs/LRS105CadastraRetornoRA.zul` | **ESCRITA** | **ARVORE CAPTURADA (sem POST)** |
| [LRS208](./LRS208.md) | Consulta RA's com D.S. | `https://www.saneago.com.br/prt/lrs/LRS208ConsultaRADS.zul` | **CONSULTA** | **REPLICADO** |
| [LRS272](./LRS272.md) | Acompanhar Atendimento | `https://www.saneago.com.br/prt/lrs/LRS272MonitorarAtendimento.zul` | **CONSULTA** | **ARVORE CAPTURADA (sem POST)** |
| [ECO151](./ECO151.md) | Cadastro de Usuarios | `https://www.saneago.com.br/prt/eco/ECO151CadastroUsuario.zul` | **ESCRITA** | **ARVORE CAPTURADA (sem POST)** |
| [ECO154](./ECO154.md) | Usuários por Nome | `https://www.saneago.com.br/prt/eco/ECO154ConsultaUsuario.zul` | **CONSULTA** | **REPLICADO** |
| [ECO202](./ECO202.md) | Movimentação de Hidrômetro | `https://www.saneago.com.br/prt/eco/ECO202MovimentacaoHidrometro.zul` | **ESCRITA** | **ARVORE CAPTURADA (sem POST)** |
| [ECO205](./ECO205.md) | Hidrômetros | `https://www.saneago.com.br/prt/eco/ECO205ConsultaHidrometro.zul` | **CONSULTA** | **ARVORE CAPTURADA (sem POST)** |
| [ECO701](./ECO701.md) | Registro de Atendimento | `https://www.saneago.com.br/prt/eco/ECO701RegistroAtendimento.zul` | **ESCRITA** | **ARVORE CAPTURADA (sem POST)** |
| [ECO707](./ECO707.md) | RAs por Número de Conta | `https://www.saneago.com.br/prt/eco/ECO707ConsultaRAConta.zul` | **CONSULTA** | **REPLICADO** |
| [ECO708](./ECO708.md) | RAs por Solicitante | `https://www.saneago.com.br/prt/eco/ECO708ConsultaRASolicitante.zul` | **CONSULTA** | **ARVORE CAPTURADA (sem POST)** |
| [ECO709](./ECO709.md) | RAs por Logradouro | `https://www.saneago.com.br/prt/eco/ECO709ConsultaRALogradouro.zul` | **CONSULTA** | **REPLICADO** |
| [ECO711](./ECO711.md) | RA em Execução/Executado | `https://www.saneago.com.br/prt/eco/ECO711ConsultaRaExecucao.zul` | **CONSULTA** | **ARVORE CAPTURADA (sem POST)** |
| [ECO712](./ECO712.md) | História do Usuário | `https://www.saneago.com.br/prt/eco/ECO712HistoricoUsuario.zul` | **CONSULTA** | **ARVORE CAPTURADA (sem POST)** |
| [ECO731](./ECO731.md) | Alteração e Impressão de RA | `https://www.saneago.com.br/prt/eco/ECO731AlteracaoImpressaoRA.zul` | **ESCRITA** | **ARVORE CAPTURADA (sem POST)** |
| [MTG020](./MTG020.md) | Consulta Fila de Relatórios PDF | `https://www.saneago.com.br/prt/mtg/MTG020RelatorioUsuarioVirtual.zul` | **RELATORIO** | **ARVORE CAPTURADA (sem POST)** |

## Resumo do Protocolo
1. **Regras Gerais**: Ver [HTTP-ECO707-ECO709.md](../HTTP-ECO707-ECO709.md).
2. **Validação Automática**: O script `scripts/validar_docs_http.js` verifica que 100% dos IDs citados nos documentos existem nas capturas correspondentes.
