# GPMV001 - Manobra de Registros

## Categoria
Painel Manobras / Saneago

## Tipo
Leitura e Consulta (zk)

## O que faz
Permite consultar e visualizar aberturas de ocorrência e manobras de registros por código, serviço, unidade responsável, cidade, bairro, reservatório, período de previsão de início e situação (abertas, fechadas, todas).

## URL Real / Atalho Direto
- `https://www.saneago.com.br/prt/gpm/GPM001AberturaOcorrencia.zul`

## Campos e Filtros da Tela
- **Código da Manobra** (`text` / editável): Código da Manobra.
- **Serviço** (`text` / editável): Código e descrição do serviço.
- **Unidade Responsável** (`text` / editável): Código da Unidade Responsável.
- **Cidade** (`text` / editável): Cidade da manobra.
- **Bairro** (`text` / readonly): Bairro selecionado.
- **Reservatório** (`text` / editável): Código e descrição do reservatório.
- **Previsão de Início** (`date` / editável): Data inicial da previsão de início da manobra.
- **a** (`date` / editável): Data final do período de previsão.
- **Abertas** (`radio` / editável): Filtro de manobras abertas.
- **Fechadas** (`radio` / editável): Filtro de manobras fechadas.
- **Todas** (`radio` / editável): Filtro de todas as manobras.

## Botões Disponíveis
- **Consultar**: Executa a consulta de ocorrências e manobras com os filtros informados.
- **Cancelar**: Limpa os filtros e campos da tela.

## Colunas do Resultado
- Manobra
- Serviço
- Un. Responsável
- Cidade
- Reservatório
- Bairro
- Logradouro
- Data Início
- Data Término
- Data Normalização
- Código
- Descrição
- Complemento(Quadras)
- Equipe
- Nome Responsável
- Tipo Equipe
- Categoria

## Perguntas que Responde
- "consultar manobras de registros no GPMV001"
- "pesquisar ocorrências de manobras por cidade ou reservatório"
- "verificar manobras abertas ou fechadas no painel de manobras"

## Status de Acesso
- **Acesso Confirmado**: Sim (perfil atual possui acesso e visualização da tela via menu Painel Manobras -> Cadastro -> Manobra de Registros).

---
*Documento inventariado com evidência de tela em 19/09/2026 (Status: inventariado).*
