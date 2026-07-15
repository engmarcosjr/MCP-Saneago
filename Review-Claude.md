# Review-Claude.md — Guia de revisão do MCP-Saneago

> **Este arquivo é meu (Claude), não do Gemini.** O `PLAN.md` é o documento de execução entregue ao Gemini. Este aqui é o roteiro para eu revisar o que o Gemini construir. Não é para o Gemini seguir.

---

## 0. Situação

- **Projeto:** `C:\repos\MCP-Saneago` — servidor MCP que conecta um LLM ao portal ZK da Intranet Saneago.
- **Quem executa:** Gemini (Antigravity/CLI), seguindo `PLAN.md`.
- **Quem revisa:** eu (Claude), usando este arquivo.
- **Status inicial:** repo só tinha `PLAN.md`. Eu reescrevi o `PLAN.md` corrigindo a abordagem e criei este guia.

## 1. Por que o plano foi corrigido (contexto que não pode se perder)

O plano original propunha coisas que os próprios projetos do usuário já provaram estar erradas. Correções aplicadas ao `PLAN.md`:

1. **`/zkau` direto é anti-padrão.** O plano original (Etapa 4) mandava montar POST manual em `/prt/zkau` com `cmd_0`/`data_0`/`uuid`. Isso contradiz o `SANEAGO ZKAU\ANATOMIA_ZKAU.md` ("replay direto é frágil, quebra quando a tela muda") e o `co701_discover.js`, que **funciona** dirigindo a UI viva com Playwright. → Executor deve usar UI viva, nunca replay de `/zkau`.
2. **Telas ZK abrem em `iframe`.** Não há `GET` direto no `.zul`. A tela carrega em `iframe[src*="...zul"]`. Inspector/executor operam sobre o `frame`, não sobre a página raiz.
3. **Navegação é por busca de app, não por URL.** Abre-se digitando o nome de exibição (ex.: `ECO701 - REGISTRO DE ATENDIMENTO`) num campo de busca e clicando na opção.
4. **"Reuso do PORTAL_LEGADO" é enganoso.** PORTAL_LEGADO autentica no **SanVAWeb** (terminal legado, comandos `PFxx`) — outro sistema. Só o bootstrap de sessão (`session.js`: login headless + `storageState`) é reutilizável.
5. **IDs/UUIDs ZK são dinâmicos.** Localizar campos por rótulo/texto próximo, nunca por UUID fixo.
6. **Stealth/anti-WAF é overkill.** O `co701_discover.js` loga com `chromium.launch({headless:true})` simples e funciona. Removido do plano.
7. **Segurança ausente no original.** Adicionado: read-only antes de escrita; confirmação + `audit.log` para escrita; nunca operar fora do perfil autorizado.
8. **Vertical primeiro.** Começar por `saneago_eco701_consultar_ra` (envelopa o `co701_discover.js`) para provar o encanamento MCP antes de generalizar.

## 2. Arquivos de referência (a fonte da verdade técnica)

- `C:\repos\6060-check\co701_discover.js` — padrão ZK que funciona (portal → iframe → campo por rótulo → consulta).
- `...\DEV_SAN\PORTAL_LEGADO\src\session.js` — bootstrap de login/sessão reutilizável.
- `...\DEV_SAN\SANEAGO ZKAU\ANATOMIA_ZKAU.md` — limites e por que não replayar `/zkau`.
- `...\DEV_SAN\SANEAGO ZKAU\PLAYBOOK_REQUISICOES_AUTORIZADAS.md` — padrão de sessão/requisição autorizada.
- Memórias relacionadas: `eco701-portal-intranet`, `download-ra-eco701`, `qlik-qsense-consulta` (todas rodam LOCAL, na rede Saneago).

## 3. Instruções que foram passadas ao Gemini

- Uma etapa por vez (ordem da seção 5 do PLAN.md); parar ao fim de cada etapa.
- Um commit por etapa: `etapa N: <o que fez>`, corpo com "o que fez / como testou / pendências".
- Manter `PROGRESSO.md` (status por etapa, arquivos tocados, comando de teste, saída, desvios justificados).
- Desvios do plano: registrar no PROGRESSO.md, não mudar o PLAN.md silenciosamente.
- Ao travar no portal (login/iframe/campo): parar e documentar, sem loop e sem cair para replay `/zkau`.

## 4. Checklist de revisão (o que eu confiro depois)

- [ ] `PROGRESSO.md` existe e cobre cada etapa com teste e saída.
- [ ] `git log --oneline` — um commit por etapa, mensagens no formato combinado.
- [ ] **Princípio 1:** nenhum POST `/zkau` montado à mão (grep por `zkau`, `cmd_0`, `data_0` no código; se aparecer em construção de request → reprovar).
- [ ] **Princípio 2:** read-only implementado e testado antes de qualquer tool de escrita.
- [ ] **Princípio 4:** campos localizados por rótulo/texto, não por UUID fixo.
- [ ] Inspector/executor operam sobre o `frame` do iframe, não a página raiz.
- [ ] Navegação por busca de app (nome de exibição), não por URL do `.zul`.
- [ ] Sem flags de stealth/anti-WAF.
- [ ] `.gitignore` protege `.auth/` e `config/credentials.json`; nada de segredo commitado (checar `git log -p` por credenciais/cookies).
- [ ] Escrita: confirmação explícita + gravação em `.auth/audit.log`.
- [ ] Cada etapa bate com seu "Critério de aceite" no PLAN.md.

## 5. Prova de fogo (teste real de ponta a ponta)

Rodar/inspecionar a tool `saneago_eco701_consultar_ra` com uma RA real. Precisa: rede Saneago (VM Google não serve — portal bloqueado), `config/credentials.json` presente. Confirmar que devolve os campos da RA **sem** ter montado request `/zkau`.

## 6. Riscos conhecidos a vigiar na revisão

- Gemini pode "otimizar" para HTTP direto/`/zkau` alegando velocidade → reprovar, é o erro nº1.
- Pode fiar em `id`/`uuid` capturados numa sessão → quebram na próxima.
- Pode tentar contornar login (stealth, credenciais hardcoded) se não tiver rede/credencial → reprovar e pedir ambiente correto.
- Pode emendar todas as etapas num commit só → dificulta revisão; pedir para fatiar.
