# LRSV100 — Manter estoque de Material por viatura

## Informações Gerais
- **Código:** LRSV100
- **Nome:** Manter estoque de Material por viatura
- **Módulo:** Atendimento ao Publico > Cadastro
- **Tecnologia:** zk
- **URL Real:** `https://www.saneago.com.br/prt/lrs/LRS100ManterEstoqueMaterialPorViatura.zul`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela ZK de consulta de estoque de materiais por viatura e distrito com botões Listar Todas, Consultar e Cancelar.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Distrito | text | Sim | `i83It` |
| Distrito | text | Não (readonly) | `i83Iv-real` |
| Veículo | text | Sim | `i83I01` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Listar Todas | button | `i83I41` | Lista todas as viaturas e materiais em estoque |
| Consultar | button | `i83I43` | Consulta o estoque da viatura/distrito informado |
| Cancelar | button | `i83Ib3` | Limpa os filtros e cancela a consulta |

### Elementos Auxiliares Ignorados
- `Sem Rotulo` (id: `i83Iv-btn`, tipo: `a`) — botão auxiliar de lookup do campo Distrito.

## Colunas da Grade
- Frota
- Placa
- Marca
- Modelo
- Cor
- Última atualização do kit cesta
- Código
- Código SAP
- Descrição
- Qtdade Estoque Veículo
- Utilizado Sem baixa no SAP
- Unidade Medida
- RA's Pendentes
- Veículo
- Qtde consumo anterior
- Qtde estoque
- Data/Hora
- Tipo Movimentação
- Operador de Movimentação
- Quantidade
