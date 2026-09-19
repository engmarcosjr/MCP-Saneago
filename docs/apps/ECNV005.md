# ECNV005 — Gerenciar Protesto

## Informações Gerais
- **Código:** ECNV005
- **Nome:** Gerenciar Protesto
- **Módulo:** SISTEMA DE PROTESTO CARTORÁRIO > Protesto Cartorário
- **Tecnologia:** misto
- **URL Real:** `https://www.saneago.com.br/prt/ecn/ECN005GerenciarProtestoCartorario.zul`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela de gerenciamento e consulta de protestos cartorários com filtros por distrito, período e botões Consultar e Cancelar.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Consultar | radio | Sim | `f7KZl-real` (`_pgh7ilgl`) |
| Solicitar | radio | Sim | `f7KZm-real` (`_pgh7ilgl`) |
| Situação do Protesto | combobox | Não | `f7KZt-real` |
| Distrito | text | Sim | `f7KZ10` |
| Distrito | text | Não | `f7KZ30-real` |
| Período | date | Sim | `f7KZp0-real` |
| a | date | Sim | `f7KZt0-real` |
| Situação do débito | checkbox | Sim | `f7KZ_1-real` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Consultar | button | `f7KZ31` | Consulta protestos cartorários conforme filtros |
| Cancelar | button | `f7KZ41` | Cancela operação / limpa filtros |

### Botões Ignorados (Auxiliares/Navegação)
- `Sem Rotulo` (a, `f7KZt-btn`) — acionador do combobox Situação do Protesto
- `Sem Rotulo` (a, `f7KZ30-btn`) — acionador de busca do Distrito
- `Sem Rotulo` (a, `f7KZp0-btn`) — acionador do datebox Período
- `Sem Rotulo` (a, `f7KZt0-btn`) — acionador do datebox a
