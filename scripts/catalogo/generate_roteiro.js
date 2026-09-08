const fs = require("fs");
const path = require("path");
const { abrirApp } = require("./portal");
const { inspecionarTela } = require("./inspector");
const { closeSession } = require("./session");

const catalogoPath = path.resolve(__dirname, "../config/catalogo_aplicacoes.json");
const roteiroPath = path.resolve(__dirname, "../config/roteiro.json");
const docsDir = path.resolve(__dirname, "../docs/apps");

// Garantir diretório de docs
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

function carregarRoteiro() {
  if (fs.existsSync(roteiroPath)) {
    try {
      return JSON.parse(fs.readFileSync(roteiroPath, "utf8"));
    } catch (e) {
      console.error("Erro ao carregar roteiro.json existente, iniciando vazio:", e.message);
    }
  }
  return {};
}

function salvarRoteiro(roteiro) {
  fs.writeFileSync(roteiroPath, JSON.stringify(roteiro, null, 2), "utf8");
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
    case "FGC": return "Contratos e Integração SAP";
    case "HFI": return "Patrimônio e Bens";
    case "HVW": return "Prestação de Contas e Viagens";
    case "LIG": return "Geoprocessamento e Mapas (SanSIG)";
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

async function processarApp(app) {
  console.log(`\n>>> Processando: [${app.codigo}] ${app.nome}...`);
  let frame = null;
  try {
    frame = await abrirApp(app.codigo);
    const relatorio = await inspecionarTela(frame);

    const campos = relatorio.inputs.map(i => ({ label: i.label, tipo: i.tipo, editavel: i.editavel }));
    const botoes = relatorio.buttons.map(b => ({ label: b.label, id: b.id }));
    
    const categoria = obterCategoria(app.codigo);
    const tipo = inferirTipo(botoes);
    const oQueFaz = `Permite visualizar e gerenciar informações relacionadas a ${app.nome.toLowerCase()}.`;
    
    const exemplosIntencao = [
      `abrir a tela de ${app.nome.toLowerCase()}`,
      `acessar a app ${app.codigo}`,
      `consultar ${app.nome.toLowerCase()}`
    ];

    const entry = {
      codigo: app.codigo,
      nome: app.nome,
      url_zul: app.url_zul,
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

    // Salvar markdown
    const mdContent = gerarMarkdown(app, campos, botoes, oQueFaz, categoria, tipo);
    fs.writeFileSync(path.join(docsDir, `${app.codigo}.md`), mdContent, "utf8");
    console.log(`[OK] Markdown gerado em docs/apps/${app.codigo}.md`);

    return entry;
  } catch (error) {
    console.error(`[ERRO] Falha ao processar ${app.codigo}:`, error.message);
    return null;
  }
}

async function main() {
  console.log("=== INICIANDO GERAÇÃO DE ROTEIRO DAS APLICAÇÕES ===");
  
  const catalogo = JSON.parse(fs.readFileSync(catalogoPath, "utf8"));
  const roteiro = carregarRoteiro();

  // Filtrar apenas as que não foram processadas ainda
  const pendentes = catalogo.filter(app => !roteiro[app.codigo]);
  console.log(`Total no catálogo: ${catalogo.length}. Já processadas: ${Object.keys(roteiro).length}. Pendentes: ${pendentes.length}`);

  let erroConsecutivoCount = 0;
  
  for (let i = 0; i < pendentes.length; i++) {
    const app = pendentes[i];
    
    // Válvula de segurança: se muitas apps falharem de forma consecutiva (ex: login caiu), interrompe
    if (erroConsecutivoCount >= 5) {
      console.error("\n!!! VÁLVULA DE SEGURANÇA !!!");
      console.error("Mais de 5 erros consecutivos de carregamento. Parando execução para evitar loop/desperdício.");
      break;
    }

    const resultado = await processarApp(app);
    if (resultado) {
      roteiro[app.codigo] = resultado;
      salvarRoteiro(roteiro);
      erroConsecutivoCount = 0;
    } else {
      erroConsecutivoCount++;
    }

    // Intervalo de segurança para não sobrecarregar o portal ZK
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  await closeSession().catch(() => {});
  console.log(`\n=== PROCESSO CONCLUÍDO. ROTEIRO ATUALIZADO COM ${Object.keys(roteiro).length} APPS ===`);
}

main().catch(console.error);
