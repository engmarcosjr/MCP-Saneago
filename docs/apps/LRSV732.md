# LRSV732 — Atendimento Por Período

## Informações Gerais

- **Código:** LRSV732
- **Nome:** Atendimento Por Período
- **Módulo:** Atendimento ao Publico > Relatório
- **Tecnologia:** JSP / HTML legado
- **URL Real:** `https://www.saneago.com.br/prt/lrs/LRS732relAtendPer.jsp`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela JSP legada de relatório de serviços atendidos por período, sem botões de escrita identificados na carga inicial.

## Campos de Entrada (Filtros de Parâmetros)

| Rótulo / Label | ID | Name | Tipo | Editável | Readonly | Maxlength | Valor Padrão |
|---|---|---|---|---|---|---|---|
| Periodo | `dataInicio` | `dataInicio` | `text` | Sim | Não | 10 | `""` |
| Periodo | `dataFim` | `dataFim` | `text` | Sim | Não | 10 | `""` |

## Botões e Ações

Nenhum botão detectado no DOM inicial.

## Decisões de Mapeamento e Segurança

- **Formulário:** `frmLRS732` (POST).
- **Classificação:** `somente_leitura` para emissão de relatório geral de serviços atendidos no período.
