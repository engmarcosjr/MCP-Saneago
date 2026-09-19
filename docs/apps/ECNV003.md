# ECNV003 — Enviar Fatura por Conta

## Informações Gerais
- **Código:** ECNV003
- **Nome:** Enviar Fatura por Conta
- **Módulo:** SISTEMA DE PROTESTO CARTORÁRIO > Protesto Cartorário
- **Tecnologia:** zk
- **URL Real:** `https://www.saneago.com.br/prt/ecn/ECN003EnvioFaturaProtesto.zul`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela de consulta de faturas por conta para envio a protesto cartorário com botões Consultar e Cancelar.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Número de Conta/DV | text | Sim | `kCzLf` |
| Número de Conta/DV | text | Não | `kCzLg` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Consultar | button | `kCzLk` | Consulta faturas da conta informada |
| Cancelar | button | `kCzLn` | Cancela operação / limpa filtros |

## Colunas / Tabelas
- Referência
- Fatura
- Vencimento
- Valor (R$)
- Titularidade
