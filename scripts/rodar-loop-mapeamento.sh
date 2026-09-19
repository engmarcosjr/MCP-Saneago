#!/usr/bin/env bash
# =============================================================================
# Loop de mapeamento com guarda de cota do OmniRoute.
#
#   bash scripts/rodar-loop-mapeamento.sh            # roda ate parar
#   MAX_LOTES=5 bash scripts/rodar-loop-mapeamento.sh
#
# Antes de cada lote consulta scripts/quota-guard.js:
#   0  OK     -> roda o lote
#   10 PAUSAR -> dorme ate o reset da janela de 5h e tenta de novo
#   20 PARAR  -> encerra (saldo semanal no piso, ou estado de cota desconhecido)
#
# Limiares em SALDO RESTANTE (variaveis de ambiente):
#   QUOTA_MIN_RESTANTE_5H=15       pausa quando restar <= 15% na janela de 5h
#   QUOTA_MIN_RESTANTE_SEMANAL=30  para  quando restar <= 30% na semanal
#
# A escrita no portal fica bloqueada por ambiente durante todo o loop.
# =============================================================================
set -uo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

MODELO="${MODELO:-gemini-3.7-flash-medium[1m]}"
MAX_LOTES="${MAX_LOTES:-0}"          # 0 = sem limite
LOG_LOOP="loop-mapeamento.log"
lote=0

registrar() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_LOOP"; }

# Conjunto ordenado "CODIGO|checagem" das divergencias abertas agora.
divergencias_atuais() {
  node scripts/auditar-mapeamento.js --json 2>/dev/null \
    | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{
        const d=JSON.parse(s).divergencias||[];
        console.log(d.map(x=>x.codigo+'|'+x.checagem).sort().join('\n'));
      }catch(e){console.log('')}})"
}

registrar "início do loop | modelo=$MODELO | max_lotes=${MAX_LOTES:-ilimitado}"

while :; do
  node scripts/quota-guard.js >> "$LOG_LOOP" 2>&1
  case $? in
    0) : ;;
    10)
      espera=$(node scripts/quota-guard.js --json 2>/dev/null \
                | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{console.log(JSON.parse(s).esperaMinutos||30)}catch(e){console.log(30)}})")
      registrar "PAUSA por cota de 5h — retomando em ${espera} min"
      sleep $(( espera * 60 + 30 ))
      continue
      ;;
    20)
      registrar "PARADA definitiva — cota semanal no teto ou estado desconhecido"
      exit 0
      ;;
    *)
      registrar "guarda de cota falhou de forma inesperada — parando por seguranca"
      exit 1
      ;;
  esac

  # A arvore tem de estar limpa: e o que permite auditar e reverter cada lote.
  #
  # Excecao: BACKLOG_MAPEAMENTO.{json,md} sao artefatos DERIVADOS, regenerados a
  # cada execucao do backlog. O executor commita o lote e em seguida regenera o
  # backlog, sujando a arvore logo depois do proprio commit -- e o loop parava por
  # causa disso. Aqui eles sao recolhidos num commit de rotina; qualquer outra
  # sujeira continua parando o loop.
  if [ -n "$(git status --porcelain -- ':!docs/BACKLOG_MAPEAMENTO.json' ':!docs/BACKLOG_MAPEAMENTO.md')" ]; then
    registrar "working tree sujo antes do lote — parando para revisão humana"
    git status --porcelain | tee -a "$LOG_LOOP"
    exit 1
  fi
  if [ -n "$(git status --porcelain -- docs/BACKLOG_MAPEAMENTO.json docs/BACKLOG_MAPEAMENTO.md)" ]; then
    git add docs/BACKLOG_MAPEAMENTO.json docs/BACKLOG_MAPEAMENTO.md
    git commit -q -m "chore(mapeamento): atualizar backlog derivado

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
    registrar "backlog derivado recolhido em commit de rotina"
  fi

  antes=$(divergencias_atuais)
  lote=$(( lote + 1 ))
  registrar "lote $lote: iniciando"

  SANEAGO_ALLOW_WRITE=0 SANEAGO_ALLOW_RA_WRITE=0 \
  SANEAGO_ALLOW_GENERIC_WRITE=0 SANEAGO_ALLOW_LRS105_WRITE=0 \
    zsh -i -c "omniclaude -p \"\$(cat docs/mapeamento/PROMPT_LOTE.md)\" \
      --model '$MODELO' --permission-mode acceptEdits \
      --allowed-tools 'Bash(node *)' 'Bash(npm *)' 'Bash(git *)' 'Bash(shasum *)' Edit Write Read Glob Grep \
      --output-format text" > omniclaude_run.log 2>&1
  registrar "lote $lote: executor terminou (exit=$?)"

  # Prova, nao autorrelato: a auditoria e quem diz se o lote vale.
  #
  # Avaliar o DELTA, nao o estado absoluto. O log carrega divergencias historicas
  # (os carimbos dos lotes 09 e 11, por exemplo) que nao sao culpa do lote atual e
  # que voltam para a fila sozinhas. Comparar o total travaria o loop para sempre.
  depois=$(divergencias_atuais)
  novas=$(comm -13 <(echo "$antes") <(echo "$depois"))
  if [ -z "$novas" ]; then
    registrar "lote $lote: auditoria sem divergencia nova"
  else
    registrar "lote $lote: DIVERGENCIA NOVA — parando para revisão humana"
    echo "$novas" | tee -a "$LOG_LOOP"
    exit 1
  fi

  [ "$MAX_LOTES" -gt 0 ] && [ "$lote" -ge "$MAX_LOTES" ] && {
    registrar "limite de $MAX_LOTES lotes atingido"; exit 0; }
done
