# MCP-Saneago (Model Context Protocol)

Servidor MCP para automação e integração de consultas e ações no portal ZK / Saneago.

## Ferramentas Disponíveis (Tools)

- **`saneago_pesquisar_asfalto_local`**: Realiza buscas por Rua, Bairro, Quadra ou número de RA na base local de recomposição asfáltica (`Asfalto-Pendentes` / `MEMÓRIA_BM`).
- **`saneago_eco709_consultar_logradouro`**: Consulta RAs por Logradouro / Rua, Bairro e Período via HTTP/Playwright no portal Saneago (ECO709).
- **`saneago_eco701_consultar_ra`**: Detalha informações de uma RA específica no ECO701.
- **`saneago_asfalto_da_ra`**: Consulta status de corte e recomposição no LRS041 para uma RA.
- **`saneago_lrs105_verificar_estatistica`**: Verifica lançamento de laudos e materiais no LRS105 sem gravação (read-only).
- **`saneago_abrir_ra`**: Abertura de RAs no ECO701 com confirmação em duas etapas (preview + confirmação por token).
- **`saneago_consultar_consumo`**: Consulta de consumo por conta no ECO303.
- **`saneago_descobrir_aplicacao`**: Busca rápida de aplicações e funcionalidades no catálogo local de capacidades.

## Uso

O servidor roda via `StdioServerTransport` e pode ser consumido por qualquer cliente MCP (como o assistente DAN01 ou o Hermes Agent).

```bash
node src/index.js
```
