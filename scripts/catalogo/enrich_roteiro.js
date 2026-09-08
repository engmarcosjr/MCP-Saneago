const fs = require("fs");
const path = require("path");

const roteiroPath = path.resolve(__dirname, "../config/roteiro.json");
const docsDir = path.resolve(__dirname, "../docs/apps");

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

function carregarRoteiro() {
  if (fs.existsSync(roteiroPath)) {
    try {
      return JSON.parse(fs.readFileSync(roteiroPath, "utf8"));
    } catch (e) {
      console.error("Erro ao carregar roteiro:", e);
    }
  }
  return {};
}

function salvarRoteiro(roteiro) {
  fs.writeFileSync(roteiroPath, JSON.stringify(roteiro, null, 2), "utf8");
}

function gerarMarkdownECO303() {
  return `# ECO303 - Acerta Leitura/Consumo

## Categoria
Comercial e Atendimento ao Cliente

## Tipo
Leitura (Livre)

## O que faz
Permite consultar as leituras e consumos medidos, médios e estimados de hidrômetros instalados para contas da Saneago, bem como consultar limites e dados do hidrômetro.

## Campos da Tela Inicial
- **Conta** (input): Número da Conta comercial a ser consultada (ex: 1813366).

## Botões Disponíveis
- **Consultar**: Executa a busca pelos dados de consumo da conta informada.

## Exemplos de Intenção (Linguagem Natural)
- "verificar volume de água consumido da conta 1813366"
- "consultar consumo de água e dados do hidrômetro da conta"
- "abrir tela de acerta leitura/consumo"

## Roteiro de Operação
1. **Abrir a aplicação:** use a tool \`saneago_abrir_e_inspecionar\` com o código \`ECO303\` (ou via intenção).
2. **Preencher a conta:** informe a Conta no input correspondente.
3. **Executar busca:** clique no botão "Consultar".
4. **Ler resultados:** extraia os dados exibidos (Consumo Medido, Consumo Médio, Estimado, Número do Hidrômetro, Capacidade e Data de Instalação).

---
*Documento enriquecido com o fluxo real E2E aprendido em 15/07/2026 (Status: enriquecido).*
`;
}

function gerarMarkdownLRS041() {
  return `# LRS041 - Relatório de recomposição asfáltica

## Categoria
Logística, Redes e Serviços de Campo

## Tipo
Leitura (Livre)

## O que faz
Permite consultar relatórios de recomposição asfáltica de valas e cortes de RAs executados, detalhando dimensões (largura, comprimento, área), bairros, logradouros, quadras e lotes.

## Campos da Tela Inicial
- **Cidade** (input): Código da cidade (ex: 2 para Anápolis).
- **Data Inicial (De)** (input): Data de início do período do corte.
- **Data Final (Até)** (input): Data de término do período do corte.

## Botões Disponíveis
- **Consultar**: Carrega a listagem de recomposições para a cidade e período selecionados.
- **Seguinte/Páginas**: Botões de paginação na listagem inferior para rolar os resultados.

## Exemplos de Intenção (Linguagem Natural)
- "verificar asfalto lançado da RA 27273762025"
- "consultar recomposição asfáltica do corte na rua tal na data tal"

## Roteiro de Operação
1. **Abrir a aplicação:** use a tool \`saneago_abrir_e_inspecionar\` com o código \`LRS041\`.
2. **Informar filtros:** preencha a Cidade (ex: 2) e o intervalo de datas (De/Até) derivados a partir da RA.
3. **Buscar:** clique em "Consultar".
4. **Paginar e Localizar:** percorra a tabela paginando pelos botões de página (ex: página 4) até localizar a linha correspondente ao RA original.
5. **Ler resultados:** extraia as dimensões de largura, comprimento, área asfáltica, logradouro, bairro, quadra e lote.

---
*Documento enriquecido com o fluxo real E2E aprendido em 15/07/2026 (Status: enriquecido).*
`;
}

function gerarMarkdownECO701() {
  return `# ECO701 - Registro de Atendimento

## Categoria
Comercial e Atendimento ao Cliente

## Tipo
Misto (Leitura livre e Escrita sob confirmação)

## O que faz
Permite consultar Registros de Atendimento (RAs) existentes e realizar a abertura de novas RAs preenchendo CEP, endereço, número do imóvel, código do serviço e observações.

## Campos da Tela Inicial e Formulário
- **RA (Consulta)** (input): Número da RA a ser pesquisada.
- **CEP (Inclusão)** (input): CEP da localidade (ex: 75040050), que auto-preenche endereço, cidade e bairro.
- **Número (Inclusão)** (input): Número do imóvel.
- **Código Serviço (Inclusão)** (input): Código do serviço solicitado (ex: 2002).
- **Observação (Inclusão)** (textarea): Descrição/observação do atendimento.

## Botões Disponíveis
- **Consultar**: Pesquisa a RA informada na tela inicial.
- **Incluir**: Abre a tela/formulário para preenchimento de nova RA.
- **Confirmar/Gravar**: Submete o formulário de nova RA (bloqueado em modo de simulação).

## Exemplos de Intenção (Linguagem Natural)
- "consultar status do RA 1812692026"
- "abrir um RA de serviço 2002 na rua Ada Centine 550"

## Roteiro de Operação
### Para Consulta:
1. **Abrir aplicação:** use a tool \`saneago_abrir_e_inspecionar\` com \`ECO701\`.
2. **Pesquisar:** informe a RA e clique em "Consultar".

### Para Abertura de RA (Escrita Gated):
1. **Iniciar inclusão:** clique no botão "Incluir" para abrir o formulário.
2. **Preencher CEP:** insira o CEP no campo correspondente e aguarde o ZK carregar os dados de endereço.
3. **Preencher imóvel e serviço:** preencha o número do imóvel, o código do serviço (ex: 2002) e a observação de atendimento.
4. **Submeter:** use o gate de escrita com \`confirmar: true\` para salvar, ou \`confirmar: false\` para obter o resumo de pré-submit.

---
*Documento enriquecido com o fluxo real E2E aprendido em 15/07/2026 (Status: enriquecido).*
`;
}

function main() {
  console.log("Iniciando enriquecimento do roteiro...");
  const roteiro = carregarRoteiro();

  // ECO303 Enrichment
  roteiro["ECO303"] = {
    codigo: "ECO303",
    nome: "Acerta Leitura/Consumo",
    url_zul: "/prt/eco/ECO303AcertaLeituraConsumo.zul",
    categoria: "Comercial e Atendimento ao Cliente",
    o_que_faz: "Permite consultar as leituras e consumos medidos, médios e estimados de hidrômetros instalados para contas da Saneago, bem como consultar limites e dados do hidrômetro.",
    tipo: "leitura",
    campos: [
      { label: "Conta", tipo: "textbox", editavel: true }
    ],
    botoes: [
      { label: "Consultar", id: "btnConsultar" }
    ],
    operacoes: [
      {
        intencao: "consultar volume de agua consumido da conta",
        passos: [
          "Abrir a aplicação ECO303",
          "Preencher o campo Conta com o número da conta (ex: 1813366)",
          "Clicar no botão Consultar",
          "Ler os campos resultantes na tela como Medido (volume consumido), Média, Estimado, Número do Hidrômetro, Capacidade e Data de Instalação"
        ]
      }
    ],
    exemplos_intencao: [
      "verificar volume de água consumido da conta 1813366",
      "consultar consumo de água e dados do hidrômetro da conta",
      "abrir tela de acerta leitura/consumo"
    ],
    status_doc: "enriquecido"
  };

  // LRS041 Enrichment
  roteiro["LRS041"] = {
    codigo: "LRS041",
    nome: "Relatório de recomposição asfáltica",
    url_zul: "https://prod.saneago.com.br/prt/lrs/LRS041RelatorioRecomposicaoAsfaltica.zul",
    categoria: "Logística, Redes e Serviços de Campo",
    o_que_faz: "Permite consultar relatórios de recomposição asfáltica de valas e cortes de RAs executados, detalhando dimensões (largura, comprimento, área), bairros, logradouros, quadras e lotes.",
    tipo: "leitura",
    campos: [
      { label: "Cidade", tipo: "textbox", editavel: true },
      { label: "Data Inicial (De)", tipo: "datebox", editavel: true },
      { label: "Data Final (Até)", tipo: "datebox", editavel: true }
    ],
    botoes: [
      { label: "Consultar", id: "btnConsultar" },
      { label: "Seguinte/Páginas", id: "btnPaginacao" }
    ],
    operacoes: [
      {
        intencao: "verificar asfalto lançado da RA",
        passos: [
          "Abrir a aplicação LRS041",
          "Preencher a Cidade (código, ex: 2 para Anápolis)",
          "Preencher o Período do Corte (data de início e fim derivadas da RA)",
          "Clicar em Consultar",
          "Paginar a tabela resultante clicando nas páginas até localizar a linha correspondente ao RA original",
          "Ler as dimensões de recomposição (L x C, Área) e o endereço da linha encontrada"
        ]
      }
    ],
    exemplos_intencao: [
      "verificar asfalto lançado da RA 27273762025",
      "consultar recomposição asfáltica do corte na rua tal na data tal"
    ],
    status_doc: "enriquecido"
  };

  // ECO701 Enrichment
  roteiro["ECO701"] = {
    codigo: "ECO701",
    nome: "Registro de Atendimento",
    url_zul: "/prt/eco/ECO701RegistroAtendimento.zul",
    categoria: "Comercial e Atendimento ao Cliente",
    o_que_faz: "Permite consultar Registros de Atendimento (RAs) existentes e realizar a abertura de novas RAs preenchendo CEP, endereço, número do imóvel, código do serviço e observações.",
    tipo: "misto",
    campos: [
      { label: "RA (Consulta)", tipo: "textbox", editavel: true },
      { label: "CEP (Inclusão)", tipo: "textbox", editavel: true },
      { label: "Número (Inclusão)", tipo: "textbox", editavel: true },
      { label: "Código Serviço (Inclusão)", tipo: "textbox", editavel: true },
      { label: "Observação (Inclusão)", tipo: "textbox", editavel: true }
    ],
    botoes: [
      { label: "Consultar", id: "btnConsultar" },
      { label: "Incluir", id: "btnIncluir" },
      { label: "Confirmar/Gravar", id: "btnGravar" }
    ],
    operacoes: [
      {
        intencao: "consultar informacoes de uma RA",
        passos: [
          "Abrir a aplicação ECO701",
          "Preencher o campo de RA e clicar em Consultar"
        ]
      },
      {
        intencao: "abrir uma nova RA",
        passos: [
          "Abrir a aplicação ECO701 e clicar no botão Incluir",
          "Preencher o campo CEP (ex: 75040050), aguardando o auto-preenchimento do endereço pela API ZK",
          "Preencher o Número (ex: 550) e o Código de Serviço (ex: 2002)",
          "Preencher a Observação detalhando o serviço",
          "Clicar em Confirmar (submissão gated sob confirmação do usuário)"
        ]
      }
    ],
    exemplos_intencao: [
      "consultar status do RA 1812692026",
      "abrir um RA de serviço 2002 na rua Ada Centine 550"
    ],
    status_doc: "enriquecido"
  };

  salvarRoteiro(roteiro);
  console.log("Roteiro atualizado com sucesso em config/roteiro.json.");

  // Gerar markdowns
  fs.writeFileSync(path.join(docsDir, "ECO303.md"), gerarMarkdownECO303(), "utf8");
  fs.writeFileSync(path.join(docsDir, "LRS041.md"), gerarMarkdownLRS041(), "utf8");
  fs.writeFileSync(path.join(docsDir, "ECO701.md"), gerarMarkdownECO701(), "utf8");
  console.log("Arquivos markdown gerados/atualizados em docs/apps/.");
}

main();
