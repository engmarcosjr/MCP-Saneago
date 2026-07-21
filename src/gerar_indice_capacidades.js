const fs = require('fs');
const path = require('path');
const { classificarCapacidade } = require('./classificar_capacidades');

const ROOT_DIR = path.resolve(__dirname, '..');
const DEFAULT_ENTRADA = path.join(ROOT_DIR, 'config', 'capacidades.json');
const DEFAULT_SAIDA = path.join(ROOT_DIR, 'config', 'indice_capacidades.json');

const MAPA_PREFIXOS = {
  comercial: ['ECO', 'ECOV', 'ECNV', 'ECAV', 'EACV', 'ECSV', 'EGWV'],
  operacional: ['LRS', 'LRSV', 'LENV', 'LIG', 'LIGV', 'MPSV', 'GPMV'],
  juridico: ['JAJ', 'JAJV'],
  rh_pessoal: ['BAP', 'BAPV', 'BPAV', 'A', 'G', 'S'],
  financeiro_licitacoes: ['FGC', 'FGCV', 'FGIV', 'FGOV'],
  ouvidoria_governanca: ['MGOV'],
  suprimentos_logistica: ['MTG', 'MTGV'],
  transportes_frota: ['PGTV'],
  patrimonio: ['HFI', 'HFIV'],
  viagens_servico: ['HVW', 'HVWV'],
  qualidade_laboratorio: ['LQA', 'LQAV', 'LQEV', 'KRT', 'KRTV', 'KOCV'],
  ti_sistemas: ['BTWV', 'GSIV', 'GCAV', 'GSPV', 'GMQV', 'AGDV', 'MSIV', 'MSSV']
};

function derivarVertical(codigo) {
  if (!codigo) return 'indefinida';
  const prefixo = codigo.replace(/\d+.*$/, '').toUpperCase();
  
  for (const [vertical, prefixos] of Object.entries(MAPA_PREFIXOS)) {
    if (prefixos.includes(prefixo)) {
      return vertical;
    }
  }

  // Tenta prefixo de 1 caractere se for letra unica ex. A, D, G, S
  const letraInicial = codigo.charAt(0).toUpperCase();
  for (const [vertical, prefixos] of Object.entries(MAPA_PREFIXOS)) {
    if (prefixos.includes(letraInicial)) {
      return vertical;
    }
  }

  return 'indefinida';
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    entrada: DEFAULT_ENTRADA,
    saida: DEFAULT_SAIDA
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--entrada' && i + 1 < args.length) {
      options.entrada = path.resolve(process.cwd(), args[++i]);
    } else if (args[i] === '--saida' && i + 1 < args.length) {
      options.saida = path.resolve(process.cwd(), args[++i]);
    }
  }

  return options;
}

function gerarIndiceCapacidades(entradaPath, saidaPath) {
  if (!fs.existsSync(entradaPath)) {
    throw new Error(`Arquivo de entrada não encontrado: ${entradaPath}`);
  }

  const dadosBrutos = JSON.parse(fs.readFileSync(entradaPath, 'utf8'));
  
  const aplicacoes = [];
  const por_filtro = {};
  const por_vertical = {};

  let confiabilidade_alta = 0;
  let confiabilidade_media = 0;
  let confiabilidade_baixa = 0;
  let com_erro = 0;

  for (const reg of dadosBrutos) {
    const classificado = classificarCapacidade(reg);
    const vertical = derivarVertical(reg.codigo);
    const filtros = classificado.filtros_aceitos || [];
    const colunas = classificado.retorna || [];
    const erro = reg.erro || null;

    let confiabilidade = 'baixa';
    if (filtros.length > 0 && colunas.length > 0) {
      confiabilidade = 'alta';
      confiabilidade_alta++;
    } else if (filtros.length > 0 || colunas.length > 0) {
      confiabilidade = 'media';
      confiabilidade_media++;
    } else {
      confiabilidade = 'baixa';
      confiabilidade_baixa++;
    }

    if (erro) {
      com_erro++;
    }

    const appIndice = {
      codigo: reg.codigo,
      nome: reg.nome,
      url_real: reg.url_real || '',
      vertical,
      tecnologia: reg.tecnologia || 'desconhecida',
      filtros,
      colunas_retornadas: colunas,
      perguntas_que_responde: classificado.perguntas_que_responde || [],
      confiabilidade,
      erro
    };

    aplicacoes.push(appIndice);

    // Indice invertido por filtro
    for (const f of filtros) {
      if (!por_filtro[f]) por_filtro[f] = [];
      if (!por_filtro[f].includes(reg.codigo)) {
        por_filtro[f].push(reg.codigo);
      }
    }

    // Indice invertido por vertical
    if (!por_vertical[vertical]) por_vertical[vertical] = [];
    if (!por_vertical[vertical].includes(reg.codigo)) {
      por_vertical[vertical].push(reg.codigo);
    }
  }

  const indiceFinal = {
    total_aplicacoes: aplicacoes.length,
    resumo: {
      confiabilidade_alta,
      confiabilidade_media,
      confiabilidade_baixa,
      com_erro
    },
    aplicacoes,
    por_filtro,
    por_vertical
  };

  const dirSaida = path.dirname(saidaPath);
  if (!fs.existsSync(dirSaida)) {
    fs.mkdirSync(dirSaida, { recursive: true });
  }

  fs.writeFileSync(saidaPath, JSON.stringify(indiceFinal, null, 2), 'utf8');

  console.log(`[Índice] Gerado com sucesso em: ${saidaPath}`);
  console.log(`[Índice] Total: ${aplicacoes.length} apps (Alta: ${confiabilidade_alta}, Média: ${confiabilidade_media}, Baixa: ${confiabilidade_baixa}, Erros: ${com_erro})`);

  return indiceFinal;
}

const DOCS_SAIDA = path.join(ROOT_DIR, 'docs', 'CAPACIDADES.md');

function formatarFiltros(filtros) {
  if (!filtros || filtros.length === 0) return '-';
  return filtros.join(', ');
}

function formatarColunas(colunas) {
  if (!colunas || colunas.length === 0) return '-';
  const cols = colunas.slice(0, 5).join(', ');
  return colunas.length > 5 ? `${cols} (+${colunas.length - 5})` : cols;
}

function gerarDocsCapacidades(indice, docPath = DOCS_SAIDA) {
  const { total_aplicacoes, resumo, aplicacoes } = indice;
  const linhas = [];

  linhas.push('# Mapa de Capacidades por Vertical — Saneago');
  linhas.push('');
  linhas.push('Este documento apresenta o mapa completo de capacidades consultáveis do portal Saneago, organizado por vertical de negócio e derivado da varredura semântica.');
  linhas.push('');
  linhas.push('## Resumo Geral de Capacidades');
  linhas.push('');
  linhas.push(`- **Total de Aplicações Mapeadas:** ${total_aplicacoes}`);
  linhas.push(`- **Confiabilidade Alta (Filtros + Retornos):** ${resumo.confiabilidade_alta}`);
  linhas.push(`- **Confiabilidade Média (Filtros ou Retornos):** ${resumo.confiabilidade_media}`);
  linhas.push(`- **Confiabilidade Baixa (Sem filtros/retornos identificados):** ${resumo.confiabilidade_baixa}`);
  linhas.push(`- **Aplicações com Erro de Captura:** ${resumo.com_erro}`);
  linhas.push('');

  const NORM_TITULOS = {
    comercial: 'Comercial & Atendimento ao Cliente',
    operacional: 'Operacional, Redes & Manutenção',
    juridico: 'Jurídico & Processos',
    rh_pessoal: 'Recursos Humanos & Gestão de Pessoal',
    financeiro_licitacoes: 'Financeiro, Contabilidade & Licitações',
    ouvidoria_governanca: 'Ouvidoria & Governança',
    suprimentos_logistica: 'Suprimentos & Logística',
    transportes_frota: 'Transportes & Gestão de Frota',
    patrimonio: 'Patrimônio & Bens',
    viagens_servico: 'Viagens & Diárias',
    qualidade_laboratorio: 'Qualidade da Água & Laboratório',
    ti_sistemas: 'TI, Sistemas & Infraestrutura',
    indefinida: 'Outros / Vertical Indefinida'
  };

  const porVert = {};
  for (const app of aplicacoes) {
    const v = app.vertical || 'indefinida';
    if (!porVert[v]) porVert[v] = [];
    porVert[v].push(app);
  }

  for (const [key, titulo] of Object.entries(NORM_TITULOS)) {
    const list = porVert[key] || [];
    if (list.length === 0) continue;

    linhas.push(`## ${titulo} (${list.length} apps)`);
    linhas.push('');
    linhas.push('| Código | Nome da Aplicação | Filtros Aceitos | O que Retorna |');
    linhas.push('|---|---|---|---|');

    for (const app of list) {
      const filtrosStr = formatarFiltros(app.filtros);
      const colunasStr = formatarColunas(app.colunas_retornadas);
      linhas.push(`| **${app.codigo}** | ${app.nome} | ${filtrosStr} | ${colunasStr} |`);
    }

    linhas.push('');
  }

  const dirDoc = path.dirname(docPath);
  if (!fs.existsSync(dirDoc)) {
    fs.mkdirSync(dirDoc, { recursive: true });
  }

  fs.writeFileSync(docPath, linhas.join('\n'), 'utf8');
  console.log(`[Índice] Documentação salva em: ${docPath}`);
}

function main() {
  const options = parseArgs();
  const indice = gerarIndiceCapacidades(options.entrada, options.saida);
  gerarDocsCapacidades(indice);
}

if (require.main === module) {
  main();
}

module.exports = {
  gerarIndiceCapacidades,
  gerarDocsCapacidades,
  derivarVertical,
  MAPA_PREFIXOS
};
