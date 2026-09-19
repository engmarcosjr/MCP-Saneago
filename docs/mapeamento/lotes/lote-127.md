# Diário de Bordo — Mapeamento Lote 127

- **Data:** 2026-09-19
- **Lote:** lote-127
- **Executor:** omniclaude
- **Aplicações do Lote:** ECO954, ECO962, ECO830

---

## O que foi feito

Reinspeção e inventário no portal corporativo ZK via Playwright para as 3 aplicações prioritárias da fila de pendências do backlog da Fase 1, sem clicar nem submeter campos:

1. **ECO954 (Painel de Religação):**
   - URL real: `null` (não localizada na busca do portal / frame indisponível)
   - Inputs: 0 campos
   - Botões: 0 botões
   - Classe proposta: `bloqueada` (aplicação do catálogo corporativo apontando para dashboard QlikSense externo, inacessível via frame/portal ZK no perfil atual).
   - Artefatos gerados/atualizados: `docs/mapeamento/evidencias/ECO954.inspect.json`, `docs/apps/ECO954.md`.

2. **ECO962 (Painel de Cortes):**
   - URL real: `null` (não localizada na busca do portal / frame indisponível)
   - Inputs: 0 campos
   - Botões: 0 botões
   - Classe proposta: `bloqueada` (aplicação do catálogo corporativo apontando para dashboard QlikSense externo, inacessível via frame/portal ZK no perfil atual).
   - Artefatos gerados/atualizados: `docs/mapeamento/evidencias/ECO962.inspect.json`, `docs/apps/ECO962.md`.

3. **ECO830 (WEBCOM - Vídeo Aulas):**
   - URL real: `https://www.saneago.com.br/prt/eco/ECO830VideoAulas.zul`
   - Inputs: 0 campos na tela inicial
   - Botões: 0 botões na tela inicial
   - Classe proposta: `sem_campos_confirmado` (tela informativa/player de treinamentos e vídeo aulas sem campos de entrada e sem botões de ação ou escrita).
   - Artefatos gerados/atualizados: `docs/mapeamento/evidencias/ECO830.inspect.json`, `docs/apps/ECO830.md`, entrada mantida em `config/roteiro.json`.

## Decisões Tomadas e Classes Propostas

- **ECO954 (`bloqueada`):** Reinspeção confirmou inacessibilidade de frame no portal ZK (tentativa 2).
- **ECO962 (`bloqueada`):** Reinspeção confirmou inacessibilidade de frame no portal ZK (tentativa 2).
- **ECO830 (`sem_campos_confirmado`):** Tela informativa sem formulário ou botões interativos (tentativa 2).

## Pendências para o Gate Humano

- Homologação das propostas para safelist da Fase 2 (`ECO830` como tela informativa/leitura sem campos, `ECO954` e `ECO962` retidas como bloqueadas/QlikSense).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-127
Auditadas 3 apps (lote lote-127) · 1 com entrada em roteiro.json
0 divergências.

$ npm test
# tests 89
# suites 0
# pass 89
# fail 0
# cancelled 0
# skipped 0
# todo 0
```
