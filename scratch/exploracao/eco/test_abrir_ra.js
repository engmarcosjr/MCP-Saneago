const { abrirRA } = require("./src/tools/eco701");
const { closeSession } = require("./src/session");

async function main() {
  try {
    const frame = await abrirRA("Rua teste 123", "2002", false);
    console.log(frame);
  } catch (err) {
    console.log("Erro capturado:", err.message);
  } finally {
    await closeSession();
  }
}
main();
