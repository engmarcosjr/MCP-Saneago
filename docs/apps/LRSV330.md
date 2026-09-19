# LRSV330 - Resumo dos Serviços

## Categoria
Logística, Redes e Serviços de Campo / Saneago

## Tipo
Relatório Operacional (misto)

## O que faz
Emite relatório com o resumo dos serviços executados por distrito, período, tipo de serviço e modalidade de execução (Saneago/Subdelegada/Todas).

## URL Real / Atalho Direto
- `https://www.saneago.com.br/prt/lrs/LRS330ResumoServico.zul`

## Campos e Filtros da Tela
- **Distrito** (zWbUl: input de texto, editável, maxlength: 5)
- **Distrito** (zWbUn-real: input de texto, readonly)
- **Período** (zWbU90-real: input de data, editável)
- **a** (zWbUb0-real: input de data, editável)
- **Todos os serviços** (zWbUh0-real: radio, editável)
- **Serviços de Água** (zWbUj0-real: radio, editável)
- **Serviços de Esgoto** (zWbUl0-real: radio, editável)
- **Serviços Comerciais** (zWbUn0-real: radio, editável)
- **Serviços Diversos** (zWbUp0-real: radio, editável)
- **Serviço** (zWbU12: input de texto, editável)
- **Serviço** (zWbUy0-real: input de texto, readonly)
- **Saneago** (zWbUi1-real: radio, editável)
- **Subdelegada** (zWbUk1-real: radio, editável)
- **Todas** (zWbUm1-real: radio, editável)

## Botões Disponíveis
- **Sem Rotulo** (`zWbUn-btn`: a) — abridor de combobox/pesquisa (ignorado)
- **Sem Rotulo** (`zWbU90-btn`: a) — abridor de calendário/data (ignorado)
- **Sem Rotulo** (`zWbUb0-btn`: a) — abridor de calendário/data (ignorado)
- **Sem Rotulo** (`zWbUy0-btn`: a) — abridor de combobox/pesquisa (ignorado)
- **Imprimir** (`zWbUp1`: button) — emissão do relatório em tela/impressão
- **Cancelar** (`zWbUr1`: button) — cancelamento/limpeza

## Observações de Segurança e Automação
- Tela ZK de emissão de relatório resumido de serviços (`LRS330ResumoServico.zul`).
- Não possui botões de escrita ou alteração de dados, apenas botões de emissão (`Imprimir`) e cancelamento (`Cancelar`).

## Status
Status: inventariado
