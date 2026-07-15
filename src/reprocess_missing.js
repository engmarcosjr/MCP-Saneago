const fs = require("fs");
const path = require("path");
const { abrirApp } = require("./portal");
const { inspecionarTela } = require("./inspector");
const { closeSession } = require("./session");

const missingApps = [
  { codigo: "ECO808", nome: "Áreas de Inf. dos Reservatórios" },
  { codigo: "JAJ028", nome: "Consulta Judicial" },
  { codigo: "JAJ033", nome: "Agenda Audiência" },
  { codigo: "LIG002", nome: "Mapa Web SanSIG" },
  { codigo: "LRS013", nome: "Extravazamento de Esgoto Sanitario" },
  { codigo: "LRS021", nome: "Extravasamento de Esgoto" },
  { codigo: "LRS314", nome: "Análise tempo padrão/execução/perfomance" },
  { codigo: "LRS702", nome: "Emite Serviços Executados em Atraso" },
  { codigo: "LRS734", nome: "Atendimento Por Código de Serviço" },
  { codigo: "MTG006", nome: "Andamento Geral" }
];

const roteiroPath = path.resolve(__dirname, "../config/roteiro.json");
const docsDir = path.resolve(__dirname, "../docs/apps");

function carregarRoteiro() {
  if (fs.existsSync(roteiroPath)) {
    try {
      return JSON.parse(fs.readFileSync(roteiroPath, "utf8"));
    } catch (e) {
      console.error(e);
    }
  }
  return {};
}

function salvarRoteiro(roteiro) {
  fs.writeFileSync(roteiroPath, JSON.stringify(roteiro, null, 2), "utf8");
}

function gerarMarkdown(app, campos, botoes, oQueFaz, categoria, tipo) {
  const listCampos = campos.map(c => `- **${c.label}** (${c.tipo}): ${c.editavel ? "Editável" : "Somente Leitura"}`).join("\n");
  const listBotoes = botoes.map(b => `- **${b.label}** (ID ZK: \`${b.id}\`)`).join("\n");
  
  return `# ${app.codigo} - ${app.nome}

## Categoria
${categoria}

## Tipo
${tipo === "escrita" ? "Escrita (Gated/Confirmar)" : "Leitura (Livre)"}

## O que faz
${oQueFaz}

## Campos da Tela Inicial
${listCampos || "Nenhum campo interativo detectado na tela inicial."}

## Botões Disponíveis
${listBotoes || "Nenhum botão detectado na tela inicial."}

## Exemplos de Intenção (Linguagem Natural)
- "Abrir a tela ${app.codigo} (${app.nome})"
- "Acessar o aplicativo de ${app.nome.toLowerCase()}"

## Roteiro de Operação
1. **Abrir a aplicação:** use a tool \`saneago_abrir_e_inspecionar\` com o código \`${app.codigo}\`.
2. **Preencher os campos necessários** e clicar nos botões de consulta/ação conforme o fluxo desejado.

---
*Documento gerado automaticamente pelo MCP-Saneago em ${new Date().toLocaleDateString('pt-BR')} (Status: auto).*
`;
}

function obterCategoria(codigo) {
  const prefix = codigo.substring(0, 3).toUpperCase();
  switch (prefix) {
    case "ECO": return "Comercial e Atendimento ao Cliente";
    case "LRS": return "Logística, Redes e Serviços de Campo";
    case "BAP": return "Recursos Humanos e Pessoal";
    case "JAJ": return "Apoio Jurídico e Contencioso";
    case "KRT": return "Controle de Processos e AVTO";
    case "MTG": return "Financeiro, Tesouraria e Remessas";
    default: return "Outros / Administrativo";
  }
}

function inferirTipo(botoes) {
  const norm = (s) => (s || '').toLowerCase();
  const temEscrita = botoes.some(b => {
    const lbl = norm(b.label);
    return lbl.includes("incluir") || lbl.includes("gravar") || lbl.includes("salvar") || 
           lbl.includes("excluir") || lbl.includes("alterar") || lbl.includes("atualizar") || 
           lbl.includes("gerar");
  });
  return temEscrita ? "escrita" : "leitura";
}

async function main() {
  console.log("=== REPROCESSANDO APLICATIVOS QUE NÃO ABRIRAM ===");
  const roteiro = carregarRoteiro();
  const relatorioFalhas = [];

  for (let i = 0; i < missingApps.length; i++) {
    const app = missingApps[i];
    console.log(`\n[${i+1}/${missingApps.length}] Processando: [${app.codigo}] ${app.nome}...`);
    
    try {
      const frame = await abrirApp(app.codigo);
      const rel = await inspecionarTela(frame);
      
      const campos = rel.inputs.map(i => ({ label: i.label, tipo: i.tipo, editavel: i.editavel }));
      const botoes = rel.buttons.map(b => ({ label: b.label, id: b.id }));
      
      const categoria = obterCategoria(app.codigo);
      const tipo = inferirTipo(botoes);
      const oQueFaz = `Permite visualizar e gerenciar informações relacionadas a ${app.nome.toLowerCase()}.`;
      
      const exemplosIntencao = [
        `abrir a tela de ${app.nome.toLowerCase()}`,
        `acessar a app ${app.codigo}`,
        `consultar ${app.nome.toLowerCase()}`
      ];

      roteiro[app.codigo] = {
        codigo: app.codigo,
        nome: app.nome,
        url_zul: frame.url(),
        categoria,
        o_que_faz: oQueFaz,
        tipo,
        campos,
        botoes,
        operacoes: [
          {
            intencao: `Acessar ${app.nome}`,
            passos: [
              `Abrir a aplicação ${app.codigo}`,
              `Preencher campos na tela inicial`
            ]
          }
        ],
        exemplos_intencao: exemplosIntencao,
        status_doc: "auto"
      };

      // Salva md
      const mdContent = gerarMarkdown(app, campos, botoes, oQueFaz, categoria, tipo);
      fs.writeFileSync(path.join(docsDir, `${app.codigo}.md`), mdContent, "utf8");
      
      console.log(`  [OK] Sucesso! Aplicativo ${app.codigo} aberto e documentado.`);
    } catch (err) {
      console.error(`  [FALHA] Não foi possível abrir ${app.codigo}:`, err.message);
      relatorioFalhas.push({ codigo: app.codigo, nome: app.nome, motivo: err.message });
    }
    
    await new Promise(r => setTimeout(r, 2000));
  }

  salvarRoteiro(roteiro);
  console.log("\nRoteiro atualizado.");
  
  console.log("\n=== RELATÓRIO DE FALHAS ===");
  if (relatorioFalhas.length === 0) {
    console.log("Todos os aplicativos abriram com sucesso!");
  } else {
    console.log(JSON.stringify(relatorioFalhas, null, 2));
  }

  await closeSession().catch(() => {});
}

main().catch(console.error);
