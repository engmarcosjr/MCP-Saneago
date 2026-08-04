/** Somente leitura: lista os campos visiveis de uma tela ZK.
 *    node scratch/probe_campos.js ECO795
 */
const { abrirApp } = require("../src/portal");
const { closeSession } = require("../src/session");

const APP = process.argv[2] || "ECO795";

async function main() {
  const frame = await abrirApp(APP);
  await frame.page().waitForTimeout(2500);

  const campos = await frame.locator("body").evaluate(() => {
    const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const rotuloDe = (el) => {
      const tr = el.closest("tr, .z-row, .z-hbox, .z-vbox");
      if (!tr) return "";
      return (tr.innerText || "").replace(/\s+/g, " ").trim().slice(0, 80);
    };
    const out = [];
    for (const el of Array.from(document.querySelectorAll("input, select, textarea")).filter(visible)) {
      out.push({
        tag: el.tagName, id: el.id, type: el.type || "",
        maxlength: el.getAttribute("maxlength") || "",
        valor: el.value || "", contexto: rotuloDe(el),
      });
    }
    const botoes = Array.from(document.querySelectorAll("button, .z-button, .z-toolbarbutton"))
      .filter(visible).map((b) => (b.innerText || b.title || "").trim()).filter(Boolean);
    return { campos: out, botoes, texto: (document.body.innerText || "").slice(0, 2500) };
  });

  console.log(JSON.stringify(campos, null, 1));
}

main().catch((e) => { console.error("ERRO:", e.message); process.exitCode = 1; })
  .finally(() => closeSession());
