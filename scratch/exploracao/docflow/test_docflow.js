"use strict";

const { downloadDocflowPdf } = require("./docflow_playwright_then_http");

const docId = process.argv[2] || "3665147";

downloadDocflowPdf(docId).catch(err => {
  console.error("Erro ao processar DocFlow:", err);
  process.exit(1);
});
