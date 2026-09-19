# PGTV917 — Veiculos Alugados

## Informações Gerais
- **Código:** PGTV917
- **Nome:** Veiculos Alugados
- **Módulo:** Gestão Transporte > Relatórios
- **Tecnologia:** html
- **URL Real:** `https://www.saneago.com.br/prt/pgt/PGT917RelVeicAlug.jsp`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela HTML de relatório de veículos alugados com opções de agrupamento, saída e situações do veículo.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Tipo de Agrupamento | select | Sim | `tipoAgrupamento` |
| Saída do Relatório | radio | Sim | `saida` (video) |
| Saída do Relatório | radio | Sim | `saida` (planilha) |
| Situações do Veículo | checkbox | Sim | `stDisponivel` |
| Disponível | checkbox | Sim | `stReservado` |
| Reservado | checkbox | Sim | `stEmpenhado` |
| Empenhado | checkbox | Sim | `stInativo` |
| Inativo | checkbox | Sim | `stLeiloado` |
| Leiloado | checkbox | Sim | `stSucata` |

## Botões e Ações
Nenhum botão detectado na tela inicial (submissão via formulário post `frmPGT917` para `PGT917Resultado.jsp`).
