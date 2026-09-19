# LRSV702 — Emite Serviços Executados em Atraso

## Informações Gerais

- **Código:** LRSV702
- **Nome:** Emite Serviços Executados em Atraso
- **Módulo:** Atendimento ao Publico > Relatório
- **Tecnologia:** JSP / HTML legado
- **URL Real:** `https://www.saneago.com.br/prt/lrs/LRS702emiteServi.jsp`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela JSP legada de emissão de relatório de serviços executados em atraso por distrito, serviço e referência mês/ano, sem botões de escrita identificados na carga inicial.

## Campos de Entrada (Filtros de Parâmetros)

| Rótulo / Label | ID | Name | Tipo | Editável | Readonly | Maxlength | Valor Padrão |
|---|---|---|---|---|---|---|---|
| Distrito | `codigoUnidadeOrganizacional` | `codigoUnidadeOrganizacional` | `text` | Sim | Não | 5 | `""` |
| Distrito | `nomeUnidadeOrganizacional` | `nomeUnidadeOrganizacional` | `text` | Não | Sim | 45 | `"Digite Código Distrito ou Consulte [ver]"` |
| Serviço | `codigoServico` | `codigoServico` | `text` | Não | Sim | 4 | `""` |
| Serviço | `descricaoServico` | `descricaoServico` | `text` | Não | Sim | 45 | `"Imprime Todos Serviços ou Consulte [Ver]"` |
| Referência | `cFrmMes` | `cFrmMes` | `select` | Sim | Não | - | `"00"` (13 opções) |
| Referência | `cFrmAno` | `cFrmAno` | `select` | Sim | Não | - | `"0000"` (6 opções) |
| Tipo de relatório | - | `tipoRelatorio` | `radio` | Sim | Não | - | `"1"` |
| Tipo de relatório | - | `tipoRelatorio` | `radio` | Sim | Não | - | `"2"` |
| Tipo de relatório | - | `tipoRelatorio` | `radio` | Sim | Não | - | `"3"` |

## Botões e Ações

Nenhum botão detectado no DOM inicial.

## Decisões de Mapeamento e Segurança

- **Formulário:** `frmLRS702` (POST).
- **Classificação:** `somente_leitura` para emissão de relatório gerencial de atrasos.
