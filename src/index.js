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

// Definicao das Ferramentas
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
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
      },
      {
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
      },
    ],
  };
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
        
        // Verifica se usou uma chave do catalogo, senao usa o valor direto
        const query = catalogo[nomeAplicacao] || nomeAplicacao;
        
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
        const { elementId, valor } = request.params.arguments;
        
        if (!activeFrame) {
          throw new Error("Nenhuma aplicacao esta aberta. Use saneago_abrir_e_inspecionar primeiro.");
        }
        
        await preencherCampo(activeFrame, elementId, valor);
        
        return {
          content: [
            {
              type: "text",
              text: `Campo ${elementId} preenchido com "${valor}".`,
            },
          ],
        };
      }

      case "saneago_clicar_botao": {
        const { elementId } = request.params.arguments;
        
        if (!activeFrame) {
          throw new Error("Nenhuma aplicacao esta aberta. Use saneago_abrir_e_inspecionar primeiro.");
        }
        
        await clicarBotao(activeFrame, elementId);
        
        const relatorioPos = await inspecionarTela(activeFrame);
        
        return {
          content: [
            {
              type: "text",
              text: `Botao ${elementId} clicado.\nNovo estado da tela:\n${JSON.stringify(relatorioPos, null, 2)}`,
            },
          ],
        };
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
