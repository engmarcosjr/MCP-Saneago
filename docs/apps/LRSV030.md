# LRSV030 — Serviço resposta por serviço solicitação

## Informações Gerais
- **Código:** LRSV030
- **Nome:** Serviço resposta por serviço solicitação
- **Módulo:** Atendimento ao Publico > Cadastro
- **Tecnologia:** zk
- **URL Real:** `https://www.saneago.com.br/prt/lrs/LRS030ServicoRespostaSolicitacao.zul`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela ZK de consulta e impressão de serviços resposta por serviço solicitação com botões Consultar, Imprimir e Cancelar.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Serviço Solicitação | text | Sim | `pNbMo3` |
| Serviço Solicitação | text | Não (readonly) | `pNbMh-real` |
| Serviço Resposta | text | Sim | `pNbMp3` |
| Serviço Resposta | text | Não (readonly) | `pNbM40-real` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Consultar | button | `pNbMr0` | Consulta os vínculos de serviço solicitação e resposta |
| Imprimir | button | `pNbMv0` | Emite relatório/impressão dos vínculos listados |
| Cancelar | button | `pNbMw0` | Limpa os filtros e cancela a consulta atual |

### Elementos Auxiliares Ignorados
- `Sem Rotulo` (id: `pNbMh-btn`, tipo: `a`) — abridor/pesquisador de Serviço Solicitação.
- `Sem Rotulo` (id: `pNbM40-btn`, tipo: `a`) — abridor/pesquisador de Serviço Resposta.

## Colunas da Grade
- Código
- Descrição
- Data Vínculo
- Remover
- Serviço Solicitação
- Serviço Resposta
- Matrícula Vínculo
- Data Cancelamento
- Matrícula Cancelamento
