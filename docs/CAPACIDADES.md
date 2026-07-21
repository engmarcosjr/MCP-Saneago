# Mapa de Capacidades por Vertical — Saneago

Este documento apresenta o mapa completo de capacidades consultáveis do portal Saneago, organizado por vertical de negócio e derivado da varredura semântica.

## Resumo Geral de Capacidades

- **Total de Aplicações Mapeadas:** 337
- **Confiabilidade Alta (Filtros + Retornos):** 61
- **Confiabilidade Média (Filtros ou Retornos):** 102
- **Confiabilidade Baixa (Sem filtros/retornos identificados):** 174
- **Aplicações com Erro de Captura:** 10

## Comercial & Atendimento ao Cliente (71 apps)

| Código | Nome da Aplicação | Filtros Aceitos | O que Retorna |
|---|---|---|---|
| **EACV005** | Protocolo de Atendimento | - | - |
| **EACV800** | Atendimento | - | - |
| **ECAV001** | Distribuição de Rotas | cidade, periodo, bairro, logradouro | Rota, Sequência, Conta, Logradouro, Número (+5) |
| **ECAV002** | Rel. de Produtividade do Recadastramento | - | - |
| **ECAV003** | Planejamento de Recadastramento | - | - |
| **ECAV004** | Autorizar Rotas para Distribuição | cidade, periodo | Rota, Total de Contas |
| **ECNV003** | Enviar Fatura por Conta | - | - |
| **ECNV004** | Enviar Fatura em Massa | - | - |
| **ECNV005** | Gerenciar Protesto | periodo | Conta, Referência, Fatura, Vencimento, Titularidade (+3) |
| **ECNV006** | Relatório | - | - |
| **ECNV007** | Consultar Protesto | cpf_cnpj | Conta, Referência, Documento, Valor, Data de Envio (+3) |
| **ECO010** | Solicitar Titularidade | conta, ra | Data/Hora de Solicitação, Nome Titular, Tipo Pessoa, CPF/CNPJ Titular, Início Contrato (+20) |
| **ECO021** | Alterar CPF/CNPJ Débito | conta | Sequencial, Motivo, Solicitante, Situação, Data/Hora Solicitação (+9) |
| **ECO131** | Atividades | data, cidade | Cidade, Job, Grupo, Referência, Qtd.Reg (+8) |
| **ECO135** | Atualiza CEP de Usuários | cidade, bairro, logradouro | - |
| **ECO160** | Alterar em Massa Grupo e Rota | cidade | Sequência......Conta, Grupo Faturamento ..... Rota |
| **ECO186** | Análise de Recadastramento | cidade, periodo | Grupo Faturamento, Rota, Sequência, Conta, Visualizar Cadastro (+1) |
| **ECO201** | Cadastramento de Hidrômetros | hidrometro | - |
| **ECO213** | Aferição de Hidrômetro | conta | Consultar, Laudo, Ano, Hidrômetro, Data da Solicitação (+17) |
| **ECO285** | Comunicação Aos Clientes Para Lacração | conta, cidade, bairro, logradouro | - |
| **ECO286** | Comunicado de Inst./Subst./Ret. | ra, conta, cidade, hidrometro | - |
| **ECO303** | Acerta Leitura/Consumo | conta | Ft., Mês/Ano, Data Leitura, Motivo Crítica, MCF (+16) |
| **ECO309** | Segunda Crítica de Consumo/Leitura | cidade | Pesquisar Conta(s):, Conta, Diferença, ECO303, Analisado (+6) |
| **ECO343** | Beneficiário Prêmio/Irregularidade | cidade, uo | - |
| **ECO348** | Cadastramento Grande Gerador | cpf_cnpj, conta | - |
| **ECO385** | Anormalidades não Criticadas na CO359 | cidade | Pesquisar Contas:, Rota, Sequencial, Conta, Crítica (+3) |
| **ECO404** | Cadastramento de Tarifas | - | - |
| **ECO410** | Cancelamento de Débito/Crédito | cpf_cnpj, conta | Número, Situação, Conta, Data Emissão, Data Venc. (+2) |
| **ECO411** | Abertura de Financiamento | conta | - |
| **ECO489** | Comunicado de Esgoto Sanitário | conta, cidade, bairro, logradouro, codigo_servico | - |
| **ECO495** | Acompanhamento de Refaturamento | conta, periodo, cidade, matricula, nome | Conta, Data Refa., Resp, Mês/Ano, Mot (+9) |
| **ECO510** | Comunicado de Débito | periodo, bairro, conta | Situação Água, Conta, Nome, Endereço, Codificação (+1) |
| **ECO538** | Anormalidades no Corte/Ocorrência | cidade, bairro, logradouro | - |
| **ECO553** | Acompanhamento de OSR e Religação | nome, periodo | - |
| **ECO568** | Clientes com débitos isolados | cidade | Pesquisar Conta:Limpar, Conta, Documento Fiscal, Ref. Débito, Nome (+4) |
| **ECO607** | Arrecadação Diária por Banco | periodo | Ordem, Código, Nome do Agente Arrecadador, Valor SANEAGO em R$, Valor CAESB em R$ (+4) |
| **ECO609** | Débitos Baixados de Usuários | conta | CPF/CNPJ, Cliente, Data Inicio Vínculo, Data Fim Vínculo, Vínculo (+9) |
| **ECO644** | Arrecadação Contábil/Cidade | cidade | - |
| **ECO674** | Consulta PIX | periodo | Lista de Pix Efetivados, Id Transação, Conta, Documento, Valor (+10) |
| **ECO701** | Registro de Atendimento | ra, conta | - |
| **ECO706** | Códigos de Serviço | codigo_servico | Código, Descrição, Prazo de Atendimento, Situação Atual |
| **ECO707** | RAs por Número de Conta | conta | Número RA, Datas, Situação RA, Código Serviço, ECO701 (+3) |
| **ECO709** | RAs por Logradouro | cidade, bairro, logradouro, codigo_servico, periodo | Número RA, Datas, Situação RA, Conta, Nome (+7) |
| **ECO712** | História do Usuário | conta | ATENÇÃO |
| **ECO725** | Estatística Serviços Exec./Cidade | cidade, uo, periodo | - |
| **ECO731** | Alteração e Impressão de RA | uo | RA, Código Serviço |
| **ECO808** | Áreas de Inf. dos Reservatórios | - | - |
| **ECO811** | Doc. do Macroprocesso de Comercialização | - | - |
| **ECO815** | Coletânea de Diretrizes Comerciais | - | - |
| **ECO825** | Coletânea Regulação dos Serviços | - | Nome, Descrição |
| **ECO954** | Painel de Religação | - | - |
| **ECO962** | Painel de Cortes | - | - |
| **ECOV010** | Solicitar Titularidade | conta, ra | Data/Hora de Solicitação, Nome Titular, Tipo Pessoa, CPF/CNPJ Titular, Início Contrato (+20) |
| **ECOV112** | Relaciona Contas Condomínio | - | - |
| **ECOV411** | Abertura de Financiamento | conta | - |
| **ECOV413** | Controle de NFAg | - | - |
| **ECOV830** | WEBCOM - Vídeo Aulas | - | - |
| **ECSV006** | Erros do Distrito por Período | periodo | Ligação, Hidrômetro, Erro, Pesquisar Conta(s):, Conta |
| **ECSV007** | Gerar Planilha | - | - |
| **ECSV008** | Apontamento de Erros | periodo, codigo_servico | - |
| **ECSV009** | Gerenciar Planilha de Controle | periodo | Contrato, Distrito, Geração, Aprovação, N° Lote (+7) |
| **ECSV010** | Gerar Resumo do Faturamento | periodo | Resumo Faturamento, Planilha SAP, Listagem, Código, Nome |
| **EGWV001** | Contrato Comercial | - | - |
| **EGWV003** | Consumo Master por Cidade | cidade, bairro | - |
| **EGWV004** | Compara Consumos Medidos | cidade | - |
| **EGWV005** | Resumo de Faturamento | - | - |
| **EGWV006** | Controle do Envio do Resumo | - | - |
| **EGWV305** | Contratos a Vencer | - | Contrato, Aditivo, Cliente, Demanda Água, Demanda Esgoto |
| **EGWV313** | Consumo e Faturamento Individualizados | - | - |
| **EGWV401** | Cliente por Faixa de Consumo | - | - |
| **EGWV402** | Faturamento | - | - |

## Operacional, Redes & Manutenção (77 apps)

| Código | Nome da Aplicação | Filtros Aceitos | O que Retorna |
|---|---|---|---|
| **GPMV001** | Manobra de Registros | codigo_servico, cidade, bairro | Manobra, Serviço, Un. Responsável, Cidade, Reservatório (+12) |
| **GPMV002** | Manobra | - | - |
| **GPMV003** | Seleciona Valvula | - | - |
| **GPMV005** | Consulta Área Influência | - | - |
| **GPMV006** | Área Afetada | - | - |
| **GPMV007** | Inclui Área Afetada não Prevista | cidade, bairro, ra | - |
| **GPMV010** | Registro Fechado | - | - |
| **GPMV015** | Registro Fechado por Período | - | - |
| **GPMV016** | Paralisação/Intermitência | - | - |
| **GPMV020** | Consulta Registro a Ser Fechado | - | - |
| **LENV110** | Unidades Consumidoras de Energia | - | - |
| **LENV145** | Interrupção de Energia | - | - |
| **LENV146** | Interrupção de Energia | - | - |
| **LIG002** | Mapa Web SanSIG | - | - |
| **LIGV002** | Mapa Web SanSIG | - | - |
| **LRS010** | Distribuição de Serviço | data | Equipe, Nome Responsável, Tipo Equipe, Categoria, Código (+7) |
| **LRS013** | Extravazamento de Esgoto Sanitario | - | - |
| **LRS017** | Cadastrar situação do distrito SIPSAP | data | - |
| **LRS019** | Índices do SIPSAP | - | - |
| **LRS021** | Extravasamento de Esgoto | - | - |
| **LRS041** | Relatório de recomposição asfáltica | cidade, bairro, uo, periodo | Listagem dos Lotes, Situação, Unidade Organizacional, E-mail do Destinatário |
| **LRS100** | Manter estoque de Material por viatura | - | Frota, Placa, Marca, Modelo, Cor (+15) |
| **LRS105** | Lançamento de serviços executados | codigo_servico | RA, Programação, Data Solicitação, Serviço Solicitação, Serviço Resposta (+11) |
| **LRS130** | Equipes | - | Código da Equipe, Nome do Responsável, Tipo de Equipe, Equipe |
| **LRS208** | Consulta RA's com D.S. | ra | Número Distribuição, Sequencia, Código Serviço Resposta, Código Serviço Retorno, Data Emissão (+3) |
| **LRS272** | Acompanhar Atendimento | data | - |
| **LRS301** | Relação Mensal Duração Serviço Encerrado | codigo_servico | - |
| **LRS314** | Análise tempo padrão/execução/perfomance | periodo | - |
| **LRS360** | Materiais Utilizados do SIPSAP | codigo_servico | - |
| **LRS363** | Relação Mensal de Serviços Atendidos | periodo | - |
| **LRS702** | Emite Serviços Executados em Atraso | codigo_servico | - |
| **LRS731** | Atendimento P/ Atendente e Período | periodo, matricula | - |
| **LRS732** | Atendimento Por Período | periodo | - |
| **LRS733** | Atendimento Por Cidade | periodo, cidade | - |
| **LRS734** | Atendimento Por Código de Serviço | periodo, codigo_servico | - |
| **LRSV002** | RA Pendente | periodo | N° RA, Conta, Serviço, Data Solicit., Data Ult. Rep. (+2) |
| **LRSV009** | Monitoramento de Atendimento | codigo_servico, uo, periodo | Serviço, Descrição, Número do RA, U.O, Código da Equipe (+9) |
| **LRSV010** | Distribuição de Serviço | - | - |
| **LRSV012** | Serviço Executado no Interior | - | - |
| **LRSV013** | Extravazamento de Esgoto Sanitario | - | - |
| **LRSV014** | Paralisações no Abastecimento de Água | - | - |
| **LRSV015** | Ocorrências de Esgoto por RA | - | - |
| **LRSV016** | Ocorrências de Esgoto por Endereço | - | - |
| **LRSV017** | Cadastrar situação do distrito SIPSAP | data | - |
| **LRSV018** | Serviços Executados no Interior | - | - |
| **LRSV019** | Índices do SIPSAP | - | - |
| **LRSV020** | Paralisações no Abastecimento de Água | - | - |
| **LRSV021** | Extravasamento de Esgoto | - | - |
| **LRSV022** | Serviços Comerciais Executados | - | - |
| **LRSV024** | Indicadores do SIPSAP por Período | - | - |
| **LRSV030** | Serviço resposta por serviço solicitação | codigo_servico | Código, Descrição, Data Vínculo, Remover, Serviço Solicitação (+4) |
| **LRSV034** | Validar Corte de Asfalto | - | Distrito, Dt. Exec, RA Corte Asf., RA Orig., Larg. (+8) |
| **LRSV036** | Resumo de Vazamentos | - | - |
| **LRSV037** | Serviço executado por conta | - | - |
| **LRSV041** | Relatório de recomposição asfáltica | - | - |
| **LRSV100** | Manter estoque de Material por viatura | - | Frota, Placa, Marca, Modelo, Cor (+15) |
| **LRSV105** | Lançamento de serviços executados | - | - |
| **LRSV130** | Equipes | - | Código da Equipe, Nome do Responsável, Tipo de Equipe, Equipe |
| **LRSV208** | Consulta RA's com D.S. | ra | Número Distribuição, Sequencia, Código Serviço Resposta, Código Serviço Retorno, Data Emissão (+3) |
| **LRSV272** | Acompanhar Atendimento | - | - |
| **LRSV301** | Relação Mensal Duração Serviço Encerrado | - | - |
| **LRSV314** | Análise tempo padrão/execução/perfomance | periodo | - |
| **LRSV330** | Resumo dos Serviços | - | - |
| **LRSV360** | Materiais Utilizados do SIPSAP | - | - |
| **LRSV363** | Relação Mensal de Serviços Atendidos | periodo | - |
| **LRSV701** | Relação de Serviços Executados | uo, periodo, codigo_servico | N° RA, N° Seq, Conta, Cod. Seviço, Serviço (+14) |
| **LRSV702** | Emite Serviços Executados em Atraso | codigo_servico | - |
| **LRSV730** | Atendimento Serv. p/ UO e Período | periodo | - |
| **LRSV731** | Atendimento P/ Atendente e Período | periodo, matricula | - |
| **LRSV732** | Atendimento Por Período | periodo | - |
| **LRSV733** | Atendimento Por Cidade | periodo, cidade | - |
| **LRSV734** | Atendimento Por Código de Serviço | periodo, codigo_servico | - |
| **LRSV735** | RA-RI por Cidade e Bairro | periodo, cidade, codigo_servico | - |
| **MPSV005** | Cadastro de Cidade | cidade, nome | - |
| **MPSV540** | Logradouro | cidade, logradouro | Código, Tipo, Logradouro |
| **MPSV541** | Relaciona Logradouro - Bairro | cidade, logradouro | Código, Tipo, Logradouro |
| **MPSV543** | Cep Correios | cidade, logradouro | Código, Tipo, Logradouro |

## Jurídico & Processos (11 apps)

| Código | Nome da Aplicação | Filtros Aceitos | O que Retorna |
|---|---|---|---|
| **JAJ028** | Consulta Judicial | conta | - |
| **JAJ033** | Agenda Audiência | periodo | - |
| **JAJ036** | Consulta Processo Conta | conta | Processo, Data Ajuizamento, Situação, Resultado |
| **JAJ042** | Consulta Cobrança | - | - |
| **JAJ060** | Rodízio de Processos | cidade | Contas, Usuário, Nº Proc., Vara, Valor Ajuiz.(R$) (+6) |
| **JAJV028** | Consulta Judicial | conta | - |
| **JAJV033** | Agenda Audiência | periodo | - |
| **JAJV036** | Consulta Processo Conta | conta | Processo, Data Ajuizamento, Situação, Resultado |
| **JAJV042** | Consulta Cobrança | - | - |
| **JAJV044** | Relatório de Contas Com o Escritório | - | - |
| **JAJV060** | Rodízio de Processos | - | - |

## Recursos Humanos & Gestão de Pessoal (37 apps)

| Código | Nome da Aplicação | Filtros Aceitos | O que Retorna |
|---|---|---|---|
| **A0009** | CAESAN | - | - |
| **A0074** | EMP.LIC.INTER.PARTICULAR-SUREH | - | - |
| **A3000** | CHEFE DE GABINETE | - | - |
| **BAP002** | Contracheque | - | - |
| **BAP004** | Atualização CTPS | data | - |
| **BAP005** | Emissão de Frequência | - | Código, Unidade Organizacional, Sigla |
| **BAP008** | Comprovante de Rendimentos | - | - |
| **BAP012** | Enviar Declaração IRPF | cpf_cnpj | Selecione, Sequencial, Data Envio, Tipo Documento, Competência (+3) |
| **BAP025** | Agendamento/Alteração de Férias | periodo | - |
| **BAP028** | Enviar Nota Fiscal | codigo_servico, data, cpf_cnpj | Nome, Idade, Cálculo IRRF, Referência Pagamento, Referência Serviço (+9) |
| **BAP032** | Definir Adiantamento de 13° Salário | - | - |
| **BAPV002** | Contracheque | - | - |
| **BAPV004** | Atualização CTPS | - | - |
| **BAPV005** | Emissão de Frequência | - | - |
| **BAPV008** | Comprovante de Rendimentos | - | - |
| **BAPV012** | Enviar Declaração IRPF | cpf_cnpj | Selecione, Sequencial, Data Envio, Tipo Documento, Competência (+3) |
| **BAPV025** | Agendamento/Alteração de Férias | - | - |
| **BAPV028** | Enviar Nota Fiscal | - | - |
| **BAPV030** | Escala de Férias | - | - |
| **BAPV032** | Definir Adiantamento de 13° Salário | - | - |
| **BPAV001** | Plano de Lotação | - | Martícula, Nome, Cargo, U.O Contábil, Situação Empregado |
| **BPAV004** | Gestão de Empregados no Teletrabalho | - | - |
| **BPAV005** | Reporte de Atividades de Teletrabalho | - | - |
| **BPAV006** | Painel de Empregados em Teletrabalho | - | - |
| **BPAV354** | Avaliação do Empregado | - | - |
| **BPAV356** | Resultado Avaliação de Desempenho | - | - |
| **BPAV358** | Relatório Avaliação de Desempenho | uo | - |
| **BPAV359** | Autoavaliação de Desempenho | - | - |
| **BPAV360** | Avaliação de Desempenho dos Gestores | - | - |
| **BPAV361** | Gerenciamento e Devolutiva - Avaliaçoes | - | - |
| **BPAV372** | Inscrição PDV | - | - |
| **BPAV373** | Ranking PDV | - | - |
| **BPAV433** | Histórico Funcional | data, cpf_cnpj, uo | - |
| **BPAV604** | Painel da Trilha | - | - |
| **G0064** | GERÊNCIA DE PLANEJAMENTO DE RECURSOS HUMANOS | - | - |
| **S0072** | SUPER. DE RECURSOS HUMANOS | - | - |
| **S0087** | CHEFIA DE GABINETE | - | - |

## Financeiro, Contabilidade & Licitações (18 apps)

| Código | Nome da Aplicação | Filtros Aceitos | O que Retorna |
|---|---|---|---|
| **FGC025** | Consulta Processo Licitatório | - | Código, Nome |
| **FGC028** | Fornecedor | - | Representante Legal |
| **FGC037** | Contratos por UO, Cidade, Forn. e Gestor | uo, cidade, periodo | Ordem, U.O., Contrato, Processo, Fornecedores (+12) |
| **FGC068** | Consulta Contrato Saneago x SAP | - | - |
| **FGC303** | Contratos por Gestor | - | - |
| **FGCV001** | Requisição Obras/Serviços | - | - |
| **FGCV018** | Processo | - | - |
| **FGCV025** | Consulta Processo Licitatório | - | - |
| **FGCV026** | Requisição Obras/Serviços | - | - |
| **FGCV028** | Fornecedor | - | Representante Legal |
| **FGCV032** | Requisições por UO | - | - |
| **FGCV033** | Requisições por Gestor | - | - |
| **FGCV037** | Contratos por UO, Cidade, Forn. e Gestor | - | - |
| **FGCV052** | Orçamento de Programas | - | Relatório Orçamentário por Categoria, Código, Orçamento, Comprometido Atual, Saldo (+8) |
| **FGCV068** | Consulta Contrato Saneago x SAP | - | - |
| **FGCV303** | Contratos por Gestor | - | - |
| **FGIV005** | Consulta de documentos digitalizados | - | - |
| **FGOV002** | Fale com Compliance | matricula | - |

## Ouvidoria & Governança (6 apps)

| Código | Nome da Aplicação | Filtros Aceitos | O que Retorna |
|---|---|---|---|
| **MGOV012** | Providência - UO Responsável | - | - |
| **MGOV021** | Registro de Ocorrência por Vencimento | - | - |
| **MGOV029** | Encaminhamento de RO | periodo, uo, cidade | Data, Reg./Ano, N.º Encam., Data Encam., Cidade (+6) |
| **MGOV033** | Registro de Ocorrência Pendente | - | - |
| **MGOV050** | Painel Estatístico Ouvidoria | - | - |
| **MGOV059** | Áreas Setoriais OGE | uo | Código, Descrição, Código Área Atuação OGE |

## Suprimentos & Logística (17 apps)

| Código | Nome da Aplicação | Filtros Aceitos | O que Retorna |
|---|---|---|---|
| **MTG001** | Capturar Remessa | - | Data/Hora, Tamanho, Tipo, Nome, Ação |
| **MTG006** | Andamento Geral | - | - |
| **MTG008** | Consultar Remessas Capturadas | - | - |
| **MTG009** | Consultar Retornos Enviados | - | Cidade, Distrito, Nome, Sequencial, Data/Hora Envio |
| **MTG011** | Arquivos Retorno com Erros | - | Data/Hora, Tamanho, Tipo, Nome, Ação |
| **MTG020** | Consulta Fila de Relatórios PDF | nome, periodo | Arquivo, Data/Hora Criacao, Ultima Visualizacao, Tamanho, Tipo (+1) |
| **MTGV001** | Capturar Remessa | - | Data/Hora, Tamanho, Tipo, Nome, Ação |
| **MTGV002** | Enviar Retorno | - | Sequenciais Esperados, Distrito, Leitura/Reaviso, Retidas, Entrega Alternativas (+3) |
| **MTGV005** | Remessas Capturadas | - | Data/Hora, Tamanho, Tipo, Nome, Ação |
| **MTGV006** | Andamento Geral | - | - |
| **MTGV008** | Consultar Remessas Capturadas | - | - |
| **MTGV009** | Consultar Retornos Enviados | - | - |
| **MTGV010** | Sequencial Esperado | - | Próximos Sequenciais Esperados - Arquivos de Retorno, Leitura, Retidas, Entrega Alternativas |
| **MTGV011** | Arquivos Retorno com Erros | - | Data/Hora, Tamanho, Tipo, Nome, Ação |
| **MTGV012** | Logs de Erros Arq Retorno | - | Data/Hora, Tamanho, Tipo, Nome, Ação |
| **MTGV016** | Controle de Religações | - | - |
| **MTGV020** | Consulta Fila de Relatórios PDF | - | - |

## Transportes & Gestão de Frota (14 apps)

| Código | Nome da Aplicação | Filtros Aceitos | O que Retorna |
|---|---|---|---|
| **PGTV301** | Cadastro de Veículo | - | - |
| **PGTV401** | Cadastro de Motorista | - | - |
| **PGTV500** | Nova Ordem de Tráfego | - | - |
| **PGTV504** | Registro Offline | - | - |
| **PGTV505** | Resumo | - | - |
| **PGTV507** | Ordem de Tráfego em Reserva | codigo_servico | Número, Início Deslocamento, Término Deslocamento, Uo Solicitante, Data Solictação (+4) |
| **PGTV510** | Atendimento | codigo_servico | Número, Início Deslocamento, Término Deslocamento, Uo Solicitante, Data Solictação (+4) |
| **PGTV511** | Empregados Ordem de Tráfego | - | Empregados Envolvidos, Matrícula, Nome |
| **PGTV909** | Veículos Próprios | - | - |
| **PGTV910** | Gastos por Periodo | periodo | - |
| **PGTV912** | Ordens de Tráfego p/ Período e Situação | - | - |
| **PGTV916** | Motoristas | - | - |
| **PGTV917** | Veiculos Alugados | - | - |
| **PGTV918** | Ordem de tráfego por motorista | matricula, periodo | - |

## Patrimônio & Bens (9 apps)

| Código | Nome da Aplicação | Filtros Aceitos | O que Retorna |
|---|---|---|---|
| **HFI001** | Registrar Inventário de Bens | - | Lista de bens sob sua responsabilidade, Nº Inventário, Nº Patrimônio, Descrição, Centro de Custo (+3) |
| **HFI032** | Acompanhar Transf. de Bens Patrimoniais | periodo | Nº Transferência, Data da Solicitação, Responsável - Origem, Responsável - Destino, Data de Conclusão (+4) |
| **HFI033** | Registrar Parecer Transferências de Bens | periodo | Nº Inventário, Nº Patrimônio, Descrição, UO Destino, Parecer |
| **HFI034** | Consulta de Bens Patrimoniais | - | - |
| **HFIV001** | Registrar Inventário de Bens | - | Lista de bens sob sua responsabilidade, Nº Inventário, Nº Patrimônio, Descrição, Centro de Custo (+3) |
| **HFIV031** | Solicitar Transferência Bem Patrimonial | - | Nº Inventário, Nº Patrimônio, Descrição |
| **HFIV032** | Acompanhar Transf. de Bens Patrimoniais | - | - |
| **HFIV033** | Registrar Parecer Transferências de Bens | - | - |
| **HFIV034** | Consulta de Bens Patrimoniais | - | - |

## Viagens & Diárias (11 apps)

| Código | Nome da Aplicação | Filtros Aceitos | O que Retorna |
|---|---|---|---|
| **HVW001** | Distância entre cidade | cidade | Origem, Destino, Distância (km) |
| **HVW009** | Conta | data, matricula | - |
| **HVW031** | Impressão Termo | - | - |
| **HVW034** | Fornecedor por Despesa | cidade | - |
| **HVWV001** | Distância entre cidade | cidade | Origem, Destino, Distância (km) |
| **HVWV006** | Solicitação Viagem | - | - |
| **HVWV009** | Conta | - | - |
| **HVWV018** | Manter Empregados com Cartão Viagem | - | - |
| **HVWV019** | Manutenção | - | - |
| **HVWV031** | Impressão Termo | - | - |
| **HVWV050** | Prestar Contas Cartão Corporativo | - | - |

## Qualidade da Água & Laboratório (23 apps)

| Código | Nome da Aplicação | Filtros Aceitos | O que Retorna |
|---|---|---|---|
| **KOCV004** | Previsto X Executado | ra | Código, Descrição, Previsto, Executado |
| **KOCV005** | Consulta Empreendimento | - | - |
| **KRT003** | Consulta AVTO | - | - |
| **KRT028** | Lista para Análise | - | Dias na Unidade, Número AVTO, Ano AVTO, Cidade, Parecer de Água (+7) |
| **KRT029** | Análise e Encaminhamento | - | Dias na Unidade, Número AVTO, Ano AVTO, Cidade, Parecer de Água (+7) |
| **KRT037** | Relatórios Gerenciais | - | - |
| **KRTV003** | Consulta AVTO | cidade, bairro, logradouro, periodo, cpf_cnpj | Dias na Unidade, Número, Ano, Cidade, Parecer de Água (+8) |
| **KRTV028** | Lista para Análise | - | Dias na Unidade, Número AVTO, Ano AVTO, Cidade, Parecer de Água (+7) |
| **KRTV037** | Relatórios Gerenciais | - | - |
| **LQAV028** | Cadastro de Mananciais/Bacias | - | - |
| **LQAV036** | DADOS PARA CONSTRUÇÃO DO RELAT SISÁGUA | - | - |
| **LQAV071** | Demonstrativo Qtdes de Contas por Bairro | cidade | - |
| **LQAV079** | IQA Anual | - | - |
| **LQAV081** | Gráfico do IQA Médio por Cidade | - | - |
| **LQAV082** | Irregularidades | cidade, periodo | - |
| **LQAV083** | Resumo das Irregularidades | - | - |
| **LQEV018** | Cadastro de Ocorrêcias nas Amostras | - | - |
| **LQEV025** | Consultar Amostras | - | - |
| **LQEV027** | Laudos Laboratoriais | - | - |
| **LQEV028** | Ocorrências nas Análises | - | - |
| **LQEV029** | Amostras Liberadas por Período | - | - |
| **LQEV030** | Resultados das Análises - Planilha | - | - |
| **LQEV039** | Relatório do IQEt por data | - | - |

## TI, Sistemas & Infraestrutura (37 apps)

| Código | Nome da Aplicação | Filtros Aceitos | O que Retorna |
|---|---|---|---|
| **AGDV001** | Consulta de RDs | - | - |
| **BTWV001** | Pedido | - | - |
| **BTWV002** | Pedidos Por Período | - | - |
| **BTWV022** | Pedidos Por Empregado | - | - |
| **BTWV024** | Pedidos desta Unidade e UOs Inferiores | periodo | - |
| **BTWV025** | Pedidos desta Unidade Organizacional | - | - |
| **BTWV055** | Avaliação de Eficácia do Treinamento | matricula | - |
| **BTWV057** | Consulta Cronograma de Treinamento | - | - |
| **BTWV062** | Treinamento por Empregado | periodo | - |
| **GCAV001** | Atividades | periodo | - |
| **GCAV002** | Atividades Diárias | periodo | - |
| **GCAV003** | Melhorias Previstas | - | - |
| **GMQV001** | Notificação | uo | - |
| **GSIV005** | Solicitações | - | - |
| **GSIV006** | Escolha de Serviço | - | - |
| **GSIV007** | Abertura de Solicitação | - | - |
| **GSIV013** | Pesquisa Geral | - | - |
| **GSPV102** | Trâmite | - | - |
| **MSIV001** | Exportar Contatos | nome, matricula, logradouro | - |
| **MSIV070** | Registrar Voto | - | - |
| **MSSV005** | Cadastro Para Recuperar Senha | - | - |
| **MSSV008** | Cadastro de Telefone por Matrícula | - | - |
| **MSSV009** | Cadastro de Telefone por UO | uo | - |
| **MSSV126** | Consulta Acessos Legado por Usuário | - | Mat. Recebedor, Nome Recebedor, Função, Nome Função, Nível de Acesso (+2) |
| **MSSV401** | Consulta A. Complementar por Sistema | - | Código, Sigla, Descrição, Resumo, Tipo de Acesso (+5) |
| **MSSV402** | Consulta Usuários por A. Complementar | - | Tipo de Acesso, Sigla da Aplicação, Nome da Aplicação, Nome do Acesso, Descrição do Acesso (+6) |
| **MSSV420** | Consulta Acessos por Usuário | - | Matriz, Descrição, Data de Início, Data de Término, GSI (+16) |
| **MSSV430** | Consulta Usuários por Perfil | - | - |
| **MSSV450** | Consulta Aplicações por Perfil | - | - |
| **MSSV460** | Consulta Usuários por Sistema | - | Acesso Complementar?, Acesso, Código, Descrição |
| **MSSV470** | Consulta Perfis por Sistema | - | Código Perfil, Descrição |
| **MSSV480** | Consulta Usuários por Aplicação | - | Unidade Organizacional, Matrícula, Usuário, Perfil, Matrizes (+10) |
| **MSSV490** | Consulta Aplicações por Sistema | - | Código da Aplicação, Nome da Aplicação, Situação da Aplicação |
| **MSSV500** | Usuário com Acesso Especial - BZ103 | - | Tipo, Matrícula, Nome Usuário, Autorizador, Nome Autorizador |
| **MSSV502** | Sistemas e Aplicações Cobol - Legado | nome | Sigla, Nome, Código, Acesso |
| **MSSV503** | Usuário por Aplicação - Legado BZ127 | - | Matrícula, Nome Usuário, Autorizador, Nome Autorizador, C (+3) |
| **MSSV550** | Consulta A. Complementar por Aplicação | - | - |

## Outros / Vertical Indefinida (6 apps)

| Código | Nome da Aplicação | Filtros Aceitos | O que Retorna |
|---|---|---|---|
| **D2000** | PRESIDENCIA | - | - |
| **D4008** | COMISSÃO DE AVALIAÇÃO DE DOCUMENTOS E ACESSO | - | - |
| **D4014** | COMISSÃO DE ÉTICA DA SANEAGO | - | - |
| **D4015** | COMITÊ ESTRATÉGICO DA SANEAGO | - | - |
| **D4030** | COMISSÃO INTERNA DE PREVENÇÃO DE ACIDENTES - DCO02 | - | - |
| **D4065** | COMITÊ DE PESSOAS, ELEGIB. SUCESSÃO E REMUNERAÇÃO | - | - |
