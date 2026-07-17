#!/usr/bin/env node

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");

const catalogo = require("../config/catalogo_aplicacoes.json");
const { abrirApp } = require("./portal");
const { inspecionarTela, aguardarInputPorRotulo } = require("./inspector");
const { preencherCampo, clicarBotao } = require("./executor");
const { closeSession } = require("./session");
const { logAudit } = require("./audit");
const { consultarConsumo } = require("./tools/eco303");
const { consultarAsfalto } = require("./tools/lrs041");
const { abrirRA } = require("./tools/eco701");
const { consumeConfirmed, createPending } = require("./confirmation-gate");
// Armazena o frame ativo (app atualmente aberta) para uso subsequente
let activeFrame = null;

const server = new Server(
  {
    name: "mcp-saneago",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const LEGACY_ALLOW_WRITE = process.env.SANEAGO_ALLOW_WRITE === '1' || process.env.SANEAGO_ALLOW_WRITE === 'true';
const ALLOW_GENERIC_WRITE =
  LEGACY_ALLOW_WRITE ||
  process.env.SANEAGO_ALLOW_GENERIC_WRITE === '1' ||
  process.env.SANEAGO_ALLOW_GENERIC_WRITE === 'true';
const ALLOW_RA_WRITE =
  LEGACY_ALLOW_WRITE ||
  process.env.SANEAGO_ALLOW_RA_WRITE === '1' ||
  process.env.SANEAGO_ALLOW_RA_WRITE === 'true';

// Definicao das Ferramentas
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = [
    {
      name: "saneago_listar_aplicacoes",
      description: "Lista as aplicacoes da Saneago disponiveis no catalogo para interacao automatizada.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "saneago_abrir_e_inspecionar",
      description: "Abre uma aplicacao pelo nome, codigo ou intencao/objetivo e inspeciona sua tela inicial, retornando os campos interativos (inputs, botoes) com seus respectivos IDs ZK.",
      inputSchema: {
        type: "object",
        properties: {
          nomeAplicacao: {
            type: "string",
            description: "Nome, codigo ou intencao/objetivo da aplicacao (ex: 'ECO701', 'abrir RA' ou 'volume consumido')",
          },
        },
        required: ["nomeAplicacao"],
      },
    },
    {
      name: "saneago_eco701_consultar_ra",
      description: "Abre o ECO701, consulta o Registro de Atendimento (RA) especificado e retorna os dados da tela (textos e inputs).",
      inputSchema: {
        type: "object",
        properties: {
          ra: {
            type: "string",
            description: "O numero do RA a ser consultado (ex: 1812692026)",
          },
        },
        required: ["ra"],
      },
    },
    {
      name: "saneago_consultar_consumo",
      description: "Consulta o volume consumido de uma conta especifica no aplicativo ECO303.",
      inputSchema: {
        type: "object",
        properties: {
          conta: {
            type: "string",
            description: "O numero da conta a ser consultada",
          },
        },
        required: ["conta"],
      },
    },
    {
      name: "saneago_consultar_roteiro",
      description: "Consulta o roteiro estruturado das aplicacoes buscando por intencao em linguagem natural ou codigo da app.",
      inputSchema: {
        type: "object",
        properties: {
          intencao: {
            type: "string",
            description: "Intencao em linguagem natural (ex: 'volume consumido')",
          },
          codigo: {
            type: "string",
            description: "Codigo da aplicacao (ex: ECO303)",
          }
        }
      }
    },
    {
      name: "saneago_asfalto_da_ra",
      description: "Consulta o asfalto lancado de um RA especifico buscando a cidade e data de corte no ECO701 e paginando no LRS041.",
      inputSchema: {
        type: "object",
        properties: {
          ra: {
            type: "string",
            description: "O numero do RA a ser consultado",
          },
          data: {
            type: "string",
            description: "Data para busca, se ja conhecida (opcional, será inferida se nao passada)",
          }
        },
        required: ["ra"],
      }
    }
  ];

  if (ALLOW_GENERIC_WRITE) {
    tools.push({
      name: "saneago_preencher_campo",
      description: "Preenche um campo de texto ou data em uma aplicacao ja aberta. A aplicacao deve ter sido aberta com saneago_abrir_e_inspecionar antes.",
      inputSchema: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
            description: "ID do elemento ZK a ser preenchido (obtido via inspecao)",
          },
          valor: {
            type: "string",
            description: "O valor a ser preenchido",
          },
        },
        required: ["elementId", "valor"],
      },
    });
    
    tools.push({
      name: "saneago_clicar_botao",
      description: "Clica em um botao de uma aplicacao ja aberta e retorna a nova inspecao da tela (caso a interface tenha mudado).",
      inputSchema: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
            description: "ID do botao ZK a ser clicado (obtido via inspecao)",
          },
        },
        required: ["elementId"],
      },
    });

  }

  if (ALLOW_RA_WRITE) {
    tools.push({
      name: "saneago_abrir_ra",
      description: "Prepara ou efetiva uma RA no ECO701. Primeiro use confirmar:false. Somente apos o usuario confirmar em uma nova mensagem, repita exatamente os dados com confirmar:true e o confirmationToken recebido no preview.",
      inputSchema: {
        type: "object",
        properties: {
          endereco: {
            type: "string",
            description: "O endereco da ocorrencia",
          },
          servico: {
            type: "string",
            description: "O tipo de servico solicitado",
          },
          confirmar: {
            type: "boolean",
            description: "Deve ser true para submeter. Se false, apenas descreve o que sera feito.",
          },
          confirmationToken: {
            type: "string",
            description: "Token retornado pelo preview. Obrigatorio e de uso unico quando confirmar for true.",
          },
          formaAtendimento: {
            type: "string",
            description: "Forma de atendimento selecionada (ex: '3 - INTERNO', '1 - TELEFONE')",
            default: "3 - INTERNO"
          },
          nomeCliente: {
            type: "string",
            description: "Nome do cliente/interessado que solicitou o atendimento. Obrigatorio pelo portal. Peca ao usuario; nunca invente.",
          },
          nomeContato: {
            type: "string",
            description: "Nome de quem a equipe deve contatar no local. PERGUNTE ao usuario se ha contato real; so omita (padrao 'SANEAGO') quando nao houver.",
            default: "SANEAGO"
          },
          telefoneContato: {
            type: "string",
            description: "Telefone do contato com DDD (ex: '62988887777'). PERGUNTE ao usuario; so omita (padrao institucional) quando nao houver contato real.",
            default: "6299999999"
          }
        },
        required: ["endereco", "servico", "confirmar", "nomeCliente"],
      },
    });
  }

  return { tools };
});

// Execucao das Ferramentas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error(`[MCP-Saneago] tool=${request.params.name} started`);
  try {
    switch (request.params.name) {
      case "saneago_listar_aplicacoes":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(catalogo, null, 2),
            },
          ],
        };

      case "saneago_abrir_e_inspecionar": {
        const { nomeAplicacao } = request.params.arguments;
        let query = nomeAplicacao;
        
        // Tenta achar no roteiro por intencao/codigo primeiro
        try {
          const roteiro = require("../config/roteiro.json");
          const queryLower = nomeAplicacao.toLowerCase();
          
          if (roteiro[nomeAplicacao.toUpperCase()]) {
            query = nomeAplicacao.toUpperCase();
          } else {
            const matchedApp = Object.values(roteiro).find(app => {
              return app.nome.toLowerCase().includes(queryLower) ||
                     app.o_que_faz.toLowerCase().includes(queryLower) ||
                     app.exemplos_intencao.some(ex => ex.toLowerCase().includes(queryLower));
            });
            if (matchedApp) {
              query = matchedApp.codigo;
            }
          }
        } catch (e) {
          const appInfo = catalogo.find(app => app.codigo === nomeAplicacao || app.nome.toLowerCase().includes(nomeAplicacao.toLowerCase()));
          if (appInfo) {
            query = appInfo.codigo;
          }
        }
        
        activeFrame = await abrirApp(query);
        const relatorio = await inspecionarTela(activeFrame);
        
        return {
          content: [
            {
              type: "text",
              text: `Aplicacao ${query} aberta com sucesso.\nEstado inicial da tela:\n${JSON.stringify(relatorio, null, 2)}`,
            },
          ],
        };
      }

      case "saneago_preencher_campo": {
        if (!ALLOW_GENERIC_WRITE) throw new Error("Acoes genericas de escrita estao desabilitadas.");
        
        const { elementId, valor } = request.params.arguments;
        
        if (!activeFrame) {
          throw new Error("Nenhuma aplicacao esta aberta. Use saneago_abrir_e_inspecionar primeiro.");
        }
        
        const appUrl = activeFrame.url();
        try {
          await preencherCampo(activeFrame, elementId, valor);
          logAudit("saneago_preencher_campo", appUrl, `Campo ${elementId} = ${valor}`, "SUCESSO");
          return {
            content: [
              {
                type: "text",
                text: `Campo ${elementId} preenchido com "${valor}".`,
              },
            ],
          };
        } catch (error) {
          logAudit("saneago_preencher_campo", appUrl, `Campo ${elementId} = ${valor}`, `ERRO: ${error.message}`);
          throw error;
        }
      }

      case "saneago_clicar_botao": {
        if (!ALLOW_GENERIC_WRITE) throw new Error("Acoes genericas de escrita estao desabilitadas.");
        
        const { elementId } = request.params.arguments;
        
        if (!activeFrame) {
          throw new Error("Nenhuma aplicacao esta aberta. Use saneago_abrir_e_inspecionar primeiro.");
        }
        
        const appUrl = activeFrame.url();
        try {
          await clicarBotao(activeFrame, elementId);
          logAudit("saneago_clicar_botao", appUrl, `Botao ${elementId}`, "SUCESSO");
          
          const relatorioPos = await inspecionarTela(activeFrame);
          
          return {
            content: [
              {
                type: "text",
                text: `Botao ${elementId} clicado.\nNovo estado da tela:\n${JSON.stringify(relatorioPos, null, 2)}`,
              },
            ],
          };
        } catch (error) {
          logAudit("saneago_clicar_botao", appUrl, `Botao ${elementId}`, `ERRO: ${error.message}`);
          throw error;
        }
      }

      case "saneago_abrir_ra": {
        if (!ALLOW_RA_WRITE) throw new Error("Abertura de RA esta desabilitada.");
        
        const args = request.params.arguments || {};
        const { endereco, servico, confirmar, formaAtendimento, nomeCliente, nomeContato, telefoneContato } = args;
        try {
          if (confirmar) consumeConfirmed(args);
          const resultado = await abrirRA(endereco, servico, confirmar, formaAtendimento, nomeCliente, nomeContato, telefoneContato);
          if (!confirmar) {
            const confirmationToken = createPending(args);
            resultado.confirmationToken = confirmationToken;
            resultado.message += `\n\nToken de confirmacao: ${confirmationToken}`;
          }
          return {
            content: [
              {
                type: "text",
                text: resultado.message + (resultado.relatorio ? `\n\nRelatorio do frame inicial: ${JSON.stringify(resultado.relatorio)}` : ""),
              },
            ],
          };
        } catch (error) {
          throw error;
        }
      }

      case "saneago_eco701_consultar_ra": {
        const { ra } = request.params.arguments;
        activeFrame = await abrirApp("ECO701");
        const appUrl = activeFrame.url();
        
        try {
          const raInputId = await aguardarInputPorRotulo(activeFrame, 'NUMERO DO RA');
          
          if (!raInputId) throw new Error('Campo Numero do RA nao encontrado na tela inicial do ECO701 apos aguardar carregamento');
          
          await preencherCampo(activeFrame, raInputId, ra);
          
          const btn = activeFrame.getByRole('button', { name: /consultar/i }).first();
          if (await btn.isVisible().catch(() => false)) {
            await btn.click();
          } else {
            await activeFrame.locator(`#${raInputId}`).press('Enter');
          }
          
          await activeFrame.page().waitForTimeout(3000); // Aguarda consulta carregar
          logAudit("saneago_eco701_consultar_ra", appUrl, `RA ${ra}`, "SUCESSO");
          
          // Retorna os dados da tela
          const text = await activeFrame.locator('body').innerText();
          const relatorioPos = await inspecionarTela(activeFrame);
          
          return {
            content: [
              {
                type: "text",
                text: `RA ${ra} consultado.\nTexto visivel na tela:\n${text}\n\nCampos da tela:\n${JSON.stringify(relatorioPos, null, 2)}`,
              },
            ],
          };
        } catch (error) {
          logAudit("saneago_eco701_consultar_ra", appUrl, `RA ${ra}`, `ERRO: ${error.message}`);
          throw error;
        }
      }

      case "saneago_consultar_consumo": {
        const { conta } = request.params.arguments;
        try {
          const resultado = await consultarConsumo(conta);
          return {
            content: [
              {
                type: "text",
                text: `Conta ${conta} consultada.\nTexto visivel na tela:\n${resultado.text}\n\nCampos da tela:\n${JSON.stringify(resultado.relatorio, null, 2)}`,
              },
            ],
          };
        } catch (error) {
          throw error;
        }
      }

      case "saneago_asfalto_da_ra": {
        const { ra, data } = request.params.arguments;
        try {
          const resultado = await consultarAsfalto(ra, data);
          return {
            content: [
              {
                type: "text",
                text: `RA/Rua ${ra} consultado para a data ${data}.\nTexto visivel na tela:\n${resultado.text}\n\nCampos da tela:\n${JSON.stringify(resultado.relatorio, null, 2)}`,
              },
            ],
          };
        } catch (error) {
          throw error;
        }
      }
      
      case "saneago_consultar_roteiro": {
        const { intencao, codigo } = request.params.arguments;
        let roteiro = {};
        try {
          roteiro = require("../config/roteiro.json");
        } catch (e) {
          throw new Error("Roteiro nao encontrado. Certifique-se de que a Fase 1.5 foi executada.");
        }
        
        let resultado = [];
        if (codigo) {
          const app = roteiro[codigo.toUpperCase()];
          if (app) resultado.push(app);
        } else if (intencao) {
          const query = intencao.toLowerCase();
          for (const key of Object.keys(roteiro)) {
            const app = roteiro[key];
            const matchName = app.nome.toLowerCase().includes(query);
            const matchOQueFaz = app.o_que_faz.toLowerCase().includes(query);
            const matchExemplos = app.exemplos_intencao.some(ex => ex.toLowerCase().includes(query));
            const matchCodigo = app.codigo.toLowerCase().includes(query);
            if (matchName || matchOQueFaz || matchExemplos || matchCodigo) {
              resultado.push(app);
            }
          }
        } else {
          resultado = Object.values(roteiro);
        }
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(resultado, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Ferramenta desconhecida: ${request.params.name}`);
    }
  } catch (error) {
    console.error(`[MCP-Saneago] tool=${request.params.name} failed: ${error.message}`);
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Erro executando ferramenta ${request.params.name}: ${error.message}`,
        },
      ],
    };
  }
});

// Tratamento para encerrar sessao ao fechar
process.on("SIGINT", async () => {
  await closeSession();
  process.exit(0);
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP-Saneago Server running on stdio");
}

run().catch(console.error);
