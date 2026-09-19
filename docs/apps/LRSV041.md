# LRSV041 - Relatório de Recomposição Asfáltica

## Categoria
Logística, Redes e Serviços de Campo / Saneago

## Tipo
Relatório Operacional (zk)

## O que faz
Permite a consulta e geração de relatório de recomposição asfáltica por cidade, bairro, UO, período de corte e situação.

## URL Real / Atalho Direto
- `https://www.saneago.com.br/prt/lrs/LRS041RelatorioRecomposicaoAsfaltica.zul`

## Campos e Filtros da Tela
- **Cidade** (eZ5S84: input de texto, editável)
- **Cidade** (eZ5Si-real: input de texto, readonly)
- **Bairro** (eZ5S94: input de texto, readonly)
- **Bairro** (eZ5S60-real: input de texto, readonly)
- **UO** (eZ5Sa4: input de texto, readonly)
- **UO** (eZ5Sv0-real: input de texto, readonly)
- **Período de Corte** (eZ5Sh1-real: input de data, editável)
- **a** (eZ5Sj1-real: input de data, editável)
- **Situação** (eZ5Sq1-real: combobox, readonly)

## Botões Disponíveis
- **Sem Rotulo** (`eZ5Si-btn`: a) — abridor de combobox/pesquisa (ignorado)
- **Sem Rotulo** (`eZ5Sh1-btn`: a) — abridor de calendário/data (ignorado)
- **Sem Rotulo** (`eZ5Sj1-btn`: a) — abridor de calendário/data (ignorado)
- **Sem Rotulo** (`eZ5Sq1-btn`: a) — abridor de combobox (ignorado)
- **Consultar** (`eZ5Su1`: button) — consulta e filtragem
- **Cancelar** (`eZ5Sv1`: button) — cancelamento/limpeza

## Colunas da Listagem
- Listagem dos Lotes
- Situação
- Unidade Organizacional
- E-mail do Destinatário

## Observações de Segurança e Automação
- Tela ZK de relatório e consulta de recomposição asfáltica (`LRS041RelatorioRecomposicaoAsfaltica.zul`).
- Contém apenas botões de consulta (`Consultar`) e controle (`Cancelar`), sem botões de escrita.

## Status
Status: inventariado
