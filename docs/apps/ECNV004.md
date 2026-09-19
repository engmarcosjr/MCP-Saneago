# ECNV004 — Enviar Fatura em Massa

## Informações Gerais
- **Código:** ECNV004
- **Nome:** Enviar Fatura em Massa
- **Módulo:** SISTEMA DE PROTESTO CARTORÁRIO > Protesto Cartorário
- **Tecnologia:** misto
- **URL Real:** `https://www.saneago.com.br/prt/ecn/ECN004EnvioFaturaProtestoEmMassa.zul`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela de consulta e seleção para envio de faturas em massa com botões Consultar e Cancelar.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Distrito | text | Sim | `iZLIp` |
| Distrito | text | Sim | `iZLIr-real` |
| Bairro | text | Não | `iZLIk4` |
| Bairro | text | Não | `iZLIf0-real` |
| Grupo de Faturamento | combobox | Sim | `iZLI11-real` |
| Grupo de Faturamento | checkbox | Sim | `iZLI21-real` |
| Física | radio | Sim | `iZLIe1-real` (`_pg3i9v87`) |
| Jurídica | radio | Sim | `iZLIf1-real` (`_pg3i9v87`) |
| Atualização de Cadastro Desde | date | Sim | `iZLIm1-real` |
| Titularidade | combobox | Não | `iZLIs1-real` |
| Sim | radio | Sim | `iZLIm4-real` (`_pg2ll1ei`) |
| Não | radio | Sim | `iZLIp4-real` (`_pg2ll1ei`) |
| Situação da água | combobox | Não | `iZLI42-real` |
| TCF | combobox | Não | `iZLIa2-real` |
| Sim | radio | Sim | `iZLIn4-real` (`_pgfniabi1`) |
| Não | radio | Sim | `iZLIq4-real` (`_pgfniabi1`) |
| Categoria | combobox | Não | `iZLIn2-real` |
| Títulos Pendentes para Reenvio | checkbox | Sim | `iZLIs2-real` |
| Contas sem Protesto | checkbox | Sim | `iZLIz2-real` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Consultar | button | `iZLI23` | Consulta faturas para envio em massa conforme filtros |
| Cancelar | button | `iZLI43` | Cancela operação / limpa filtros |

### Botões Ignorados (Auxiliares/Navegação)
- `Sem Rotulo` (a, `iZLIr-btn`) — acionador de busca do Distrito
- `Sem Rotulo` (a, `iZLI11-btn`) — acionador do combobox Grupo de Faturamento
- `Sem Rotulo` (a, `iZLIm1-btn`) — acionador do datebox Atualização de Cadastro Desde
- `Sem Rotulo` (a, `iZLIs1-btn`) — acionador do combobox Titularidade
- `Sem Rotulo` (a, `iZLI42-btn`) — acionador do combobox Situação da água
- `Sem Rotulo` (a, `iZLIa2-btn`) — acionador do combobox TCF
- `Sem Rotulo` (a, `iZLIn2-btn`) — acionador do combobox Categoria
