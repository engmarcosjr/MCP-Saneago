# ECNV006 — Relatório

## Informações Gerais
- **Código:** ECNV006
- **Nome:** Relatório
- **Módulo:** SISTEMA DE PROTESTO CARTORÁRIO > Protesto Cartorário
- **Tecnologia:** misto
- **URL Real:** `https://www.saneago.com.br/prt/ecn/ECN006RelatoriosProtesto.zul`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela de relatórios de protestos cartorários com filtros por superintendência, regional, distrito e botões Relatório e Planilha.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Superintendência | text | Sim | `uKCYi` |
| Superintendência | text | Não | `uKCYk-real` |
| Regional | text | Sim | `uKCY70` |
| Regional | text | Não | `uKCY90-real` |
| Distrito | text | Sim | `uKCYl1` |
| Distrito | text | Não | `uKCYn1-real` |
| Opção | combobox | Não | `uKCY82-real` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Relatório | button | `uKCYw2` | Emite relatório de protestos cartorários |
| Planilha | button | `uKCYx2` | Exporta relatório em planilha |
| Cancelar | button | `uKCYy2` | Cancela operação / limpa filtros |

### Botões Ignorados (Auxiliares/Navegação)
- `Sem Rotulo` (a, `uKCYk-btn`) — acionador de busca da Superintendência
- `Sem Rotulo` (a, `uKCY90-btn`) — acionador de busca da Regional
- `Sem Rotulo` (a, `uKCYn1-btn`) — acionador de busca do Distrito
- `Sem Rotulo` (a, `uKCY82-btn`) — acionador do combobox Opção
