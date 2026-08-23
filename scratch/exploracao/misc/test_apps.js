const { abrirApp } = require("./src/portal");
const { inspecionarTela } = require("./src/inspector");
const { closeSession } = require("./src/session");

async function check(appCode) {
  try {
    const frame = await abrirApp(appCode);
    const relatorio = await inspecionarTela(frame);
    console.log(`--- ${appCode} ---`);
    console.log(JSON.stringify(relatorio, null, 2));
  } catch(e) {
    console.error(e);
  }
}

async function run() {
  await check("ECO303");
  await check("LRS041");
  await check("ECO701");
  await closeSession();
}

run();
