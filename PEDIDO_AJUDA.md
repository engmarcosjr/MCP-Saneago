# Pedido de Ajuda - FASE 3 e FASE 4

## Em que fase/tarefa estava:
Estou atualmente na **Fase 3** (Verticais de Leitura) e na **Fase 4** (Verticais de Escrita).

## O que tentei:
Implementei estruturalmente as ferramentas `saneago_consultar_consumo` (ECO303), `saneago_asfalto_da_ra` (LRS041) e `saneago_abrir_ra` (ECO701) no código (`src/tools/*` e `src/index.js`).
Para continuar de forma autônoma, as instruções dizem:
- "Prove E2E: rode com um valor real e cole no PROGRESSO.md o comando + saída resumida..." (Fase 3)
- "NÃO crie uma RA real de teste sem o usuário. Para esta fase, valide até o ponto imediatamente antes de submeter... e pare pedindo ajuda..." (Fase 4)

## O bloqueio exato:
Falta de dados reais para testar a FASE 3 e restrição de criar RA real sem supervisão para a FASE 4. 
Não tenho uma "Conta" real ou um "RA/Rua" real + "Data" real para exercitar o E2E das verticais de leitura. Se eu chutar um valor arbitrário, as ferramentas vão falhar no portal.

## Pergunta Específica:
1. Qual é um **Número da Conta** válido que eu possa usar para testar E2E a consulta de volume consumido (ECO303)?
2. Qual é um **RA ou Rua** e uma **Data (DD/MM/AAAA)** válidos para testar E2E a verificação de asfalto lançado (LRS041)?
3. Para a FASE 4, o preenchimento de teste com `confirmar: true` foi bloqueado até este ponto. Podemos rodar um E2E da FASE 4 de forma supervisionada agora?

---

## RESOLUÇÃO (usuário via Claude — 2026-07-15)

Dados reais para as provas E2E:
- **Consumo:** conta = `1813366`. **ATENÇÃO ao mapeamento:** revalidar se ECO303 ("Acerta Leitura/Consumo") é a tela certa para *ler volume consumido*, ou se é HVW009 ("Conta") / JAJ036 ("Consulta Processo Conta"). Antes de fixar a vertical, abra e inspecione as 3 com a conta acima e escolha a que mostra o **volume consumido**; documente a escolha no PROGRESSO.md.
- **Asfalto (LRS041):** RA com asfalto = `27273762025`. Se a LRS041 filtra por data/período, derive a data a partir do RA (ou consulte o RA no ECO701 para achar a data do serviço) e use.
- **Abrir RA (Fase 4 — ESCRITA REAL AUTORIZADA):** o usuário autorizou abrir um RA de serviço **2002** no endereço **Rua Ada Centine, nº 550, bairro Maracanã**.
  - **Política de segurança (obrigatória):** implemente e valide `saneago_abrir_ra` **até o resumo de pré-submit** com esses dados, de forma autônoma. **NÃO submeta o RA real automaticamente.** Deixe pronto e registre no PROGRESSO o resumo exato que seria enviado. A submissão real só ocorre com `confirmar: true` disparado numa etapa explícita e supervisionada pelo usuário. Se algo no preenchimento exigir um campo não fornecido, pare e pergunte.

Prossiga as provas E2E de leitura com os dados acima. Depois, siga para a nova **FASE 2.5 (ROTEIRO)** descrita no `EXECUCAO_GEMINI.md`.
