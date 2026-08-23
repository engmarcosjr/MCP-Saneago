# Vertical Webmail (Zimbra) - MCP Saneago

Este documento descreve as capacidades de integração com o Webmail Zimbra da Saneago, implementadas no MCP.

## Tools Disponíveis (Somente Leitura)

Nesta fase (Fase 14), a integração com o Zimbra foi consolidada com foco **exclusivo em leitura**. 
A comunicação é feita via API REST (`/home/~/`) de forma autenticada, mantendo sessão ativa (cookies).

1. `saneago_webmail_buscar`
   - **Descrição:** Busca e-mails por remetente, assunto, período ou qualquer filtro suportado pela busca nativa do Zimbra.
   - **Controle de Volume:** Retorna os metadados e um pequeno trecho (fragmento) da mensagem. 
   - **Default:** O limite padrão é de 50 mensagens. Para evitar uso excessivo de memória e estourar a janela de contexto, o limite máximo tolerado pela tool é `200`.

2. `saneago_webmail_ler_thread`
   - **Descrição:** Recupera o conteúdo completo de uma conversa/mensagem usando o seu identificador (`id` / `cid`).
   - **Uso:** Deve ser utilizada após o `saneago_webmail_buscar` caso seja necessário ler o corpo integral do e-mail.

3. `saneago_webmail_listar_pastas`
   - **Descrição:** Retorna a árvore hierárquica de pastas da conta com a contagem atualizada de mensagens lidas e não lidas.

## Fora de Escopo e Portões Humanos (GATES)

Em total concordância com as regras e diretrizes arquiteturais de segurança do projeto (`SANEAGO_ALLOW_WRITE`), nenhuma ação que altere estado no webmail foi automatizada em forma de tool MCP. O webmail é um ambiente de comunicação com terceiros (clientes, fornecedores, agências reguladoras), tornando a sua manipulação extremamente sensível.

**O que NÃO foi automatizado (ausência de tools):**
- Enviar ou responder e-mails.
- Encaminhar mensagens.
- Mover mensagens entre pastas.
- Etiquetar (tag) ou remover etiquetas (untag) de mensagens.
- Marcar mensagens como lidas ou não lidas.
- Arquivar, apagar ou esvaziar lixeira.
- Criar, renomear ou excluir pastas.
- Criar regras ou filtros.

**Por quê?** 
A ação de alteração de estado no sistema real precisa de aprovação e de **portão (gate) humano explícito**. 
Essas operações não são expostas como tools MCP, mas permanecem no escopo de *scripts isolados supervisionados*.

### Scripts Supervisionados Existentes

Para realizar as operações citadas acima (sob supervisão), os seguintes scripts foram testados e retidos no diretório `scratch/exploracao/zimbra/`:

- `move_conversations.js` - Move threads de uma pasta para outra de acordo com regras em lote.
- `organize_zimbra.js` - Etiqueta e categoriza e-mails na caixa de entrada baseando-se em remetentes conhecidos.
- `reorganize_folders.js` - Script de reorganização massiva baseado em busca e batch.
- `test_untag.js` - Exemplo de como remover etiquetas de mensagens.

Estes scripts requerem execução manual do desenvolvedor ou operador humano.
