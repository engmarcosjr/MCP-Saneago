#!/usr/bin/env node

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");

const catalogo = require("../config/catalogo_aplicacoes.json");
const { abrirApp } = require("./portal");
const { inspecionarTela } = require("./inspector");
const { preencherCampo, clicarBotao } = require("./executor");
const { closeSession } = require("./session");
const { logAudit } = require("./audit");

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

const ALLOW_WRITE = process.env.SANEAGO_ALLOW_WRITE === '1' || process.env.SANEAGO_ALLOW_WRITE === 'true';

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
      description: "Abre uma aplicacao pelo nome ou codigo e inspeciona sua tela inicial, retornando os campos interativos (inputs, botoes) com seus respectivos IDs ZK.",
      inputSchema: {
        type: "object",
        properties: {
          nomeAplicacao: {
            type: "string",
            description: "Nome ou codigo da aplicacao (ex: ECO701)",
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
    }
  ];

  if (ALLOW_WRITE) {
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

  return { tools };
});

// Execucao das Ferramentas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
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
        
        // Verifica se usou uma chave do catalogo (array de objetos)
        const appInfo = catalogo.find(app => app.codigo === nomeAplicacao || app.nome.toLowerCase().includes(nomeAplicacao.toLowerCase()));
        const query = appInfo ? appInfo.codigo : nomeAplicacao;
        
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
        if (!ALLOW_WRITE) throw new Error("Acoes de escrita estao desabilitadas (SANEAGO_ALLOW_WRITE).");
        
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
        if (!ALLOW_WRITE) throw new Error("Acoes de escrita estao desabilitadas (SANEAGO_ALLOW_WRITE).");
        
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

      case "saneago_eco701_consultar_ra": {
        const { ra } = request.params.arguments;
        activeFrame = await abrirApp("ECO701");
        const appUrl = activeFrame.url();
        
        try {
          // localiza o campo "Numero do RA" usando a heuristica padrao
          const ids = await activeFrame.locator('body').evaluate(() => {
            const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
            const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
            const labels = Array.from(document.querySelectorAll('label, span, div, td'));
            for (const lb of labels) {
              if (!norm(lb.textContent).includes('NUMERO DO RA')) continue;
              const scope = lb.closest('tr, .z-row, .z-hbox, .z-vbox, div') || document.body;
              const inputs = Array.from(scope.querySelectorAll('input')).filter(visible);
              if (inputs.length) return { raInputId: inputs[0].id };
            }
            return { raInputId: null };
          });
          
          if (!ids.raInputId) throw new Error('Campo Numero do RA nao encontrado na tela inicial');
          
          await preencherCampo(activeFrame, ids.raInputId, ra);
          
          const btn = activeFrame.getByRole('button', { name: /consultar/i }).first();
          if (await btn.isVisible().catch(() => false)) {
            await btn.click();
          } else {
            await activeFrame.locator(`#${ids.raInputId}`).press('Enter');
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

      default:
        throw new Error(`Ferramenta desconhecida: ${request.params.name}`);
    }
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Erro executando ferramenta ${request.params.name}:\n${error.message}\n${error.stack}`,
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
