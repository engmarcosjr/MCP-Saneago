const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function inspectLogin() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  await page.goto("https://www.saneago.com.br/docflow/xhtml/docflow/geral/login.jsf", { waitUntil: "networkidle" });

  const inputs = await page.locator("input, select, button, form").evaluateAll(els =>
    els.map(el => ({
      tagName: el.tagName,
      id: el.id,
      name: el.name || el.getAttribute("name"),
      type: el.type || el.getAttribute("type"),
      value: el.value || el.getAttribute("value"),
      action: el.action || el.getAttribute("action"),
      class: el.className
    }))
  );

  console.log("Elementos do formulário de login no DocFlow:");
  console.log(JSON.stringify(inputs, null, 2));

  fs.writeFileSync(path.join(__dirname, "scratch", "docflow_login_page.html"), await page.content());

  await browser.close();
}

inspectLogin().catch(console.error);
