# ECNV007 — Consultar Protesto

## Informações Gerais
- **Código:** ECNV007
- **Nome:** Consultar Protesto
- **Módulo:** SISTEMA DE PROTESTO CARTORÁRIO > Protesto Cartorário
- **Tecnologia:** misto
- **URL Real:** `https://www.saneago.com.br/prt/ecn/ECN007ConsultarProtesto.zul`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Consulta de protestos cartorários por CPF/CNPJ com botões Consultar e Cancelar.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Filtros | combobox | Não | `eT1Zl-real` |
| Pessoa Física | radio | Sim | `eT1Zv-real` (`_pgvs4sle1`) |
| Pessoa Jurídica | radio | Sim | `eT1Zx-real` (`_pgvs4sle1`) |
| CPF | text | Sim | `eT1Z30` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Consultar | button | `eT1Zx0` | Consulta protestos do titular informado |
| Cancelar | button | `eT1Zy0` | Cancela operação / limpa filtros |

### Botões Ignorados (Auxiliares/Navegação)
- `Sem Rotulo` (a, `eT1Zl-btn`) — acionador do combobox Filtros
