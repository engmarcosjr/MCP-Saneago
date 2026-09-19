# Diário de Bordo — Mapeamento Lote 123

- **Data:** 2026-09-19
- **Lote:** lote-123
- **Executor:** omniclaude
- **Aplicações do Lote:** ECO808, ECO811, ECO815

---

## O que foi feito

Inspeção e inventário de 3 aplicações da fila da Fase 1:
1. **ECO808 (Áreas de Inf. dos Reservatórios):**
   - URL real: `https://www.saneago.com.br/prt/eco/ECO808AreaInfRes.jsp`
   - Tela legada JSP informativa, sem campos interativos de entrada e sem botões de ação na tela inicial.
   - Classe proposta: `sem_campos_confirmado`.
   - Ficha criada em `docs/apps/ECO808.md`, evidência em `docs/mapeamento/evidencias/ECO808.inspect.json`, roteiro registrado em `config/roteiro.json` e registrada na safelist.

2. **ECO811 (Doc. do Macroprocesso de Comercialização):**
   - URL real: `https://www.saneago.com.br/prt/eco/ECO811IT.jsp`
   - Tela legada JSP informativa para consulta de instruções de trabalho de comercialização, sem campos interativos de entrada e sem botões de ação na tela inicial.
   - Classe proposta: `sem_campos_confirmado`.
   - Ficha criada em `docs/apps/ECO811.md`, evidência em `docs/mapeamento/evidencias/ECO811.inspect.json`, roteiro registrado em `config/roteiro.json` e registrada na safelist.

3. **ECO815 (Coletânea de Diretrizes Comerciais):**
   - Aplicação corporativa listada em catálogo como documento/relatório (`/prt/eco/relatorios/coletanea_diretrizes.pdf`), porém inacessível ou não localizada na busca de telas no portal ZK pelo perfil logado (`url_real: null`).
   - Classe proposta: `bloqueada`.
   - Ficha criada em `docs/apps/ECO815.md`, evidência em `docs/mapeamento/evidencias/ECO815.inspect.json`, registrada na safelist e isenta de entrada em `config/roteiro.json` (checagem C4).

## Decisões Tomadas e Classes Propostas

- **ECO808 (`sem_campos_confirmado`):** Tela informativa estática confirmada sem botões nem campos.
- **ECO811 (`sem_campos_confirmado`):** Tela informativa estática confirmada sem botões nem campos.
- **ECO815 (`bloqueada`):** Aplicação não encontrada ou sem permissão de acesso para abertura no portal.

## Pendências para o Gate Humano

- Homologação das propostas para safelist da Fase 2.
- Verificação de permissões do usuário logado para a aplicação `ECO815` caso haja necessidade de disponibilização.

## Verificação e Auditoria

Comandos executados e resultados obtidos:

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido

$ node scripts/auditar-mapeamento.js --lote lote-123
Auditadas 3 apps (lote lote-123) · 2 com entrada em roteiro.json
0 divergências.

$ npm test
# tests 89, pass 89, fail 0
```
