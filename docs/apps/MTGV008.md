# MTGV008 - Consultar Remessas Capturadas

## Categoria
Transmissão e Recepção de Arquivos / Remessas

## Tipo
Leitura e Consulta (zk)

## O que faz
Permite consultar e listar remessas capturadas no sistema de transmissão e recepção de arquivos da Saneago, com filtros por tipo de remessa (Leitura, Retidas, Entrega Alternativa), distrito, grupo, referência e status de captura.

## URL Real / Atalho Direto
- `https://www.saneago.com.br/prt/mtg/MTG008ConsultarRemessasCapturadas.zul`

## Campos e Filtros da Tela
- **Leitura** (`radio` / editável): Opção de tipo de remessa Leitura.
- **Retidas** (`radio` / editável): Opção de tipo de remessa Retidas.
- **Entrega Alternativa** (`radio` / editável): Opção de tipo de remessa Entrega Alternativa.
- **Distrito** (`text` / editável): Código do distrito.
- **Distrito** (`text` / readonly): Descrição e seleção do distrito.
- **Grupo** (`text` / editável): Grupo de faturamento.
- **Referência** (`date` / editável): Mês e ano de referência da remessa.
- **Capturados** (`radio` / editável): Filtro por arquivos capturados.
- **Disponíveis** (`radio` / editável): Filtro por arquivos disponíveis.
- **Todos** (`radio` / editável): Filtro por todos os status de remessa.

## Botões Disponíveis
- **Consultar**: Executa a busca de remessas capturadas com base nos filtros informados.
- **Cancelar**: Limpa os campos da consulta e reinicia o formulário.

### Botões Ignorados
- `Sem Rotulo` (gatilhos de abertura de combobox / calendário ZK).

## Colunas do Resultado
- Distrito
- Cidade
- Grupo
- Arquivo
- Matrícula
- Status
- Data/Hora de Geração
- Data/Hora de Acesso
- Qtde. Contas
- Com Hidrômetro
- Sem Hidrômetro
- Reaviso
- Tx. Res. Sólidos
- Total

## Perguntas que Responde
- "consultar remessas capturadas no MTGV008"
- "pesquisar arquivos de leitura e retidas por distrito e referência"
- "verificar remessas disponíveis e capturadas"

## Status de Acesso
- **Acesso Confirmado**: Sim (perfil atual possui acesso e visualização da tela via Transmissao Rec.Arquivos -> Remessas -> Consultar Remessas Capturadas).

---
*Documento inventariado com evidência de tela em 19/09/2026 (Status: inventariado).*
