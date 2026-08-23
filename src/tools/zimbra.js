"use strict";

const { ZimbraClient } = require("../zimbra");

async function getClient() {
  const client = new ZimbraClient();
  if (process.env.ZIMBRA_OFFLINE !== "1") {
    await client.login(); 
  }
  return client;
}

/**
 * Busca e-mails no webmail Zimbra por remetente, assunto, período, etc.
 * Retorna metadados e trechos (snippets), não a mensagem inteira.
 * Volume controlado: limite padrão de 50.
 */
async function saneago_webmail_buscar({ query = "", limite = 50, offset = 0 }) {
  if (limite > 200) {
    limite = 200; // Proteção contra requisições excessivas (default máximo tolerado na leitura paginada)
  }

  const client = await getClient();
  const res = await client.buscar(query, limite, offset);
  
  if (!res || !Array.isArray(res.m)) {
    // Se não retornou array 'm', pode ser busca vazia ou outro formato (Zimbra pode retornar objeto vazio ou diferente)
    return {
      sucesso: true,
      total_retornado: 0,
      mensagens: [],
      nota: "Nenhuma mensagem encontrada para a busca."
    };
  }

  // Mapeia o payload do Zimbra para algo mais legível
  const mensagens = res.m.map(msg => {
    // Extrai remetentes e destinatários do array 'e' (a = endereço, d = display name, t = tipo 'f'rom, 't'o, 'c'c)
    const emails = msg.e || [];
    const remetente = emails.find(e => e.t === "f");
    const destinatarios = emails.filter(e => e.t === "t" || e.t === "c");

    return {
      id: msg.id,
      conversa_id: msg.cid,
      data: new Date(msg.d).toISOString(),
      assunto: msg.su || "(sem assunto)",
      trecho: msg.fr || "",
      remetente: remetente ? { email: remetente.a, nome: remetente.d } : null,
      destinatarios: destinatarios.map(d => ({ email: d.a, nome: d.d }))
    };
  });

  return {
    sucesso: true,
    total_retornado: mensagens.length,
    limite_aplicado: limite,
    offset_aplicado: offset,
    mensagens
  };
}

/**
 * Lê o conteúdo completo de uma conversa/mensagem específica por ID.
 */
async function saneago_webmail_ler_thread({ id }) {
  if (!id) throw new Error("O 'id' da mensagem/conversa é obrigatório.");

  const client = await getClient();
  const res = await client.lerThread(id);
  
  if (!res || !Array.isArray(res.m) || res.m.length === 0) {
    throw new Error(`Thread/Mensagem com id '${id}' não encontrada ou resposta inválida.`);
  }

  const thread = res.m.map(msg => {
    const emails = msg.e || [];
    const remetente = emails.find(e => e.t === "f");
    const destinatarios = emails.filter(e => e.t === "t" || e.t === "c");
    
    // Procura o conteúdo do corpo. Pode estar em 'mp' (multipart)
    let bodyText = msg.fr || ""; 
    
    if (msg.mp && Array.isArray(msg.mp)) {
       // Uma busca simples pelo primeiro fragmento de texto ou html, pode variar
       const contentPart = msg.mp.find(part => part.content || part._content);
       if (contentPart) {
           bodyText = contentPart.content || contentPart._content || bodyText;
       }
    }

    return {
      id: msg.id,
      data: msg.d ? new Date(msg.d).toISOString() : null,
      assunto: msg.su || "(sem assunto)",
      remetente: remetente ? { email: remetente.a, nome: remetente.d } : null,
      destinatarios: destinatarios.map(d => ({ email: d.a, nome: d.d })),
      corpo: bodyText
    };
  });

  return {
    sucesso: true,
    thread_id: id,
    mensagens_na_conversa: thread.length,
    mensagens: thread
  };
}

/**
 * Retorna a árvore de pastas com contagem de mensagens.
 */
async function saneago_webmail_listar_pastas() {
  const client = await getClient();
  const res = await client.listarPastas();
  
  if (!res || !res.folder || !Array.isArray(res.folder)) {
    throw new Error("Resposta inesperada ao listar pastas.");
  }

  // Função recursiva para limpar a árvore de pastas e manter apenas o necessário
  function mapFolder(f) {
    return {
      id: f.id,
      nome: f.name,
      nao_lidas: f.u || 0, // unread
      total: f.n || 0,     // number of messages
      tamanho: f.s || 0,   // size
      subpastas: Array.isArray(f.folder) ? f.folder.map(mapFolder) : []
    };
  }

  const pastas = res.folder.map(mapFolder);

  return {
    sucesso: true,
    pastas
  };
}

module.exports = {
  saneago_webmail_buscar,
  saneago_webmail_ler_thread,
  saneago_webmail_listar_pastas
};
