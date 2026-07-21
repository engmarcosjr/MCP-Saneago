"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const { parseNumeroConta } = require("../src/tools/eco701");

test("parseNumeroConta handles formatted, unformatted, empty, and invalid inputs", () => {
  assert.deepStrictEqual(parseNumeroConta("123456-7"), { conta: "123456", dv: "7" });
  assert.deepStrictEqual(parseNumeroConta("123456/7"), { conta: "123456", dv: "7" });
  assert.deepStrictEqual(parseNumeroConta("1234567"), { conta: "1234567", dv: "" });
  assert.deepStrictEqual(parseNumeroConta(""), { conta: "", dv: "" });
  assert.deepStrictEqual(parseNumeroConta("abc"), { conta: "", dv: "" });
  assert.deepStrictEqual(parseNumeroConta(null), { conta: "", dv: "" });
  assert.deepStrictEqual(parseNumeroConta(undefined), { conta: "", dv: "" });
});
