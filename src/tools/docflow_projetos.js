const fs = require("fs");
const path = require("path");

const ROOT_DIR = process.env.DOCFLOW_DATA_DIR || path.join(__dirname, "..", "..");
const INDEX_FILE = process.env.DOCFLOW_INDEX_FILE || path.join(ROOT_DIR, "config", "indice_projetos.json");

function gerarIndiceProjetos() {
  const bases = ["projetos_organizados_anapolis", "projetos_organizados_goiania"];
  const indice = [];

  for (const base of bases) {
    const baseDir = path.join(ROOT_DIR, base);
    if (!fs.existsSync(baseDir)) continue;

    const pastas = fs.readdirSync(baseDir);
    for (const pasta of pastas) {
      if (pasta.startsWith("PROJETO_")) {
        const manifestPath = path.join(baseDir, pasta, "manifesto_projeto.json");
        if (fs.existsSync(manifestPath)) {
          try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
            const p = manifest.projetoExcel || {};
            const d = manifest.dadosDocflow || {};
            
            // Extracts ARTs
            const arts = p["Nº ART'S / RRT'S"] || p["Nº ART's / RRT's"] || "";
            
            indice.push({
              id: pasta,
              municipio: (p["MUNICÍPIO"] || "").trim().toUpperCase(),
              empreendimento: (p["NOME DO EMPREENDIMENTO"] || "").trim().toUpperCase(),
              sistema: (p["SISTEMA"] || "").trim().toUpperCase(),
              avto: (p["Nº AVTO"] || "").trim(),
              processo: (p["Nº PROCESSO"] || d["Número do Processo"] || "").trim(),
              ano: (p["Nº PROCESSO"] || d["Número do Processo"] || "").split("/")[1] || "",
              art: arts.trim(),
              caminhoBase: base,
              totalAnexos: manifest.totalAnexosBaixados || 0
            });
          } catch (e) {
            console.error("Erro ao ler manifesto " + manifestPath + ": " + e.message);
          }
        }
      }
    }
  }

  const configDir = path.join(ROOT_DIR, "config");
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
  
  fs.writeFileSync(INDEX_FILE, JSON.stringify(indice, null, 2), "utf-8");
  return indice;
}

async function pesquisarProjetosLocais({ empreendimento, avto, sistema, processo, ano, municipio, art, limite = 15 }) {
  if (!fs.existsSync(INDEX_FILE)) {
    gerarIndiceProjetos();
  }

  const indice = JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8"));
  const limitNum = parseInt(limite, 10) || 15;
  const resultados = [];

  const empStr = (empreendimento || "").toLowerCase().trim();
  const avtoStr = (avto || "").toLowerCase().trim();
  const sysStr = (sistema || "").toLowerCase().trim();
  const procStr = (processo || "").toLowerCase().trim();
  const anoStr = (ano || "").toLowerCase().trim();
  const munStr = (municipio || "").toLowerCase().trim();
  const artStr = (art || "").toLowerCase().trim();

  for (const item of indice) {
    let match = true;
    
    if (empStr && !(item.empreendimento || "").toLowerCase().includes(empStr)) match = false;
    if (avtoStr && !(item.avto || "").toLowerCase().includes(avtoStr)) match = false;
    if (sysStr && item.sistema.toLowerCase() !== sysStr) match = false;
    if (procStr && !(item.processo || "").toLowerCase().includes(procStr)) match = false;
    if (anoStr && item.ano !== anoStr) match = false;
    if (munStr && !(item.municipio || "").toLowerCase().includes(munStr)) match = false;
    if (artStr && !(item.art || "").toLowerCase().includes(artStr)) match = false;

    if (match) {
      resultados.push(item);
      if (resultados.length >= limitNum * 2) break; // Fetch a bit more for total count, then slice
    }
  }

  return {
    sucesso: true,
    totalEncontrado: resultados.length,
    registros: resultados.slice(0, limitNum),
    mensagem: "Para regerar o índice, apague o arquivo 'config/indice_projetos.json' ou chame a função interna gerarIndiceProjetos()."
  };
}

module.exports = {
  gerarIndiceProjetos,
  pesquisarProjetosLocais
};
