# PERGUNTAS DE NEGÓCIO REAVALIADAS (FASE 9)

**Data:** 2026-07-22  
**Escopo:** Reavaliação das 12 perguntas de negócio da FASE 7 contra o catálogo consolidado de **596 aplicações** (índice completo) com a nova ferramenta de ranking semântico hierárquico (`src/tools/descobrir.js`).

---

## 1. Resumo Executivo das Mudanças de Veredito

| # | Pergunta de Negócio | Veredito Fase 7 (337 apps) | Veredito Fase 9 (596 apps) | App Indicada | Status |
|---|---|---|---|---|---|
| 1 | "Todas as RAs da Rua Ada Centine, no Maracanã, dos últimos 3 meses" | ECO709 (RAs por Logradouro) | ECO709 (RAs por Logradouro) | `ECO709` | **MANTIDO** |
| 2 | "Pesquisar a conta no nome de Marcos Antônio" | Não é possível (Errado) | ECO154 (Usuários por Nome) | `ECO154` | **MUDOU DE VEREDITO** (Corrigido) |
| 3 | "Histórico de leituras e consumos faturados da conta 123456" | ECO303 (Acerta Leitura/Consumo) | ECO303 / ECO113 | `ECO303` | **MANTIDO** |
| 4 | "Débitos em cobrança judicial ou títulos em cartório no CPF" | ECNV007 (Consultar Protesto) | ECO506 / ECNV007 | `ECO506` / `ECNV007` | **MANTIDO** |
| 5 | "Relatório de recomposição asfáltica pendente no Bueno em Goiânia" | LRS041 (Recomposição Asfáltica) | LRS041 (Recomposição Asfáltica) | `LRS041` | **MANTIDO** |
| 6 | "RAs abertas associadas ao número de conta de água" | ECO707 (RAs por Número de Conta) | ECO707 / ECO701 | `ECO707` | **MANTIDO** |
| 7 | "Pagamentos via PIX confirmados no sistema no período" | ECO674 (Consulta PIX) | ECO674 (Consulta PIX) | `ECO674` | **MANTIDO** |
| 8 | "Manobras de rede e fechamento de registros em Anápolis" | GPMV001 (Manobra de Registros) | GPMV001 / GPM001 | `GPMV001` | **MANTIDO** |
| 9 | "Laudos de aferição de hidrômetro registrados para a conta" | ECO213 (Aferição de Hidrômetro) | ECO213 (Aferição de Hidrômetro) | `ECO213` | **MANTIDO** |
| 10 | "Lista de processos judiciais vinculados à conta de água" | JAJ036 (Consulta Processo Conta) | JAJ036 (Consulta Processo Conta) | `JAJ036` | **MANTIDO** |
| 11 | "Comprovante e status do envio de declaração de IRPF no CPF" | BAP012 (Enviar Declaração IRPF) | BAP012 (Enviar Declaração IRPF) | `BAP012` | **MANTIDO** |
| 12 | "Atestado de Viabilidade Técnica e Operacional (AVTO) em Aparecida" | KRTV003 (Consulta AVTO) | KRTV003 (Consulta AVTO) | `KRTV003` | **MANTIDO** |

---

## 2. Detalhamento e Prova por Pergunta

### Pergunta 1: "Todas as RAs da Rua Ada Centine, no Maracanã, dos últimos 3 meses"
- **Veredito:** SIM.
- **Aplicação:** `ECO709` (RAs por Logradouro)
- **URL Real:** `https://www.saneago.com.br/prt/eco/ECO709ConsultaRALogradouro.zul`
- **Filtros Aceitos na Tela:** `cidade`, `bairro`, `logradouro`, `codigo_servico`, `periodo`
- **Colunas Retornadas:** `Número RA`, `Datas`, `Situação RA`, `Conta`, `Nome`, `Qd.`, `Lt.`, `Nº`, `Código Serviço`, `Ir p/ RA`, `Início`, `Execução`
- **Prova de Aceite:** A tela aceita os 4 filtros necessários (`logradouro: "Rua Ada Centine"`, `bairro: "Maracanã"`, `cidade`, `periodo: "últimos 3 meses"`) e lista as RAs e moradores no grid.

### Pergunta 2: "Pesquisar a conta no nome de Marcos Antônio" — **MUDANÇA DE VEREDITO**
- **Veredito:** SIM, TOTALMENTE POSSÍVEL.
- **Aplicação:** `ECO154` (Usuários por Nome)
- **URL Real:** `https://www.saneago.com.br/prt/eco/ECO154ConsultaUsuario.zul`
- **Filtros Aceitos na Tela:** `nome`, `cpf_cnpj`, `cidade`, `bairro`, `logradouro`
- **Colunas Retornadas:** `Nº Conta`, `Nome Proprietário`, `Logradouro`, `Quadra`, `Lote`, `Nº`, `Codificação.`, `Id. Conta.`, `Hidrômetro`
- **Prova de Aceite:** O veredito original da Fase 7 afirmava incorretamente que não havia tela para pesquisar contas por nome. A Fase 8 e 9 provaram que `ECO154` é a tela exata para isso: aceita o campo `Nome` (preencher "MARCOS ANTONIO") e devolve o `Nº Conta` e o `Nome Proprietário` vinculados.

### Pergunta 3: "Qual o histórico de leituras e consumos faturados da conta 123456?"
- **Veredito:** SIM.
- **Aplicação:** `ECO303` (Acerta Leitura/Consumo) / `ECO113` (Histórico de Conta Individual)
- **URL Real:** `https://www.saneago.com.br/prt/eco/ECO303AcertaLeituraConsumo.zul`
- **Filtros Aceitos na Tela:** `conta`
- **Colunas Retornadas:** `Mês/Ano`, `Data Leitura`, `Consumo`, `Motivo Crítica`, `MCF`, `MRL`
- **Prova de Aceite:** `ECO303` aceita `conta` e exibe o histórico detalhado de medições e consumos.

### Pergunta 4: "Quais os débitos em cobrança judicial ou títulos em cartório no CPF 123.456.789-00?"
- **Veredito:** SIM.
- **Aplicação:** `ECNV007` (Consultar Protesto) / `ECO506` (Débitos em Aberto/Usuário)
- **URL Real:** `https://www.saneago.com.br/prt/ecn/ECN007ConsultaProtesto.zul`
- **Filtros Aceitos na Tela:** `cpf_cnpj`
- **Colunas Retornadas:** `Conta`, `Referência`, `Documento`, `Valor`, `Data de Envio`, `Situação Atual`
- **Prova de Aceite:** `ECNV007` permite a consulta por `cpf_cnpj` e traz os títulos negativados ou protestados em cartório.

### Pergunta 5: "Qual o relatório de recomposição asfáltica pendente na cidade de Goiânia no bairro Bueno?"
- **Veredito:** SIM.
- **Aplicação:** `LRS041` (Relatório de recomposição asfáltica)
- **URL Real:** `https://www.saneago.com.br/prt/lrs/LRS041RelatorioRecomposicaoAsfaltica.zul`
- **Filtros Aceitos na Tela:** `cidade`, `bairro`, `uo`, `periodo`
- **Colunas Retornadas:** `Listagem dos Lotes`, `Situação`, `Unidade Organizacional`, `E-mail do Destinatário`
- **Prova de Aceite:** `LRS041` recebe os filtros geográficos `cidade` e `bairro` e devolve a listagem de lotes pendentes de pavimento.

### Pergunta 6: "Quais as RAs abertas associadas ao número de conta de água 987654?"
- **Veredito:** SIM.
- **Aplicação:** `ECO707` (RAs por Número de Conta) / `ECO701` (Registro de Atendimento)
- **URL Real:** `https://www.saneago.com.br/prt/eco/ECO707ConsultaRAConta.zul`
- **Filtros Aceitos na Tela:** `conta`
- **Colunas Retornadas:** `Número RA`, `Datas`, `Situação RA`, `Código Serviço`, `Início`, `Execução`
- **Prova de Aceite:** `ECO707` busca por `conta` e retorna todas as ordens de serviço / RAs vinculadas àquela conta.

### Pergunta 7: "Quais os pagamentos via PIX confirmados no sistema no período de 01/07 a 15/07?"
- **Veredito:** SIM.
- **Aplicação:** `ECO674` (Consulta PIX)
- **URL Real:** `https://www.saneago.com.br/prt/eco/ECO674ConsultaPix.zul`
- **Filtros Aceitos na Tela:** `periodo`
- **Colunas Retornadas:** `Lista de Pix Efetivados`, `Id Transação`, `Conta`, `Documento`, `Valor`, `Data de Envio`
- **Prova de Aceite:** `ECO674` filtra por `periodo` e exibe o extrato de liquidação de pagamentos PIX.

### Pergunta 8: "Quais as manobras de rede e fechamento de registros cadastrados para a cidade de Anápolis?"
- **Veredito:** SIM.
- **Aplicação:** `GPMV001` (Manobra de Registros)
- **URL Real:** `https://www.saneago.com.br/prt/gpm/GPM001ManobraRegistros.zul`
- **Filtros Aceitos na Tela:** `cidade`, `bairro`, `codigo_servico`
- **Colunas Retornadas:** `Manobra`, `Serviço`, `Un. Responsável`, `Cidade`, `Reservatório`, `Data Início`, `Data Término`
- **Prova de Aceite:** `GPMV001` recebe `cidade` e lista os registros operacionais de manobra de rede de água.

### Pergunta 9: "Quais os laudos de aferição de hidrômetro registrados para a conta 456789?"
- **Veredito:** SIM.
- **Aplicação:** `ECO213` (Aferição de Hidrômetro)
- **URL Real:** `https://www.saneago.com.br/prt/eco/ECO213AfericaoHidrometro.zul`
- **Filtros Aceitos na Tela:** `conta`
- **Colunas Retornadas:** `Laudo`, `Ano`, `Hidrômetro`, `Data da Solicitação`, `Data da Emissão`, `Resultado dos Ensaios`
- **Prova de Aceite:** `ECO213` recebe `conta` e expõe laudos de testes bancada em medidores.

### Pergunta 10: "Qual a lista de processos judiciais vinculados à conta de água 112233?"
- **Veredito:** SIM.
- **Aplicação:** `JAJ036` (Consulta Processo Conta)
- **URL Real:** `https://www.saneago.com.br/prt/jaj/JAJ036ConsultaProcessoConta.zul`
- **Filtros Aceitos na Tela:** `conta`
- **Colunas Retornadas:** `Processo`, `Data Ajuizamento`, `Situação`, `Resultado`
- **Prova de Aceite:** `JAJ036` recebe `conta` e lista os autos de processos jurídicos anexados à conta.

### Pergunta 11: "Qual o comprovante e status do envio de declaração de IRPF para o CPF 123.456.789-00?"
- **Veredito:** SIM.
- **Aplicação:** `BAP012` (Enviar Declaração IRPF)
- **URL Real:** `https://www.saneago.com.br/prt/bap/BAP012EnviarDeclaracaoIRPF.zul`
- **Filtros Aceitos na Tela:** `cpf_cnpj`
- **Colunas Retornadas:** `Sequencial`, `Data Envio`, `Tipo Documento`, `Competência`, `Status Recebimento`
- **Prova de Aceite:** `BAP012` aceita o `cpf_cnpj` e valida a remessa de comprovantes de IRPF de colaboradores.

### Pergunta 12: "Quais as análises e processos de AVTO na cidade de Aparecida de Goiânia?"
- **Veredito:** SIM.
- **Aplicação:** `KRTV003` (Consulta AVTO)
- **URL Real:** `https://www.saneago.com.br/prt/krt/KRT003ConsultarAvto.zul`
- **Filtros Aceitos na Tela:** `cidade`, `bairro`, `logradouro`, `periodo`, `cpf_cnpj`
- **Colunas Retornadas:** `Dias na Unidade`, `Número`, `Ano`, `Cidade`, `Parecer de Água`, `Parecer de Esgoto`, `Prazo Final`, `Situação`, `U.O.`, `Empreendedor`
- **Prova de Aceite:** `KRTV003` filtra por `cidade` e exibe o parecer técnico de viabilidade de água/esgoto para empreendimentos.
