# LRSV036 - Resumo de Vazamentos

## Categoria
Logística, Redes e Serviços de Campo / Saneago

## Tipo
Relatório Operacional (zk)

## O que faz
Permite a emissão e visualização de resumo de vazamentos por regional, distrito, período e tipo de vazamento (cavalete, derivação, ramal ou rede).

## URL Real / Atalho Direto
- `https://www.saneago.com.br/prt/lrs/LRS036ResumoVazamentos.zul`

## Campos e Filtros da Tela
- **Regional** (q6EN52: input de texto, editável, max 5)
- **Regional** (q6ENk-real: input de texto, readonly)
- **Distrito** (q6EN62: input de texto, editável, max 5)
- **Distrito** (q6EN80-real: input de texto, readonly)
- **Período** (q6ENv0-real: input de data, editável)
- **a** (q6ENx0-real: input de data, editável)
- **Cavalete** (q6EN82-real: radio button, editável)
- **Derivação** (q6EN92-real: radio button, editável)
- **Ramal** (q6ENa2-real: radio button, editável)
- **Rede** (q6ENb2-real: radio button, editável)
- **Serviço** (q6EN72: input de texto, editável, max 5)
- **Serviço** (q6ENb1-real: input de texto, readonly)

## Botões Disponíveis
- **Sem Rotulo** (`q6ENk-btn`: a) — abridor de combobox/pesquisa (ignorado)
- **Sem Rotulo** (`q6EN80-btn`: a) — abridor de combobox/pesquisa (ignorado)
- **Sem Rotulo** (`q6ENv0-btn`: a) — abridor de calendário/data (ignorado)
- **Sem Rotulo** (`q6ENx0-btn`: a) — abridor de calendário/data (ignorado)
- **Sem Rotulo** (`q6ENb1-btn`: a) — abridor de combobox/pesquisa (ignorado)
- **Imprimir** (`q6ENu1`: button) — emissão de relatório
- **Cancelar** (`q6ENv1`: button) — cancelamento/limpeza

## Observações de Segurança e Automação
- Tela ZK de relatório e resumo de vazamentos (`LRS036ResumoVazamentos.zul`).
- Contém apenas botões de emissão/consulta (`Imprimir`) e controle (`Cancelar`), sem botões de escrita.

## Status
Status: inventariado
