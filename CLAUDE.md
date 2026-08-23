# CLAUDE.md — MCP-Saneago

## A regra mais importante: gates humanos em toda escrita

**Toda ação que grava em sistema Saneago é gate humano supervisionado.**
Nenhuma tool de escrita executa sem que:
1. A flag de ambiente correspondente esteja habilitada (`opt-in` estrito, padrão `0`).
2. O fluxo `confirmar: false` → revisão humana → `confirmar: true + token` tenha sido completado.

| Flag de ambiente | O que libera |
|---|---|
| `SANEAGO_ALLOW_WRITE=1` | Legacy — libera todas as escritas |
| `SANEAGO_ALLOW_RA_WRITE=1` | Apenas `saneago_abrir_ra` (ECO701) |
| `SANEAGO_ALLOW_GENERIC_WRITE=1` | `saneago_preencher_campo` e `saneago_clicar_botao` |
| `SANEAGO_ALLOW_LRS105_WRITE=1` | Apenas `saneago_lrs105_lancar_servico` |

Sem a flag, a tool **nem aparece** no `tools/list` retornado ao cliente MCP.

O padrão preview/confirmar (`confirmation-gate`) usa `confirmationToken` de uso único —
o token é gerado no pré-submit e consumido na confirmação real. Alterar qualquer argumento
entre preview e confirmação invalida o token.

---

## O que nunca automatizar

| Ação | Motivo |
|---|---|
| Envio, resposta, encaminhamento, movimentação de e-mail | Comunicação com terceiros — efeito irreversível |
| Qualquer comando de equipamento no supervisório (bomba, válvula) | Risco operacional imediato à rede de abastecimento |
| Submissão real no LRS105/ECO701 sem gate | RA e lançamento são registros jurídicos |
| Escrita ou deleção de documento no DocFlow/GED | GED é repositório oficial auditado |

Scripts de movimentação de e-mail (`scratch/exploracao/zimbra/`) existem mas permanecem
**scripts supervisionados** — nunca tools MCP.

---

## Camadas do projeto

```
src/                   — código de produção (importado pelo servidor MCP)
  index.js             — ponto de entrada, registra as 27 tools
  tools/               — um arquivo por vertical (eco303.js, eco701.js, lrs041.js,
  |                       lrs105.js, eco709.js, asfalto_local.js, docflow.js,
  |                       docflow_projetos.js, descobrir.js, supervisorio.js, zimbra.js)
  supervisorio_http.js — cliente HTTP do Supervisório Web
  zimbra.js            — cliente SOAP/REST do Zimbra
  portal.js            — navegação Playwright/ZK (abrirApp)
  inspector.js         — inspeção de tela ZK
  executor.js          — driver ZK client API (setarCampoZk, clicarZk, etc.)
  session.js           — reuso de sessão Playwright
  audit.js             — log de auditoria
  confirmation-gate.js — token de preview/confirmação

test/                  — testes offline (node --test test/*.test.js)
  fixtures/            — payloads capturados e anonimizados (sem dados pessoais reais)
  integration/         — testes de integração (requerem rede, fora do npm test normal)

config/                — catálogos e credenciais
  indice_capacidades.json   — índice de 596+ apps + tools MCP para a descoberta
  catalogo_aplicacoes.json  — 596 apps ZK
  roteiro.json              — roteiros detalhados das apps
  menu_nav.json             — navegação de menu indexada por código
  credentials.json          — GITIGNORED; nunca versionar
  supervisorio_componentes_<unidade>.json — cache de catálogo de sensores

docs/                  — contratos HTTP, fichas de aplicação, decisões arquiteturais
  apps/                — markdown por app (ECO701.md, SUPERVISORIO.md, ZIMBRA.md…)
  historico/           — histórico cronológico arquivado (PROGRESSO.md)

scratch/exploracao/    — scripts de rascunho por vertical (docflow/, zimbra/, supervisorio/, eco/)
  INVENTARIO.md        — mapa completo do que foi movido para cá
```

---

## Como rodar

```bash
# Testes offline — deve ser 0 falhas sempre
npm test

# Testes de integração (requerem rede Saneago e config/credentials.json)
npm run test:integration

# Smoke test — valida todas as tools registradas sem rede
npm run smoke

# Servidor MCP
node src/index.js
```

**Pré-requisito:** credenciais em `config/credentials.json` (gitignored):
```json
{ "username": "MATRICULA", "password": "SENHA" }
```
Alternativa: variáveis `SANEAGO_USER` / `SANEAGO_PASS`.

---

## Verticais e tools (27 tools em produção)

| Vertical | Tools | Escrita? |
|---|---|---|
| Portal ZK (genérico) | `saneago_listar_aplicacoes`, `saneago_abrir_e_inspecionar`, `saneago_consultar_roteiro` | Não |
| Portal ZK (escrita) | `saneago_preencher_campo`, `saneago_clicar_botao` | Sim (`ALLOW_GENERIC_WRITE`) |
| Descoberta | `saneago_descobrir_aplicacao` | Não |
| Consumo (ECO303) | `saneago_consultar_consumo` | Não |
| RA (ECO701) | `saneago_eco701_consultar_ra`, `saneago_abrir_ra` | `abrir_ra` sim (`ALLOW_RA_WRITE`) |
| Logradouro (ECO709) | `saneago_eco709_consultar_logradouro` | Não |
| Asfalto (LRS041) | `saneago_asfalto_da_ra`, `saneago_pesquisar_asfalto_local` | Não |
| LRS105 (serviço) | `saneago_lrs105_verificar_estatistica`, `saneago_lrs105_lancar_servico` | `lancar` sim (`ALLOW_LRS105_WRITE`) |
| DocFlow/GED | `saneago_docflow_consultar_processo`, `saneago_docflow_listar_anexos`, `saneago_docflow_pesquisar_local`, `saneago_docflow_indexar_projetos` | Não |
| Supervisório Web | `saneago_supervisorio_telemetria`, `saneago_supervisorio_historico`, `saneago_supervisorio_minima_noturna`, `saneago_supervisorio_listar_componentes`, `saneago_supervisorio_listar_dmcs`, `saneago_supervisorio_horimetro` | Não |
| Webmail (Zimbra) | `saneago_webmail_buscar`, `saneago_webmail_ler_thread`, `saneago_webmail_listar_pastas` | Não |

---

## Convenções aprendidas nesta série (Fases 5–15)

1. **Testes com `test()` do `node:test`, casos independentes e nomeados.** Nunca use
   `assert` solto fora de um `test()` — o runner conta o arquivo inteiro como 1 teste e
   a primeira falha aborta todos os seguintes.

2. **Offline por design, não por acidente.** Cada módulo tem flag `*_OFFLINE` (ex:
   `DOCFLOW_OFFLINE=1`, `SUPERVISORIO_OFFLINE=1`, `ZIMBRA_OFFLINE=1`). Os testes em
   `test/*.test.js` DEVEM setar essas flags explicitamente. Nunca confie em "vai falhar
   porque não tem rede" — a suíte deve passar mesmo com rede disponível.

3. **Nenhuma credencial em arquivo versionado.** Credenciais reais NUNCA entram em `.js`,
   `.json` ou `.md` — nem ao descrever que as removeu. Se encontrar uma, remova antes de
   qualquer commit.

4. **Testes não podem sujar o working tree.** Antes e depois de `npm test`, `git status`
   deve ser idêntico. Arquivos temporários vão para `os.tmpdir()` ou são controlados por
   variável de ambiente (ex: `DOCFLOW_INDEX_FILE`).

5. **Fixtures de dados reais precisam ser anonimizadas.** Endereços de e-mail,
   matrículas, nomes de pessoas e qualquer PII substituídos por valores fictícios antes
   de versionar.

6. **Polling, nunca `waitForTimeout` fixo.** O motor ZK é assíncrono; toda espera usa
   loop com timeout (padrão: `20 × 500 ms = 10 s`). `waitForTimeout` é dívida técnica
   conhecida.

7. **Driver ZK client API para escrita.** Tools de escrita usam `setarCampoZk`,
   `confirmarCampoZk`, `clicarZk`, `selecionarComboZk` de `src/executor.js` — nunca
   `fill()` direto em campo longo (corrida de autofill do ZK trunca silenciosamente).

8. **Abertura de app via `abrirApp` busca em dois passos:** URL direta → fallback por
   menu (`config/menu_nav.json` indexado por código). Não use `url.includes(codigo)` como
   asserção de identidade de tela (código difere da URL real, ex: `PGTV510` → `PGT510...zul`).

9. **Nenhum script de diagnóstico vai para `src/`.** Rascunhos, diagnósticos e provas
   E2E ficam em `scratch/exploracao/<vertical>/`.

10. **`exit 0` não prova trabalho feito.** Sempre verifique a existência e o conteúdo
    dos entregáveis — não só o exit code do processo.

---

## Credenciais

Ordem de resolução (idêntica em todos os módulos):

1. Variáveis de ambiente: `SANEAGO_USER` / `SANEAGO_PASS`
2. Arquivo `config/credentials.json` (gitignored): `{ "username": "...", "password": "..." }`
3. Erro claro sem stack trace — nunca credencial hardcoded como fallback

**NUNCA** escreva credenciais reais neste ou em qualquer outro arquivo.
