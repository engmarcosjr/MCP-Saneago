"use strict";

const fs = require("fs");
const path = require("path");

const capacidadesPath = path.join(__dirname, "..", "config", "capacidades.json");
const roteiroPath = path.join(__dirname, "..", "config", "roteiro.json");
const catalogoPath = path.join(__dirname, "..", "config", "catalogo_aplicacoes.json");
const docsAppsDir = path.join(__dirname, "..", "docs", "apps");

const PRIORITARIAS = [
  "LRS010", "LRS034", "LRS041", "LRS100", "LRS105", "LRS208", "LRS272",
  "ECO151", "ECO154", "ECO202", "ECO205", "ECO701", "ECO707", "ECO708",
  "ECO709", "ECO711", "ECO712", "ECO731", "MTG020"
];

const PREFIX_CATEGORIES = {
  BAP: "Recursos Humanos e Pessoal",
  BAPV: "Recursos Humanos e Pessoal",
  ECO: "Comercial e Atendimento ao Cliente",
  ECOV: "Comercial e Atendimento ao Cliente",
  LRS: "Logística, Redes e Serviços de Campo",
  LRSV: "Logística, Redes e Serviços de Campo",
  FGC: "Contratos e Integração SAP",
  FGCV: "Contratos e Integração SAP",
  JAJ: "Apoio Jurídico e Contencioso",
  JAJV: "Apoio Jurídico e Contencioso",
  HFI: "Patrimônio e Bens",
  HFIV: "Patrimônio e Bens",
  HVW: "Prestação de Contas e Viagens",
  HVWV: "Prestação de Contas e Viagens",
  KRT: "Controle de Processos e AVTO",
  KRTV: "Controle de Processos e AVTO",
  MTG: "Financeiro, Tesouraria e Remessas",
  MTGV: "Financeiro, Tesouraria e Remessas",
};

const WRITE_BUTTON_REGEX = /Incluir|Gravar|Salvar|Confirmar|Alterar|Excluir|Cancelar RA|Lançar|Executar|Distribuir/i;
const ESCRITA_CODES = ["LRS010", "LRS105", "ECO151", "ECO202", "ECO701", "ECO731"];

function normalizeUrl(url) {
  if (!url) return "";
  let clean = url.trim();
  clean = clean.replace(/^https?:\/\/(www|prod)\.saneago\.com\.br/i, "");
  return clean;
}

function getCategoria(codigo, existingCategory) {
  if (existingCategory && existingCategory !== "Outros / Administrativo") {
    return existingCategory;
  }
  for (const prefix of Object.keys(PREFIX_CATEGORIES)) {
    if (codigo.startsWith(prefix)) {
      return PREFIX_CATEGORIES[prefix];
    }
  }
  return existingCategory || "Outros / Administrativo";
}

function isWriteButton(label) {
  return WRITE_BUTTON_REGEX.test(label || "");
}

function generateDocMd(app) {
  const isEnriched = app.status_doc === "enriquecido";
  const lines = [];

  lines.push(`# ${app.codigo} - ${app.nome}`);
  lines.push("");
  lines.push("## Categoria");
  lines.push(app.categoria || "Outros / Administrativo");
  lines.push("");
  lines.push("## Tecnologia e URL");
  lines.push(`ZK UI (URL .zul: \`${app.url_zul || "N/A"}\`)`);
  lines.push("");
  lines.push("## Tipo");
  if (app.codigo === "ECO701") {
    lines.push("Misto (Leitura livre e Escrita sob confirmação)");
  } else if (ESCRITA_CODES.includes(app.codigo)) {
    lines.push("Escrita (Ações alteram estado — exige gate de confirmação)");
  } else if (app.codigo === "MTG020") {
    lines.push("Relatório (Geração/Consulta PDF)");
  } else {
    lines.push("Leitura (Livre)");
  }
  lines.push("");
  lines.push("## O que faz");
  lines.push(app.o_que_faz || `Permite visualizar e gerenciar informações relacionadas a ${app.nome.toLowerCase()}.`);
  lines.push("");

  lines.push("## Campos da Tela");
  if (app.campos && app.campos.length > 0) {
    lines.push("| Rótulo | Tipo | Editável |");
    lines.push("|---|---|---|");
    for (const c of app.campos) {
      lines.push(`| ${c.label || "Sem Rótulo"} | ${c.tipo || "textbox"} | ${c.editavel ? "Sim" : "Não"} |`);
    }
  } else {
    lines.push("Nenhum campo rotulado capturado.");
  }
  lines.push("");

  lines.push("## Botões Disponíveis");
  if (app.botoes && app.botoes.length > 0) {
    for (const b of app.botoes) {
      const lbl = b.label || "Sem Rótulo";
      if (isWriteButton(lbl)) {
        lines.push(`- **${lbl}** (ação de ESCRITA — exige gate)`);
      } else {
        lines.push(`- **${lbl}**`);
      }
    }
  } else {
    lines.push("Nenhum botão capturado.");
  }
  lines.push("");

  lines.push("## Colunas da Grade de Resultado");
  if (app.colunas && app.colunas.length > 0) {
    for (const col of app.colunas) {
      lines.push(`- ${col}`);
    }
  } else {
    lines.push("Nenhuma grade de resultado mapeada.");
  }
  lines.push("");

  if (app.exemplos_intencao && app.exemplos_intencao.length > 0) {
    lines.push("## Exemplos de Intenção (Linguagem Natural)");
    for (const ex of app.exemplos_intencao) {
      lines.push(`- "${ex}"`);
    }
    lines.push("");
  }

  lines.push("## Roteiro de Operação");
  if (app.operacoes && app.operacoes.length > 0) {
    for (const op of app.operacoes) {
      if (op.intencao) lines.push(`### ${op.intencao}:`);
      if (op.passos) {
        op.passos.forEach((p, idx) => lines.push(`${idx + 1}. ${p}`));
      }
    }
  } else {
    lines.push(`1. **Abrir a aplicação:** use a tool \`saneago_abrir_e_inspecionar\` com o código \`${app.codigo}\`.`);
    lines.push("2. **Preencher os campos necessários** e clicar nos botões de consulta/ação conforme o fluxo desejado.");
  }
  lines.push("");

  lines.push("## Como operar por HTTP");
  if (app.codigo === "ECO707" || app.codigo === "ECO709") {
    lines.push(`Contrato HTTP disponível em [\`docs/http/${app.codigo}.md\`](file:///C:/repos/MCP-Saneago/docs/http/${app.codigo}.md).`);
  } else {
    const httpDocFile = path.join(__dirname, "..", "docs", "http", `${app.codigo}.md`);
    if (fs.existsSync(httpDocFile)) {
      lines.push(`Contrato HTTP disponível em [\`docs/http/${app.codigo}.md\`](file:///C:/repos/MCP-Saneago/docs/http/${app.codigo}.md).`);
    } else {
      lines.push("Contrato HTTP não capturado.");
    }
  }
  lines.push("");

  lines.push("---");
  if (isEnriched) {
    lines.push(`*Documento enriquecido com o fluxo real E2E aprendido em 15/07/2026 (Status: enriquecido, dados base de capacidades.json de 23/07/2026).*`);
  } else {
    lines.push(`*Documento gerado automaticamente a partir de capacidades.json de 23/07/2026 (Status: auto).*`);
  }
  lines.push("");

  return lines.join("\n");
}

function main() {
  const args = process.argv.slice(2);
  const gerarTodas = args.includes("--todas");

  const capacidades = JSON.parse(fs.readFileSync(capacidadesPath, "utf8"));
  const catalogo = JSON.parse(fs.readFileSync(catalogoPath, "utf8"));
  
  let roteiroAtual = {};
  if (fs.existsSync(roteiroPath)) {
    roteiroAtual = JSON.parse(fs.readFileSync(roteiroPath, "utf8"));
  }

  const novoRoteiro = {};

  for (const cap of capacidades) {
    const code = cap.codigo;
    const catItem = catalogo.find(c => c.codigo === code) || {};
    const existingRoteiro = roteiroAtual[code];
    const isEnriched = existingRoteiro && existingRoteiro.status_doc === "enriquecido";

    const urlZul = normalizeUrl(cap.url_real) || normalizeUrl(catItem.url_zul) || (existingRoteiro ? existingRoteiro.url_zul : "");
    const categoria = getCategoria(code, existingRoteiro ? existingRoteiro.categoria : null);

    // Converte campos/inputs (sem uuid)
    const campos = (cap.inputs || []).map(inp => ({
      label: inp.rotulo || "Sem Rótulo",
      tipo: inp.tipo === "date" ? "datebox" : (inp.tipo === "combobox" ? "combobox" : "textbox"),
      editavel: !inp.readonly
    }));

    // Converte botoes (sem uuid ZK)
    const botoes = (cap.botoes || []).map(b => {
      const item = { label: b.label || "Sem Rótulo" };
      return item;
    });

    const colunas = cap.colunas || [];

    let tipo = "leitura";
    if (code === "ECO701") {
      tipo = "misto";
    } else if (ESCRITA_CODES.includes(code) || botoes.some(b => isWriteButton(b.label))) {
      tipo = "escrita";
    } else if (code === "MTG020") {
      tipo = "relatorio";
    }

    if (isEnriched) {
      // Preserva dados curados manuais
      novoRoteiro[code] = {
        codigo: code,
        nome: existingRoteiro.nome || cap.nome,
        url_zul: urlZul,
        categoria: categoria,
        o_que_faz: existingRoteiro.o_que_faz,
        tipo: existingRoteiro.tipo || tipo,
        campos: campos.length > 0 ? campos : (existingRoteiro.campos || []),
        botoes: botoes.length > 0 ? botoes : (existingRoteiro.botoes || []).map(b => ({ label: b.label })),
        colunas: colunas,
        operacoes: existingRoteiro.operacoes,
        exemplos_intencao: existingRoteiro.exemplos_intencao,
        status_doc: "enriquecido"
      };
    } else {
      const nome = cap.nome || catItem.nome || code;
      const oQueFaz = `Permite visualizar e gerenciar informações relacionadas a ${nome.toLowerCase()}.`;
      const exemplosIntencao = [
        `abrir a tela de ${nome.toLowerCase()}`,
        `acessar a app ${code}`,
        `consultar ${nome.toLowerCase()}`
      ];
      const operacoes = [
        {
          intencao: `Acessar ${nome}`,
          passos: [
            `Abrir a aplicação ${code}`,
            "Preencher campos na tela inicial"
          ]
        }
      ];

      novoRoteiro[code] = {
        codigo: code,
        nome: nome,
        url_zul: urlZul,
        categoria: categoria,
        o_que_faz: oQueFaz,
        tipo: tipo,
        campos: campos,
        botoes: botoes,
        colunas: colunas,
        operacoes: operacoes,
        exemplos_intencao: exemplosIntencao,
        status_doc: "auto"
      };
    }
  }

  // Escreve config/roteiro.json atualizado com 596 apps
  fs.writeFileSync(roteiroPath, JSON.stringify(novoRoteiro, null, 2), "utf8");
  console.log(`roteiro.json regenerado com sucesso: ${Object.keys(novoRoteiro).length} aplicações.`);

  // Regenera os docs em docs/apps/
  const appsParaGerarDoc = gerarTodas ? Object.keys(novoRoteiro) : PRIORITARIAS;
  let countDocs = 0;
  for (const code of appsParaGerarDoc) {
    if (novoRoteiro[code]) {
      const docContent = generateDocMd(novoRoteiro[code]);
      const filePath = path.join(docsAppsDir, `${code}.md`);
      fs.writeFileSync(filePath, docContent, "utf8");
      countDocs++;
    }
  }
  console.log(`Docs regenerados em docs/apps/: ${countDocs} arquivos.`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
