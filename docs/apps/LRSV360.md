# LRSV360 - Materiais Utilizados do SIPSAP

## Categoria
Logística, Redes e Serviços de Campo / Saneago

## Tipo
Relatório Operacional (misto)

## O que faz
Gera relatório de materiais utilizados do SIPSAP agrupados por serviço ou material, abrangência geográfica (Estado/Regional/Distrito) e período (mês/ano).

## URL Real / Atalho Direto
- `https://www.saneago.com.br/prt/lrs/LRS360ResumoMaterial.zul`

## Campos e Filtros da Tela
- **Mês/Ano** (hQbC10-real: input de data, editável)
- **Estado** (hQbC60-real: radio, editável)
- **Regional** (hQbC80-real: radio, editável)
- **Distrito** (hQbCa0-real: radio, editável)
- **Serviço** (hQbCq1-real: radio, editável)
- **Material** (hQbCs1-real: radio, editável)
- **Serviço** (hQbCc4: input de texto, editável)
- **Serviço** (hQbCq2-real: input de texto, readonly)

## Botões Disponíveis
- **Sem Rotulo** (`hQbC10-btn`: a) — abridor de calendário/data (ignorado)
- **Sem Rotulo** (`hQbCq2-btn`: a) — abridor de combobox/pesquisa (ignorado)
- **Imprimir** (`hQbC_4`: button) — emissão do relatório em tela/impressão
- **Cancelar** (`hQbC04`: button) — cancelamento/limpeza

## Observações de Segurança e Automação
- Tela ZK de emissão de relatório de materiais utilizados (`LRS360ResumoMaterial.zul`).
- Não contém botões de gravação ou alteração de dados, apenas botões de emissão (`Imprimir`) e cancelamento (`Cancelar`).

## Status
Status: inventariado
