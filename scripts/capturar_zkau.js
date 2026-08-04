"use strict";
/**
 * Captura os POSTs reais em /prt/zkau enquanto a tela e operada pela UI, para
 * documentar/replicar o contrato HTTP.
 *
 *   node scratch/capturar_zkau.js ECO707 2238097
 *   node scratch/capturar_zkau.js ECO709            (preenche cidade/bairro/logradouro)
 */
const fs = require("fs");
const path = require("path");
const { abrirApp } = require("../src/portal");
const { preencherCampo } = require("../src/executor");
const { closeSession } = require("../src/session");

const APP = process.argv[2] || "ECO707";
const VALOR = process.argv[3] || "2238097";

async function main() {
  const frame = await abrirApp(APP);
  const page = frame.page();
  const capturas = [];

  page.on("request", (req) => {
    if (!req.url().includes("/zkau")) return;
    if (req.method() !== "POST") return;
    capturas.push({ url: req.url(), body: req.postData() || "" });
  });

  await page.waitForTimeout(1500);

  const ids = await frame.locator("body").evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    return Array.from(document.querySelectorAll("input")).filter(vis).map((e) => e.id);
  });

  if (APP === "ECO707") {
    await preencherCampo(frame, ids[0], VALOR);
  } else {
    await preencherCampo(frame, ids[0], "2");      // cidade
    await frame.page().waitForTimeout(1200);
    await preencherCampo(frame, ids[2], "81");     // bairro
    await frame.page().waitForTimeout(1200);
    await preencherCampo(frame, ids[4], "1945");   // logradouro
    await frame.page().waitForTimeout(1200);
    await preencherCampo(frame, ids[11], "01/01/2024");
    await preencherCampo(frame, ids[12], "31/12/2024");
  }
  await frame.page().waitForTimeout(800);

  await frame.getByRole("button", { name: /consultar/i }).first().click();
  await frame.page().waitForTimeout(6000);

  const arquivo = path.join(__dirname, `zkau_${APP}.txt`);
  fs.writeFileSync(arquivo, capturas.map((c, i) =>
    `--- POST ${i + 1} ---\n${decodeURIComponent(c.body).replace(/&/g, "\n&")}`).join("\n\n"), "utf8");
  console.log(`${capturas.length} POST(s) capturado(s) -> ${path.basename(arquivo)}`);
  for (const [i, c] of capturas.entries()) {
    console.log(`\n--- POST ${i + 1} ---`);
    console.log(decodeURIComponent(c.body).replace(/&/g, "\n&").slice(0, 1200));
  }
}

main().catch((e) => { console.error("ERRO:", e.message); process.exitCode = 1; })
  .finally(() => closeSession());
