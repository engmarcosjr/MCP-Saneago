# Relatório Pacote FASE 5 — Parâmetro `numeroConta` no ECO701 (Destravar REGRA 7)

## O que mudou (arquivo por arquivo)

1. **`src/tools/eco701.js`**
   - **`parseNumeroConta(valor)`**: Criada função pura auxiliar (e exportada) que parseia strings nos formatos `<conta>-<dv>`, `<conta>/<dv>`, `<conta>` ou strings sem dígitos, retornando `{ conta, dv }` com dígitos normalizados.
   - **Assinatura de `abrirRA`**: Adicionado `numeroConta` como **8º parâmetro posicional** opcional, mantendo a ordem e retrocompatibilidade dos 7 parâmetros anteriores.
   - **Preenchimento no topo da tela**: Quando `numeroConta` é fornecido, o preenchimento da Conta (e DV, se houver) é realizado **logo após clicar em "Incluir" e antes do CEP e demais campos**, prevenindo corridas do ZK com auto-fill.
   - **Reuso de helpers e falha estrita**: Utiliza `aguardarInputPorRotulo` (para achar o campo pelo rótulo `"NUMERO DA CONTA"` / `"CONTA"`) e `preencherCampo`. Se `numeroConta` for informado mas o campo não for localizado na tela, dispara `Error` explícito.
   - **Exports**: Exporta `{ abrirRA, parseNumeroConta }`.

2. **`src/index.js`**
   - **`inputSchema` da tool `saneago_abrir_ra`**: Exposta propriedade `numeroConta` (tipo `string`, opcional) instruindo a pedir o número ao usuário e aceitando o formato `conta-dv`.
   - **Manipulador `saneago_abrir_ra`**: Desestrutura `numeroConta` e o repassa na 8ª posição da chamada para `abrirRA`.

3. **`src/confirmation-gate.js`**
   - **`canonicalArgs`**: Incluído `numeroConta` normalizado apenas com dígitos (`replace(/\D/g, "")`). Garante que a confirmação exige exatamente o mesmo número de conta aprovado no preview, ignorando apenas formatações (ex: `123456-7` vs `1234567`).

4. **`scratch/test_eco701_supervisionado.js`**
   - Adicionado suporte à flag `--conta <valor>` via CLI, repassando o valor como 8º argumento para `abrirRA`.

5. **`test/confirmation-gate.test.js`**
   - Adicionados testes unitários offline para o gate de confirmação:
     - Rejeição quando `numeroConta` diverge entre preview e confirmação.
     - Aceitação quando `numeroConta` é idêntico ou possui formatação diferente que normaliza para os mesmos dígitos (`123456-7` vs `1234567`).
     - Teste de regressão para ausência de `numeroConta`.

6. **`test/eco701.test.js`**
   - Criado arquivo de testes offline para a função `parseNumeroConta`, cobrindo as entradas: `"123456-7"`, `"123456/7"`, `"1234567"`, `""`, `"abc"`, `null`, `undefined`.

---

## Decisões Tomadas e Por Quê

1. **Manutenção de assinatura posicional mínima**:
   - A assinatura de `abrirRA` recebeu `numeroConta` na 8ª posição sem alterar o tipo para objeto de opções, mantendo a alteração mínima e segura contra quebras de código legável.

2. **Preenchimento prioritário no topo da tela**:
   - A Conta/DV fica no topo do formulário do ECO701. Preenchê-la antes do CEP e do serviço impede que o processamento do auto-fill do CEP no ZK zere ou corrompa a digitação da conta.

3. **Reuso estrito de helpers provados**:
   - Nenhuma interação customizada ou payload ZK foi inventado; utilizou-se exclusivamente `aguardarInputPorRotulo` e `preencherCampo`.

4. **Normalização de dígitos no Gate de Confirmação**:
   - Ao aplicar `replace(/\D/g, "")` em `canonicalArgs`, previne-se falsos rejeitos de confirmação devidos a pequenas variações de máscara/separador (`-` ou `/`), mantendo a segurança estrita contra troca de imóvel entre o preview e a gravação real.

---

## Provas

### 1. `node --check`
Comando executado:
```bash
node --check src/tools/eco701.js && node --check src/index.js && node --check src/confirmation-gate.js && node --check scratch/test_eco701_supervisionado.js && node --check test/confirmation-gate.test.js && node --check test/eco701.test.js
```
Saída:
```text
(Retorno 0 — sem erros de sintaxe)
```

### 2. `npm test` (`node --test`)
Comando executado:
```bash
npm test
```
Saída:
```text
> mcp-saneago@1.0.0 test
> node --test

✔ confirmation is bound to the exact preview and consumed once (1.837666ms)
✔ confirmation requires a server-side grant (0.257584ms)
✔ confirmation rejects changed arguments and expired previews (0.486416ms)
✔ confirmation gate handles numeroConta binding and format normalization (0.653209ms)
✔ absence of numeroConta in preview and confirmation continues to work (regression) (0.272292ms)
✔ parseNumeroConta handles formatted, unformatted, empty, and invalid inputs (1.927417ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 230.325
```

### 3. `npm run smoke`
Comando executado:
```bash
npm run smoke
```
Saída:
```text
> mcp-saneago@1.0.0 smoke
> node scripts/smoke-mcp.js

MCP-Saneago Server running on stdio
[MCP-Saneago] tool=saneago_consultar_roteiro started
{"ok":true,"tools":6}
```

---

## Pendências

1. **Execução Supervisionada E2E na Rede Saneago (Revisor)**:
   - Executar o script `scratch/test_eco701_supervisionado.js` com credenciais válidas e um número de conta real de teste:
     ```bash
     node scratch/test_eco701_supervisionado.js --conta <NUMERO_CONTA-DV>
     # E para submissão real (se autorizado):
     # SANEAGO_ALLOW_WRITE=1 node scratch/test_eco701_supervisionado.js --confirmar --conta <NUMERO_CONTA-DV>
     ```
2. **Integração no bot Telegram (DAN01)**:
   - Garantir que o bot solicite o número da conta/DV quando o serviço assim o exigir (ex: 2002).

## Revisão (Claude Opus 4.8, 2026-07-21)

Revisão independente em subagente isolado, com reprodução das provas — sem confiar no
autorrelato do executor.

**Veredito: APROVADO.** Nenhuma violação de regra encontrada.

- **Provas reproduzidas pelo revisor:** `node --check` verde em todos os arquivos
  modificados; `npm test` → **6 pass / 0 fail** (213,9 ms).
- **Item 1** (`numeroConta` como 8º parâmetro posicional opcional, sem converter a
  assinatura para objeto): atendido — `src/tools/eco701.js:44`.
- **Item 2** (`inputSchema` + propagação): atendido — `src/index.js:215-218`,
  desestruturação na 345, chamada na 348.
- **Item 3** (segurança — `numeroConta` no `canonicalArgs`, só dígitos): atendido —
  `src/confirmation-gate.js:35`. O teste de divergência entre preview e confirmação
  exercita de fato a mudança (não é tautológico).
- **Item 4** (`numeroConta` no `resumo`; flag `--conta`): atendido — resumo coletado
  automaticamente; `scratch/test_eco701_supervisionado.js:16-17,21`.
- **Item 5** (testes offline): atendido — `test/eco701.test.js` (7 casos de
  `parseNumeroConta`) e 3 novos testes no `test/confirmation-gate.test.js`.
- Localização do campo por polling via `aguardarInputPorRotulo` (tenta "NUMERO DA CONTA",
  depois "CONTA"); nenhuma espera fixa introduzida; `package.json` inalterado.

**Gate da FASE 5 (aberto):** prova E2E supervisionada na rede Saneago, com Marcos Jr
presente e um número de conta/DV de teste válido:
`node scratch/test_eco701_supervisionado.js --conta <CONTA-DV>` (preview primeiro, sem
`--confirmar`; só depois a submissão real).
