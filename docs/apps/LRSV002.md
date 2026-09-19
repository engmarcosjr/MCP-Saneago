# LRSV002 — RA Pendente

## Informações Gerais
- **Código:** LRSV002
- **Nome:** RA Pendente
- **Módulo:** Atendimento ao Publico > Consulta
- **Tecnologia:** ZK Framework
- **URL Real:** `https://www.saneago.com.br/prt/lrs/LRS002ConsultaRaPendente.zul`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela ZK de consulta de Registro de Atendimento (RA) pendente por distrito e período, com grade de resultados e botões de consulta e cancelamento (Consultar, Cancelar).

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Distrito | text | Sim | `e9EZg` |
| Distrito | text | Não (readonly) | `e9EZi-real` |
| Período | date | Sim | `e9EZ10-real` |
| Período | date | Sim | `e9EZ30-real` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Consultar | button | `e9EZ60` | Executa a consulta de RAs pendentes |
| Cancelar | button | `e9EZ80` | Limpa os filtros e cancela a consulta |

### Elementos Auxiliares Ignorados
- `Sem Rotulo` (id: `e9EZi-btn`, tipo: `a`) — abridor de lookup Distrito.
- `Sem Rotulo` (id: `e9EZ10-btn`, tipo: `a`) — abridor de datepicker Período.
- `Sem Rotulo` (id: `e9EZ30-btn`, tipo: `a`) — abridor de datepicker Período.

## Colunas da Grade
- N° RA
- Conta
- Serviço
- Data Solicit.
- Data Ult. Rep.
- Regis. Atend.
- Cad. Usu.
