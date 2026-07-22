# Mapa de Capacidades por Vertical — Saneago

Este documento apresenta o mapa completo de capacidades consultáveis do portal Saneago, organizado por vertical de negócio e derivado da varredura semântica.

## Resumo Geral de Capacidades

- **Total de Aplicações Mapeadas:** 596
- **Confiabilidade Alta (Filtros + Retornos):** 164
- **Confiabilidade Média (Filtros ou Retornos):** 214
- **Confiabilidade Baixa (Sem filtros/retornos identificados):** 218
- **Aplicações com Erro de Captura:** 11

## Comercial & Atendimento ao Cliente (168 apps)

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
| **ECO103** | Qtde de Contas com Prazo em Vigor | cidade | - |
| **ECO104** | Contas com Prazo por Período | cidade, periodo | - |
| **ECO106** | Quantidade de Contas em Débito Automátic | - | Banco, Quantidade de Contas, Código, Nome, Total (+2) |
| **ECO108** | Relação de contas potencial faturamento | cidade, bairro, logradouro | Lista de Subcategorias |
| **ECO112** | Relaciona Contas Condomínio | conta | Contas Individuais Relacionadas a Conta do Condomínio, Pesquisar Conta(s):, Conta, Nome, Codificação (+3) |
| **ECO113** | Histórico de Conta Individual | conta | Histórico, Conta Macro, Data/Hora Inclusão, Matrícula Inclusão, Data/Hora Exclusão (+1) |
| **ECO118** | Bairros | cidade, bairro, nome | Código, Nome, Distrito, ECO120 |
| **ECO120** | Logradouros por Nome/Bairro | cidade, bairro, logradouro, nome | Cód. Bairro, Bairro, Cód. Logradouro, Tipo, Logradouro (+5) |
| **ECO121** | Reordenação Codificação de Massa | cidade | - |
| **ECO122** | Manutenção de Bairros | cidade, bairro, nome | - |
| **ECO124** | Atualiza Data Vencimento/Cliente | conta | - |
| **ECO130** | Relação de Clientes p/ Categoria | cidade, bairro | - |
| **ECO131** | Atividades | data, cidade | Cidade, Job, Grupo, Referência, Qtd.Reg (+8) |
| **ECO133** | Cronograma de Atividades | cidade | Código, Atividade, Previsão, Geração/Execução, Matricula Ult. Alt. (+1) |
| **ECO135** | Atualiza CEP de Usuários | cidade, bairro, logradouro | - |
| **ECO139** | Entrega de Contas | conta | ENTREGA DA FATURA OU DO COMUNICADO DE SUA NÃO EMISSÃO NO ATO DA LEITURA, ENTREGA DA FATURA NÃO EMITIDA NO ATO DA LEITURA, Referência, Data/Hora, Tipo Entrega (+4) |
| **ECO144** | Endereço Alternativo | conta | - |
| **ECO145** | Órgãos Públicos Cadastrados | cidade, nome | - |
| **ECO146** | Controle de Fatura Digital | conta | - |
| **ECO148** | Cadastro de Clientes | cpf_cnpj | Tipo de Telefone, Número, Ramal, Excluir?, Data (+17) |
| **ECO150** | Boletim de Recadastramento | conta | - |
| **ECO151** | Cadastro de Usuarios | conta, ra, cpf_cnpj, data, cidade, bairro, logradouro, matricula | - |
| **ECO152** | Autorização p/ Débito Automático | conta | Histórico de Débito Automático, Dados Bancários, Data, Tipo Operação, Operador (+7) |
| **ECO154** | Usuários por Nome | cidade, bairro, logradouro, nome, cpf_cnpj | ECO151, Nº Conta, Nome Proprietário, Logradouro, S.A. (+9) |
| **ECO157** | Codificações Existentes | cidade | Seq., Id. Conta, N° Conta, Usuário, S.A. (+7) |
| **ECO160** | Alterar em Massa Grupo e Rota | cidade | Sequência......Conta, Grupo Faturamento ..... Rota |
| **ECO162** | Usuário Eventual | conta, cpf_cnpj | - |
| **ECO163** | Subcategorias | - | - |
| **ECO170** | Codificação/Número de Conta | cidade, bairro | - |
| **ECO171** | Contas | cidade, bairro | - |
| **ECO172** | Usuários Reais de Água | cidade, bairro, logradouro | - |
| **ECO186** | Análise de Recadastramento | cidade, periodo | Grupo Faturamento, Rota, Sequência, Conta, Visualizar Cadastro (+1) |
| **ECO187** | Histórico de Usuários | conta, nome | Data, Campo (Cod - Desc), Situação Anterior do Campo, Matrícula, Motivo |
| **ECO189** | Relatório de Medição de Serviços | cidade, periodo | - |
| **ECO193** | Relatório Analítico do Faturamento | cidade | - |
| **ECO201** | Cadastramento de Hidrômetros | hidrometro | - |
| **ECO202** | Movimentação de Hidrômetro | conta, hidrometro | - |
| **ECO203** | Lacração do Hidrômetro ao Padrão | conta | Conta, Ligação, Tipo, Hidrômetro, Data Lacração (+4) |
| **ECO204** | Ocorrências de Leitura/Corte/Relig | - | Código, Descrição, Necessidade, Permissão, Foto (+4) |
| **ECO205** | Hidrômetros | conta, hidrometro | - |
| **ECO212** | Consumo Hidrômetro Instal/Trocado | cidade, bairro | Referência, Consumo, Valor, Contas Faturadas |
| **ECO213** | Aferição de Hidrômetro | conta | Consultar, Laudo, Ano, Hidrômetro, Data da Solicitação (+17) |
| **ECO219** | Controle de Contas Suprimidas | bairro, logradouro, conta | Conta, Fonte, Supressão, Data Última Vistoria, Data Final (+9) |
| **ECO265** | Ligações sem Hidrômetro | cidade, bairro, logradouro | Código, Descrição, Quantidade, Sequencial, Conta (+3) |
| **ECO273** | Hidrômetros com Volume Acumulado/Tempo | cidade, bairro | Capacidade, Volume Acumulado, Tempo de Instalação, Individualizadas, Total |
| **ECO285** | Comunicação Aos Clientes Para Lacração | conta, cidade, bairro, logradouro | - |
| **ECO286** | Comunicado de Inst./Subst./Ret. | ra, conta, cidade, hidrometro | - |
| **ECO303** | Acerta Leitura/Consumo | conta | Ft., Mês/Ano, Data Leitura, Motivo Crítica, MCF (+16) |
| **ECO309** | Segunda Crítica de Consumo/Leitura | cidade | Pesquisar Conta(s):, Conta, Diferença, ECO303, Analisado (+6) |
| **ECO343** | Beneficiário Prêmio/Irregularidade | cidade, uo | - |
| **ECO344** | Diferença de Consumo | periodo | - |
| **ECO348** | Cadastramento Grande Gerador | cpf_cnpj, conta | - |
| **ECO349** | Concessão de Crédito | conta, cpf_cnpj | RA, Data, Litros, Valor, Conta Beneficiada (+1) |
| **ECO351** | Listagem Coleta Óleo | periodo | RA, Data Crédito, Conta, Volume Crédito, Valor Crédito (+2) |
| **ECO357** | Consulta Estoque | uo | - |
| **ECO359** | Primeira Crítica de Consumo/Leitura | cidade | Pesquisar Conta(s):, Rota, Sequencial, Conta, Crítica (+4) |
| **ECO360** | Contas com Ocorrência | cidade, bairro | - |
| **ECO363** | Revisão de Leitura | - | Pesquisar:, Rota, Sequencial, Conta, Hidrômetro (+10) |
| **ECO367** | Clientes c/ Média de Consumo X | cidade, bairro | - |
| **ECO376** | Clientes c/ Consumo Faturado | cidade, bairro | - |
| **ECO385** | Anormalidades não Criticadas na CO359 | cidade | Pesquisar Contas:, Rota, Sequencial, Conta, Crítica (+3) |
| **ECO395** | Clientes com Irregularidades | cidade, bairro, periodo | - |
| **ECO402** | Emissão de Fatura em Braille | conta | - |
| **ECO404** | Cadastramento de Tarifas | - | - |
| **ECO407** | Códigos de Lançamentos | - | - |
| **ECO410** | Cancelamento de Débito/Crédito | cpf_cnpj, conta | Número, Situação, Conta, Data Emissão, Data Venc. (+2) |
| **ECO411** | Abertura de Financiamento | conta | - |
| **ECO413** | Controle de NFAg | cpf_cnpj, periodo | Conta, Número/Séria NFAg, Número da Fatura, CPF/CNPJ, Situação da NF (+4) |
| **ECO415** | Débito Analítico | conta | CPF/CNPJ, Cliente, Data Inicio Vínculo, Data Fim Vínculo, Vínculo |
| **ECO416** | Simulação | conta, nome | Categoria, Subcategoria, Economia, Unidade, Consumo Estimado m³/mês (+4) |
| **ECO422** | Contas Pagas com Atraso | conta | CPF/CNPJ, Cliente, Data Início Vínculo, Data Fim Vínculo, Vínculo (+7) |
| **ECO427** | Termo de Ocorrencia de Irregularidade | ra, conta | - |
| **ECO460** | Emite Faturamento Avulso | conta, cpf_cnpj | - |
| **ECO461** | Crítica de Valor Faturado | cidade, bairro | Contas Criticadas, Pesquisar Conta(s):, Todos, Conta, Cliente (+5) |
| **ECO470** | Fatura Digital | conta, cpf_cnpj | - |
| **ECO472** | Quantidade Lig. Bairros/Distritos | - | - |
| **ECO477** | Tabela de Preços Água/Esgoto | cidade | Consumo (m³), RESIDENCIAL, COMERCIAL, INDUSTRIAL, PÚBLICA (+6) |
| **ECO482** | Inclusão de Débito/Crédito | conta | - |
| **ECO484** | Estatística Faturamento/Bairro | cidade, bairro | - |
| **ECO488** | Refaturamento | conta, cpf_cnpj | Categorias\Economias\Peso, Categoria, Descrição, Economia, Peso (+13) |
| **ECO489** | Comunicado de Esgoto Sanitário | conta, cidade, bairro, logradouro, codigo_servico | - |
| **ECO492** | Códigos de Lançamento | - | Código, Descrição, REF, LAN, AVU (+3) |
| **ECO495** | Acompanhamento de Refaturamento | conta, periodo, cidade, matricula, nome | Conta, Data Refa., Resp, Mês/Ano, Mot (+9) |
| **ECO501** | Controle de Corte/Revisão/Religação | conta | Nº do Corte, Data Emissão, Motivo, Data Solicitação Revisão, Data Solicitação Religação (+1) |
| **ECO502** | Controle de Revisão de Corte | periodo | - |
| **ECO504** | Revisões Violadas de Contas Cortadas | - | - |
| **ECO505** | Financiamento/Parcelamento | conta | CPF/CNPJ, Cliente, Data Início Vínculo, Data Fim Vínculo, Vínculo (+35) |
| **ECO506** | Débitos em Aberto/Usuário | conta, cpf_cnpj | CPF/CNPJ, Cliente, Total Débito Histórico (R$), Selecione, Número Conta (+3) |
| **ECO510** | Comunicado de Débito | periodo, bairro, conta | Situação Água, Conta, Nome, Endereço, Codificação (+1) |
| **ECO512** | Ordem De Serviço De Religação | conta | - |
| **ECO515** | Relatório de Contas Cortadas | cidade, bairro | - |
| **ECO516** | Nr. Doc Faturamento Avulso | conta | CPF/CNPJ, Cliente, Data Inicio Vínculo, Data Fim Vínculo, Vínculo (+5) |
| **ECO520** | Usuário com corte suspenso | ra, cpf_cnpj, conta | - |
| **ECO530** | Relação Deb. Abertos por Órgão Pagador | periodo | - |
| **ECO536** | Revisão de Corte | bairro, conta | - |
| **ECO538** | Anormalidades no Corte/Ocorrência | cidade, bairro, logradouro | - |
| **ECO548** | Emissão de 2ª Via de Fatura(s) | conta | CPF/CNPJ, Cliente, Data Inicio Vínculo, Data Fim Vínculo, Vínculo |
| **ECO550** | Histórico de Débito Automático | conta | Referência, Data de Vencimento, Valor R$, Banco / Agência / Conta, Situação (+6) |
| **ECO553** | Acompanhamento de OSR e Religação | nome, periodo | - |
| **ECO556** | Faturamento Avulso em Aberto | periodo, cidade | Cidade, Documento, Conta, CNPJ/CPF, Nome (+4) |
| **ECO562** | Reaviso de Débitos | conta | - |
| **ECO563** | Extrato de Débito | conta | CPF/CNPJ, Cliente, Data Inicio Vínculo, Data Fim Vínculo, Vínculo |
| **ECO568** | Clientes com débitos isolados | cidade | Pesquisar Conta:Limpar, Conta, Documento Fiscal, Ref. Débito, Nome (+4) |
| **ECO584** | Contas Retornadas/Não Ret. Corte | periodo | - |
| **ECO585** | Débitos Pendentes | cidade | - |
| **ECO592** | Negociação de Débitos Particulares | conta, cpf_cnpj | Conta, Cliente, Data Inicio Vínculo, Data Fim Vínculo, CPF/CNPJ (+2) |
| **ECO596** | Resumo Cortes, Revisões e Religações | conta, periodo | - |
| **ECO607** | Arrecadação Diária por Banco | periodo | Ordem, Código, Nome do Agente Arrecadador, Valor SANEAGO em R$, Valor CAESB em R$ (+4) |
| **ECO609** | Débitos Baixados de Usuários | conta | CPF/CNPJ, Cliente, Data Inicio Vínculo, Data Fim Vínculo, Vínculo (+9) |
| **ECO616** | Motivo de Baixa de Arrecadação | conta | Documento Baixa, Documento Fiscal, Referência, Data Pgto, Valor Arrecadado (+2) |
| **ECO623** | Demonstrativo Arrecadação Diária | periodo, cidade, bairro | - |
| **ECO625** | Declaração de quitação anual de débitos | conta | CPF/CNPJ, Cliente, Data Inicio Vínculo, Data Fim Vínculo, Vínculo (+8) |
| **ECO635** | Emitir Certidão Negativa | conta | CPF/CNPJ, Cliente, Data Início Vínculo, Data Fim Vínculo, Vínculo |
| **ECO644** | Arrecadação Contábil/Cidade | cidade | - |
| **ECO674** | Consulta PIX | periodo | Lista de Pix Efetivados, Id Transação, Conta, Documento, Valor (+10) |
| **ECO697** | Valores por Número de Documento | cpf_cnpj | Doc. Fiscal
	
Conta
	
Referência
	
Situação
	
Data Venc.
	
Banco
	
Data Pgto
	
Valor, Doc. Fiscal, Conta, Referência, Situação (+4) |
| **ECO701** | Registro de Atendimento | ra, conta | - |
| **ECO706** | Códigos de Serviço | codigo_servico | Código, Descrição, Prazo de Atendimento, Situação Atual |
| **ECO707** | RAs por Número de Conta | conta | Número RA, Datas, Situação RA, Código Serviço, ECO701 (+3) |
| **ECO708** | RAs por Solicitante | nome, cidade, bairro, codigo_servico, periodo | Número RA, Datas, Situação RA, Conta, Nome (+4) |
| **ECO709** | RAs por Logradouro | cidade, bairro, logradouro, codigo_servico, periodo | Número RA, Datas, Situação RA, Conta, Nome (+7) |
| **ECO711** | RA em Execução/Executado | periodo, cidade, uo, codigo_servico | Número RA, Situação, Data Execução, Telefone, Endereço (+8) |
| **ECO712** | História do Usuário | conta | ATENÇÃO |
| **ECO725** | Estatística Serviços Exec./Cidade | cidade, uo, periodo | - |
| **ECO728** | Impressão de RA | uo, data, codigo_servico, ra | - |
| **ECO731** | Alteração e Impressão de RA | uo | RA, Código Serviço |
| **ECO795** | Retorno de Registro de Atendimento | conta | - |
| **ECO804** | Legislação | - | Nome, Descrição |
| **ECO808** | Áreas de Inf. dos Reservatórios | - | - |
| **ECO811** | Doc. do Macroprocesso de Comercialização | - | - |
| **ECO815** | Coletânea de Diretrizes Comerciais | - | - |
| **ECO823** | Política de Titularidade | - | Nome, Descrição |
| **ECO825** | Coletânea Regulação dos Serviços | - | Nome, Descrição |
| **ECO830** | WEBCOM - Vídeo Aulas | - | - |
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

## Operacional, Redes & Manutenção (86 apps)

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
| **LRS002** | RA Pendente | periodo | N° RA, Conta, Serviço, Data Solicit., Data Ult. Rep. (+2) |
| **LRS009** | Monitoramento de Atendimento | codigo_servico, uo, periodo | Serviço, Descrição, Número do RA, U.O, Código da Equipe (+9) |
| **LRS010** | Distribuição de Serviço | data | Equipe, Nome Responsável, Tipo Equipe, Categoria, Código (+7) |
| **LRS013** | Extravazamento de Esgoto Sanitario | - | - |
| **LRS017** | Cadastrar situação do distrito SIPSAP | data | - |
| **LRS019** | Índices do SIPSAP | - | - |
| **LRS021** | Extravasamento de Esgoto | - | - |
| **LRS024** | Indicadores do SIPSAP por Período | periodo | - |
| **LRS030** | Serviço resposta por serviço solicitação | codigo_servico | Código, Descrição, Data Vínculo, Remover, Serviço Solicitação (+4) |
| **LRS034** | Validar Corte de Asfalto | - | Distrito, Dt. Exec, RA Corte Asf., RA Orig., Larg. (+8) |
| **LRS036** | Resumo de Vazamentos | periodo, codigo_servico | - |
| **LRS037** | Serviço executado por conta | periodo, codigo_servico | Serviço, Descrição |
| **LRS041** | Relatório de recomposição asfáltica | cidade, bairro, uo, periodo | Listagem dos Lotes, Situação, Unidade Organizacional, E-mail do Destinatário |
| **LRS100** | Manter estoque de Material por viatura | - | Frota, Placa, Marca, Modelo, Cor (+15) |
| **LRS105** | Lançamento de serviços executados | codigo_servico | RA, Programação, Data Solicitação, Serviço Solicitação, Serviço Resposta (+11) |
| **LRS130** | Equipes | - | Código da Equipe, Nome do Responsável, Tipo de Equipe, Equipe |
| **LRS208** | Consulta RA's com D.S. | ra | Número Distribuição, Sequencia, Código Serviço Resposta, Código Serviço Retorno, Data Emissão (+3) |
| **LRS272** | Acompanhar Atendimento | data | - |
| **LRS301** | Relação Mensal Duração Serviço Encerrado | codigo_servico | - |
| **LRS314** | Análise tempo padrão/execução/perfomance | periodo | - |
| **LRS330** | Resumo dos Serviços | periodo, codigo_servico | - |
| **LRS360** | Materiais Utilizados do SIPSAP | codigo_servico | - |
| **LRS363** | Relação Mensal de Serviços Atendidos | periodo | - |
| **LRS701** | Relação de Serviços Executados | uo, periodo, codigo_servico | N° RA, N° Seq, Conta, Cod. Seviço, Serviço (+14) |
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

## Jurídico & Processos (12 apps)

| Código | Nome da Aplicação | Filtros Aceitos | O que Retorna |
|---|---|---|---|
| **JAJ028** | Consulta Judicial | conta | - |
| **JAJ033** | Agenda Audiência | periodo | - |
| **JAJ036** | Consulta Processo Conta | conta | Processo, Data Ajuizamento, Situação, Resultado |
| **JAJ042** | Consulta Cobrança | - | - |
| **JAJ044** | Relatório de Contas Com o Escritório | - | ExtraJudicial, Judicial, Total, Código, Cidade (+3) |
| **JAJ060** | Rodízio de Processos | cidade | Contas, Usuário, Nº Proc., Vara, Valor Ajuiz.(R$) (+6) |
| **JAJV028** | Consulta Judicial | conta | - |
| **JAJV033** | Agenda Audiência | periodo | - |
| **JAJV036** | Consulta Processo Conta | conta | Processo, Data Ajuizamento, Situação, Resultado |
| **JAJV042** | Consulta Cobrança | - | - |
| **JAJV044** | Relatório de Contas Com o Escritório | - | - |
| **JAJV060** | Rodízio de Processos | - | - |

## Recursos Humanos & Gestão de Pessoal (47 apps)

| Código | Nome da Aplicação | Filtros Aceitos | O que Retorna |
|---|---|---|---|
| **A0009** | CAESAN | - | - |
| **A0074** | EMP.LIC.INTER.PARTICULAR-SUREH | - | - |
| **A3000** | CHEFE DE GABINETE | - | - |
| **AGD001** | Consulta de RDs | cpf_cnpj, data | Número, Interessado, Assunto, Assunto Complementar, Conclusão (+1) |
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
| **GCA003** | Melhorias Previstas | periodo | Num. Solicit., Cód. Distrito, Distrito, Valor, Status (+5) |
| **GMQ001** | Notificação | uo | - |
| **GPM001** | Manobra de Registros | codigo_servico, cidade, bairro | Manobra, Serviço, Un. Responsável, Cidade, Reservatório (+12) |
| **GPM016** | Paralisação/Intermitência | periodo | Tipo, Distrito, Total de Horas, Qtd. Paralizações, Economias Afetadas (+1) |
| **GSI005** | Solicitações | periodo | Código, Unidade Organizacional |
| **GSI006** | Escolha de Serviço | - | - |
| **GSI007** | Abertura de Solicitação | - | - |
| **GSI013** | Pesquisa Geral | - | Campo Complementar, Valor, Solicitação, Abertura, Execução (+6) |
| **GSP102** | Trâmite | - | - |
| **S0072** | SUPER. DE RECURSOS HUMANOS | - | - |
| **S0087** | CHEFIA DE GABINETE | - | - |

## Financeiro, Contabilidade & Licitações (24 apps)

| Código | Nome da Aplicação | Filtros Aceitos | O que Retorna |
|---|---|---|---|
| **FGC001** | Requisição Obras/Serviços | - | - |
| **FGC018** | Processo | - | Origem, Destino, Dia do Recebimento, Hora do Recebimento |
| **FGC025** | Consulta Processo Licitatório | - | Código, Nome |
| **FGC026** | Requisição Obras/Serviços | - | Referência, Conta, Análise, Recurso, Comprometido (+5) |
| **FGC028** | Fornecedor | - | Representante Legal |
| **FGC032** | Requisições por UO | uo, cidade, periodo | Consulta, Requisição, Processo, UO Req., UO Exec. (+6) |
| **FGC033** | Requisições por Gestor | matricula, periodo | Requisição, Descrição Objeto, Data, Consulta |
| **FGC037** | Contratos por UO, Cidade, Forn. e Gestor | uo, cidade, periodo | Ordem, U.O., Contrato, Processo, Fornecedores (+12) |
| **FGC052** | Orçamento de Programas | - | Relatório Orçamentário por Categoria, Código, Orçamento, Comprometido Atual, Saldo (+8) |
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

## Suprimentos & Logística (22 apps)

| Código | Nome da Aplicação | Filtros Aceitos | O que Retorna |
|---|---|---|---|
| **MTG001** | Capturar Remessa | - | Data/Hora, Tamanho, Tipo, Nome, Ação |
| **MTG002** | Enviar Retorno | - | Sequenciais Esperados, Distrito, Leitura/Reaviso, Retidas, Entrega Alternativas (+3) |
| **MTG005** | Remessas Capturadas | - | Data/Hora, Tamanho, Tipo, Nome, Ação |
| **MTG006** | Andamento Geral | - | - |
| **MTG008** | Consultar Remessas Capturadas | - | - |
| **MTG009** | Consultar Retornos Enviados | - | Cidade, Distrito, Nome, Sequencial, Data/Hora Envio |
| **MTG010** | Sequencial Esperado | - | Próximos Sequenciais Esperados - Arquivos de Retorno, Leitura, Retidas, Entrega Alternativas |
| **MTG011** | Arquivos Retorno com Erros | - | Data/Hora, Tamanho, Tipo, Nome, Ação |
| **MTG012** | Logs de Erros Arq Retorno | - | Data/Hora, Tamanho, Tipo, Nome, Ação |
| **MTG016** | Controle de Religações | periodo | Conta, Dt. Hr. Solic., Tp. Solici., Dt. Hr. Lim., Ligação (+13) |
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

## Patrimônio & Bens (10 apps)

| Código | Nome da Aplicação | Filtros Aceitos | O que Retorna |
|---|---|---|---|
| **HFI001** | Registrar Inventário de Bens | - | Lista de bens sob sua responsabilidade, Nº Inventário, Nº Patrimônio, Descrição, Centro de Custo (+3) |
| **HFI031** | Solicitar Transferência Bem Patrimonial | - | Nº Inventário, Nº Patrimônio, Descrição |
| **HFI032** | Acompanhar Transf. de Bens Patrimoniais | periodo | Nº Transferência, Data da Solicitação, Responsável - Origem, Responsável - Destino, Data de Conclusão (+4) |
| **HFI033** | Registrar Parecer Transferências de Bens | periodo | Nº Inventário, Nº Patrimônio, Descrição, UO Destino, Parecer |
| **HFI034** | Consulta de Bens Patrimoniais | - | - |
| **HFIV001** | Registrar Inventário de Bens | - | Lista de bens sob sua responsabilidade, Nº Inventário, Nº Patrimônio, Descrição, Centro de Custo (+3) |
| **HFIV031** | Solicitar Transferência Bem Patrimonial | - | Nº Inventário, Nº Patrimônio, Descrição |
| **HFIV032** | Acompanhar Transf. de Bens Patrimoniais | - | - |
| **HFIV033** | Registrar Parecer Transferências de Bens | - | - |
| **HFIV034** | Consulta de Bens Patrimoniais | - | - |

## Viagens & Diárias (16 apps)

| Código | Nome da Aplicação | Filtros Aceitos | O que Retorna |
|---|---|---|---|
| **HVW001** | Distância entre cidade | cidade | Origem, Destino, Distância (km) |
| **HVW006** | Solicitação Viagem | periodo, nome, matricula | Nº, Data Saída, Data Chegada, Tipo Pagamento, Motivo (+6) |
| **HVW009** | Conta | data, matricula | - |
| **HVW018** | Manter Empregados com Cartão Viagem | data | Via, Cartão, Justificativa do Cancelamento, Limite do Cartão, Data Validade (+4) |
| **HVW019** | Manutenção | data | Via, Data Solicitação, Cartão, Data Emissão, Data Validade (+3) |
| **HVW025** | Solicitação | uo, periodo | - |
| **HVW031** | Impressão Termo | - | - |
| **HVW034** | Fornecedor por Despesa | cidade | - |
| **HVW050** | Prestar Contas Cartão Corporativo | data, matricula | Calculado, Realizado Cartão, Realizado Dinheiro, Limite Ultrapassado, Cartão (+2) |
| **HVWV001** | Distância entre cidade | cidade | Origem, Destino, Distância (km) |
| **HVWV006** | Solicitação Viagem | - | - |
| **HVWV009** | Conta | - | - |
| **HVWV018** | Manter Empregados com Cartão Viagem | - | - |
| **HVWV019** | Manutenção | - | - |
| **HVWV031** | Impressão Termo | - | - |
| **HVWV050** | Prestar Contas Cartão Corporativo | - | - |

## Qualidade da Água & Laboratório (26 apps)

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
| **LQA036** | DADOS PARA CONSTRUÇÃO DO RELAT SISÁGUA | cidade | Cidade, Sistema de Tratamento, Área de Influência, Bairro, Ponto (+11) |
| **LQA081** | Gráfico do IQA Médio por Cidade | cidade, periodo | Código, Fase |
| **LQA083** | Resumo das Irregularidades | cidade, periodo | - |
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

## Outros / Vertical Indefinida (128 apps)

| Código | Nome da Aplicação | Filtros Aceitos | O que Retorna |
|---|---|---|---|
| **BPA001** | Plano de Lotação | - | - |
| **BPA004** | Gestão de Empregados no Teletrabalho | uo, data | Matrícula, Nome do Empregado, Telefone, Modalidade, Tipo de revezamento (+1) |
| **BPA005** | Reporte de Atividades de Teletrabalho | uo, periodo | Nome, Período, Atividades, Situação |
| **BPA354** | Avaliação do Empregado | - | - |
| **BPA356** | Resultado Avaliação de Desempenho | - | - |
| **BPA358** | Relatório Avaliação de Desempenho | uo | - |
| **BPA359** | Autoavaliação de Desempenho | - | - |
| **BPA360** | Avaliação de Desempenho dos Gestores | - | - |
| **BPA361** | Gerenciamento e Devolutiva - Avaliaçoes | uo | - |
| **BPA372** | Inscrição PDV | - | - |
| **BPA373** | Ranking PDV | - | - |
| **BPA433** | Histórico Funcional | data, cpf_cnpj, uo | - |
| **BPA604** | Painel da Trilha | - | - |
| **BSW003** | Total de EPI por UO | uo | - |
| **BSW004** | Entrega de EPI/EPC | data | Codigo, Equipamento, Quantidade, Numeração, Número CA |
| **BSW006** | Histórico de Entrega | data | - |
| **BSW020** | Numeração de Epi por Empregado | - | Codigo, Equipamento, Tamanho EPI, Qtde Anual |
| **BSW040** | Relatório de Agentes Risco por Empregado | uo, nome, matricula | - |
| **BSW043** | Consultar Não Conformidade | data | N. NC, DESCRIÇÃO NC, GESTOR DA U.O., DATA DA INSPEÇÃO, STATUS (+1) |
| **BSW150** | Cadastro de EPI | - | Código do risco, Nome do risco, Código, Descricao, Tipo (+3) |
| **BSW310** | Atestado Médico | uo, periodo | - |
| **BSW504** | Atividades por Empregado | - | - |
| **BTW001** | Pedido | - | - |
| **BTW002** | Pedidos Por Período | periodo | - |
| **BTW021** | Avaliação do Treinamento | - | - |
| **BTW022** | Pedidos Por Empregado | periodo | - |
| **BTW024** | Pedidos desta Unidade e UOs Inferiores | periodo | - |
| **BTW025** | Pedidos desta Unidade Organizacional | periodo | - |
| **D2000** | PRESIDENCIA | - | - |
| **D4008** | COMISSÃO DE AVALIAÇÃO DE DOCUMENTOS E ACESSO | - | - |
| **D4014** | COMISSÃO DE ÉTICA DA SANEAGO | - | - |
| **D4015** | COMITÊ ESTRATÉGICO DA SANEAGO | - | - |
| **D4030** | COMISSÃO INTERNA DE PREVENÇÃO DE ACIDENTES - DCO02 | - | - |
| **D4065** | COMITÊ DE PESSOAS, ELEGIB. SUCESSÃO E REMUNERAÇÃO | - | - |
| **EAC005** | Protocolo de Atendimento | periodo, conta | Protocolo, Conta, Cidade, Unidade de Atendimento, Telefone (+13) |
| **EAC799** | Atendimento | - | - |
| **ECA001** | Distribuição de Rotas | cidade, periodo, bairro, logradouro | Rota, Sequência, Conta, Logradouro, Número (+5) |
| **ECA002** | Rel. de Produtividade do Recadastramento | cidade, periodo | Contas em Execução, Contas em Análise, Responsável, Total Contas, Distribuído (+17) |
| **ECA003** | Planejamento de Recadastramento | cidade | Cidade, Empresa Responsável, Mês/Ano Referência, Ativo |
| **ECA004** | Autorizar Rotas para Distribuição | cidade, periodo | Rota, Total de Contas |
| **ECN003** | Enviar Fatura por Conta | conta | Referência, Fatura, Vencimento, Valor (R$), Titularidade |
| **ECN004** | Enviar Fatura em Massa | bairro | Conta, Referência Selecionada, Fatura, CPF/CNPJ, Nome do Titular (+5) |
| **ECN005** | Gerenciar Protesto | periodo | Conta, Referência, Fatura, Vencimento, Titularidade (+3) |
| **ECN006** | Relatório | - | - |
| **ECN007** | Consultar Protesto | cpf_cnpj | Conta, Referência, Documento, Valor, Data de Envio (+3) |
| **ECS006** | Erros do Distrito por Período | - | - |
| **ECS007** | Gerar Planilha | periodo | - |
| **ECS008** | Apontamento de Erros | periodo, codigo_servico | - |
| **ECS009** | Gerenciar Planilha de Controle | periodo | Contrato, Distrito, Geração, Aprovação, N° Lote (+7) |
| **ECS010** | Gerar Resumo do Faturamento | periodo | Resumo Faturamento, Planilha SAP, Listagem, Código, Nome |
| **EGW001** | Contrato Comercial | cpf_cnpj, data, uo, matricula, conta, nome | CPF, Nome Pessoa, Nº Aditivo, Nome Anexo, Abrir Anexo (+2) |
| **EGW005** | Resumo de Faturamento | conta | - |
| **EGW006** | Controle do Envio do Resumo | conta | - |
| **EGW305** | Contratos a Vencer | - | Contrato, Aditivo, Cliente, Demanda Água, Demanda Esgoto |
| **EGW313** | Consumo e Faturamento Individualizados | conta, cidade | Número da Conta, Nome, CONTA, CLIENTE, Nº (+9) |
| **EGW401** | Cliente por Faixa de Consumo | - | - |
| **EGW402** | Faturamento | conta | - |
| **FCA002** | Andamento das Notificações Órgão Público | - | - |
| **FCA003** | Consulta de Notificação | cidade, uo, data | Detalhes, Notificação, Orgão Regulador, Relatório Fiscalização, Processo Saneago (+10) |
| **FCA005** | Consulta de Infração | uo, cidade, data | Detalhes, Auto de Infração, Processo Saneago, Processo SEI, Valor (+8) |
| **FGO002** | Fale com Compliance | matricula | - |
| **FGQ004** | Documentos Normativos | cpf_cnpj | Documento, Versão, Título, Informações, U.O. (+3) |
| **FGQ006** | Tratar NC | - | - |
| **FGQ010** | Auditor | - | - |
| **FGQ011** | Auditoria | - | - |
| **FGQ012** | Equipes | data | Data, Tipo, Membro, Visualização do Guia Cadastrado |
| **FGQ014** | Curso | data | Data Cadatro, Curso, Data Início, Data Fim, Descrição do Curso (+1) |
| **FGQ017** | UO Responsável pelo RNC | uo, periodo | UO Responsável, Número do RNC, Data de Encerramento, Descrição NC, Status |
| **FGQ018** | Relatório Geral | - | - |
| **FGQ019** | RNC onde ocorreu NC | uo, periodo | UO Onde Ocorreu a NC, Número do RNC, Data Encerramento, UO Responsável, Status |
| **FGQ020** | RNC por Período | periodo | Numero/Ano RACP, Dt. Est. Encerramento, Status, Ações |
| **FGQ022** | Histórico Auditor | - | - |
| **FGQ024** | Documentos por UO | uo | - |
| **FGQ026** | Registrar RNC | - | Data, Nome do Arquivo, Documento Normativo, Versão, Item Norma |
| **FGQ037** | Relatório Doc. Normativo por UO Resp. | uo | - |
| **KOC004** | Previsto X Executado | ra | Código, Descrição, Previsto, Executado |
| **KOC005** | Consulta Empreendimento | uo, cidade, periodo | Código, Resumo, Descrição, Ano, Empreendimento (+10) |
| **LEN110** | Unidades Consumidoras de Energia | - | - |
| **LEN145** | Interrupção de Energia | cidade, conta, periodo, uo, matricula | - |
| **LEN146** | Interrupção de Energia | periodo, cidade | - |
| **LQE018** | Cadastro de Ocorrêcias nas Amostras | data | descricao, conteúdo, Descrição, Fase, Qtde. Frascos (+2) |
| **LQE025** | Consultar Amostras | periodo | Data, Número/Ano, ETE, Ponto de Coleta, N° Ocorrências (+2) |
| **LQE027** | Laudos Laboratoriais | - | - |
| **LQE028** | Ocorrências nas Análises | ra, periodo | descricao, conteúdo, Parâmetro, Ocorrência, Ponto de Coleta (+1) |
| **LQE029** | Amostras Liberadas por Período | periodo | Protocolo, Sistema, Ponto de Coleta, Produto, Data Agendamento |
| **LQE030** | Resultados das Análises - Planilha | periodo | Data, Número/Ano, ETE, Ponto de Coleta, Tipo de Produto |
| **LQE039** | Relatório do IQEt por data | - | - |
| **MGO012** | Providência - UO Responsável | - | - |
| **MGO021** | Registro de Ocorrência por Vencimento | periodo, uo | - |
| **MGO029** | Encaminhamento de RO | periodo, uo, cidade | Data, Reg./Ano, N.º Encam., Data Encam., Cidade (+6) |
| **MGO033** | Registro de Ocorrência Pendente | - | Data, Reg./Ano, N.º Encam., Data Encam., Origem (+16) |
| **MGO059** | Áreas Setoriais OGE | uo | Código, Descrição, Código Área Atuação OGE |
| **MIG018** | Cadastro de Atividade de Agrupamento | - | - |
| **MIG602** | Plano de Ação | data, uo, codigo_servico | Data Base:, Atividades, Qtde., Qtde. Serviço, Medida (+12) |
| **MIG605** | Análise Critica | uo, periodo | Data Base:, Quant. Serv., Realizado, Total, Observações (+8) |
| **MPS005** | Cadastro de Cidade | cidade, nome | - |
| **MPS540** | Logradouro | cidade, logradouro | Código, Tipo, Logradouro |
| **MSI001** | Exportar Contatos | - | - |
| **MSI070** | Registrar Voto | - | - |
| **MSS005** | Cadastro Para Recuperar Senha | - | - |
| **MSS008** | Cadastro de Telefone por Matrícula | - | - |
| **MSS009** | Cadastro de Telefone por UO | uo | - |
| **MSS126** | Consulta Acessos Legado por Usuário | - | Mat. Recebedor, Nome Recebedor, Função, Nome Função, Nível de Acesso (+2) |
| **MSS165** | Autorização Acesso por Usuário Virtual | matricula | Excluir, Código, Descrição Impressora, Solicitação, Data Acesso (+4) |
| **MSS401** | Consulta A. Complementar por Sistema | - | Código, Sigla, Descrição, Resumo, Tipo de Acesso (+5) |
| **MSS402** | Consulta Usuários por A. Complementar | - | Tipo de Acesso, Sigla da Aplicação, Nome da Aplicação, Nome do Acesso, Descrição do Acesso (+6) |
| **MSS420** | Consulta Acessos por Usuário | - | Matriz, Descrição, Data de Início, Data de Término, GSI (+16) |
| **MSS430** | Consulta Usuários por Perfil | - | - |
| **MSS450** | Consulta Aplicações por Perfil | - | - |
| **MSS460** | Consulta Usuários por Sistema | - | Acesso Complementar?, Acesso, Código, Descrição |
| **MSS470** | Consulta Perfis por Sistema | - | Código Perfil, Descrição |
| **MSS480** | Consulta Usuários por Aplicação | - | Unidade Organizacional, Matrícula, Usuário, Perfil, Matrizes (+10) |
| **MSS490** | Consulta Aplicações por Sistema | - | Código da Aplicação, Nome da Aplicação, Situação da Aplicação |
| **MSS500** | Usuário com Acesso Especial - BZ103 | - | Tipo, Matrícula, Nome Usuário, Autorizador, Nome Autorizador |
| **MSS502** | Sistemas e Aplicações Cobol - Legado | nome | Sigla, Nome, Código, Acesso |
| **MSS503** | Usuário por Aplicação - Legado BZ127 | - | Matrícula, Nome Usuário, Autorizador, Nome Autorizador, C (+3) |
| **MSS550** | Consulta A. Complementar por Aplicação | - | - |
| **PGT301** | Cadastro de Veículo | data, cidade, codigo_servico, nome | - |
| **PGT401** | Cadastro de Motorista | nome, data | Veiculo, Motorista, CPF, CNH, Anexo |
| **PGT500** | Nova Ordem de Tráfego | nome, codigo_servico, periodo, matricula | - |
| **PGT504** | Registro Offline | codigo_servico, nome | - |
| **PGT505** | Resumo | - | - |
| **PGT510** | Atendimento | codigo_servico | Número, Início Deslocamento, Término Deslocamento, Uo Solicitante, Data Solictação (+4) |
| **PGT511** | Empregados Ordem de Tráfego | - | Empregados Envolvidos, Matrícula, Nome |
| **PGT912** | Ordens de Tráfego p/ Período e Situação | periodo | Nº OT, Início Deslocamento, Term. Deslocamento, Pst. Serviço, Local Embarque (+2) |
| **PGT913** | Relatório de Movimentação de Veículos | periodo | - |
| **PGT916** | Motoristas | - | - |
| **PGT918** | Ordem de tráfego por motorista | matricula, periodo | - |
