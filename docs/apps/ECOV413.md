# ECOV413 - Controle de NFAg

## Categoria
Comercial e Atendimento ao Cliente

## Tipo
Leitura e Consulta (zk)

## O que faz
Permite consultar e visualizar informações de notas fiscais de água (NFAg) rejeitadas no sistema comercial (ECO413 - Nota Fiscal Rejeitada).

## URL Real / Atalho Direto
- `https://www.saneago.com.br/prt/eco/ECO413ConsultarNotaFiscalRejeitada.zul`

## Campos e Filtros da Tela
- **Número da Nota Fiscal** (`text` / editável): Número da Nota Fiscal.
- **Número do Documento** (`text` / editável): Número do Documento.
- **Empresa** (`combobox` / readonly): Seleção de empresa.
- **Situação da NF** (`combobox` / readonly): Situação da NF.
- **Motivo da Rejeição** (`text` / editável): Motivo da Rejeição.
- **Período** (`date` / editável): Data inicial do período.
- **a** (`date` / editável): Data final do período.

## Botões Disponíveis
- **Consultar**: Executa a consulta com os filtros informados.
- **Imprimir**: Emite relatório impresso das notas fiscais rejeitadas.
- **Cancelar**: Limpa os campos da consulta.

## Colunas do Resultado
- Conta
- Número/Séria NFAg
- Número da Fatura
- CPF/CNPJ
- Situação da NF
- NFAg
- ECO148
- ECO151
- ECO415

## Perguntas que Responde
- "consultar notas fiscais rejeitadas no ECOV413"
- "pesquisar NFAg por período ou motivo de rejeição"
- "verificar faturas e notas fiscais com rejeição no faturamento"

## Status de Acesso
- **Acesso Confirmado**: Sim (perfil atual possui acesso e visualização da tela).

---
*Documento inventariado com evidência de tela em 08/09/2026 (Status: inventariado).*
