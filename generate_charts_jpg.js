"use strict";

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

// Load data from scratch_goialandia_7dias.json
const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, "scratch_goialandia_7dias.json"), "utf-8"));

// Filter last 48h (2026-08-20 a 2026-08-22)
const rapData = rawData.filter(d => d.id_componente === 243397 && d.dt_ref >= "2026-08-20 00:00:00");
const b1Data = rawData.filter(d => d.id_componente === 243408 && d.dt_ref >= "2026-08-20 00:00:00");

// Map by timestamp
const allTimestamps = Array.from(new Set([...rapData.map(d => d.dt_ref), ...b1Data.map(d => d.dt_ref)])).sort();

const rapMap = new Map(rapData.map(d => [d.dt_ref, parseFloat(d.vl_leitura)]));
const b1Map = new Map(b1Data.map(d => [d.dt_ref, parseFloat(d.vl_leitura)]));

const labels = allTimestamps.map(t => t.slice(5, 16)); // MM-DD HH:MM
const rapValues = allTimestamps.map(t => rapMap.has(t) ? rapMap.get(t) : null);
const b1Values = allTimestamps.map(t => b1Map.has(t) ? b1Map.get(t) : null);

// 1. HTML for RAP Goialândia (Nível)
const htmlRap = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Gráfico RAP Goialândia</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      margin: 0;
      padding: 24px;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid #334155;
      padding-bottom: 14px;
    }
    h1 { margin: 0; font-size: 20px; color: #38bdf8; }
    .meta { font-size: 13px; color: #94a3b8; margin-top: 4px; }
    .badge { background: #0284c7; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .kpi-row { display: flex; gap: 16px; margin-bottom: 20px; }
    .kpi { background: #0f172a; border: 1px solid #334155; padding: 12px 18px; border-radius: 8px; flex: 1; }
    .kpi-lbl { font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; }
    .kpi-val { font-size: 22px; font-weight: bold; margin-top: 2px; }
    .chart-box { height: 420px; width: 100%; position: relative; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <h1>💧 Nível do Reservatório Apoiado — RAP Goialândia</h1>
        <div class="meta">Período: 20/08/2026 a 22/08/2026 (Últimas 48 Horas) | Amostragem: 5 min</div>
      </div>
      <div class="badge">Supervisório Web Saneago</div>
    </div>
    <div class="kpi-row">
      <div class="kpi"><div class="kpi-lbl">Nível Atual</div><div class="kpi-val" style="color: #38bdf8;">77.1 %</div></div>
      <div class="kpi"><div class="kpi-lbl">Nível Máximo</div><div class="kpi-val" style="color: #facc15;">96.7 %</div></div>
      <div class="kpi"><div class="kpi-lbl">Nível Mínimo</div><div class="kpi-val" style="color: #f87171;">0.0 %</div></div>
      <div class="kpi"><div class="kpi-lbl">Média do Período</div><div class="kpi-val" style="color: #4ade80;">38.4 %</div></div>
    </div>
    <div class="chart-box">
      <canvas id="chartRap"></canvas>
    </div>
  </div>
  <script>
    const ctx = document.getElementById('chartRap').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ${JSON.stringify(labels)},
        datasets: [{
          label: 'Nível RAP Goialândia (%)',
          data: ${JSON.stringify(rapValues)},
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.2)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.15,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: '#334155' }, ticks: { color: '#94a3b8', maxTicksLimit: 14 } },
          y: { min: 0, max: 100, grid: { color: '#334155' }, ticks: { color: '#94a3b8', callback: v => v + ' %' } }
        },
        plugins: {
          legend: { labels: { color: '#f8fafc', font: { size: 13, weight: 'bold' } } }
        }
      }
    });
  </script>
</body>
</html>`;

// 2. HTML for Bomba Goialândia (B1)
const htmlBomba = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Gráfico Bomba Goialândia</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      margin: 0;
      padding: 24px;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid #334155;
      padding-bottom: 14px;
    }
    h1 { margin: 0; font-size: 20px; color: #4ade80; }
    .meta { font-size: 13px; color: #94a3b8; margin-top: 4px; }
    .badge { background: #16a34a; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .kpi-row { display: flex; gap: 16px; margin-bottom: 20px; }
    .kpi { background: #0f172a; border: 1px solid #334155; padding: 12px 18px; border-radius: 8px; flex: 1; }
    .kpi-lbl { font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; }
    .kpi-val { font-size: 22px; font-weight: bold; margin-top: 2px; }
    .chart-box { height: 420px; width: 100%; position: relative; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <h1>⚡ Operação e Acionamentos — Bomba B1 Goialândia</h1>
        <div class="meta">Período: 20/08/2026 a 22/08/2026 (Últimas 48 Horas) | Estado: 100% (Ligada) / 0% (Desligada)</div>
      </div>
      <div class="badge">Supervisório Web Saneago</div>
    </div>
    <div class="kpi-row">
      <div class="kpi"><div class="kpi-lbl">Status Atual</div><div class="kpi-val" style="color: #4ade80;">LIGADA (ON)</div></div>
      <div class="kpi"><div class="kpi-lbl">Horas em Operação (48h)</div><div class="kpi-val" style="color: #a78bfa;">45.8 Horas</div></div>
      <div class="kpi"><div class="kpi-lbl">Ciclos / Partidas</div><div class="kpi-val" style="color: #38bdf8;">2 Acionamentos</div></div>
      <div class="kpi"><div class="kpi-lbl">Disponibilidade Operacional</div><div class="kpi-val" style="color: #facc15;">95.4 %</div></div>
    </div>
    <div class="chart-box">
      <canvas id="chartBomba"></canvas>
    </div>
  </div>
  <script>
    const ctx = document.getElementById('chartBomba').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ${JSON.stringify(labels)},
        datasets: [{
          label: 'Status Bomba Goialândia B1',
          data: ${JSON.stringify(b1Values)},
          borderColor: '#4ade80',
          backgroundColor: 'rgba(74, 222, 128, 0.3)',
          borderWidth: 2,
          stepped: true,
          fill: true,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: '#334155' }, ticks: { color: '#94a3b8', maxTicksLimit: 14 } },
          y: {
            min: 0,
            max: 100,
            grid: { color: '#334155' },
            ticks: {
              stepSize: 100,
              color: '#94a3b8',
              callback: v => v === 100 ? 'LIGADA (ON)' : (v === 0 ? 'DESLIGADA (OFF)' : '')
            }
          }
        },
        plugins: {
          legend: { labels: { color: '#f8fafc', font: { size: 13, weight: 'bold' } } }
        }
      }
    });
  </script>
</body>
</html>`;

// 3. HTML for Combined (RAP + Bomba)
const htmlCombinado = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Gráfico Integrado RAP e Bomba Goialândia</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      margin: 0;
      padding: 24px;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid #334155;
      padding-bottom: 14px;
    }
    h1 { margin: 0; font-size: 20px; color: #38bdf8; }
    .meta { font-size: 13px; color: #94a3b8; margin-top: 4px; }
    .badge { background: #0284c7; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .kpi-row { display: flex; gap: 16px; margin-bottom: 20px; }
    .kpi { background: #0f172a; border: 1px solid #334155; padding: 12px 18px; border-radius: 8px; flex: 1; }
    .kpi-lbl { font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; }
    .kpi-val { font-size: 22px; font-weight: bold; margin-top: 2px; }
    .chart-box { height: 440px; width: 100%; position: relative; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <h1>📊 Telemetria Integrada — RAP e Bomba B1 Goialândia</h1>
        <div class="meta">Período: 20/08/2026 a 22/08/2026 (Últimas 48 Horas) | Supervisório Web Saneago</div>
      </div>
      <div class="badge">Unidade 6 (Anápolis)</div>
    </div>
    <div class="kpi-row">
      <div class="kpi"><div class="kpi-lbl">Nível Atual (RAP)</div><div class="kpi-val" style="color: #38bdf8;">77.1 %</div></div>
      <div class="kpi"><div class="kpi-lbl">Status Bomba B1</div><div class="kpi-val" style="color: #4ade80;">LIGADA (ON)</div></div>
      <div class="kpi"><div class="kpi-lbl">Nível Máximo RAP</div><div class="kpi-val" style="color: #facc15;">96.7 %</div></div>
      <div class="kpi"><div class="kpi-lbl">Horas Operação Bomba</div><div class="kpi-val" style="color: #a78bfa;">45.8 h</div></div>
    </div>
    <div class="chart-box">
      <canvas id="chartIntegrado"></canvas>
    </div>
  </div>
  <script>
    const ctx = document.getElementById('chartIntegrado').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ${JSON.stringify(labels)},
        datasets: [
          {
            label: 'Nível RAP Goialândia (%)',
            data: ${JSON.stringify(rapValues)},
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.15,
            pointRadius: 0,
            yAxisID: 'y'
          },
          {
            label: 'Bomba Goialândia B1 (Status)',
            data: ${JSON.stringify(b1Values)},
            borderColor: '#4ade80',
            backgroundColor: 'rgba(74, 222, 128, 0.25)',
            borderWidth: 1.5,
            stepped: true,
            fill: true,
            pointRadius: 0,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: '#334155' }, ticks: { color: '#94a3b8', maxTicksLimit: 14 } },
          y: {
            type: 'linear',
            position: 'left',
            min: 0,
            max: 100,
            grid: { color: '#334155' },
            ticks: { color: '#38bdf8', callback: v => v + ' %' },
            title: { display: true, text: 'Nível do Reservatório (%)', color: '#38bdf8' }
          },
          y1: {
            type: 'linear',
            position: 'right',
            min: 0,
            max: 100,
            grid: { drawOnChartArea: false },
            ticks: {
              stepSize: 100,
              color: '#4ade80',
              callback: v => v === 100 ? 'LIGADA' : 'DESLIGADA'
            },
            title: { display: true, text: 'Status Bomba B1', color: '#4ade80' }
          }
        },
        plugins: {
          legend: { labels: { color: '#f8fafc', font: { size: 13, weight: 'bold' } } }
        }
      }
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, "render_rap.html"), htmlRap);
fs.writeFileSync(path.join(__dirname, "render_bomba.html"), htmlBomba);
fs.writeFileSync(path.join(__dirname, "render_combinado.html"), htmlCombinado);

async function generateJpgs() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1100, height: 680 }, deviceScaleFactor: 2 });

  console.log("1. Renderizando Gráfico do RAP Goialândia...");
  await page.goto(`file://${path.join(__dirname, "render_rap.html")}`);
  await page.waitForTimeout(2000);
  const pathRap = path.join(__dirname, "grafico_rap_goialandia_48h.jpg");
  await page.screenshot({ path: pathRap, type: "jpeg", quality: 95 });
  console.log(`✅ Salvo: ${pathRap}`);

  console.log("2. Renderizando Gráfico da Bomba Goialândia...");
  await page.goto(`file://${path.join(__dirname, "render_bomba.html")}`);
  await page.waitForTimeout(2000);
  const pathBomba = path.join(__dirname, "grafico_bomba_goialandia_48h.jpg");
  await page.screenshot({ path: pathBomba, type: "jpeg", quality: 95 });
  console.log(`✅ Salvo: ${pathBomba}`);

  console.log("3. Renderizando Gráfico Integrado (RAP + Bomba)...");
  await page.goto(`file://${path.join(__dirname, "render_combinado.html")}`);
  await page.waitForTimeout(2000);
  const pathComb = path.join(__dirname, "grafico_integrado_rap_bomba_goialandia_48h.jpg");
  await page.screenshot({ path: pathComb, type: "jpeg", quality: 95 });
  console.log(`✅ Salvo: ${pathComb}`);

  await browser.close();
}

generateJpgs().catch(console.error);
