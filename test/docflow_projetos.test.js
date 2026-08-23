const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Configura o índice para o diretório temporário, garantindo que o repositório não seja sujado.
process.env.DOCFLOW_INDEX_FILE = path.join(os.tmpdir(), "indice_projetos_test.json");

const { gerarIndiceProjetos, pesquisarProjetosLocais } = require("../src/tools/docflow_projetos");
const { listarAnexosDocflow } = require("../src/tools/docflow");

const INDEX_FILE = process.env.DOCFLOW_INDEX_FILE;

test("Setup: Gerar índice de projetos", (t) => {
  const indice = gerarIndiceProjetos();
  assert(Array.isArray(indice), "Índice deve ser um array");
  assert(fs.existsSync(INDEX_FILE), "Arquivo de índice deve ter sido criado");
});

test("Validação: parâmetro ausente (buscando tudo com default)", async (t) => {
  const res = await pesquisarProjetosLocais({});
  assert.strictEqual(res.sucesso, true);
  assert.ok(res.registros.length > 0);
});

test("Validação: tipo errado (esperava string, passou array ou object)", async (t) => {
  await assert.rejects(
    async () => await pesquisarProjetosLocais({ empreendimento: ["VILA ROSA"] }),
    TypeError
  );
});

test("Validação: limite negativo não deve quebrar", async (t) => {
  const resLimitNeg = await pesquisarProjetosLocais({ limite: -5 });
  assert(resLimitNeg.registros.length >= 0, "Limite negativo não deve quebrar");
});

test("Validação: limite absurdamente alto não deve quebrar", async (t) => {
  const resLimitAbsurdo = await pesquisarProjetosLocais({ limite: 999999 });
  assert(resLimitAbsurdo.registros.length >= 0, "Limite absurdo não deve quebrar");
});

test("Validação: limite zero não deve quebrar", async (t) => {
  const resLimitZero = await pesquisarProjetosLocais({ limite: 0 });
  assert(resLimitZero.registros.length >= 0, "Limite zero não deve quebrar");
});

test("Validação: município nulo não deve falhar", async (t) => {
  const resMunNull = await pesquisarProjetosLocais({ municipio: null });
  assert.strictEqual(resMunNull.sucesso, true, "Município nulo não deve falhar");
});

test("Validação: ano fora de faixa (ex: 1800)", async (t) => {
  const resAnoFora = await pesquisarProjetosLocais({ ano: "1800" });
  assert.strictEqual(resAnoFora.registros.length, 0, "Ano fora de faixa retorna vazio, não erro");
});

test("Busca: município inexistente (ex: ATLANTIDA)", async (t) => {
  const resInexMun = await pesquisarProjetosLocais({ municipio: "ATLANTIDA" });
  assert.strictEqual(resInexMun.registros.length, 0, "Município inexistente retorna vazio");
});

test("Busca no índice: por empreendimento parcial", async (t) => {
  const resEmpParcial = await pesquisarProjetosLocais({ empreendimento: "VILA ROSA" });
  assert.strictEqual(resEmpParcial.sucesso, true);
  assert.ok(resEmpParcial.registros.length > 0);
});

test("Busca no índice: por empreendimento exato", async (t) => {
  const resEmpExato = await pesquisarProjetosLocais({ empreendimento: "VILA ROSA VII" });
  assert.strictEqual(resEmpExato.sucesso, true);
});

test("Busca no índice: por AVTO", async (t) => {
  const resAvto = await pesquisarProjetosLocais({ avto: "2081/2019" });
  assert.strictEqual(resAvto.sucesso, true);
  assert.ok(resAvto.registros.length > 0);
});

test("Busca no índice: por sistema SAA/SES", async (t) => {
  const resSys = await pesquisarProjetosLocais({ sistema: "SAA" });
  assert.ok(resSys.registros.length > 0);
  for (const item of resSys.registros) {
    assert.strictEqual(item.sistema, "SAA");
  }
});

test("Busca no índice: por processo", async (t) => {
  const resProc = await pesquisarProjetosLocais({ processo: "13475/2021" });
  assert.strictEqual(resProc.sucesso, true);
  assert.ok(resProc.registros.length > 0);
});

test("Busca no índice: por ano", async (t) => {
  const resAno = await pesquisarProjetosLocais({ ano: "2021" });
  assert.strictEqual(resAno.sucesso, true);
  assert.ok(resAno.registros.length > 0);
});

test("Busca no índice: por município", async (t) => {
  const resMun = await pesquisarProjetosLocais({ municipio: "GOIÂNIA" });
  assert.ok(resMun.registros.length > 0);
  for (const item of resMun.registros) {
    assert.strictEqual(item.municipio, "GOIÂNIA");
  }
});

test("Busca no índice: por ART/RRT", async (t) => {
  const resArt = await pesquisarProjetosLocais({ art: "1020200057075" });
  assert.strictEqual(resArt.sucesso, true);
});

test("Caso 'nada encontrado': lista vazia e mensagem honesta, não erro", async (t) => {
  const resInex = await pesquisarProjetosLocais({ empreendimento: "inexistente_xpto99" });
  assert.strictEqual(resInex.registros.length, 0, "A busca por termo inexistente deve retornar vazio");
  assert.ok(resInex.mensagem, "Deve retornar mensagem honesta");
});

test("Paginação: default aplicado", async (t) => {
  const resDef = await pesquisarProjetosLocais({});
  assert.ok(resDef.registros.length <= 15, "Default de limite é aplicado");
});

test("Paginação: limite explícito respeitado", async (t) => {
  const resLim3 = await pesquisarProjetosLocais({ limite: 3 });
  assert.ok(resLim3.registros.length <= 3, "Limite explícito é respeitado");
});

test("Anexos: falha graciosamente sem rede e sem fixture", async (t) => {
  process.env.DOCFLOW_OFFLINE = "1";
  const res = await listarAnexosDocflow({ processo: "14652/2026" });
  assert.strictEqual(res.sucesso, false, "Deve falhar graciosamente offline");
  assert.ok(res.mensagem.includes("requer rede e foi bloqueada"), "Deve conter mensagem offline correta");
});

test("Anexos: erro de validação (parâmetro de processo ausente)", async (t) => {
  await assert.rejects(
    async () => await listarAnexosDocflow({}),
    /Informe o número do processo/
  );
});

test("Anexos: parse de HTML com fixture (pasta vazia e nome de arquivo truncado/acentuado)", async (t) => {
  const htmlMockCompleto = `
    <div id="gridPastas">
      <table>
        <tbody>
          <tr><td class="pastaColuna"><a href="#">Raiz</a></td></tr>
          <tr><td class="pastaColuna"><a href="#">Pasta Vazia</a></td></tr>
        </tbody>
      </table>
    </div>
    <table id="anexos">
      <tbody>
        <tr class="rf-dt-r">
          <td></td>
          <td>1</td>
          <td>VILA ROSA VII-SAA-13475-2021-GOI...rar</td>
          <td>20/12/2021</td>
          <td>VILA ROSA VII-SAA-13475-2021-GOIÂNIA.rar</td>
          <td>
            <table>
              <tbody>
                <tr>
                  <td><span>Tamanho:</span></td>
                  <td>64.14 MB</td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  `;
  
  process.env.SANEAGO_USER = "mock";
  process.env.SANEAGO_PASS = "mock";
  process.env.DOCFLOW_OFFLINE = "1";
  
  const resParse = await listarAnexosDocflow({ processo: "14652/2026", htmlMock: htmlMockCompleto });
  assert.strictEqual(resParse.sucesso, true, "Deve parsear com sucesso o HTML mock");
  assert.ok(resParse.pastas.length > 0, "Deve encontrar pastas");
  
  const arqTruncado = resParse.pastas[0].arquivos.find(a => a.nome.includes("GOI...rar"));
  assert.ok(arqTruncado, "Deve encontrar arquivo com nome truncado");
  assert.ok(arqTruncado.descricao.includes("GOIÂNIA.rar"), "Deve extrair descrição acentuada");
  assert.strictEqual(arqTruncado.tamanho, "64.14 MB", "Deve extrair o tamanho correto");
});
