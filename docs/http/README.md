# Índice dos Contratos HTTP das 19 Telas Prioritárias Saneago

Este diretório contém a documentação técnica e os contratos de interações por **POST /prt/zkau** (HTTP puro) para as 19 telas prioritárias do sistema ZK Intranet Saneago.

## Tabela Geral de Telas e Status

| Código | Nome da Tela | URL ZK | Natureza | Status HTTP |
|---|---|---|---|---|
| [LRS010](./LRS010.md) | Distribuição de Serviços - Água, Esgoto e Comercial | `/prt/lrs/LRS010DistribuicaoServico.zul` | **ESCRITA** | **SO ABERTURA (tela de escrita)** |
| [LRS034](./LRS034.md) | Validação RA Corte Asfalto | `/prt/lrs/LRS034ValidaRaCorteAsfalto.zul` | **CONSULTA** | **CONFIRMADO** |
| [LRS041](./LRS041.md) | Relatório Recomposição Asfáltica | `/prt/lrs/LRS041RelatorioRecomposicaoAsfaltica.zul` | **CONSULTA** | **CONFIRMADO** |
| [LRS100](./LRS100.md) | Manter Estoque Material por Viatura | `/prt/lrs/LRS100ManterEstoqueMaterialPorViatura.zul` | **CONSULTA** | **CONFIRMADO** |
| [LRS105](./LRS105.md) | Cadastra Retorno RA | `/prt/lrs/LRS105CadastraRetornoRA.zul` | **ESCRITA** | **SO ABERTURA (tela de escrita)** |
| [LRS208](./LRS208.md) | Consulta RA / DS | `/prt/lrs/LRS208ConsultaRADS.zul` | **CONSULTA** | **CONFIRMADO** |
| [LRS272](./LRS272.md) | Monitorar Atendimento | `/prt/lrs/LRS272MonitorarAtendimento.zul` | **CONSULTA** | **CONFIRMADO** |
| [ECO151](./ECO151.md) | Cadastro de Usuário | `/prt/eco/ECO151CadastroUsuario.zul` | **ESCRITA** | **SO ABERTURA (tela de escrita)** |
| [ECO154](./ECO154.md) | Consulta Usuário | `/prt/eco/ECO154ConsultaUsuario.zul` | **CONSULTA** | **CONFIRMADO** |
| [ECO202](./ECO202.md) | Movimentação de Hidrômetro | `/prt/eco/ECO202MovimentacaoHidrometro.zul` | **ESCRITA** | **SO ABERTURA (tela de escrita)** |
| [ECO205](./ECO205.md) | Consulta Hidrômetro | `/prt/eco/ECO205ConsultaHidrometro.zul` | **CONSULTA** | **CONFIRMADO** |
| [ECO701](./ECO701.md) | Registro de Atendimento | `/prt/eco/ECO701RegistroAtendimento.zul` | **ESCRITA** | **SO ABERTURA (tela de escrita)** |
| [ECO707](./ECO707.md) | Consulta RA por Número de Conta | `/prt/eco/ECO707ConsultaRAConta.zul` | **CONSULTA** | **CONFIRMADO** |
| [ECO708](./ECO708.md) | Consulta RA por Solicitante | `/prt/eco/ECO708ConsultaRASolicitante.zul` | **CONSULTA** | **CONFIRMADO** |
| [ECO709](./ECO709.md) | Consulta RA por Logradouro | `/prt/eco/ECO709ConsultaRALogradouro.zul` | **CONSULTA** | **CONFIRMADO** |
| [ECO711](./ECO711.md) | RA em Execução / Executado | `/prt/eco/ECO711ConsultaRaExecucao.zul` | **CONSULTA** | **CONFIRMADO** |
| [ECO712](./ECO712.md) | História do Usuário | `/prt/eco/ECO712HistoricoUsuario.zul` | **CONSULTA** | **CONFIRMADO** |
| [ECO731](./ECO731.md) | Alteração e Impressão de RA | `/prt/eco/ECO731AlteracaoImpressaoRA.zul` | **ESCRITA** | **SO ABERTURA (tela de escrita)** |
| [MTG020](./MTG020.md) | Relatório Usuários Virtuais | `/prt/mtg/MTG020RelatorioUsuarioVirtual.zul` | **RELATORIO** | **CONFIRMADO** |

## Resumo das Convenções ZK-por-HTTP
1. **Login e Sessão**: Centralizado em `src/http/portal-http.js`. Mantém a sessão ZK ativa e trata expiração via redirect automático.
2. **Resolução de UUIDs**: Centralizado em `src/http/zk-tree.js` (`uuidByComponentId`, `resolverFilho`). Nunca hardcodear UUIDs dinâmicos.
3. **Datas 1-based**: `Datebox` consome strings como `YYYY.M.D.H.m.s.ms` onde o mês é **1-based** (janeiro = 1).
4. **Preservação de Escrita**: Telas de natureza **ESCRITA** possuem status `SO ABERTURA` para garantir zero alterações em ambiente produtivo.
