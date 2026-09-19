# LRSV037 — Serviço executado por conta

## Informações Gerais
- **Código:** LRSV037
- **Nome:** Serviço executado por conta
- **Módulo:** Atendimento ao Publico > Relatório
- **Tecnologia:** zk
- **URL Real:** `https://www.saneago.com.br/prt/lrs/LRS037ServicoExecutadoConta.zul`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela ZK de emissão de relatório de serviços executados por conta por regional, distrito, período e serviço com botões Imprimir e Cancelar.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Regional | text | Sim | `bNoTk2` |
| Regional | text | Não (readonly) | `bNoTi-real` |
| Distrito | text | Sim | `bNoTl2` |
| Distrito | text | Não (readonly) | `bNoT60-real` |
| Período | date | Sim | `bNoTt0-real` |
| a | date | Sim | `bNoTv0-real` |
| Serviço | text | Sim | `bNoTm2` |
| Serviço | text | Não (readonly) | `bNoT51-real` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Imprimir | button | `bNoT82` | Emite o relatório de serviços executados por conta |
| Cancelar | button | `bNoT92` | Limpa os filtros e cancela a consulta |

### Elementos Auxiliares Ignorados
- `Sem Rotulo` (id: `bNoTi-btn`, tipo: `a`) — botão auxiliar de lookup do campo Regional.
- `Sem Rotulo` (id: `bNoT60-btn`, tipo: `a`) — botão auxiliar de lookup do campo Distrito.
- `Sem Rotulo` (id: `bNoTt0-btn`, tipo: `a`) — botão auxiliar de acionamento do calendário do campo Período.
- `Sem Rotulo` (id: `bNoTv0-btn`, tipo: `a`) — botão auxiliar de acionamento do calendário do campo a.
- `Sem Rotulo` (id: `bNoT51-btn`, tipo: `a`) — botão auxiliar de lookup do campo Serviço.
- `Sem Rotulo` (id: `bNoTu1-a`, tipo: `submit`) — elemento de submit oculto/estrutural ZK.

## Colunas da Grade
- Serviço
- Descrição
