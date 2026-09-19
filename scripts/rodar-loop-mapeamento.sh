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
  if [ -n "$(git status --porcelain)" ]; then
    registrar "working tree sujo antes do lote — parando para revisão humana"
    exit 1
  fi

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
  if node scripts/auditar-mapeamento.js >> "$LOG_LOOP" 2>&1; then
    registrar "lote $lote: auditoria OK"
  else
    registrar "lote $lote: AUDITORIA COM DIVERGENCIA — parando para revisão humana"
    exit 1
  fi

  [ "$MAX_LOTES" -gt 0 ] && [ "$lote" -ge "$MAX_LOTES" ] && {
    registrar "limite de $MAX_LOTES lotes atingido"; exit 0; }
done
