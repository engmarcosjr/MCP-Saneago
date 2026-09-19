# PGTV510 — Atendimento

## Informações Gerais
- **Código:** PGTV510
- **Nome:** Atendimento
- **Módulo:** Gestão Transporte > Ordem Tráfego
- **Tecnologia:** misto
- **URL Real:** `https://www.saneago.com.br/prt/pgt/PGT510AtendimentoOrdemTrafego.zul`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela mista de consulta e atendimento de ordens de tráfego com filtros de posto de serviço e status, e botão Atualizar.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Posto de Serviço | text | Sim | `yCOFb1` |
| Posto de Serviço | text | Não (readonly) | `yCOFi-real` |
| Posto de Serviço | checkbox | Sim | `yCOF_0-real` |
| Aberta | checkbox | Sim | `yCOF00-real` |
| Reservada | checkbox | Sim | `yCOF10-real` |
| Número. O.T | text | Sim | `yCOFv0` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Atualizar | button | `yCOF30` | Atualiza a listagem de ordens de tráfego |

### Elementos Auxiliares Ignorados
- `Sem Rotulo` (id: `yCOFi-btn`, tipo: `a`) — botão auxiliar de lookup do campo Posto de Serviço.
- `Sem Rotulo` (id: `yCOF60-a`, tipo: `submit`) — elemento de submit auxiliar do formulário.

## Colunas da Grade
- Número
- Início Deslocamento
- Término Deslocamento
- Uo Solicitante
- Data Solictação
- Itinerário
- À Disp.
- Viagem
- Status
