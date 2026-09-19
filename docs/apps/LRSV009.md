# LRSV009 — Monitoramento de Atendimento

## Informações Gerais
- **Código:** LRSV009
- **Nome:** Monitoramento de Atendimento
- **Módulo:** Atendimento ao Publico > Relatório
- **Tecnologia:** ZK Framework
- **URL Real:** `https://www.saneago.com.br/prt/lrs/LRS009RelMonitoramentoAtendimento.zul`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela ZK de relatório e monitoramento de atendimento com filtros por unidade executora, período, situação e serviço prestado, contendo botões de consulta e cancelamento (Consultar, Cancelar).

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Unidade Executora do Serviço | text | Sim | `zPjJz1` |
| Unidade Executora do Serviço | text | Não (readonly) | `zPjJ8-real` |
| Período | date | Sim | `zPjJq-real` |
| a | date | Sim | `zPjJs-real` |
| Situação | combobox | Não (readonly) | `zPjJv-real` |
| Serviço Prestado | text | Sim | `zPjJ_2` |
| Serviço Prestado | text | Não (readonly) | `zPjJ00-real` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Consultar | button | `zPjJv0` | Executa a consulta e gera o relatório de monitoramento de atendimento |
| Cancelar | button | `zPjJw0` | Limpa os filtros e cancela a consulta |

### Elementos Auxiliares Ignorados
- `Sem Rotulo` (id: `zPjJ8-btn`, tipo: `a`) — abridor de lookup Unidade Executora.
- `Sem Rotulo` (id: `zPjJq-btn`, tipo: `a`) — abridor de datepicker Período.
- `Sem Rotulo` (id: `zPjJs-btn`, tipo: `a`) — abridor de datepicker a.
- `Sem Rotulo` (id: `zPjJv-btn`, tipo: `a`) — abridor de combobox Situação.
- `Sem Rotulo` (id: `zPjJ00-btn`, tipo: `a`) — abridor de lookup Serviço Prestado.
- `Sem Rotulo` (id: `zPjJm0-a`, tipo: `submit`) — gatilho submit/evento interno.

## Colunas do Relatório / Grade
- Serviço
- Descrição
- Número do RA
- U.O
- Código da Equipe
- Situação Atendimento
- Data e Hora de Comunicação
- Serviço Prestado
- Latitude
- Longitude
- Altitude
- Ínicio
- Fim
- Placa do Veículo
