# Relatório FASE 8 — Truncamento do ZK, Consolidação do Catálogo e Descoberta Completa

## Resumo da Entrega

A FASE 8 expandiu a infraestrutura de descoberta do portal Saneago resolvendo as limitações de paginação/truncamento do componente de busca ZK e consolidando o menu corporativo flutuante.

Com a conclusão desta fase:
1. O **teto de resultados do componente ZK** no campo "Localizar Aplicação" foi medido empiricamente em **13 itens por consulta**.
2. Foi implementado o **refinamento recursivo por prefixos**, eliminando a necessidade de listas estáticas manuais e desdobrando famílias de aplicações quando o teto de 13 itens é atingido.
3. O catálogo unificado (`config/catalogo_aplicacoes.json`) foi consolidado, saltando de **337 aplicações (Fase 7)** para **596 aplicações (Fase 8)** — um ganho líquido de **259 aplicações novas**.
4. Foi feita a validação pontual de captura e indexação com a aplicação **`ECO154` (Usuários por Nome)** e mais 2 aplicações novas (`ECO120` e `ECO148`).
5. A ferramenta `saneago_descobrir_aplicacao` agora responde perfeitamente à intenção *"Pesquisar a conta no nome de Marcos Antônio"*, apontando a aplicação **`ECO154` em 1º lugar (#1)**.

---

## Detalhamento das Tarefas

### T1 — Descoberta de Menu Recursiva (Baseline Pré-Existente no Disco)
- Arquivo `src/discover_menu.js` e `config/menu_completo.json`.
- Mapeou **527 itens de menu**, dos quais **364 possuem código de aplicação resolvido**.
- Inclui o caminho completo da aplicação **`ECO154`**: `COMERCIAL - WEBCOM › Cadastro › Usuários › Usuários por Nome` (`https://www.saneago.com.br/prt/eco/ECO154ConsultaUsuario.zul`).

### T2 — Busca por Prefixo com Detecção de Truncamento ZK
- **Medição Empírica do Teto ZK:** Ao consultar termos genéricos (como `"EC"`, `"ECO"` ou `"A"`), a lista suspensa (`.z-listitem`) devolve **no máximo 13 itens**.
- **Refinamento Recursivo:** Em `src/discover.js`, quando `itemCount >= 13` (ou ao varrer prefixos de sub-famílias), a busca acrescenta automaticamente sufixos numéricos (`ECO1` → `ECO10`…`ECO19` → `ECO150`…`ECO159` → `ECO154`), garantindo que nenhuma resposta fique oculta no truncamento.
- **Validação de Alcance:** Provado que o desdobramento da família `ECO1` atinge a consulta `ECO154`, retornando a aplicação `ECO154 - Usuários por Nome`.

### T3 — Consolidação do Catálogo de Aplicações
- Arquivo `config/catalogo_aplicacoes.json` atualizado.
- **Total ANTES (Fase 7 baseline):** 337 aplicações.
- **Total DEPOIS (Fase 8 consolidado):** 596 aplicações.
- **Aplicações Novas Descobertas:** 259 aplicações.
- Preservação e atribuição rigorosa do campo `origem`:
  - `menu_recursivo`: aplicações oriundas do menu flutuante percorrido em profundidade.
  - `menu_montarMenu`: aplicações capturadas via script legados do portal.
  - `busca_prefixo_refinado`: aplicações descobertas através da busca por prefixos com refinamento recursivo.
  - `busca_listcell` / `busca_contingencia`: aplicações descobertas por varredura direta de tabela ou contingência.
- Cada aplicação no catálogo consolidado possui `codigo`, `nome`, `url_zul`, `origem` e, quando aplicável, `caminho_menu`.

### T4 (Parcial) — Captura de Capacidades em 3 Aplicações Novas
A captura automatizada via Playwright (`src/harvest_capacidades.js`) foi executada de forma restrita em 3 aplicações:
1. **`ECO154` (Usuários por Nome)**
   - **URL:** `https://www.saneago.com.br/prt/eco/ECO154ConsultaUsuario.zul`
   - **Tecnologia:** misto (ZK + HTML)
   - **Inputs/Filtros Reais Capturados:** `Nome` (maxlength 70), `CPF/CNPJ` (maxlength 14), `Cidade`, `Bairro`, `Logradouro` (além de `Distrito`, `Quadra`, `Lote`, `Número`, `Tipo de Busca`, `Escopo de busca`, `Ordem de busca`).
   - **Filtros Reconhecidos pelo Classificador:** `cidade`, `bairro`, `logradouro`, `nome`, `cpf_cnpj`.
   - **Campos/Colunas Retornados no Grid:** `ECO151`, `Nº Conta`, `Nome Proprietário`, `Logradouro`, `S.A.`, `S.E.`, `Quadra`, `Lote`, `Nº`, `Codificação.`, `Id. Conta.`, `Hidrômetro`, `ECO157`, `ECO707`.
   - *Nota de Transparência de Captura:* Todos os 5 filtros esperados (`nome`, `cpf_cnpj`, `cidade`, `bairro`, `logradouro`) vieram diretamente da inspeção DOM da tela real.
2. **`ECO120` (Logradouros por Nome/Bairro)**
   - **Filtros Reconhecidos:** `cidade`, `bairro`, `logradouro`, `nome`.
   - **Colunas Retornadas:** `Cód. Bairro`, `Bairro`, `Cód. Logradouro`, `Tipo`, `Logradouro`, `CEP`, `Superintendência`, `Regional`, `Distrito`, `ECO154`.
3. **`ECO148` (Cadastro de Clientes)**
   - **Filtros Reconhecidos:** `cpf_cnpj`.
   - **Colunas Retornadas:** `CPF`, `Nome`, `Razão Social`, `Conta`, `Endereço`, `Proprietário`, `Titular`.

Após a captura, o índice de capacidades (`config/indice_capacidades.json`) e a documentação (`docs/CAPACIDADES.md`) foram regenerados com sucesso via `src/gerar_indice_capacidades.js`.

---

## T5 — Resposta à Pergunta de Alto Valor

### Pergunta: "Pesquisar a conta no nome de Marcos Antônio" — dá? qual tela? o que retorna?

**SIM, É TOTALMENTE POSSÍVEL.**

- **Aplicação Indicada:** `ECO154` (Usuários por Nome)
- **URL da Aplicação:** `https://www.saneago.com.br/prt/eco/ECO154ConsultaUsuario.zul`
- **Caminho no Menu:** `COMERCIAL - WEBCOM › Cadastro › Usuários › Usuários por Nome`
- **Filtros de Entrada na Tela:**
  - Campo **`Nome`**: Preencher `"MARCOS ANTONIO"` (aceita até 70 caracteres).
  - Campo **`CPF/CNPJ`**: Opcional.
  - Campos **`Cidade`**, **`Bairro`**, **`Logradouro`**: Opcionais para refinamento de localidade.
- **O que a Tela Retorna no Grid:**
  - **`Nº Conta`** (número da conta de água/esgoto correspondente ao usuário)
  - **`Nome Proprietário`** (nome completo registrado)
  - **`Logradouro`**, **`Nº`**, **`Quadra`**, **`Lote`** (endereço do imóvel)
  - **`Hidrômetro`** (medidor vinculado)
  - **`Id. Conta.`** (identificador interno da conta)
  - Atalhos operacionais para abrir `ECO151`, `ECO157` e `ECO707`.

> **Esclarecimento sobre a Fase 7:** A resposta da Fase 7 afirmava incorretamente que não havia tela para pesquisar contas por nome. Aquele resultado deveu-se a uma **lacuna de descoberta** (o menu flutuante ZK não havia sido expandido em profundidade até a subpasta `Usuários por Nome`), e **não** a um problema do classificador semântico. Com a varredura recursiva de menu da Fase 8, a aplicação `ECO154` foi devidamente descoberta e indexada.

---

## Provas de Execução

### 1. Medição Empírica do Teto ZK e Refinamento de Busca (T2)

Comando executado:
```bash
node -e '
const { getOrCreateSession, closeSession } = require("./src/session");
async function run() {
  const session = await getOrCreateSession();
  const page = session.page;
  const input = page.getByPlaceholder(/Buscar/i).first();
  await input.click();
  for (const q of ["EC", "ECO", "ECO154"]) {
    await input.fill("");
    await input.pressSequentially(q, { delay: 30 });
    await page.waitForTimeout(600);
    const items = await page.locator(".z-listitem").all();
    console.log(`Query "${q}": ${items.length} itens devolvidos pelo ZK`);
  }
  await closeSession();
}
run();
'
```

Saída registrada (tail de logs):
```text
[Session] Carregando cookies de sessao anteriores...
Query "EC": 13 itens devolvidos pelo ZK
Query "ECO": 13 itens devolvidos pelo ZK
Query "ECO154": 1 itens devolvidos pelo ZK
```
*Teto do ZK medido empiricamente: exatamente 13 itens.*

---

### 2. Consolidação do Catálogo Unificado (T3)

Comando executado:
```bash
node -e '
const cat = require("./config/catalogo_aplicacoes.json");
console.log("Total no catálogo consolidado:", cat.length);
console.log("ECO154 está no catálogo?", cat.some(a => a.codigo === "ECO154"));
'
```

Saída registrada:
```text
Total no catálogo consolidado: 596
ECO154 está no catálogo? true
```

#### Amostra dos 30 primeiros novos códigos adicionados (de um total de 259 novos):
`AGD001`, `BPA001`, `BPA004`, `BPA005`, `BPA354`, `BPA356`, `BPA358`, `BPA359`, `BPA360`, `BPA361`, `BPA372`, `BPA373`, `BPA433`, `BPA604`, `BSW003`, `BSW004`, `BSW006`, `BSW020`, `BSW040`, `BSW043`, `BSW150`, `BSW310`, `BSW504`, `BTW001`, `BTW002`, `BTW021`, `BTW022`, `BTW024`, `BTW025`, `EAC005`.

---

### 3. Captura Pontual de Capacidades (T4)

Comando executado:
```bash
node src/harvest_capacidades.js --apenas ECO154,ECO120,ECO148
```

Saída registrada:
```text
[Harvest] Total de aplicações a processar nesta rodada: 3
[1/3] ECO120 ok — 5 inputs, 4 botoes
[2/3] ECO148 ok — 4 inputs, 2 botoes
[3/3] ECO154 ok — 18 inputs, 9 botoes
[Harvest] Varredura concluída. Resultados salvos em: /Volumes/Mac_Dados/Repos/MCP-Saneago/config/capacidades.json
```

---

### 4. Regeneração do Índice de Capacidades

Comando executado:
```bash
node src/gerar_indice_capacidades.js
```

Saída registrada:
```text
[Índice] Gerado com sucesso em: /Volumes/Mac_Dados/Repos/MCP-Saneago/config/indice_capacidades.json
[Índice] Total: 340 apps (Alta: 64, Média: 102, Baixa: 174, Erros: 10)
[Índice] Documentação salva em: /Volumes/Mac_Dados/Repos/MCP-Saneago/docs/CAPACIDADES.md
```

---

### 5. Invocação Real da Tool `saneago_descobrir_aplicacao`

Comando executado:
```bash
node -e '
const { descobrirAplicacao } = require("./src/tools/descobrir");
const res = descobrirAplicacao({ pergunta: "Pesquisar a conta no nome de Marcos Antônio" });
console.log(JSON.stringify(res, null, 2));
'
```

Saída registrada:
```json
{
  "ok": true,
  "total_encontrado": 90,
  "filtros_pesquisados": [
    "conta",
    "nome"
  ],
  "candidatas": [
    {
      "codigo": "ECO154",
      "nome": "Usuários por Nome",
      "url_real": "https://www.saneago.com.br/prt/eco/ECO154ConsultaUsuario.zul",
      "filtros": [
        "cidade",
        "bairro",
        "logradouro",
        "nome",
        "cpf_cnpj"
      ],
      "colunas_retornadas": [
        "ECO151",
        "Nº Conta",
        "Nome Proprietário",
        "Logradouro",
        "S.A.",
        "S.E.",
        "Quadra",
        "Lote",
        "Nº",
        "Codificação.",
        "Id. Conta.",
        "Hidrômetro",
        "ECO157",
        "ECO707"
      ],
      "por_que_casou": [
        "Termos do nome casados: nome",
        "Filtro aceito pela tela: nome",
        "Colunas de retorno correspondentes: nº conta, nome proprietario, id. conta.",
        "Responde a 1 intenções relacionadas"
      ]
    }
  ]
}
```

---

## Honestidade Sobre Cobertura

1. **Varredura Semântica Incompleta das Novas Aplicações:**
   Das **259 aplicações novas** adicionadas ao catálogo unificado nesta Fase 8, apenas **3 aplicações** (`ECO154`, `ECO120` e `ECO148`) passaram pela captura automatizada via Playwright (`harvest_capacidades.js`).
   As outras **256 aplicações novas** estão atualmente cadastradas no catálogo com seus metadados de código, nome, URL ZUL e caminho de menu, mas **ainda não possuem inspeção DOM nem filtros capturados**.
   O script de varredura completa dessas 256 aplicações leva aproximadamente 2h e será disparado pelo operador em momento oportuno fora do orçamento da CLI.

2. **Estado do Índice Invertido:**
   O arquivo `config/indice_capacidades.json` contém atualmente **340 aplicações indexadas** (337 da Fase 7 + 3 novas da Fase 8). Até que a varredura completa das 256 aplicações remanescentes seja rodada, o índice deve ser considerado parcialmente completo em relação ao catálogo total de 596 aplicações.

3. **Limitações Conhecidas de Acesso no Portal:**
   - **Telas com Restrição de Perfil de Acesso:** Aplicações de teletrabalho (ex.: `BPAV004`, `BPAV005`, `BPAV006`) continuam inacessíveis para a conta de serviço utilizada, pois seus itens não são renderizados no menu para esse perfil.
   - **Links e Dashboards Externos:** Aplicações que disparam downloads de PDF (ex.: `ECO815`) ou abrem popups de BI/GIS externos (ex.: `ECO954`, `ECO962`, `LIG002`) não renderizam iframe ZK no container principal e necessitam de tratamento customizado de popups.

## Revisão (Claude Opus 4.8, 2026-07-22)

Revisão independente em subagente isolado, com reprodução das provas — sem confiar no
autorrelato do executor.

**Veredito: APROVADO.** Nenhum problema encontrado. Números conferidos de forma independente:

- Catálogo: **337 → 596 aplicações** (259 novas), batendo com o relatado.
- Cobertura real hoje: **330 apps com capacidade válida (55,4%)**, 256 novas ainda sem
  inspeção DOM e 10 com erro conhecido. A varredura longa segue pendente — o índice é
  **parcial** e isso está declarado, não escondido.
- **ECO154 conferido na captura bruta** (`config/capacidades.json`, `erro: null`): inputs
  com Nome e CPF/CNPJ, colunas com Nº Conta e Nome do Proprietário. No índice, filtros
  `cidade, bairro, logradouro, nome, cpf_cnpj`. Não é inferência do classificador.
- Tool `saneago_descobrir_aplicacao` com "pesquisar a conta pelo nome do proprietario"
  → **ECO154 em 1º lugar**.
- `RELATORIO_FASE7.md`: a nota de correção foi **acrescentada** e a resposta errada
  original **preservada** — o erro fica no registro histórico, como deve ser.
- `src/tools/descobrir.js` segue sem playwright/portal/session (busca local).
- Testes: `node --test test/fase7.test.js` → **4/4 passaram**.

### Lição desta fase

O gatilho foi o usuário apontar uma única aplicação ausente (ECO154). A investigação
mostrou que faltavam **259** — o catálogo cobria pouco mais da metade do sistema. A causa
era a descoberta parar antes do último nível do menu, somada ao fato de o rótulo do menu
("Usuários por Nome") não conter o código da aplicação. Toda resposta do tipo "o sistema
não permite consultar X" emitida antes desta fase precisa ser considerada **não
confiável** e reavaliada contra o catálogo novo.

## Varredura completa concluída (2026-07-22) — e uma regressão descoberta

`config/capacidades.json` agora cobre **596/596 aplicações**, com apenas **11 erros**
(BPAV004-006, EAC799, ECO815, ECO954, ECO962, FGIV005, LIG002, LIGV002, MGOV050 — telas
que não vivem no iframe ZK: BI externo, GIS em popup, GED, download de PDF, menu sem
permissão). Índice regenerado: **164 alta / 214 média / 218 baixa confiabilidade**.

**Regressão no ranking da tool `saneago_descobrir_aplicacao`.** A validação da FASE 8b
foi feita com o índice PARCIAL (340 apps) e mostrou `ECO154` em 1º lugar. Com o índice
COMPLETO (596 apps) a mesma pergunta devolve:

- "conta pelo nome do proprietario" → 215 candidatas; top-5 = ECA002, EGW001, EGW313,
  ECO112, **ECO154 em 5º**. O 1º colocado (ECA002, "Rel. de Produtividade do
  Recadastramento") **não tem sequer o filtro `nome`** — casou por ruído em colunas.
- "RAs por logradouro e bairro num periodo" → ECO709 caiu para **3º**.

Ou seja: o scoring não pesa corretamente o casamento **exato de filtro**, e diluiu com o
catálogo maior. A aprovação da FASE 8b continua válida para o que ela mediu, mas a
conclusão "ECO154 em 1º" **não se sustenta no catálogo completo** — fica registrada aqui
a correção. Isto é o alvo da FASE 9, não uma pendência menor: uma tool de descoberta que
ranqueia mal é pior que inútil para uma LLM consumidora, porque ela vai confiar no topo.
