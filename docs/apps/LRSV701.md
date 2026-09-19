# LRSV701 — Relação de Serviços Executados

## Informações Gerais
- **Código:** LRSV701
- **Nome:** Relação de Serviços Executados
- **Módulo:** Atendimento ao Publico > Relatório
- **Tecnologia:** misto
- **URL Real:** `https://www.saneago.com.br/prt/lrs/LRS701RelServicosExec.zul`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela mista de consulta e relatório de serviços executados com filtros por UO, período, serviço e status com botões Consultar e Cancelar.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| UO | text | Sim | `r1FNu3` |
| UO | text | Não (readonly) | `r1FNh-real` |
| UO | checkbox | Sim | `r1FN_0-real` |
| Período | date | Sim | `r1FN40-real` |
| Até | date | Sim | `r1FN80-real` |
| Serviço | text | Sim | `r1FNv3` |
| Serviço | text | Não (readonly) | `r1FNi0-real` |
| Pendente | radio | Sim | `r1FN41-real` |
| Executado | radio | Sim | `r1FN61-real` |
| Todos | radio | Sim | `r1FN81-real` |
| Sim | radio | Sim | `r1FNe1-real` |
| Não | radio | Sim | `r1FNg1-real` |
| Todos | radio | Sim | `r1FNi1-real` |
| Saneago | radio | Sim | `r1FNo1-real` |
| Subdelegada | radio | Sim | `r1FNq1-real` |
| Todos | radio | Sim | `r1FNs1-real` |
| Data Emissão | radio | Sim | `r1FNy1-real` |
| Data Prevista | radio | Sim | `r1FN_2-real` |
| Cód. Serviço | radio | Sim | `r1FN12-real` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Consultar | button | `r1FN42` | Consulta a relação de serviços executados |
| Cancelar | button | `r1FN62` | Cancela e limpa os campos de pesquisa |

### Elementos Auxiliares Ignorados
- `Sem Rotulo` (id: `r1FNh-btn`, tipo: `a`) — botão auxiliar de lookup do campo UO.
- `Sem Rotulo` (id: `r1FN40-btn`, tipo: `a`) — botão auxiliar de calendário do campo Período.
- `Sem Rotulo` (id: `r1FN80-btn`, tipo: `a`) — botão auxiliar de calendário do campo Até.
- `Sem Rotulo` (id: `r1FNi0-btn`, tipo: `a`) — botão auxiliar de lookup do campo Serviço.

## Colunas da Grade
- N° RA
- N° Seq
- Conta
- Cod. Seviço
- Serviço
- Cidade
- Bairro
- Data Solicit.
- Data Distri.
- Data Emis.
- Hora Emis.
- Data Exec.
- Hora Exec.
- Qt. Hr. Prev.
- Tempo Pdr.
- Peso Serv.
- Diferença
- Regis. Atend.
- Cad. Usu.
