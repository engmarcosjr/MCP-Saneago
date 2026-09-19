# ECSV007 — Gerar Planilha

## Informações Gerais
- **Código:** ECSV007
- **Nome:** Gerar Planilha
- **Módulo:** SISTEMA DE CONTROLE DE SERVIÇOS
- **Tecnologia:** zk
- **URL Real:** `https://www.saneago.com.br/prt/ecs/ECS007GerarPlanilha.zul`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela de geração e consulta de planilha de controle de medição por distrito e lote com botões Consultar e Cancelar.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Distrito | text | Sim | `wXrIk` |
| Distrito | text | Não | `wXrIm-real` |
| Período de medição | combobox | Não | `wXrI80-real` |
| Lote | combobox | Não | `wXrIg0-real` |
| Fase Contratual | text | Não | `wXrIo0` |
| Data Inicial da Fase Contratual | date | Não | `wXrIw0-real` |
| Data Final da Fase Contratual | date | Não | `wXrI21-real` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Consultar | button | `wXrI61` | Consulta dados para geração da planilha de controle |
| Cancelar | button | `wXrI81` | Cancela operação / limpa filtros |

### Botões Ignorados (Auxiliares/Navegação)
- `Sem Rotulo` (a, `wXrIm-btn`) — acionador de busca do Distrito
- `Sem Rotulo` (a, `wXrI80-btn`) — acionador do combobox Período de medição
- `Sem Rotulo` (a, `wXrIg0-btn`) — acionador do combobox Lote
