# MCP-Saneago (Model Context Protocol)

Servidor MCP e suíte de automação de alto desempenho para integração com os sistemas corporativos da Saneago (Portal ZK, DocFlow, ECO e LRS).

---

## 🛠️ Ferramentas MCP Disponíveis (Tools)

- **`saneago_docflow_consultar_processo`**: Consulta detalhes de um processo no DocFlow por número/ano (ex: `14652/2026`), combinando cache local (`data_processos_YYYY/`) com consulta HTTP direta em tempo real.
- **`saneago_docflow_pesquisar_local`**: Pesquisa textual rápida em milhares de processos salvos no repositório local por termo, interessado, assunto ou ano.
- **`saneago_pesquisar_asfalto_local`**: Realiza buscas por Rua, Bairro, Quadra ou número de RA na base local de recomposição asfáltica (`Asfalto-Pendentes` / `MEMÓRIA_BM`).
- **`saneago_eco709_consultar_logradouro`**: Consulta RAs por Logradouro / Rua, Bairro e Período via HTTP/Playwright no portal Saneago (ECO709).
- **`saneago_eco701_consultar_ra`**: Detalha informações completas de uma RA específica no ECO701.
- **`saneago_asfalto_da_ra`**: Consulta status de corte e recomposição no LRS041 para uma RA.
- **`saneago_lrs105_verificar_estatistica`**: Verifica lançamento de laudos e materiais no LRS105 sem gravação (read-only).
- **`saneago_abrir_ra`**: Abertura de RAs no ECO701 com confirmação em duas etapas (preview + confirmação por token).
- **`saneago_consultar_consumo`**: Consulta de consumo por conta no ECO303.
- **`saneago_supervisorio_telemetria`**: Leitura em tempo real por unidade/grupo do Supervisório Web.
- **`saneago_supervisorio_historico`**: Consulta a série temporal de medições de sensores num período, com agregações (min/max/média).
- **`saneago_supervisorio_minima_noturna`**: Consulta os dados de mínima noturna (perdas/vazamentos) por DMC.
- **`saneago_supervisorio_listar_componentes`**: Lista o catálogo de sensores disponíveis para telemetria em uma unidade.
- **`saneago_supervisorio_listar_dmcs`**: Lista os DMCs cadastrados em uma unidade operacional.
- **`saneago_supervisorio_horimetro`**: Consulta a totalização de horas ou detalhamento de acionamentos de bomba no período.
- **`saneago_descobrir_aplicacao`**: Busca rápida de aplicações e capacidades no catálogo local.

---

## 🏛️ Arquitetura e Engenharia Reversa do DocFlow & Portal ZK

O sistema **DocFlow** da Saneago é uma aplicação corporativa para gestão de processos e GED (Gerenciamento Eletrônico de Documentos) desenvolvida sob a arquitetura **Java EE**, integrando **ZK Framework**, **JSF 2 (Mojarra)** e componentes **RichFaces 4.2**.

### 1. Autenticação e Cadeia SSO Multi-Camadas
1. **Portal ZK (`/prt/mpt/principal.zul`)**:
   - Inicializa a sessão obtendo o identificador do desktop ZK (`dtid`).
   - Autentica via requisições POST assíncronas ZKAU (`/prt/zkau`) enviando comandos `onChange` para matrícula e senha e `onClick` para o botão de login (`btnEntrar`).
2. **Validação SSO (`/prt/GerenciadorDocumento.jsp`)**:
   - Endpoint intermediário de Single Sign-On que herda os cookies e autorizações da sessão ZK e propaga o contexto de autenticação para as aplicações legadas.
3. **Sessão JSF DocFlow (`/docflow/xhtml/docflow/geral/login.jsf`)**:
   - O DocFlow estabelece o `JSESSIONID` e gerencia o ciclo de vida dos formulários via token dinâmico `javax.faces.ViewState`.

### 2. Consulta Rápida de Processos via HTTP Direto
- **Endpoint**: `/docflow/xhtml/docflow/protocolo/consultarProtocolo.jsf`
- **Funcionamento**: Permite submeter consultas por número de processo e recuperar trâmites, dados de protocolo, interessado e situação sem a sobrecarga de renderização gráfica.
- **Implementação**: `docflow_consultar_processo.js` e `src/tools/docflow.js`.

### 3. Extração e Download de Anexos do GED (Projetos de Engenharia)
- **Tela de Anexos**: `/docflow/xhtml/docflow/processo/processoConsultarTabPanel.jsf`
- **Diferença entre Peças do Processo vs. Anexos do GED**:
  - *Peças do Processo*: Documentos textuais (ofícios, despachos, pareceres) que compõem o corpo do processo.
  - *Anexo(s) do GED*: Arquivos físicos pesados anexados (projetos executivos SAA/SES em `.zip`, `.pdf`, `.dwg`, `.rar`, `.7z`).
- **Navegação em Pastas e Download**:
  - As pastas de anexos são organizadas em componentes `#gridPastas td.pastaColuna`.
  - Cada pasta dispara atualizações parciais AJAX RichFaces (`Faces-Request: partial/ajax`) atualizando a tabela `#anexos`.
  - O download é disparado via JavaScript `mojarra.jsfcljs` submetendo o formulário `formBody`.
- **Tratamento de Anomalias de Servidor**:
  - O cabeçalho `Content-Disposition` da Saneago trunca frequentemente nomes de arquivos contendo espaços ou acentos.
  - O pipeline possui lógica de sanitização que preserva o nome exibido na tabela com garantia de extensão e substituição de caracteres proibidos em sistemas de arquivos locais.

---

## 🚀 Pipeline de Download e Geração de Relatórios dos Projetos Aprovados

Para processamento dos projetos de engenharia da planilha `PROJETOS AVTO E-SEP Finalizados.xlsx`:

```bash
# Executar lote de projetos de Anápolis
node docflow_baixar_projetos_anapolis.js scratch/projetos_anapolis_filtrados.json 0 95
```

### Estrutura de Pastas Gerada (`downloads_anexos/`):
```text
downloads_anexos/
└── PROJETO_18974_2023_SAA_HIT SKY CLUB/
    ├── HIT SKY CLUB_SAA_18974-2023_ANAPOLIS.zip
    ├── RELATORIO_18974_2023_SAA_HIT SKY CLUB.md
    └── manifesto_projeto.json
```

Cada relatório em Markdown consolida:
1. **Identificação do Empreendimento**: Município, Sistema (SAA/SES), Nº AVTO, Validade, Status e ART's/RRT's.
2. **Dados Oficiais do DocFlow**: Interessado, Assunto, Data, Unidade Criadora, Autor e Sigilo.
3. **Metadados dos Anexos**: Tabela com links relativos locais, tamanho em MB, datas e descrições das pastas.

---

## 💻 Execução do Servidor MCP

```bash
# Instalação das dependências
npm install

# Início do servidor MCP via stdio
node src/index.js
```
