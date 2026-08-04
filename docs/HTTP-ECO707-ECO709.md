# Contrato HTTP — ECO707 e ECO709 (consulta de RA)

Como operar estas duas telas **por HTTP puro**, sem navegador. Os payloads abaixo
foram capturados da UI real (`scripts/capturar_zkau.js`) e replicados com sucesso
em Node — o ECO707 roda hoje a **0,13 s por consulta**.

Base: `https://prod.saneago.com.br` (o `www` responde 302 para cá).
Todas as interações vão por `POST /prt/zkau` com `content-type:
application/x-www-form-urlencoded;charset=UTF-8` e o header `zk-sid` incrementando.

## Regras gerais do ZK (valem para qualquer tela)

1. **Abrir a tela**: `GET /prt/eco/<TELA>.zul` → a resposta traz o `dtid` (id do
   desktop) e a árvore de widgets. Os `uuid` são **dinâmicos a cada abertura**;
   localize os componentes pelo **id estável** (`id:'btnConsultar'`) e pegue o
   uuid que o precede na serialização.
2. **onChange e onClick vão no MESMO POST.** Se o `onChange` for enviado sozinho,
   o ZK descarta o valor (ou derruba o desktop) e a consulta roda vazia — sem
   nenhuma mensagem de erro.
3. **Tipo do valor importa**: `zul.inp.Intbox` espera `{"value": 2238097}`
   (número); `Textbox` espera string. Mandar string num Intbox faz a tela
   consultar vazio silenciosamente.
4. **Datas** (`zul.db.Datebox`): `{"value":"2024.1.1.14.26.11.771","start":10,
   "z$dateKeys":["value"]}` — formato `ano.mês.dia.hora.min.seg.ms` com o
   **mês 1-based** (01/01/2024 → `2024.1.1`; 31/12/2024 → `2024.12.31`).
   Na leitura o mesmo formato aparece como `_value:jq.j2d('2023.4.13.3.0.0.0')`
   = 13/04/2023, também 1-based.
5. **O resultado vem no echo**: a resposta do clique traz
   `["showBusy",...],["echo2",[{$u:'UUID'},"onConsultar"]]`. É preciso postar
   esse echo — **com `opt=i`** — e é a resposta dele que contém a grade.
6. **Reaproveite o desktop.** Reabrir o `.zul` a cada consulta cria um desktop
   novo e o servidor derruba o anterior. Abrir uma vez e repetir
   onChange+onClick no mesmo `dtid` é ~10x mais rápido e muito mais estável.
7. Quando a resposta for `["redirect",["principal.zul",""]]`, a sessão caiu:
   refazer o login e reabrir a tela.

## ECO707 — RAs por Número de Conta

`GET /prt/eco/ECO707ConsultaRAConta.zul`

Ids estáveis: `intbxConta`, `intbxDigitoConta` (invisível/desabilitado),
`btnConsultar`, `btnImprimir`, `lstbxRaConta`, `txtbxNomeUsuario`.

```
POST /prt/zkau
dtid=<dtid>
&cmd_0=onChange &uuid_0=<uuid intbxConta> &data_0={"value":2238097,"start":7}
&cmd_1=onClick  &uuid_1=<uuid btnConsultar> &data_1={"pageX":0,"pageY":0,"which":1,"x":0,"y":0}

POST /prt/zkau                     (o echo devolvido acima)
dtid=<dtid>
&cmd_0=echo &opt_0=i &uuid_0=<uuid do echo> &data_0={"":["onConsultar"]}
```

**Resultado**: listbox com 7 células por linha —
`RA | data início | data execução | situação | serviço solicitado | (2 células
vazias dos botões "Ir p/ RA")`. Ancore a leitura no número da RA
(`/^\d{9,11}$/`) em vez de contar células.

Sem limite de período: devolve o histórico inteiro da conta.

Implementação: `Revisão-Contas-Esgoto/src/portal/eco707.js`.

## ECO709 — RAs por Logradouro

`GET /prt/eco/ECO709ConsultaRALogradouro.zul`

Ids estáveis: `pesquisaCidade`, `pesquisaBairro`, `pesquisaLogradouro`,
`pesquisaServico` (macros `caixaPesquisa`, cada uma com um `txtCodigo` interno),
`quadra`, `lote`, `numero`, `dtbxInicial`, `dtbxFinal`, `btnConsultar`, `lstbxRa`.

**Restrições medidas na tela:**
- sem bairro → *"Favor informar o bairro."*
- sem logradouro → *"Favor informar o logradouro."*
  (ou seja: **não** dá para varrer por cidade nem por bairro)
- período > 1 ano → *"Você não possui acesso para consulta com um período maior
  que 1 ano."*
- o "Código Serviço", tanto no filtro quanto no resultado, é o serviço
  **solicitado** — não o de resposta.

Cada filtro é enviado em seu **próprio POST**, com `onChange` + `onBlur` (a tela
busca a descrição no servidor a cada campo):

```
POST 1: cmd_0=onChange uuid_0=<cidade>      data_0={"value":2,"start":1}
        cmd_1=onBlur   uuid_1=<cidade>
POST 2: cmd_0=onChange uuid_0=<bairro>      data_0={"value":81,"start":2}
        cmd_1=onBlur   uuid_1=<bairro>
POST 3: cmd_0=onChange uuid_0=<logradouro>  data_0={"value":"1945","start":4}
        cmd_1=onBlur   uuid_1=<logradouro>
POST 4: cmd_0=onChange uuid_0=<dtbxInicial> data_0={"value":"2024.1.1.14.26.11.771","start":10,"z$dateKeys":["value"]}
        cmd_1=onChange uuid_1=<dtbxFinal>   data_1={"value":"2024.12.31.14.26.11.784","start":10,"z$dateKeys":["value"]}
        cmd_2=onClick  uuid_2=<btnConsultar> data_2={...}
POST 5: cmd_0=echo opt_0=i uuid_0=<echo> data_0={"":["onConsultar"]}
```

**Resultado**: `RA | início | execução | situação | conta (com DV) | nome |
quadra | lote | número | serviço solicitado`. Traz a **conta**, e RAs de rede
aparecem com conta `0000000-0` e só o endereço — é assim que se recupera a RA
que não está amarrada a nenhuma conta.

> **Estado**: o contrato acima está confirmado pela captura, mas a implementação
> HTTP (`Revisão-Contas-Esgoto/src/portal/eco709.js`) ainda **não** está
> funcionando: falta mapear o uuid do `txtCodigo` interno de cada macro
> `caixaPesquisa` — pegar o primeiro `txtCodigo` da árvore preenche só a cidade,
> e a tela responde "Favor informar o código da cidade". O ECO707 cobre o caso
> de uso principal, então isto ficou pendente.

## Como capturar de novo

`scripts/capturar_zkau.js <APP> [valor]` abre a tela pela UI (Playwright),
registra todos os POSTs em `/prt/zkau` e grava em `scripts/zkau_<APP>.txt`.
É o caminho mais rápido para descobrir o contrato de qualquer outra tela.
