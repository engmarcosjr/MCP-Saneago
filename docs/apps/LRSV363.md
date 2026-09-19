# LRSV363 — Relação Mensal de Serviços Atendidos

## Informações Gerais

- **Código:** LRSV363
- **Nome:** Relação Mensal de Serviços Atendidos
- **Módulo:** Atendimento ao Publico > Relatório
- **Tecnologia:** JSP / HTML legado
- **URL Real:** `https://www.saneago.com.br/prt/lrs/LRS363relMensal.jsp`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela JSP legada de emissão/consulta de relatório de serviços atendidos por período e unidade, sem botões de escrita identificados na carga inicial.

## Campos de Entrada (Filtros de Parâmetros)

| Rótulo / Label | ID | Name | Tipo | Editável | Readonly | Maxlength | Valor Padrão |
|---|---|---|---|---|---|---|---|
| Período | `dataInicial` | `dataInicial` | `text` | Sim | Não | 10 | `""` |
| Período | `dataFinal` | `dataFinal` | `text` | Sim | Não | 10 | `""` |
| Unidade | `codigoUnidadeOrganizacional` | `codigoUnidadeOrganizacional` | `text` | Sim | Não | 9 | `""` |
| Unidade | `nomeUnidadeOrganizacional` | `nomeUnidadeOrganizacional` | `text` | Não | Sim | - | `""` |

## Botões e Ações

Nenhum botão detectado no DOM inicial.

## Decisões de Mapeamento e Segurança

- **Formulário:** `frmLRS363` (POST).
- **Classificação:** `somente_leitura` para consulta e emissão de relatório mensal.
