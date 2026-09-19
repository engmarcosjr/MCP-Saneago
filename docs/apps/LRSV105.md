# LRSV105 — Lançamento de serviços executados

## Informações Gerais
- **Código:** LRSV105
- **Nome:** Lançamento de serviços executados
- **Módulo:** Atendimento ao Publico > Cadastro
- **Tecnologia:** zk
- **URL Real:** `https://www.saneago.com.br/prt/lrs/LRS105CadastraRetornoRA.zul`
- **Status:** inventariado
- **Classe Proposta:** `possui_escrita`
- **Motivo:** Tela ZK de cadastro de retorno de RA e lançamento de serviços executados com fluxo de gravação de serviços.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| R.A. | text | Sim | `p66Rl` |
| Programação | text | Sim | `p66Rq` |
| Serviço Resposta | text | Sim | `p66R3o` |
| Serviço Resposta | text | Não (readonly) | `p66Ry-real` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Consultar | button | `p66Ri1` | Consulta a RA ou programação para retorno e lançamento |
| Cancelar | button | `p66Rk1` | Cancela a operação e limpa a tela |

### Elementos Auxiliares Ignorados
- `Sem Rotulo` (id: `p66Ry-btn`, tipo: `a`) — botão auxiliar de lookup do campo Serviço Resposta.

## Colunas da Grade
- RA
- Programação
- Data Solicitação
- Serviço Solicitação
- Serviço Resposta
- Código
- Descrição
- Equipe
- Nome Responsável
- Tipo Equipe
- Categoria
- Frota
- Placa
- Marca
- Modelo
- Cor
