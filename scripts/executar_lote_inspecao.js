const fs = require('fs');
const path = require('path');
const { abrirApp } = require('../src/portal');
const { inspecionarTela } = require('../src/inspector');

async function inspecionarAppEGravar(codigo) {
  console.log(`\n=== Inspecionando ${codigo} ===`);
  try {
    const frame = await abrirApp(codigo);
    const relatorio = await inspecionarTela(frame);
    relatorio.url_real = frame.url();
    relatorio.codigo = codigo;

    const caminhoEvidencia = path.join(__dirname, `../docs/mapeamento/evidencias/${codigo}.inspect.json`);
    fs.writeFileSync(caminhoEvidencia, JSON.stringify(relatorio, null, 2));
    console.log(`[SUCESSO] ${codigo} gravado em ${caminhoEvidencia}`);
    console.log(`URL real: ${relatorio.url_real}`);
    console.log(`Campos: ${relatorio.inputs.length}, Botoes: ${relatorio.botoes.length}`);
    return { ok: true, relatorio };
  } catch (err) {
    console.error(`[ERRO] Falha ao inspecionar ${codigo}:`, err.message);
    const relatorioErro = {
      codigo,
      url_real: null,
      erro: err.message,
      inputs: [],
      botoes: [],
      mensagens: []
    };
    const caminhoEvidencia = path.join(__dirname, `../docs/mapeamento/evidencias/${codigo}.inspect.json`);
    fs.writeFileSync(caminhoEvidencia, JSON.stringify(relatorioErro, null, 2));
    return { ok: false, erro: err.message };
  }
}

async function main() {
  const lote = ['ECO811', 'ECO815', 'ECO823'];
  for (const cod of lote) {
    await inspecionarAppEGravar(cod);
  }
  process.exit(0);
}

main();
