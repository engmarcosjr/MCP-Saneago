# LRSV733 — Atendimento Por Cidade

## Informações Gerais

- **Código:** LRSV733
- **Nome:** Atendimento Por Cidade
- **Módulo:** Atendimento ao Publico > Relatório
- **Tecnologia:** JSP / HTML legado
- **URL Real:** `https://www.saneago.com.br/prt/lrs/LRS733relAtendCid.jsp`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela JSP legada de relatório de serviços atendidos por cidade e período, sem botões de escrita identificados na carga inicial.

## Campos de Entrada (Filtros de Parâmetros)

| Rótulo / Label | ID | Name | Tipo | Editável | Readonly | Maxlength | Valor Padrão |
|---|---|---|---|---|---|---|---|
| Periodo | `dataInicio` | `dataInicio` | `text` | Sim | Não | 10 | `""` |
| Periodo | `dataFim` | `dataFim` | `text` | Sim | Não | 10 | `""` |
| Cidade | `codigoCidade` | `codigoCidade` | `text` | Sim | Não | 7 | `""` |
| Cidade | `nomeCidade` | `nomeCidade` | `text` | Não | Sim | 40 | `""` |

## Botões e Ações

Nenhum botão detectado no DOM inicial.

## Decisões de Mapeamento e Segurança

- **Formulário:** `frmLRS733` (POST).
- **Classificação:** `somente_leitura` para emissão de relatório de serviços atendidos por município.
