# LRSV730 — Atendimento Serv. p/ UO e Período

## Informações Gerais

- **Código:** LRSV730
- **Nome:** Atendimento Serv. p/ UO e Período
- **Módulo:** Atendimento ao Publico > Relatório
- **Tecnologia:** JSP / HTML legado
- **URL Real:** `https://www.saneago.com.br/prt/lrs/LRS730atendServUo.jsp`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela JSP legada de relatório de serviços atendidos por U.O. em período específico, sem botões de escrita identificados na carga inicial.

## Campos de Entrada (Filtros de Parâmetros)

| Rótulo / Label | ID | Name | Tipo | Editável | Readonly | Maxlength | Valor Padrão |
|---|---|---|---|---|---|---|---|
| Periodo | `dataInicio` | `dataInicio` | `text` | Sim | Não | 10 | `""` |
| Periodo | `dataFim` | `dataFim` | `text` | Sim | Não | 10 | `""` |
| U.O. | `codigoUO` | `codigoUO` | `text` | Sim | Não | 7 | `""` |
| U.O. | `nomeUO` | `nomeUO` | `text` | Não | Sim | 40 | `""` |

## Botões e Ações

Nenhum botão detectado no DOM inicial.

## Decisões de Mapeamento e Segurança

- **Formulário:** `frmLRS730` (POST).
- **Classificação:** `somente_leitura` para relatório operacional de serviços atendidos.
