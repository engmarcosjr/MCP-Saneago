# ESTADO ATUAL — MCP-Saneago

> Gerado na Fase 15 (2026-08-23). Substitui `PROGRESSO.md` (50 KB cronológico),
> que foi arquivado em `docs/historico/PROGRESSO.md` com git mv.

---

## O que o MCP faz hoje

O MCP-Saneago é um servidor MCP (Model Context Protocol) que expõe **27 tools** para
que uma LLM interaja com o ecossistema de sistemas da Saneago — portal intranet ZK,
Supervisório Web, DocFlow/GED e webmail Zimbra — sem precisar navegar manualmente.

O servidor cobre cinco verticais:

| Vertical | Tipo de acesso | Obs. |
|---|---|---|
| Portal intranet ZK (596 apps) | Playwright (sessão viva) | Leitura e escrita com gate |
| Supervisório Web | HTTP (API REST) | Somente leitura |
| DocFlow / GED | Playwright + cache local JSON | Somente leitura de metadados |
| Webmail Zimbra | SOAP/HTTP | Somente leitura |
| Descoberta de capacidades | Índice local JSON | Sem rede |

---

## As 27 tools por vertical

### Descoberta e portal genérico (3 tools sempre expostas)
| Tool | O que faz |
|---|---|
| `saneago_descobrir_aplicacao` | Ranking de apps/tools por pergunta em linguagem natural |
| `saneago_listar_aplicacoes` | Lista o catálogo completo de 596 apps ZK |
| `saneago_consultar_roteiro` | Busca o roteiro detalhado de uma app por código ou intenção |

### Portal ZK — leitura e navegação (2 tools)
| Tool | O que faz |
|---|---|
| `saneago_abrir_e_inspecionar` | Abre uma app e inspeciona campos interativos |
| `saneago_eco701_consultar_ra` | Consulta RA pelo número no ECO701 |

### Portal ZK — escrita (3 tools, opt-in por flag)
| Tool | Flag necessária |
|---|---|
| `saneago_preencher_campo` | `SANEAGO_ALLOW_GENERIC_WRITE=1` |
| `saneago_clicar_botao` | `SANEAGO_ALLOW_GENERIC_WRITE=1` |
| `saneago_abrir_ra` | `SANEAGO_ALLOW_RA_WRITE=1` |

### Verticais comerciais/operacionais — leitura (5 tools)
| Tool | App/fonte |
|---|---|
| `saneago_consultar_consumo` | ECO303 (volume consumido) |
| `saneago_eco709_consultar_logradouro` | ECO709 (RAs por logradouro/bairro) |
| `saneago_asfalto_da_ra` | LRS041 (asfalto de uma RA) |
| `saneago_pesquisar_asfalto_local` | Base local de laudos de recomposição |
| `saneago_lrs105_verificar_estatistica` | LRS105 (leitura de estatística) |

### LRS105 — escrita (1 tool, opt-in)
| Tool | Flag necessária |
|---|---|
| `saneago_lrs105_lancar_servico` | `SANEAGO_ALLOW_LRS105_WRITE=1` |

### DocFlow / GED (4 tools — somente leitura)
| Tool | O que faz |
|---|---|
| `saneago_docflow_consultar_processo` | Dados de um processo por número (cache + online) |
| `saneago_docflow_pesquisar_local` | Busca processos no banco local extraído |
| `saneago_docflow_listar_anexos` | Árvore de pastas e metadados do GED de um processo |
| `saneago_docflow_indexar_projetos` | Busca na base de projetos organizados localmente |

### Supervisório Web (6 tools — somente leitura)
| Tool | O que faz |
|---|---|
| `saneago_supervisorio_telemetria` | Leitura em tempo real (nível, status bomba, vazão, pressão) |
| `saneago_supervisorio_historico` | Série temporal com agregação por período |
| `saneago_supervisorio_minima_noturna` | Mínima noturna por DMC |
| `saneago_supervisorio_horimetro` | Horas de acionamento de bomba |
| `saneago_supervisorio_listar_componentes` | Catálogo de sensores por unidade |
| `saneago_supervisorio_listar_dmcs` | Lista de DMCs da unidade |

### Webmail Zimbra (3 tools — somente leitura)
| Tool | O que faz |
|---|---|
| `saneago_webmail_buscar` | Busca e-mails por assunto, remetente etc. (até 200) |
| `saneago_webmail_ler_thread` | Lê conversa completa por ID |
| `saneago_webmail_listar_pastas` | Árvore de pastas com contagem |

---

## O que está maduro

| Componente | Status |
|---|---|
| Suite offline `npm test` | **70 testes / 0 falhas** (base: Fase 14) |
| Gate de escrita (confirmation-gate) | Maduro; token de uso único; cobrindo ECO701 e LRS105 |
| Driver ZK client API (executor.js) | Maduro; sem bugs de corrida; provado em 8 rodadas E2E |
| Catálogo ZK | 596 apps, 327 com roteiro detalhado (10 exceções documentadas) |
| Índice de capacidades | 596+ entradas incluindo tools MCP das novas verticais (Fase 15) |
| Supervisório: 6 tools | Maduro (offline por design via `SUPERVISORIO_OFFLINE`) |
| DocFlow: 4 tools | Maduro (offline por design via `DOCFLOW_OFFLINE`) |
| Webmail Zimbra: 3 tools | Maduro (offline por design via `ZIMBRA_OFFLINE`); somente leitura |
| Descoberta (`saneago_descobrir_aplicacao`) | Maduro; inclui verticais novas após Fase 15 |
| Smoke test (`npm run smoke`) | Estendido na Fase 15: cobre todas as 27 tools |

---

## Pendências conhecidas

| Pendência | Categoria | Bloqueante? |
|---|---|---|
| Gate da FASE 5 (ECO701 com conta válida): E2E supervisionado pendente | Negócio | Não (tecnicamente pronto) |
| `config/supervisorio_componentes_6.json` é mock; catálogo real exige varredura online | Operacional | Não (usa mock no offline) |
| LRS041 varre só o 1º lote da listagem | Funcional | Não |
| 273 apps com roteiro `auto` (inferido, não provado E2E) | Qualidade | Não |
| Logradouro por nome retorna 0 resultados sem CEP (ambiguidade bandbox ZK) | Funcional | Não |
| Guarda de confirmação humana no fluxo Telegram antes de `confirmar: true` | Processo | Não |
| Cache de processos DocFlow (`data_processos_*/`) vazio | Operacional | Não (consulta online quando disponível) |

---

## Gates humanos abertos (escritas não executadas ainda)

| Gate | Descrição | Status |
|---|---|---|
| ECO701 — submissão real com numeroConta | Requer conta/DV de teste válida e Marcos Jr presente | **Aberto** |
| LRS105 — lançamento real de serviço | Requer gate humano em produção | **Aberto** |

---

## Referências rápidas

- **Histórico cronológico completo:** `docs/historico/PROGRESSO.md`
- **Fases 11–14:** `RELATORIO_FASE11.md` a `RELATORIO_FASE14.md`
- **Doutrina e convenções:** `CLAUDE.md` (raiz)
- **Contratos HTTP:** `docs/MAPEAMENTO_SUPERVISORIO_WEB.md`, `docs/ZIMBRA.md`
- **Decisões arquiteturais:** `docs/PLANO_ZK_CLIENT_API.md`, `Review-Claude.md`
